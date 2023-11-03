import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dto/home.dto';
import { PropertyType } from '@prisma/client';

interface GetHomesParam {
    city?: string;
    price?: {
        gte?: number;
        lte?: number;
    }
    propertyType?: PropertyType
}

interface CreateHomeParam {
    address: string,
    numberOfBedrooms: number;
    numberOfBathrooms: number;
    city: string;
    price: number;
    landSize: number;
    propertyType: PropertyType;
    images: {url: string}[];
}

interface UpdateHomeParam {
    address?: string,
    numberOfBedrooms?: number;
    numberOfBathrooms?: number;
    city?: string;
    price?: number;
    landSize?: number;
    propertyType?: PropertyType;
}

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}

  async getHomes(filter: GetHomesParam): Promise<HomeResponseDto[]> {
    const homes = await this.prismaService.home.findMany({
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        propertyType: true,
        number_of_bathrooms: true,
        number_of_bedrooms: true,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
      where: filter
    });

    if(!homes.length) {
        throw new NotFoundException();
    }

    return homes.map((home) => {
        const fetchedHome = {...home, image: home.images[0].url}
        delete fetchedHome.images
        return new HomeResponseDto(fetchedHome)
    });
  }

async getHomeById(id: number): Promise<HomeResponseDto> {
    const home = await this.prismaService.home.findUnique({
      where: {
        id: id, 
      },
      include: {
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
    });

    if (!home) {
      throw new NotFoundException(`Home with ID ${id} not found`);
    }
    const getHome = {...home, image: home.images[0].url}
    delete getHome.images
    return new HomeResponseDto(getHome);
  }

async createHome({address, numberOfBathrooms, numberOfBedrooms, city, landSize, price, propertyType, images}: CreateHomeParam) {
    const home = await this.prismaService.home.create({
        data: {
            address,
            number_of_bathrooms: numberOfBathrooms,
            number_of_bedrooms: numberOfBedrooms,
            city,
            land_size: landSize,
            propertyType,
            price,
            realtor_id: 4
        }
    })
    const homeImages = images.map(image => {
        return {...image, home_id: home.id}
    })
    await this.prismaService.image.createMany({data: homeImages})

    return new HomeResponseDto(home);
}
 
async updateHomeById(id: number, data: UpdateHomeParam) {
    const home = await this.prismaService.home.findFirst({
        where: {
            id
        }
    })
    if(!home) {
        throw new NotFoundException();
    }

    const updatedHome = await this.prismaService.home.update({
        where: {
            id
        },
        data
    })
    return new HomeResponseDto(updatedHome)
}





}
