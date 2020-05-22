import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// 连接mysql数据库
import { TypeOrmModule } from '@nestjs/typeorm'; // 使用TypeORM是因为它是TypeScript中最成熟的对象关系映射器（ORM）
import { Connection } from 'typeorm';
import { APP_PIPE, APP_FILTER } from '@nestjs/core';
// import { Photo } from './photo/photo.entity'; // 使用photo实体，需要让TypeORM知道它插入实体数组

import { ScheduleModule } from '@nestjs/schedule'

import { HttpExceptionFilter } from './common/http-exception.filter'

// 模块
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { BasicModule } from './basic/basic.module';
import { PayModule } from './pay/pay.module';
import { BankModule } from './bank/bank.module';
import { PlatformModule } from './platform/platform.module';
import { WealthModule } from './wealth/wealth.module';
import { DepositModule } from './deposit/deposit.module';
import { CommissionModule } from './commission/commission.module';
import { NoticeModule } from './notice/notice.module';
import { TaskModule } from './task/task.module';

/**
 * 全局模块
 */
@Module({
  imports: [
    // forRoot()方法接受与来自TypeORM包的createConnection()相同的配置对象
    TypeOrmModule.forRoot(
      {
        type: 'mysql', // 数据库类型
        host: '47.104.194.187', // 数据库ip地址
        port: 3306, // 端口
        username: 'root', // 登录名
        password: 'Achenjinbang_15915155079', // 密码
        database: 'hot', // 数据库名称
        entities: [__dirname + '/**/**/*.entity{.ts,.js}'], // 扫描本项目中.entity.ts或者.entity.js的文件，静态全局路径不适用于webpack热重载
        // entities: [Photo],
        synchronize: true // 定义数据库表结构与实体类字段同步（这里一旦数据库少了字段就会自动加入，根据需要来使用）
      }
    ),
    // 激活工作调度
    ScheduleModule.forRoot(),
    AuthModule,
    BasicModule,
    UserModule,
    PayModule,
    BankModule,
    PlatformModule,
    WealthModule,
    DepositModule,
    CommissionModule,
    NoticeModule,
    TaskModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    },

    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    }
  ],
})
export class AppModule {
  // 建立连接。一旦完成，TypeORM连接和EntityManager对象就可以在整个项目中注入（不需要导入任何模块）
  constructor(private readonly connection: Connection) { }
}
