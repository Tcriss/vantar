import { UserGuard } from './user.guard';

describe('OwnerGuard', () => {
  it('should be defined', () => {
    expect(new UserGuard()).toBeDefined();
  });
});
