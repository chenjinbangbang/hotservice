import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

// 连接mysql数据库
import { TypeOrmModule } from '@nestjs/typeorm'; // 使用TypeORM是因为它是TypeScript中最成熟的对象关系映射器（ORM）
import { Connection } from 'typeorm';
import { Photo } from './photo/photo.entity'; // 使用photo实体，需要让TypeORM知道它插入实体数组
import { PhotoModule } from './photo/photo.module';

@Module({
  imports: [
    // forRoot()方法接受与来自TypeORM包的createConnection()相同的配置对象
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '47.104.194.187',
      port: 3306,
      username: 'root',
      password: 'Achenjinbang_15915155079',
      database: 'hot',
      // entities: [__dirname + '/**/*.entity{.ts,.js}'], // 静态全局路劲不适用于webpack热重载
      entities: [Photo],
      synchronize: true
    }),
    UserModule,
    AuthModule,
    PhotoModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  // 一旦完成，TypeORM连接和EntityManager对象就可以在整个项目中注入（不需要导入任何模块）
  constructor(private readonly connection: Connection) { }
}
