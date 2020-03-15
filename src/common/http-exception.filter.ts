import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

// @Catch(HttpException)
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  // catch(exception: HttpException, host: ArgumentsHost) {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    // const status = exception.getStatus();

    // console.log(exception instanceof HttpException);
    // console.log(request);

    // 捕获异常。为了捕获每一个未处理的异常（不管异常类型如何）。将@Catch()装饰器的参数列表设为空。过滤器将捕获抛出的每个异常，而不管其类型如何
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    response
      .status(status)
      .json({
        statusCode: status,
        // request,
        timestamp: new Date().toISOString(),
        path: request.url,
        data: exception
      })
  }
}