import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// 配置静态资源服务器
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

// swagger
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// import { HttpException } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // app.useGlobalFilters(new HttpException());
  // console.log(join(__dirname, '..', 'uploads'));

  // 静态文件托管
  app.useStaticAssets(
    join(__dirname, '..', 'uploads'),
    { prefix: '/static/' } // 配置虚拟路径
  ) // 配置静态资源服务器
  // app.setBaseViewsDir(join(__dirname, '..', 'views')) // 配置html模板
  // app.setViewEngine('jade') // 配置模板引擎

  // 处理跨域
  app.enableCors()

  // 配置swagger选项对象
  const options = new DocumentBuilder() // DocumentBuilder有助于构建符合OpenAPI规范的基础文档。
    // .addSecurity('basic', { type: 'http', scheme: 'basic' }) // 使用安全性机制
    .addBearerAuth()
    .setTitle('Hot 接口文档') // 标题
    .setDescription('The hot API description') // 描述
    .setVersion('1.0') // 版本
    .addTag('接口文档')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document); // 1. Swagger UI的挂载路径。2. 应用程序实例。3. 上面已经实例化的文档对象document

  await app.listen(4000);
}
bootstrap();
