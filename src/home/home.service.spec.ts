import { Test, TestingModule } from '@nestjs/testing';
import { HomeService, homeSelect } from './home.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyType } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

const mockGetHomes = [
  {
  id: 1,
  address: "Eziobodo RadioNodeList, futo",
  city: "Toronto",
  price: 150000,
  property_type: PropertyType.RESIDENTIAL,
  number_of_bedorooms: 3,
  number_of_bathrooms: 2.5,
  images: [
    {
      url: "src1"
    }
  ]
}
]

const mockhome =  {
  id: 1,
  address: "Eziobodo RadioNodeList, futo",
  city: "Toronto",
  price: 150000,
  property_type: PropertyType.RESIDENTIAL,
  number_of_bedorooms: 3,
  number_of_bathrooms: 2.5,
}

const mockImages = [
  {
    id: 1,
    url: "src1"
  },
  {
    id: 2,
    url: "src2"
  }
];



describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HomeService, {
        provide: PrismaService,
        useValue: {
          home: {
            findMany: jest.fn().mockReturnValue(mockGetHomes),
            create: jest.fn().mockReturnValue(mockhome)
          },
          image: {
            createMany: jest.fn().mockReturnValue(mockImages)
          }
        }
      }],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe("getHomes", () => {

    const filters = {
      city: "Toronto",
      price: {
          gte: 10000000,
          lte: 15000000,
      },
      propertyType: PropertyType.RESIDENTIAL
  }

    it("Should call prisma home.findMany with correct params", async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue(mockGetHomes);

      jest.spyOn(prismaService.home, "findMany").mockImplementation(mockPrismaFindManyHomes)

      await service.getHomes(filters)

      expect(mockPrismaFindManyHomes).toBeCalledWith({
        select: {
          ...homeSelect,
          images: {
            select: {
              url: true,
            },
            take: 1
          }
        },
        where: filters,
      })
    });

    it("Should throw not found exception if no homes are found", async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue([]);

      jest.spyOn(prismaService.home, "findMany").mockImplementation(mockPrismaFindManyHomes)

      await expect(service.getHomes(filters)).rejects.toThrowError(NotFoundException)
    })
  })

  describe("createHome", () => {
    const mockCreateHomeParams = {
      address: "Eziobodo RadioNodeList, futo",
      city: "Toronto",
      landSize: 4444,
      price: 150000,
      propertyType: PropertyType.RESIDENTIAL,
      numberOfBedrooms: 3,
      numberOfBathrooms: 2.5,
      images: [{
        url: "src1"
      }]
    }

    it("Should call prisma home.create with the correct payload", async () => {
      const mockCreateHome = jest.fn().mockReturnValue(mockhome)

      jest.spyOn(prismaService.home, "create").mockImplementation(mockCreateHome)

      await service.createHome(mockCreateHomeParams, 5)

      expect(mockCreateHome).toBeCalledWith({
        data: {
            address: "Eziobodo RadioNodeList, futo",
            city: "Toronto",
            land_size: 4444,
            price: 150000,
            propertyType: PropertyType.RESIDENTIAL,
            number_of_bedrooms: 3,
            number_of_bathrooms: 2.5,
            realtor_id: 5
        }
      })
    })
  })
});
