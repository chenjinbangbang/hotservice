import { IsString, IsInt, IsBoolean } from 'class-validator';

export class AuthDto {
  @IsInt()
  readonly id: number;

  @IsString()
  readonly name: string;

  @IsInt()
  readonly age: number;

  @IsBoolean()
  readonly sex: boolean;
}