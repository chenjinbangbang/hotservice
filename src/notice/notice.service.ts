import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notice } from 'src/entity/notice.entity';
import { Repository } from 'typeorm';
import { resFormat } from 'src/common/global';

@Injectable()
export class NoticeService {
  constructor(@InjectRepository(Notice) private readonly noticeRepo: Repository<Notice>) { }

  // 获取公告列表
  async getList(data) {
    const { page, pageNum } = data;

    let res: any = await this.noticeRepo.createQueryBuilder('notice')
      .skip((page - 1) * pageNum)
      .take(pageNum)
      .getMany();

    let count: number = await this.noticeRepo.count();

    return resFormat(true, { lists: res, total: count }, null);
  }

  // 获取某个公告详情
  async getDetail(data) {
    const { id } = data;
    let res: any = await this.noticeRepo.findOne(id);

    if (res) {
      return resFormat(true, res, null);
    } else {
      return resFormat(false, null, '该公告不存在');
    }
  }
}
