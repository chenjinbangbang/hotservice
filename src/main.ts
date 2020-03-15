import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// swagger
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import { HttpException } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useGlobalFilters(new HttpException());

  // 配置swagger选项对象
  const options = new DocumentBuilder() // DocumentBuilder有助于构建符合OpenAPI规范的基础文档。
    .setTitle('Hot 接口文档') // 标题
    .setDescription('The hot API description') // 描述
    .setVersion('1.0') // 版本
    .addTag('接口文档')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document); // 1. Swagger UI的挂载路径。2. 应用程序实例。3. 上面已经实例化的文档对象document

  await app.listen(4001);
}
bootstrap();
