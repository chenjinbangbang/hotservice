import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from 'src/entity/task.entity';
import { Repository } from 'typeorm';
import { searchParams, removeRawMany, resFormat } from 'src/common/global';
import { User } from 'src/entity/user.entity';
import { Platform } from 'src/entity/platform.entity';
import { WealthService } from 'src/wealth/wealth.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly wealthService: WealthService
  ) { }

  // ====================================== 后台管理 ======================================
  // 获取任务列表（后台管理，根据id查询）
  async getListById(data) {
    console.log(data);
    let searchData: object = searchParams(data, ['id', 'username', 'platform_name', 'takeover_platform_name', 'platform_type', 'status'], ['page', 'pageNum']);

    console.log(searchData);

    try {
      let sql = this.taskRepo.createQueryBuilder('task')
        .select(['task.*', 'u.username username', 'u1.username takeover_username', 'p.platform_name platform_name', 'p1.platform_name takeover_platform_name'])
        .leftJoinAndSelect(User, 'u', 'task.user_id = u.id')
        .leftJoinAndSelect(User, 'u1', 'task.takeover_user_id = u1.id')
        .leftJoinAndSelect(Platform, 'p', 'task.platform_id = p.id')
        .leftJoinAndSelect(Platform, 'p1', 'task.takeover_platform_id = p1.id')
        .where('task.id like :id and u.username like :username')
        // .where('task.id like :id and u.username like :username and p.platform_name like :platform_name and p.platform_name like :takeover_platform_name')
        .andWhere('task.platform_type like :platform_type and task.status like :status');

      let res: any = await sql
        .offset((data.page - 1) * data.pageNum)
        .limit(data.pageNum)
        .setParameters(searchData)
        .getRawMany();

      // 使用getRawMany()方法时，删除所有原始数据
      removeRawMany(res, 'u_', []);
      removeRawMany(res, 'u1_', []);
      removeRawMany(res, 'p_', []);
      removeRawMany(res, 'p1_', []);

      // 查询总数
      let count = await sql.getCount();

      // return { success: true, data: { lists: res, total: count }, msg: null };
      return resFormat(true, { lists: res, total: count }, null);
    } catch (err) {
      console.log(err);
      return resFormat(false, null, err);
    }
  }

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
    let total: number = await this.taskRepo.count();

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
      total,
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

  // 更改任务状态为违规状态（后台管理）
  async changeStatus(data) {
    const { id } = data;

    let isExist = await this.taskRepo.findOne(id);
    if (!isExist) {
      return resFormat(false, null, '该任务不存在');
    }

    let res = await this.taskRepo.update(id, { status: 6 });

    if (res.raw.affectedRows > 0) {
      return resFormat(true, null, '更改任务状态为违规状态成功');
    } else {
      return resFormat(false, null, '更改任务状态为违规状态失败');
    }
  }


  // ====================================== 创作者 ======================================
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
    let publish_time =  new Date()

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

  // 获取创作者任务统计数据（创作者）
  async getStateByOrigin(user) {
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

  // 获取创作者任务列表（创作者，根据task_id查询）
  async getListByTaskId(user, data) {
    const { id } = user;
    const { page, pageNum } = data;

    let searchData: any = searchParams(data, ['platform_type', 'platform_id'], ['page', 'pageNum']);
    console.log(searchData);

    //   let sql = this.userRepo.createQueryBuilder('user')
    //   .select(['user.*', 'u.username referrer_username', '(select count(*) from user where u.id = referrer_user_id) referrer_num', '(select count(*) from platform where status = 2 and user.id = user_id) platformStatusNum'])
    //   .leftJoinAndSelect(User, 'u', 'user.referrer_user_id = u.id')
    //   .where('(user.id like :search or user.username like :search or user.email like :search or user.qq like :search or user.mobile like :search or user.freeze_reason like :search or user.name like :search or user.idcardno like :search)')
    //   .andWhere('user.role like :role and user.freeze_status like :freeze_status and user.isVip like :isVip and user.real_status like :real_status');

    // if (data.create_time && data.create_time.length === 2) {
    //   sql.andWhere('user.create_time between :create_time1 and :create_time2', { create_time1: data.create_time[0], create_time2: data.create_time[1] });
    // }

    // 按照task_id,platform_type,platform_head_thumb分组
    // task_id：父任务编号，platform_type：活动平台类型，platform_name：平台账号，gold：金币数，task_num：总任务数，statusNum0：未开始任务数，statusNum1：进行中任务数，statusNum2：待审核任务数，statusNum3：审核通过任务数，statusNum4：审核不通过任务数，statusNum5：已取消任务数，statusNum6：违规任务数，publish_time：发布时间
    // let res: any = await this.taskRepo.query(`select t.task_id, t.platform_type, p.platform_name, sum(gold) gold, (select count(*) from task where task_id = t.task_id) task_num, (select count(*) from task where status = 0 and task_id = t.task_id) statusNum0, t.publish_time from task t left join platform p on t.platform_id = p.id where t.user_id = '${id}' and t.platform_type like '${searchData.platform_type}' and  t.platform_id like '${searchData.platform_id}' group by t.task_id, t.platform_type, p.platform_name, t.publish_time limit ${(page - 1) * pageNum}, ${pageNum}`);
    let sql = this.taskRepo.createQueryBuilder('task')
      .select([])

    return resFormat(true, res, null);
  }

  // 取消任务（创作者）
  async taskCancel(user, data) {
    const { id } = user;
    const { task_id } = data;

    // 只能取消未开始的任务
    let res = await this.taskRepo.update({ user_id: id, task_id, status: 0 }, { status: 5 });

    if (res.raw.affectedRows > 0) {
      return resFormat(true, null, `已取消父任务[${task_id}]下的所有子任务`);
    } else {
      return resFormat(false, null, `取消父任务[${task_id}]失败`);
    }
  }


  // ====================================== 刷手 ======================================
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
}
