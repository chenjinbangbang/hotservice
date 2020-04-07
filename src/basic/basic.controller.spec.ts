import { Test, TestingModule } from '@nestjs/testing';
import { BasicController } from './basic.controller';

describe('Basic Controller', () => {
  let controller: BasicController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BasicController],
    }).compile();

    controller = module.get<BasicController>(BasicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
