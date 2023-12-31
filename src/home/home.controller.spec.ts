import { Test, TestingModule } from '@nestjs/testing';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyType } from '@prisma/client';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

const mockUser = {
  id: 53,
  name: "Elvis",
  email: "Elvis123@gmail.com",
  phone: "555 555 5555"
}

const mockhome =  {
  id: 1,
  address: "Eziobodo RadioNodeList, futo",
  city: "Toronto",
  image: "img1",
  price: 150000,
  property_type: PropertyType.RESIDENTIAL,
  number_of_bedorooms: 3,
  number_of_bathrooms: 2.5,
}

describe('HomeController', () => {
  let controller: HomeController;
  let homeService: HomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      providers: [{
        provide: HomeService,
        useValue: {
          getHomes: jest.fn().mockReturnValue([]),
          getRealtorByHomeId: jest.fn().mockReturnValue(mockUser),
          updateHomeById: jest.fn().mockReturnValue(mockhome)
        }}, 
        PrismaService]
    }).compile();

    controller = module.get<HomeController>(HomeController);
    homeService = module.get<HomeService>(HomeService)
  });

 describe("getHomes", () => {
    it("Should construct filter object correctly", async () => {
      const mockGetHomes = jest.fn().mockReturnValue([])
      jest.spyOn(homeService, "getHomes").mockImplementation(mockGetHomes)
      await controller.getHomes("Toronto", "1500000");

      expect(mockGetHomes).toBeCalledWith({
        city: "Toronto",
        price: {
          gte: 1500000,
        }
      })
    })
 });

 describe("updateHome", () => {

  const mockUserData = {
    name: "Elvis",
    id: 30,
    iat: 1,
    exp: 2 
  }

  const mockUpdateHomeParams = {
    address: "Eziobodo RadioNodeList, futo",
    city: "Toronto",
    landSize: 4444,
    price: 150000,
    propertyType: PropertyType.RESIDENTIAL,
    numberOfBedrooms: 3,
    numberOfBathrooms: 2.5,
  }

  it("Should throw unauthorized error if realtor did not create home", async () => {
    // await controller.updateHomeById(5, mockCreateHomeParams, mockUserData);

    await expect(controller.updateHomeById(5, mockUpdateHomeParams, mockUserData)).rejects.toThrowError(
      UnauthorizedException
    )
  })

  it("Should update home if realtor id is valid", async () => {
    const mockUpdateHome = jest.fn().mockReturnValue(mockhome)

    jest.spyOn(homeService, "updateHomeById").mockImplementation(mockUpdateHome)

    await controller.updateHomeById(5, mockUpdateHomeParams, {...mockUserData, id: 53})

    expect(mockUpdateHome).toBeCalled();
  });
 });
});
