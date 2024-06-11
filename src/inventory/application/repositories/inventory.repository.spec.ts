import { Test, TestingModule } from '@nestjs/testing';

import { InventoryRepository } from './inventory.repository';
import { PrismaProvider } from '../../../prisma/application/providers/prisma.provider';
import { prismaMock } from '../../domain/mocks/inventory-providers.mock';
import { mockInventory1, mockInventory2, mockInventory3 } from '../../domain/mocks/inventory.mock';
import { InventoryEntity } from '../../domain/entities/inventory.entity';

describe('Customer', () => {
  let repository: InventoryRepository;
  let prisma: PrismaProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryRepository,
        {
          provide: PrismaProvider,
          useValue: prismaMock
        }
      ],
    }).compile();

    prisma = module.get<PrismaProvider>(PrismaProvider);
    repository = module.get<InventoryRepository>(InventoryRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('Find All Inventories', () => {
    it('should find all inventories', async () => {
      jest.spyOn(prisma.inventory, 'findMany').mockResolvedValue([ mockInventory1, mockInventory3 ]);

      const res: Partial<InventoryEntity>[] = await repository.findAll(mockInventory1.customer_id, { skip: 1, take: 2 });

      expect(res).toBeInstanceOf(Array);
      expect(res).toHaveLength(2);
      expect(res).toEqual([ mockInventory1, mockInventory3 ]);
    });

    it('should only bring one element', async () => {
      jest.spyOn(prisma.inventory, 'findMany').mockResolvedValue([mockInventory1]);

      const res: Partial<InventoryEntity>[] = await repository.findAll(mockInventory1.customer_id, { skip: 0, take: 1 });

      expect(res).toBeInstanceOf(Array);
      expect(res).toHaveLength(1);
      expect(res).toEqual([ mockInventory1 ]);
    });
  });

  describe('Find One Inventory', () => {
    it('should find a inventory', async () => {
      jest.spyOn(prisma.inventory, 'findUnique').mockResolvedValue(mockInventory2);

      const res: Partial<InventoryEntity> = await repository.findOne(mockInventory2.id);

      expect(res).toEqual(mockInventory2);
    });

    it('should fetch some fields from an inventory', async () => {
      jest.spyOn(prisma.inventory, 'findUnique').mockResolvedValue(mockInventory2);

      const res: Partial<InventoryEntity> = await repository.findOne(mockInventory2.id, {
        company_name: true,
        id: true,
        products_amount: true,
        created_at: false,
        capital: false,
        customer_id: false,
        service_charge: false
      });

      expect(res).toEqual(mockInventory2);
    });
  });

  describe('Create InventorY', () => {
    it('should create a inventory', async () => {
      jest.spyOn(prisma.inventory, 'create').mockResolvedValue(mockInventory2);

      const { company_name, capital, customer_id, service_charge } = mockInventory2;
      const res: Partial<InventoryEntity> = await repository.create({ company_name, capital, customer_id, service_charge });

      expect(res).toEqual(mockInventory2);
    });
  });

  describe('Update InventorY', () => {
    it('should update a inventory', async () => {
      jest.spyOn(prisma.inventory, 'update').mockResolvedValue(mockInventory3);

      const { company_name, capital, customer_id, service_charge } = mockInventory2;
      const res: Partial<InventoryEntity> = await repository.update(mockInventory1.id, { company_name, capital, customer_id, service_charge });

      expect(res).toEqual(mockInventory3);
    });
  });

  describe('Delete InventorY', () => {
    it('should delete a inventory', async () => {
      jest.spyOn(prisma.inventory, 'delete').mockResolvedValue(mockInventory3);

      const res: Partial<InventoryEntity> = await repository.delete(mockInventory3.id);

      expect(res).toEqual(mockInventory3);
    });
  });
});
