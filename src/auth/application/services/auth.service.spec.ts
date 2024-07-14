import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { mockUserRepository } from '../../../users/domain/mocks/user-providers.mock';
import { userMock1, userMock2 } from '../../../users/domain/mocks/user.mocks';
import { BcryptProvider } from '../../../common/application/providers/bcrypt.provider';
import { Repository } from '../../../common/domain/entities';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { EmailModule } from 'src/email/email.module';

describe('AuthService', () => {
  let userRepository: Repository<UserEntity>;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        BcryptProvider,
        {
          provide: Repository<UserEntity>,
          useValue: mockUserRepository
        }
      ],
      imports: [
        ConfigModule,
        JwtModule.register({}),
        EmailModule.register({
          options: {
            apiKey: 'API_KEY',
            authUrl: '',
            host: '',
            resetPasswordUrl: ''
          }
        })
      ]
    }).compile();

    userRepository = module.get<Repository<UserEntity>>(Repository<UserEntity>);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Login', () => {
    it('should login user', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userMock2);

      const res = await service.login({
        email: userMock2.email,
        password: userMock2.password
      });

      expect(res).toBeDefined();
    });

    it('should return undefined if user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const res = await service.login({
        email: userMock2.email,
        password: userMock2.password
      });

      expect(res).toBeUndefined();
    });

    it('should return null if password does not match', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userMock2);

      const res = await service.login({
        email: userMock2.email,
        password: userMock1.password
      });

      expect(res).toBeNull();
    })
  });

  describe('Refresh Tokens', () => {
    it('should return null if user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const res: string = await service.refreshTokens(userMock2.id, userMock2.refresh_token);

      expect(res).toBeNull();
    });

    it('should return null if access token does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userMock1);

      const res: string = await service.refreshTokens(userMock2.id, userMock2.refresh_token);

      expect(res).toBeUndefined();
    });

    it('should return undefined if refresh token does not match', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userMock1);

      const res: string = await service.refreshTokens(userMock2.id, userMock2.refresh_token);

      expect(res).toBeUndefined();
    });
  });

  describe('Logout', () => {
    it('should logout user', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userMock2);

      let { refresh_token, ...rest } = userMock2;
      refresh_token = null;

      jest.spyOn(userRepository, 'update').mockResolvedValue({ refresh_token, ...rest});

      const res = await service.logOut(userMock2.id);

      expect(res).toBeDefined();
      expect(res).toBe('User logout successfully');
    });

    it('should return null if user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const res = await service.logOut(userMock2.id);

      expect(res).toBeNull();
    });
  });
});
