import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, SchedulerRegistry } from '@nestjs/schedule'
import { CronJob } from 'cron' // cron包，用于导入CronJob

import { searchParams, removeRawMany, resFormat } from 'src/common/global';
import { Task } from 'src/entity/task.entity';
import { User } from 'src/entity/user.entity';
import { Platform } from 'src/entity/platform.entity';
import { WealthService } from 'src/wealth/wealth.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly wealthService: WealthService,
    private schedulerRegistry: SchedulerRegistry
  ) {}

  private readonly logger = new Logger(TaskService.name);

  // 每秒钟执行一次
  // @Cron('* * * * * *')
  // handleCron() {
  //   // this.logger.debug('每秒钟执行一次');
  // }

  // 刷手接任务后，任务在1进行中状态时：必须在规定任务完成时间内完成，否则将自动放弃任务，任务状态变为0未开始状态，并且接手人，接手时间，接手平台账号，审核不通过时间重置（每秒钟执行）
  @Cron('* * * * * *')
  async complete_countdown_timeFn() {
    await this.taskRepo.query(`update task set status = 0, takeover_user_id = null, takeover_time = null, takeover_platform_id = null, status_reason_time = null where status = 1 and (now() - takeover_time) > (select index_name_cn from dict where dict_code = 'complete_countdown_time_dict' and code_index = complete_countdown_time) * 100`);
  }

  // 任务在2待审核状态时：若创作者在24小时内未操作，平台将自动审核通过，任务状态变为3审核通过状态（每秒钟执行）
  @Cron('* * * * * *')
  async complete_timeFn() {
    await this.taskRepo.query(`update task set status = 3 where status = 2 and (now() - complete_time) > 240000`);
  }

  // 任务在4审核不通过时：该任务审核不通过，刷手有24小时内处理，否则当无效处理，自动放弃该任务，任务状态变为0未开始，并且接手人，接手时间，接手平台账号，审核不通过时间重置（每秒钟执行）
  @Cron('* * * * * *')
  async status_reason_timeFn() {
    await this.taskRepo.query(`update task set status = 0, takeover_user_id = null, takeover_time = null, takeover_platform_id = null, status_reason_time = null where status = 4 and (now() - status_reason_time) > 240000`);
  }

  // ================================================ 公共接口 ================================================
  // 更改任务状态（后台管理：更改为违规状态status=6，创作者：更改为审核通过status=3，审核不通过status=4，刷手：完成任务（status=2），放弃任务（status=0），任务审核通过（status=3））
  async changeStatus(user, data) {
    const { id: user_id, role } = user;
    const { id, status, status_reason, status_reason_imgs } = data

    let updateParam: any = { status }

    let isExist = await this.taskRepo.findOne(id);
    if (!isExist) {
      return resFormat(false, null, '该任务不存在');
    }
    // this.logger.debug(isExist, `${id}的任务信息：`);

    switch (role) {
      // 管理员                     
      case 'admin':
        if (status !== 6) {
          return resFormat(false, null, '任务状态异常');
        }

        // 任务状态为3已完成时，才能更改为6违规状态
        if (isExist.status !== 3) {
          return resFormat(false, null, '任务状态为3已完成时，才能更改为6违规状态');
        }

        break;
      // 创作者
      case 'origin':
        if (![3, 4].includes(status)) {
          return resFormat(false, null, '任务状态异常');
        }

        if (status === 4) {
          if (!(status_reason && status_reason.length > 0)) {
            return resFormat(false, null, '任务状态为4时，审核不通过原因必传');
          }

          updateParam.status_reason = status_reason
          updateParam.status_reason_imgs = status_reason_imgs || []
        }

        // 任务状态为2待审核时，才能更改为3审核通过状态
        if (isExist.status !== 2 && status === 3) {
          return resFormat(false, null, '任务状态为2待审核时，才能更改为3审核通过状态');
        }
      
        // 任务状态为2待审核时，才能更改为3审核不通过状态
        if (isExist.status !== 2 && status === 4) {
          return resFormat(false, null, '任务状态为2待审核时，才能更改为3审核不通过状态');
        }

        break;
      // 刷手
      case 'user':
        if (![0, 2].includes(status)) {
          return resFormat(false, null, '任务状态异常');
        }

        // 任务状态为1进行中时，才能更改为0未开始状态
        if (isExist.status !== 1 && status === 0) {
          return resFormat(false, null, '任务状态为1进行中时，才能更改为0未开始状态');
        }

        // 任务状态为1进行中时，才能更改为2待审核状态
        if (isExist.status !== 1 && status === 2) {
          return resFormat(false, null, '任务状态为1进行中时，才能更改为2待审核状态');
        }

        break;
      default:
        break;
    }

    let res = await this.taskRepo.update(id, updateParam);

    if (res.raw.affectedRows > 0) {

      // 是后台管理，并且任务状态为6违规时，就更新用户的金币数并添加一条财务明细记录
      if (role === 'admin' && status === 6) {

        // 创作者用户编号
        let user_id_origin = isExist.user_id
        // 接手人用户编号
        let takeover_user_id = isExist.takeover_user_id
        // 任务金币数（attention_time，若3个月内查不到该刷手，则扣除1金币给创作者，并记录一次违规。若选择了其他时间，刷手在该时间内取消关注，则在扣除n+1个金币，如半年扣除2金币，1年扣除3金币，2年扣除4金币，3年扣除5金币，并记录一次违规）
        let gold = isExist.attention_time + 1

        // 更新用户的金币数
        let res1 = await this.userRepo.query(`update user set gold = concat(gold + ${gold}) where id = ${user_id_origin}`); // 创作者的金币数增加
        let res2 = await this.userRepo.query(`update user set gold = concat(gold - ${gold}) where id = ${takeover_user_id}`); // 刷手的金币数减少

        if (res1.affectedRows > 0 && res2.affectedRows > 0) {

          // 添加一条财务明细记录 - 创作者
          let userInfo1 = await this.userRepo.findOne(user_id);
          let wealthData1 = {
            user_id: user_id_origin,
            type: 8,
            detail: `刷手任务违规，扣除${gold}个金币，已返回到创作者账户`,
            change_gold_type: 1,
            change_gold: gold,
            gold: userInfo1.gold,
            change_wealth_type: 0,
            change_wealth: 0,
            wealth: userInfo1.wealth
          }
          await this.wealthService.wealthCreate(wealthData1);

          // 添加一条财务明细记录 - 刷手
          let userInfo2 = await this.userRepo.findOne(takeover_user_id);
          let wealthData2 = {
            user_id: takeover_user_id,
            type: 7,
            detail: `刷手任务违规，扣除${gold}个金币，已返回到创作者账户`,
            change_gold_type: 0,
            change_gold: gold,
            gold: userInfo2.gold,
            change_wealth_type: 0,
            change_wealth: 0,
            wealth: userInfo2.wealth
          }
          await this.wealthService.wealthCreate(wealthData2);

          return resFormat(true, null, '更改任务状态成功');
        } else {
          return resFormat(false, null, '更改任务状态成功，但记录一条财务明细记录失败');
        }
      }

      // 是创作者，并且任务状态为3审核通过时，就更新用户的金币数并添加一条财务明细记录
      if (role === 'origin' && status === 3) {

        // 接手人用户编号
        let takeover_user_id = isExist.takeover_user_id
        // 任务金币数
        let gold = isExist.gold
        this.logger.debug(`接手人用户编号：${takeover_user_id}，任务金币数：${gold}`);

        // 更新用户的金币数
        let res1 = await this.userRepo.query(`update user set gold = concat(gold + ${gold}) where id = ${takeover_user_id}`);

        if (res1.affectedRows > 0) {

          // 添加一条财务明细记录
          let userInfo = await this.userRepo.findOne(takeover_user_id);
          let wealthData1 = {
            user_id: takeover_user_id,
            type: 3,
            detail: `发布方确认任务[${id}]，完成1个任务成功，获得${gold}个金币`,
            change_gold_type: 1,
            change_gold: gold,
            gold: userInfo.gold,
            change_wealth_type: 0,
            change_wealth: 0,
            wealth: userInfo.wealth
          }
          await this.wealthService.wealthCreate(wealthData1);


          /**
           * 推广一个创作者成功（推广一个创作者[我的唯一]，并且该创作者已成功发布10个任务，获得推广佣金2个金币）
           * 判断创作者完成任务数是否等于10，并且是否有师傅，则师傅获得2个金币
           */
          // 当前创作者完成任务数
          let taskCount: number = await this.taskRepo.count({ status: 3, user_id });

          // 当前创作者是否有师傅
          let originUserInfo = await this.userRepo.findOne({ id: user_id });
          let referrer_user_id = originUserInfo.referrer_user_id;

          // 推广金币
          let referrerGold = 2;
          this.logger.debug(`当前创作者完成任务数：${taskCount}，当前创作者是否有师傅：${referrer_user_id}`);

          if (taskCount === 10 && referrer_user_id) {
            // 更新用户的金币数
            let res3 = await this.userRepo.query(`update user set gold = concat(gold + ${referrerGold}) where id = ${referrer_user_id}`);

            if (res3.affectedRows > 0) {
              // 添加一条财务明细记录
              let userInfo = await this.userRepo.findOne(referrer_user_id);
              let wealthData2 = {
                user_id: referrer_user_id,
                type: 9,
                detail: `推广一个创作者[${originUserInfo.username}]，并且该创作者已成功发布10个任务，获得推广佣金${referrerGold}个金币`,
                change_gold_type: 1,
                change_gold: referrerGold,
                gold: userInfo.gold,
                change_wealth_type: 0,
                change_wealth: 0,
                wealth: userInfo.wealth
              }
              await this.wealthService.wealthCreate(wealthData2);

              this.logger.debug(`推广一个创作者[${originUserInfo.username}]，并且该创作者已成功发布10个任务，获得推广佣金${referrerGold}个金币`)
            }
          }

          return resFormat(true, null, '更改任务状态成功');
        } else {
          return resFormat(false, null, '更改任务状态成功，但记录一条财务明细记录失败');
        }

      }

      // return resFormat(true, null, '更改任务状态成功');
    } else {
      return resFormat(false, null, '更改任务状态失败');
    }
  }


  // ================================================ 后台管理 ================================================
  // 获取任务统计数据（后台管理）
  async getStat() {
    // 总任务数
    let taskNum: number = await this.taskRepo.count();

    // 创作者发布金币数（不包括状态status为5：已取消的任务）
    let originGoldRes: any = await this.taskRepo.createQueryBuilder('task')
      .select('sum(gold)', 'originGoldNum')
      .where('status != :status', { status: 5 })
      .getRawOne();

    // 刷手赚取金币数
    let userGoldRes: any = await this.userRepo.createQueryBuilder('user')
      .select('sum(gold_num)', 'userGoldNum')
      .getRawOne();

    // 总任务数
    // let total: number = await this.taskRepo.count();

    // 未开始任务数
    let status0_num: number = await this.taskRepo.count({ status: 0 });

    // 进行中任务数
    let status1_num: number = await this.taskRepo.count({ status: 1 });

    // 待审核任务数
    let status2_num: number = await this.taskRepo.count({ status: 2 });

    // 审核通过任务数
    let status3_num: number = await this.taskRepo.count({ status: 3 });

    // 审核不通过任务数
    let status4_num: number = await this.taskRepo.count({ status: 4 });

    // 已取消任务数
    let status5_num: number = await this.taskRepo.count({ status: 5 });

    // 违规任务数
    let status6_num: number = await this.taskRepo.count({ status: 6 });

    // 平台赚取金币数
    let adminGoldNum: number = originGoldRes.originGoldNum - userGoldRes.userGoldNum;

    console.log(taskNum, originGoldRes.originGoldNum);

    let res = {
      taskNum,
      originGoldNum: originGoldRes.originGoldNum,
      userGoldNum: userGoldRes.userGoldNum,
      adminGoldNum,
      // total,
      status0_num,
      status1_num,
      status2_num,
      status3_num,
      status4_num,
      status5_num,
      status6_num
    }

    return resFormat(true, res, null);
  }

  // 获取子任务列表（后台管理，根据id查询）
  async getListByAdmin(data) {
    console.log(data);
    let searchData: object = searchParams(data, ['id', 'username', 'platform_name', 'takeover_platform_name', 'platform_type', 'status'], ['page', 'pageNum']);

    console.log(searchData);

    try {
      let sql = this.taskRepo.createQueryBuilder('t')
        .select(['t.*', 'u.username username', 'u1.username takeover_username', 'p.platform_name platform_name', 'p1.platform_name takeover_platform_name'])
        .leftJoin(User, 'u', 't.user_id = u.id')
        .leftJoin(User, 'u1', 't.takeover_user_id = u1.id')
        .leftJoin(Platform, 'p', 't.platform_id = p.id')
        .leftJoin(Platform, 'p1', 't.takeover_platform_id = p1.id')
        .where('t.id like :id and u.username like :username and t.platform_type like :platform_type and p.platform_name like :platform_name and p1.platform_name like :takeover_platform_name and t.status like :status');

      let res: any = await sql
        .offset((data.page - 1) * data.pageNum)
        .limit(data.pageNum)
        .setParameters(searchData)
        .getRawMany();

      // 使用getRawMany()方法时，删除所有原始数据
      // removeRawMany(res, 'u_', []);
      // removeRawMany(res, 'u1_', []);
      // removeRawMany(res, 'p_', []);
      // removeRawMany(res, 'p1_', []);

      // 查询总数
      let count = await sql.getCount();

      // return { success: true, data: { lists: res, total: count }, msg: null };
      return resFormat(true, { lists: res, total: count }, null);
    } catch (err) {
      console.log(err);
      return resFormat(false, null, err);
    }
  }


  // ================================================ 创作者 ================================================
  // 发布任务（创作者）
  async publishTask(user, data) {
    const { id } = user;
    let { platform_type, platform_id, task_img1, task_img2, task_entry, complete_countdown_time, task_num, attention_time, comment_content, transpond, transpond_content, remark, goldNum } = data;

    // 初始金币数
    let initGold = (0.5 * 10 + attention_time * 0.1 * 10) / 10;

    // 金币总数
    let totalGold = 0

    // 获取task_id最大值
    let task_idData = await this.taskRepo.query('select max(task_id) task_id from task');
    let task_id = Number(task_idData[0].task_id) + 1;
    console.log('task_id：', task_id);

    // 发布时间
    let publish_time = new Date()

    // console.log(data);
    let taskArr: any[] = [];
    for (let i = 0; i < task_num; i++) {
      let taskData: any = {
        task_id,
        publish_time,
        user_id: id,
        platform_type,
        platform_id,
        task_img1,
        task_img2,
        task_entry,
        complete_countdown_time,
        attention_time,
        remark
      }

      // 判断是否有评价内容，有则处理
      if (comment_content.length > i) {
        // 有评价内容时
        taskData.comment_content = comment_content[i];
      }

      // 判断是否有转发，没有则任务金币平均
      if (transpond === 0) {
        taskData.gold = initGold;
      } else if (transpond === 1) {
        // 有转发时
        // [
        //   {
        //     type: 0,
        //     content: ''
        //   }
        // ]
        taskData.gold = initGold;
        if (transpond_content.length > i) {
          console.log('转发：', transpond_content[i])
          let { type, content } = transpond_content[i];
          taskData.transpond = 1
          taskData.transpond_type = type;
          taskData.transpond_content = content;
          taskData.gold = (initGold * 10 + 0.2 * 10) / 10;
        }
      }
      console.log(taskData);

      totalGold += taskData.gold

      let taskCreateData = this.taskRepo.create(taskData);
      taskArr.push(taskCreateData);
    }

    await this.taskRepo.save(taskArr);

    // 更新用户的金币数
    let res = await this.userRepo.query(`update user set gold = concat(gold - ${totalGold}) where id = ${id}`);
    console.log(res);

    if (res.affectedRows > 0) {

      // 添加一条财务明细记录
      let userInfo = await this.userRepo.findOne(id);
      let wealthData = {
        user_id: id,
        type: 2,
        detail: `发布方发布${task_num}个任务，父任务编号为[${task_id}]，已扣除${totalGold}个金币`,
        change_gold_type: 0,
        change_gold: totalGold,
        gold: userInfo.gold,
        change_wealth_type: 0,
        change_wealth: 0,
        wealth: userInfo.wealth
      }
      await this.wealthService.wealthCreate(wealthData);

      return resFormat(true, `发布${task_num}个任务成功`, null);
    } else {
      return resFormat(false, null, '发布任务失败');
    }
  }

  // 获取创作者的父任务统计数据（创作者）
  async getStatByOrigin(user) {
    const { id } = user;

    // 发布任务数：20个，发布金币数：200金币
    // 未开始：4个，进行中：2个，待审核：2个，审核通过：2个，审核不通过：2个，违规：10个，已取消：10个

    // 发布任务数
    let task_num: number = await this.taskRepo.count({ user_id: id });

    // 发布金币数
    let gold_numData: any = await this.taskRepo.query(`select sum(gold) gold from task where user_id = ${id}`);
    let gold_num = gold_numData[0].gold

    // 未开始任务数
    let status0_num: number = await this.taskRepo.count({ user_id: id, status: 0 });

    // 进行中任务数
    let status1_num: number = await this.taskRepo.count({ user_id: id, status: 1 });

    // 待审核任务数
    let status2_num: number = await this.taskRepo.count({ user_id: id, status: 2 });

    // 审核通过任务数
    let status3_num: number = await this.taskRepo.count({ user_id: id, status: 3 });

    // 审核不通过任务数
    let status4_num: number = await this.taskRepo.count({ user_id: id, status: 4 });

    // 已取消任务数
    let status5_num: number = await this.taskRepo.count({ user_id: id, status: 5 });

    // 违规任务数
    let status6_num: number = await this.taskRepo.count({ user_id: id, status: 6 });

    let res = {
      task_num,
      gold_num,
      status0_num,
      status1_num,
      status2_num,
      status3_num,
      status4_num,
      status5_num,
      status6_num
    };

    return resFormat(true, res, null);
  }

  // 获取创作者的父任务列表（创作者，根据task_id查询）
  async getListByOrigin(user, data) {
    const { id } = user;

    let searchData: any = searchParams(data, ['platform_type', 'platform_id'], ['page', 'pageNum']);
    console.log(searchData);

    // 按照task_id,platform_type,platform_head_thumb分组
    // task_id：父任务编号，platform_type：活动平台类型，platform_name：平台账号，gold：金币数，task_num：总任务数，statusNum0：未开始任务数，statusNum1：进行中任务数，statusNum2：待审核任务数，statusNum3：审核通过任务数，statusNum4：审核不通过任务数，statusNum5：已取消任务数，statusNum6：违规任务数，publish_time：发布时间
    // let res: any = await this.taskRepo.query(`select t.task_id, t.platform_type, p.platform_name, sum(gold) gold, (select count(*) from task where task_id = t.task_id and user_id = '${id}') task_num, (select count(*) from task where status = 0 and task_id = t.task_id and  user_id = '${id}') statusNum0, t.publish_time from task t left join platform p on t.platform_id = p.id where t.user_id = '${id}' and t.platform_type like '${searchData.platform_type}' and  t.platform_id like '${searchData.platform_id}' group by t.task_id, t.platform_type, p.platform_name, t.publish_time limit ${(page - 1) * pageNum}, ${pageNum}`);
    // return resFormat(true, res, null);

    let sql = this.taskRepo.createQueryBuilder('t')
      .select([
        't.task_id task_id',
        't.platform_type platform_type',
        't.platform_id platform_id',
        'p.platform_name platform_name',
        'sum(gold) gold',
        '(select count(*) from task where task_id = t.task_id and user_id = :id) task_num',
        '(select count(*) from task where status = 0 and task_id = t.task_id and user_id = :id) statusNum0',
        '(select count(*) from task where status = 1 and task_id = t.task_id and user_id = :id) statusNum1',
        '(select count(*) from task where status = 2 and task_id = t.task_id and user_id = :id) statusNum2',
        '(select count(*) from task where status = 3 and task_id = t.task_id and user_id = :id) statusNum3',
        '(select count(*) from task where status = 4 and task_id = t.task_id and user_id = :id) statusNum4',
        '(select count(*) from task where status = 5 and task_id = t.task_id and user_id = :id) statusNum5',
        '(select count(*) from task where status = 6 and task_id = t.task_id and user_id = :id) statusNum6',
        't.publish_time publish_time'])
      .leftJoin(Platform, 'p', 't.platform_id = p.id')
      .where('t.user_id = :id and t.platform_type like :platform_type and t.platform_id like :platform_id', { id })
      .groupBy('t.task_id')
      .addGroupBy('t.platform_type')
      .addGroupBy('t.platform_id')
      .addGroupBy('p.platform_name')
      .addGroupBy('t.publish_time');

    if (data.publish_time && data.publish_time.length === 2) {
      sql.andWhere('t.publish_time between :publish_time1 and :publish_time2', { publish_time1: data.publish_time[0], publish_time2: data.publish_time[1] });
    }

    let res: any[] = await sql
      .offset((data.page - 1) * data.pageNum)
      .limit(data.pageNum)
      .setParameters(searchData)
      .getRawMany();

    // 使用getRawMany()方法时，删除所有原始数据
    // removeRawMany(res, 'p_', []);

    // 查询总数
    // let count = await sql.getCount();
    let countData: any = await this.taskRepo.query(`select count(*) count from (select count(*) from task where user_id = ${id} group by task_id) task`);
    let count = countData[0].count

    return resFormat(true, { lists: res, total: count }, null);
  }

  // 取消父任务（创作者）
  async taskCancel(user, data) {
    const { id } = user;
    const { task_id } = data;

    // 只能取消未开始的任务
    let res = await this.taskRepo.update({ user_id: id, task_id, status: 0 }, { status: 5 });

    // 取消子任务的数量
    let taskCancelNum = res.raw.affectedRows;

    // 获取取消子任务的总金币
    let taskRes = await this.taskRepo.query(`select sum(gold) gold from task where user_id = ${id} and task_id = ${task_id} and status = 5`);
    let taskCancelGold = taskRes[0].gold;
    this.logger.debug(`取消子任务的数量：${taskCancelNum} - 获取取消子任务的总金币：${taskCancelGold}`);

    if (taskCancelNum > 0) {

      // 更新用户的金币数
      let res1 = await this.userRepo.query(`update user set gold = concat(gold + ${taskCancelGold}) where id = ${id}`);

      if (res1.affectedRows > 0) {
        // 添加一条财务明细记录
        let userInfo = await this.userRepo.findOne(id);
        let wealthData = {
          user_id: id,
          type: 6,
          detail: `父任务编号为[${task_id}]已取消，${taskCancelNum}个子任务取消成功，返回${taskCancelGold}个金币到该创作者的账户`,
          change_gold_type: 1,
          change_gold: taskCancelGold,
          gold: userInfo.gold,
          change_wealth_type: 0,
          change_wealth: 0,
          wealth: userInfo.wealth
        }
        await this.wealthService.wealthCreate(wealthData);

        return resFormat(true, null, `已取消父任务[${task_id}]下的所有子任务`);
      } else {
        return resFormat(false, null, `已取消父任务[${task_id}]下的所有子任务，但记录财务明细记录失败`);
      }
      // return resFormat(true, null, `已取消父任务[${task_id}]下的所有子任务`);
    } else {
      return resFormat(false, null, `取消父任务[${task_id}]失败`);
    }
  }

  // 获取某个父任务下的子任务详情（创作者，根据task_id查询）
  async getTaskDetailByTaskId(user, task_id) {
    const { id } = user;

    let res: any = await this.taskRepo.createQueryBuilder('t')
      .select([
        't.task_id task_id',
        't.platform_type platform_type',
        't.platform_id platform_id',
        'p.platform_name platform_name',
        't.task_entry task_entry',
        't.attention_time attention_time',
        't.remark remark',
        'sum(gold) gold',
        '(select count(*) from task where task_id = t.task_id and user_id = :id) task_num',
        '(select count(*) from task where status = 0 and task_id = t.task_id and user_id = :id) statusNum0',
        '(select count(*) from task where status = 1 and task_id = t.task_id and user_id = :id) statusNum1',
        '(select count(*) from task where status = 2 and task_id = t.task_id and user_id = :id) statusNum2',
        '(select count(*) from task where status = 3 and task_id = t.task_id and user_id = :id) statusNum3',
        '(select count(*) from task where status = 4 and task_id = t.task_id and user_id = :id) statusNum4',
        '(select count(*) from task where status = 5 and task_id = t.task_id and user_id = :id) statusNum5',
        '(select count(*) from task where status = 6 and task_id = t.task_id and user_id = :id) statusNum6',
        't.publish_time publish_time'])
      .leftJoin(Platform, 'p', 't.platform_id = p.id')
      .where('t.user_id = :id and task_id = :task_id', { id, task_id })
      .groupBy('t.task_id')
      .addGroupBy('t.platform_type')
      .addGroupBy('t.platform_id')
      .addGroupBy('p.platform_name')
      .addGroupBy('t.task_entry')
      .addGroupBy('t.attention_time')
      .addGroupBy('t.remark')
      .addGroupBy('t.publish_time')
      .getRawOne();

    return resFormat(true, res, null);
  }

  // 获取某个父任务下的子任务列表（创作者，根据task_id查询）
  async getTaskDetailListByTaskId(user, data) {
    const { id } = user;

    let searchData: any = searchParams(data, ['transpond', 'status'], ['page', 'pageNum', 'task_id']);
    console.log(searchData);

    let sql = this.taskRepo.createQueryBuilder('t')
      .select(['t.*', 'u.username username', 'p.platform_name platform_name', 'u.qq qq'])
      .leftJoinAndSelect(User, 'u', 't.user_id = u.id')
      .leftJoinAndSelect(Platform, 'p', 't.platform_id = p.id')
      .where('t.transpond like :transpond and t.status like :status and task_id = :task_id', { task_id: data.task_id })

    let res: any[] = await sql
      .offset((data.page - 1) * data.pageNum)
      .limit(data.pageNum)
      .setParameters(searchData)
      .getRawMany();

    // 使用getRawMany()方法时，删除所有原始数据
    removeRawMany(res, 'u_', []);
    removeRawMany(res, 'p_', []);

    let count: number = await sql.getCount();

    return resFormat(true, { lists: res, total: count }, null);
  }


  // ================================================ 刷手 ================================================
  // 获取可接任务列表（刷手）
  async getListSimple(user, data) {
    const { id } = user;
    const { page, pageNum } = data;

    let searchData: any = searchParams(data, ['platform_type'], ['page', 'pageNum']);
    console.log(searchData);

    // 按照task_id,platform_type,platform_head_thumb分组
    // task_id：一级任务编号，platform_type：活动平台类型，platform_head_thumb：平台账号头像，task_total：总任务数，task_num：剩余任务数，goldMin：最少佣金数，goldMax：最大佣金数
    // 最多返回100个任务，然后进行筛选：做过该创作者的任务，并且3个月内刷过，则不显示
    let res: any = await this.taskRepo.query(`select t1.task_id, t1.platform_type, p.platform_head_thumb platform_head_thumb, count(*) task_total, (select count(*) from task t2 where t2.status = 0 and t1.task_id = t2.task_id) task_num, (select min(gold) from task where status = 0 and task.task_id = t1.task_id) goldMin, (select max(gold) from task where status = 0 and task.task_id = t1.task_id) goldMax from task t1 left join platform p on t1.platform_id = p.id where t1.platform_type like '${searchData.platform_type}' group by t1.task_id, t1.platform_type, p.platform_head_thumb having task_num > 0 limit ${(page - 1) * pageNum}, ${pageNum}`);

    return resFormat(true, res, null);
  }

  // 获取子任务详情（刷手）
  async getTaskDetailById(user, id) {
    const { id: user_id } = user;

    let res: any = await this.taskRepo.createQueryBuilder('t')
      .select([
        't.*',
        'u.username username',
        'p.platform_name platform_name',
        'p.platform_name taskover_platform_name',
      ])
      .leftJoin(User, 'u', 't.user_id = u.id')
      .leftJoin(Platform, 'p', 't.platform_id = p.id')
      .leftJoin(Platform, 'p1', 't.takeover_platform_id = p1.id')
      .where('t.id = :id', { id })
      .getRawOne();

    return resFormat(true, res, null);
  }

  // 验证发布平台账号（刷手）
  async platformNameCheck(user, data) {
    // const { id: user_id } = user;
    // const { id, platform_name } = data;

    let isCheck: any = await this.taskRepo.createQueryBuilder('t')
      .leftJoin(Platform, 'p', 't.platform_id = p.id')
      .where('t.id = :id and p.platform_name = :platform_name', data)
      .getRawOne();

    if (isCheck) {
      return resFormat(true, null, `验证发布平台账号正确`);
    } else {
      return resFormat(false, null, `验证发布平台账号不正确`);
    }
  }

  // 抢任务（刷手）
  async taskRob(user, data) {
    const { id, role } = user;
    const { task_id, platform_id } = data;

    // 刷手角色才能抢任务
    if (role !== 'user') {
      return resFormat(false, null, `刷手角色才能抢任务`);
    }

    // 您有任务还未完成，不能同时抢两个任务
    let isExistTask = await this.taskRepo.findOne({ task_id, takeover_user_id: id, status: 1 });
    if (isExistTask) {
      return resFormat(false, null, `您有任务还未完成，不能同时抢两个任务`);
    }

    // 获取可接的任务列表
    let taskList: any[] = await this.taskRepo.find({ task_id, status: 0 });

    if (taskList.length === 0) {
      return resFormat(false, null, `您来迟了！任务已抢完，请刷新重试`);
    }

    // 随机抽取一个任务，作为刷手抢到的任务
    let robId = taskList[Math.floor(Math.random() * taskList.length)].id;
    console.log('抢到的任务：', robId);

    let res = await this.taskRepo.update(robId, { status: 1, takeover_time: new Date(), takeover_user_id: id, takeover_platform_id: platform_id });

    if (res.raw.affectedRows > 0) {
      return resFormat(true, null, `您已成功抢到[${robId}]任务`);
    } else {
      return resFormat(false, null, `抢任务失败`);
    }
  }

  // 预览时间开始计时（刷手）
  // async taskPreview(user, id) {
  //   const { id: user_id, role } = user;

  //   // 刷手角色才能操作
  //   if (role !== 'user') {
  //     return resFormat(false, null, `刷手角色才能操作`);
  //   }

  //   // const job = this.schedulerRegistry.getCronJob('notifications'); // getCronJob返回一个命名的定时任务
  //   // job.stop();
  //   // console.log(job.lastDate());

  //   // 动态创建一个新的定时任务
  //   const job = new CronJob('* * * * * *', async () => {

  //     // 若倒计时为0时，则停止倒计时的定时任务
  //     let res: any = await this.taskRepo.findOne(id);
  //     if (res.preview_countdown_time > 0) {
  //       let res1: any = await this.taskRepo.query(`update task set preview_countdown_time = concat(preview_countdown_time - 1) where id = ${id} and status = 1 and takeover_user_id = ${user_id}`);

  //       if (res1.affectedRows > 0) {
  //         this.logger.debug(`任务正在预览倒计时：${res.preview_countdown_time}`);
  //       }
  //     } else {
  //       job.stop();
  //       this.logger.debug('任务预览结束');
  //     }
  //   })
  //   this.schedulerRegistry.addCronJob('previewFn', job);
  //   job.start();
  //   // console.log(job);

  //   return resFormat(true, null, `任务正在预览中...`);
  // }

  // 获取刷手的子任务统计数据（刷手）
  async getStatByUser(user) {
    const { id } = user;

    // 已接任务数
    let taskNum: number = await this.taskRepo.count({ takeover_user_id: id });

    // 赚取金币数（不包括状态status为5：已取消的任务）
    let goldNumRes: any = await this.taskRepo.createQueryBuilder('task')
      .select('sum(gold)', 'goldNum')
      .where('takeover_user_id = :id', { id })
      .getRawOne();

    // 进行中任务数
    let status1_num: number = await this.taskRepo.count({ status: 1, takeover_user_id: id });

    // 待审核任务数
    let status2_num: number = await this.taskRepo.count({ status: 2, takeover_user_id: id });

    // 审核通过任务数
    let status3_num: number = await this.taskRepo.count({ status: 3, takeover_user_id: id });

    // 审核不通过任务数
    let status4_num: number = await this.taskRepo.count({ status: 4, takeover_user_id: id });

    // 违规任务数
    let status6_num: number = await this.taskRepo.count({ status: 6, takeover_user_id: id });

    let res = {
      taskNum,
      goldNum: goldNumRes.goldNum,
      status1_num,
      status2_num,
      status3_num,
      status4_num,
      status6_num,
    }

    return resFormat(true, res, null);
  }

  // 获取刷手的子任务列表（刷手，根据id查询）
  async getListByUser(user, data) {
    const { id } = user;

    console.log(data);
    let searchData: object = searchParams(data, ['username', 'platform_name', 'platform_type', 'takeover_platform_name', 'status'], ['page', 'pageNum']);

    console.log(searchData);

    try {
      let sql = this.taskRepo.createQueryBuilder('t')
        .select(['t.*', 'u.username username', 'p.platform_name platform_name', 'p1.platform_name takeover_platform_name'])
        .leftJoin(User, 'u', 't.user_id = u.id')
        .leftJoin(Platform, 'p', 't.platform_id = p.id')
        .leftJoin(Platform, 'p1', 't.takeover_platform_id = p1.id')
        .where('u.username like :username and p.platform_name like :platform_name and t.platform_type like :platform_type and p1.platform_name like :takeover_platform_name and t.status like :status')
        .andWhere('t.takeover_user_id = :id', { id })

      let res: any = await sql
        .offset((data.page - 1) * data.pageNum)
        .limit(data.pageNum)
        .setParameters(searchData)
        .getRawMany();

      // 使用getRawMany()方法时，删除所有原始数据
      // removeRawMany(res, 'u_', []);
      // removeRawMany(res, 'u1_', []);
      // removeRawMany(res, 'p_', []);
      // removeRawMany(res, 'p1_', []);

      // 查询总数
      let count = await sql.getCount();

      return resFormat(true, { lists: res, total: count }, null);
    } catch (err) {
      console.log(err);
      return resFormat(false, null, err);
    }
  }

}
