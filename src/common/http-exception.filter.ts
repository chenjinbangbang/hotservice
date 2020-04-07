import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

// @Catch(HttpException)
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  // catch(exception: HttpException, host: ArgumentsHost) {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    // const status = exception.getStatus();

    // console.log(exception instanceof HttpException);
    // console.log(request.query);

    // 捕获异常。为了捕获每一个未处理的异常（不管异常类型如何）。将@Catch()装饰器的参数列表设为空。过滤器将捕获抛出的每个异常，而不管其类型如何
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // 处理返回信息
    let message: any = ''

    if (status === 400) {
      let constraints = exception.response.message[0].constraints;
      if (constraints) {
        let values = Object.values(constraints);
        message = values[0];
      }
    }

    if (status === 401) {
      message = exception.response.message
    }

    if (status === 500) {
      message = exception.message
    }

    response
      .status(status)
      .json({
        statusCode: status,
        // request,
        timestamp: new Date().toISOString(),
        path: request.url,
        data: message ? { message } : exception
      })
  }
}