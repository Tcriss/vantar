import { Test, TestingModule } from "@nestjs/testing";
import { Prisma } from "@prisma/client";

import { ProductRepository } from "./product.repository";
import { PrismaProvider } from "@database/infrastructure/providers";
import { ProductEntity } from "@products/domain/entities";
import { productMock1, productMock2, productMock3, productMock4, productMock5, productMock6, prismaMock } from "@products/domain/mocks";

describe('Customer', () => {
    let repository: ProductRepository;
    let prisma: PrismaProvider;
  
    beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ProductRepository,
          {
            provide: PrismaProvider,
            useValue: prismaMock
          }
        ],
      }).compile();
  
      prisma = module.get<PrismaProvider>(PrismaProvider);
      repository = module.get<ProductRepository>(ProductRepository);
    });
  
    it('should be defined', () => {
      expect(repository).toBeDefined();
    });

    describe('Find All Products', () => {
      it('should fetch all products', async () => {
        jest.spyOn(prisma.product, 'findMany').mockResolvedValue([ productMock1, productMock2, productMock3 ]);

        const res: Partial<ProductEntity>[] = await repository.findAll('123', { take: 10, skip: 0 });

        expect(res).toBeInstanceOf(Array);
        expect(res).toEqual([ productMock1, productMock2, productMock3 ]);
      });

      it('should fetch inventory products', async () => {
        jest.spyOn(prisma.product, 'findMany').mockResolvedValue([ productMock1, productMock4, productMock5 ]);

        const res: Partial<ProductEntity>[] = await repository.findAll('123', { take: 10, skip: 0 });

        expect(res).toEqual([ productMock1, productMock4, productMock5 ]);
      });

      it('should fetch what pagination indicates', async () => {
        jest.spyOn(prisma.product, 'findMany').mockResolvedValue([ productMock3 ]);

        const res: Partial<ProductEntity>[] = await repository.findAll('123', { take: 1, skip: 2 });

        expect(res).toHaveLength(1);
        expect(res).toEqual([ productMock3 ]);
      });
    });

    describe('Find One Product', () => {
      it('should fecth one prodcut', async () => {
        jest.spyOn(prisma.product, 'findUnique').mockResolvedValue(productMock2);

        const res: Partial<ProductEntity> = await repository.findOne(productMock2.id);

        expect(res).toBe(productMock2);
      });
    });

    describe('Create Many Products', () => {
      it('should create many products', async () => {
        jest.spyOn(prisma.product, 'createMany').mockResolvedValue({ count: 2 });

        const res: Prisma.BatchPayload = await repository.createMany([
          {
            id: null,
            created_at: productMock1.created_at,
            shop_id: productMock1.shop_id,
            name: productMock1.name,
            price: productMock1.price,
          },
          {
            id: null,
            created_at: productMock1.created_at,
            shop_id: productMock2.shop_id,
            name: productMock2.name,
            price: productMock2.price,
          }
        ]);

        expect(res.count).toBe(2);
      });
    });

    describe('Create One Product', () => {
      it('should create a product', async () => {
        jest.spyOn(prisma.product,'create').mockResolvedValue(productMock1);

        const { name, price } = productMock1;
        const res: ProductEntity = await repository.create({ name, price });

        expect(res).toBe(productMock1);
      });
    });

    describe('Update Product', () => {
      it('should update a prodcut', async () => {
        jest.spyOn(prisma.product,'update').mockResolvedValue(productMock6);

        const { name, price } = productMock2;
        const res: ProductEntity = await repository.update(productMock1.id, { name, price });

        expect(res).toBe(productMock6);
      });
    });

    describe('Delete Product', () => {
      it('should delete a product', async () => {
        jest.spyOn(prisma.product,'delete').mockResolvedValue(productMock6);

        const res: ProductEntity = await repository.delete(productMock6.id);

        expect(res).toBe(productMock6);
      });
    });
});