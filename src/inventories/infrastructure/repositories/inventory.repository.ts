import { Injectable } from '@nestjs/common';

import { SelectedFields } from '@inventories/domain/types';
import { InventoryEntity } from '@inventories/domain/entities';
import { Pagination } from '@common/domain/types';
import { Repository } from '@common/domain/entities';
import { PrismaProvider } from '@database/infrastructure/providers';

@Injectable()
export class InventoryRepository implements Partial<Repository<InventoryEntity>> {

    constructor(private readonly prisma: PrismaProvider) { }

    public async findAll(shopId: string, page: Pagination, fields?: SelectedFields): Promise<Partial<InventoryEntity>[]> {
        return this.prisma.inventory.findMany({
            where: { shop_id: shopId },
            orderBy: { created_at: 'asc' },
            select: fields,
            skip: page.skip,
            take: page.take
        });
    }

    public async findOne(id: string, fields?: SelectedFields): Promise<Partial<InventoryEntity>> {
        return this.prisma.inventory.findUnique({
            where: { id: id },
            select: fields
        });
    }

    public async create(newInventory: Partial<InventoryEntity>): Promise<InventoryEntity> {
        return this.prisma.inventory.create({
            data: {
                shop_id: newInventory.shop_id,
                cost: newInventory.cost,
                total: newInventory.total,
                subtotal: newInventory.subtotal,
            }
        })
    }

    public async update(id: string, inventory: Partial<InventoryEntity>): Promise<InventoryEntity> {
        return this.prisma.inventory.update({ 
            where: { id: id },
            data: inventory
        });
    }

    public async delete(id: string): Promise<InventoryEntity>  {
        return this.prisma.inventory.delete({ where: { id: id }})
    }
}
