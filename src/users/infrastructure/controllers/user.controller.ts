import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateUserDto, UpdateUserDto } from '@users/domain/dtos';
import { UserParams } from '@users/domain/types';
import { UserEntity } from '@users/domain/entities';
import { UserService } from '@users/application/services';
import { ApiCreateUser, ApiDeleteUser, ApiGetUser, ApiGetUsers, ApiUpdateUser } from '@users/application/decorators';
import { UserGuard, CreateUserGuard } from '@users/application/guards';
import { UserFieldsInterceptor } from '@users/application/interceptors';
import { Roles } from '@common/domain/enums';
import { PublicAccess, Role } from '@common/application/decorators';
import { RoleGuard } from '@auth/application/guards';

@ApiTags('Users')
@Controller('users')
export class UserController {

    constructor(private readonly service: UserService) { }

    @ApiGetUsers()
    @Role(Roles.ADMIN)
    @UseGuards(RoleGuard)
    @UseInterceptors(UserFieldsInterceptor)
    @Get()
    public async findAll(@Req() req: Request, @Query() queries?: UserParams): Promise<UserEntity[] | Partial<UserEntity>[]> {
        if (!req['user']) throw new HttpException('credentials missing', HttpStatus.BAD_REQUEST);
        if (!queries.limit || !queries.page) throw new HttpException("'page' or 'limit' param missing", HttpStatus.BAD_REQUEST);

        const { page, limit, q } = queries;

        return this.service.findAllUsers({
            skip: (page - 1) * limit,
            take: limit ? +limit : 10
        }, q);
    }

    @ApiGetUser()
    @Role(Roles.ADMIN, Roles.CUSTOMER)
    @UseGuards(RoleGuard, UserGuard)
    @UseInterceptors(UserFieldsInterceptor)
    @Get(':id')
    public async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<UserEntity> {
        const user: UserEntity = await this.service.findOneUser(id);

        if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        return user;
    }
    
    @ApiCreateUser()
    @PublicAccess()
    @UseGuards(CreateUserGuard)
    @UseInterceptors(UserFieldsInterceptor)
    @Post()
    public async create(@Body() body: CreateUserDto, @Req() req?: Request): Promise<UserEntity> {
        const isExist: boolean = !!await this.service.findOneUser(null, body.email);

        if (req && req['user'] && req['user']['role'] === Roles.CUSTOMER) throw new HttpException('Cannot register when logged in', HttpStatus.FORBIDDEN);
        if (req && !req['user'] && body.role && body.role === Roles.ADMIN) throw new HttpException('Not enough permissions', HttpStatus.FORBIDDEN);
        if (isExist) throw new HttpException('This user already exists', HttpStatus.FORBIDDEN);

        const user: UserEntity = await this.service.createUser(body);

        return user;
    }

    @ApiUpdateUser()
    @Role(Roles.ADMIN, Roles.CUSTOMER)
    @UseGuards(RoleGuard, UserGuard)
    @UseInterceptors(UserFieldsInterceptor)
    @Patch(':id')
    public async update(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: Request, @Body() body: UpdateUserDto): Promise<UserEntity> {
        const user: UserEntity = await this.service.updateUser(id, body, req['user']['role']);

        if (user === null) throw new HttpException('Wrong credentials', HttpStatus.NOT_ACCEPTABLE);
        if (user === undefined) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        if (!user) throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);

        return user;
    }

    @ApiDeleteUser()
    @Role(Roles.ADMIN, Roles.CUSTOMER)
    @UseGuards(RoleGuard, UserGuard)
    @Delete(':id')
    public async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<unknown> {
        const res: string = await this.service.deleteUser(id);

        if (!res) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        return { message: res };
    }
}