import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from 'src/entity/task.entity';
import { Repository } from 'typeorm';
import { searchParams, removeRawMany, resFormat } from 'src/common/global';
import { User } from 'src/entity/user.entity';
import { Platform } from 'src/entity/platform.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    @InjectRepository(User) private readonly userRepo: Repository<User>
  ) { }

  // 获取任务列表（后台管理，根据id查询查询）
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
    console.log(data);
    const { id } = data

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

  // 发布任务（创作者）
  async publishTask(user, data) {
    const { id } = user;
    let { platform_type, platform_id, task_img1, task_img2, task_entry, complete_countdown_time, task_num, attention_time, comment_content, transpond, transpond_content, remark, goldNum } = data;

    console.log(data);
    let taskArr: any[] = [];
    for (let i = 0; i < task_num; i++) {

      let taskData: any = {
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
      if (comment_content.length > 0) {
        // 有评价内容时
        let commentIndex = Math.floor(Math.random() * comment_content.length); // 0, 1
        taskData.comment_content = comment_content[commentIndex];

        comment_content.splice(commentIndex, 1);
      }

      // 判断是否有转发，没有则transpond为0，任务金币平均
      if (transpond === 0) {
        taskData.transpond = 0
        taskData.gold = goldNum / task_num
      } else if (transpond === 1) {
        // 有转发时
        // 
      }
      console.log(taskData);

      let taskCreateData = this.taskRepo.create(taskData);
      taskArr.push(taskCreateData)
    }

  }

  // 获取可接任务列表（刷手）
  async getListSimple(user, data) {
    const { id } = user;
    const { page, pageNum } = data;

    let searchData: any = searchParams(data, ['platform_type'], ['page', 'pageNum']);
    console.log(searchData);

    // 按照task_id,platform_type,platform_head_thumb分组
    // task_id：一级任务编号，platform_type：活动平台类型，platform_type：平台账号头像，task_total：总任务数，task_num：剩余任务数，goldMin：最少佣金数，goldMax：最大佣金数
    // 最多返回100个任务，然后进行筛选：做过该创作者的任务，并且3个月内刷过，则不显示
    let res: any = await this.taskRepo.query(`select t1.task_id, t1.platform_type, p.platform_head_thumb platform_head_thumb, count(*) task_total, (select count(*) from task t2 where t2.status = 0 and t1.task_id = t2.task_id) task_num, (select min(gold) from task where status = 0 and task.task_id = t1.task_id) goldMin, (select max(gold) from task where status = 0 and task.task_id = t1.task_id) goldMax from task t1 left join platform p on t1.platform_id = p.id where t1.platform_type like '%${searchData.platform_type}%' group by t1.task_id, t1.platform_type, p.platform_head_thumb having task_num > 0 limit ${(page - 1) * pageNum}, ${pageNum}`);

    return resFormat(true, res, null);
  }
}
