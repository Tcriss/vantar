import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { ShopEntity } from '@shops/domain/entities';
import { ShopParams } from '@shops/domain/types';
import { CreateShopDto, UpdateShopDto } from '@shops/domain/dtos';
import { ShopService } from '@shops/application/services';
import { ApiCreateShop, ApiDeleteShop, ApiGetShop, ApiGetShops, ApiUpdateShop } from '@shops/application/decorators';
import { Roles } from '@common/domain/enums';
import { Role } from '@common/application/decorators';
import { RoleGuard } from '@auth/application/guards';

@Role(Roles.CUSTOMER)
@ApiBearerAuth()
@UseGuards(RoleGuard)
@ApiTags('Shops')
@Controller('shops')
export class ShopController {

    constructor(private readonly service: ShopService) {}

    @ApiGetShops()
    @Get()
    public async findAll(@Req() request: Request, @Query() queries: ShopParams): Promise<Partial<ShopEntity>[]> {
        if (!queries.limit || !queries.page) throw new HttpException("'page' or 'limit' param missing", HttpStatus.BAD_REQUEST);

        const userId: string = request['user']['id'];
        const { page, limit, fields } = queries;
        const res = await this.service.findAll(
            userId,
            {
                skip: (page - 1) * limit,
                take: +limit
            },
            fields
        );

        return res;
    }

    @ApiGetShop()
    @Get(':id')
    public async findOne(@Param('id', new ParseUUIDPipe()) id: string, @Query('fields') fields: string): Promise<Partial<ShopEntity>> {
        const res = await this.service.findOne(id, fields);

        if (!res) throw new HttpException('Shop not found', HttpStatus.NOT_FOUND);

        return res;
    }

    @ApiCreateShop()
    @Post()
    public async create(@Req() req: unknown, @Body() shop: CreateShopDto): Promise<{ message: string, shop: unknown }> {
        const userId: string = req['user']['id'];
        const res = await this.service.create(shop, userId);

        if (!res) throw new HttpException('Shop not created', HttpStatus.INTERNAL_SERVER_ERROR);

        return {
            message: 'Shop created succesfully',
            shop: res
        };
    }

    @ApiUpdateShop()
    @Patch(':id')
    public async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() shop: UpdateShopDto): Promise<{ message: string, shop: unknown }> {
        const res = await this.service.update(id, shop);

        if (!res) throw new HttpException('Shop not updated', HttpStatus.INTERNAL_SERVER_ERROR);

        return {
            message: 'Shop updated succesfully',
            shop: res
        };
    }

    @ApiDeleteShop()
    @Delete(':id')
    public async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<{ message: string }> {
        const res = await this.service.delete(id);

        if (!res) throw new HttpException('Shop not deleted', HttpStatus.INTERNAL_SERVER_ERROR);

        return { message: 'Shop deleted succesfully' };
    }
}
