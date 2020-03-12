import { Controller, Get, Body, Put, ForbiddenException, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UserDto } from './dto/user.dto';
import { ApiBody, ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('user') // 要将控制器附加到特定标签
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('list')
  @ApiResponse({ type: [UserDto] }) // 响应的模型
  findAll() {
    return this.userService.findAll();
  }

  @Put()
  // @ApiBody({ type: [UserDto] }) // 
  async update(@Body() body: UserDto) {
    console.log(body)
    await this.userService.update(body);

  }

}
