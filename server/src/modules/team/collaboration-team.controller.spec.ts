import { Test, TestingModule } from '@nestjs/testing';
import { CollaborationTeamController } from './collaboration-team.controller';

describe('CollaborationTeamController', () => {
  let controller: CollaborationTeamController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollaborationTeamController],
    }).compile();

    controller = module.get<CollaborationTeamController>(CollaborationTeamController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
