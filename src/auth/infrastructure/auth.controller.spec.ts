import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { userMock, userMock2 } from '@users/domain/mocks';
import { Roles } from '@common/domain/enums';
import { mockAuthService } from '@auth/domain/mocks';
import { AuthService } from '@auth/application/services';

describe('AuthController', () => {
  let service: AuthService;
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService
        }
      ],
      controllers: [AuthController],
      imports: [
        JwtModule.register({}),
        ConfigModule
      ]
    }).compile();

    service = module.get<AuthService>(AuthService);
    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(controller).toBeDefined();
  });

  describe('Login User', () => {
    it('should log user in', async () => {
      jest.spyOn(service, 'login').mockResolvedValue({
        access_token: '123456',
        refresh_token: '654321'
      });

      const { email, password } = userMock;
      const res = await controller.login({ email, password });

      expect(res['message']).toBe('Login successfull');
      expect(res['access_token']).toBe('123456');
      expect(res['refresh_token']).toBe('654321')
    });

    it('should throw exception if credentials are wrong', async () => {
      jest.spyOn(service, 'login').mockResolvedValue(null);

      const { email, password } = userMock;

      try {
        await controller.login({ email, password });
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.status).toBe(HttpStatus.NOT_ACCEPTABLE);
        expect(err.message).toBe('Wrong credentials');
      }
    });

    it('should throw exception if user not found', async () => {
      jest.spyOn(service, 'login').mockResolvedValue(undefined);

      const { email, password } = userMock;

      try {
        await controller.login({ email, password });
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.status).toBe(HttpStatus.NOT_ACCEPTABLE);
        expect(err.message).toBe('Wrong credentials');
      }
    });
  });

  describe('Refresh Tokens', () => {
    it('should refresh tokens', async () => {
      jest.spyOn(service, 'refreshTokens').mockResolvedValue('654321');

      const res: string = await controller.refresh({
        refresh_token: {
          id: userMock2.id,
          email: userMock2.email,
          name: userMock2.name,
          role: userMock2.role as Roles
        }
      } as any, { refresh_token: '12222' });

      expect(res).toEqual('654321');
    });

    it('should throw an exception if user was not found', async () => {
      jest.spyOn(service, 'refreshTokens').mockResolvedValue(null);
      
      try {
        await controller.refresh({
          refresh_token: {
            id: userMock2.id,
            email: userMock2.email,
            name: userMock2.name,
            role: userMock2.role as Roles
          }
        } as any, { refresh_token: '12222' });
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(err.message).toBe('Session expired');
      }
    });

    it('should throw an exception if token was not found', async () => {
      jest.spyOn(service, 'refreshTokens').mockResolvedValue(null);
      
      try {
        await controller.refresh({
          refresh_token: {
            id: userMock2.id,
            email: userMock2.email,
            name: userMock2.name,
            role: userMock2.role as Roles
          }
        } as any, { refresh_token: '12222' });
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(err.message).toBe('Session expired');
      }
    });

    it('should throw an exception if tokens does not match', async () => {
      jest.spyOn(service, 'refreshTokens').mockResolvedValue(undefined);
      
      try {
        await controller.refresh({
          refresh_token: {
            id: userMock2.id,
            email: userMock2.email,
            name: userMock2.name,
            role: userMock2.role as Roles
          }
        } as any, { refresh_token: '12222' });
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.status).toBe(HttpStatus.NOT_ACCEPTABLE);
        expect(err.message).toBe('Invalid token');
      }
    })
  });

  describe('Logout User', () => {
    it('should logout user', async () => {
      jest.spyOn(service, 'logOut').mockResolvedValue('User logout successfully');

      const res: string = await controller.logOut({
          refresh_token: {
            id: userMock2.id,
            email: userMock2.email,
            name: userMock2.name,
            role: userMock2.role as Roles
          }
        } as any);

      expect(res).toBe('User logout successfully');
    });

    it('should throw an exception if user not found', async () => {
      jest.spyOn(service, 'logOut').mockResolvedValue(null);

      try {
        await controller.logOut({
          refresh_token: {
            id: userMock2.id,
            email: userMock2.email,
            name: userMock2.name,
            role: userMock2.role as Roles
          }
        } as any);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.status).toBe(HttpStatus.NOT_FOUND);
        expect(err.message).toBe('User not found');
      }
    });

    it('should throw an exception if user could not be logout', async () => {
      jest.spyOn(service, 'logOut').mockResolvedValue(undefined);

      try {
        await controller.logOut({
          refresh_token: {
            id: userMock2.id,
            email: userMock2.email,
            name: userMock2.name,
            role: userMock2.role as Roles
          }
        } as any)
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(err.message).toBe('User could not logout');
      }
    });
  });

  describe('Forgot Password', () => {
    it('Should pass', async () => {
      jest.spyOn(service, 'forgotPassword').mockResolvedValue();

      const res = await controller.forgotPassword({ email: 'example@email.com' });

      expect(res['message']).toBe('If this user exist, an email will be sent by e-mail')
    });
  });

  describe('Activate Account', () => {
    it('', async () => {
      jest.spyOn(service, 'activateAccount').mockResolvedValue('Account activated successfully');

      const res = await controller.activateAccount('TOKEN');

      expect(res['message']).toBe('Account activated successfully');
    });

    it('should throw an exception if token is invalid', async () => {
      jest.spyOn(service, 'activateAccount').mockResolvedValue(null);

      try {
        await controller.activateAccount('TOKEN');
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.status).toBe(HttpStatus.CONFLICT);
        expect(err.message).toBe('Invalid token');
      }
    });
  });

  describe('Reset Password', () => {
    it('should reset password', async () => {
      jest.spyOn(service, 'resetPassword').mockResolvedValue('Password reseted successfully');

      const res = await controller.resetPassword({ password: '123456' }, 'TOKEN');

      expect(res['message']).toBe('Password updated successfully');
    });

    it('should throw an exception if token is invalid', async () => {
      jest.spyOn(service, 'resetPassword').mockResolvedValue(null);

      try {
        await controller.resetPassword({ password: '123456' }, 'TOKEN');
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.status).toBe(HttpStatus.CONFLICT);
        expect(err.message).toBe('Invalid token');
      }
    });
  });
});
