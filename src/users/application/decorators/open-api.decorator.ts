import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';

import { UserEntity } from '../../domain/entities/user.entity';

export const ApiGetUsers = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get users' }),
    ApiResponse({ type: UserEntity, isArray: true }),
    ApiResponse({ status: 403, description: 'Without enough permissions' }),
    ApiResponse({ status: 500, description: 'Server error' }),
    ApiQuery({ name: 'page', required: true, example: '0, 10' }),
    ApiQuery({ name: 'q', required: false, description: 'search param to filter results' })
);

export const ApiGetUser = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get a user' }),
    ApiResponse({ type: UserEntity }),
    ApiResponse({ status: 404, description: 'User not found' }),
    ApiResponse({ status: 500, description: 'Server error' }),
    ApiParam({ name: 'id', description: 'User id', format: 'uuid' })
);

export const ApiCreateUser = () => applyDecorators(
    ApiOperation({ summary: 'Create user' }),
    ApiResponse({ status: 201, description: 'User created succesfully' }),
    ApiResponse({ status: 400, description: 'Validations error' }),
    ApiResponse({ status: 409, description: 'User already exist or you are already logged, method not allowed' }),
    ApiResponse({ status: 500, description: 'Internal server error' })
);

export const ApiUpdateUser = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update user' }),
    ApiResponse({ status: 200, description: 'User created succesfully' }),
    ApiResponse({ status: 400, description: 'Validations error' }),
    ApiResponse({ status: 404, description: 'User not found' }),
    ApiResponse({ status: 406, description: 'Wrong credentials' }),
    ApiResponse({ status: 500, description: 'Internal server error' }),
    ApiParam({ name: 'id', description: 'User id', format: 'uuid' })
);

export const ApiDeleteUser = () => applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete user' }),
    ApiResponse({ status: 200, description: 'User deleted succesfully' }),
    ApiResponse({ status: 400, description: 'Validations error' }),
    ApiResponse({ status: 404, description: 'User not found' }),
    ApiResponse({ status: 500, description: 'Internal server error' }),
    ApiParam({ name: 'id', description: 'User id', format: 'uuid' })
);