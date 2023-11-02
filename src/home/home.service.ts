import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dto/home.dto';
import { PropertyType } from '@prisma/client';

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}

  async getHomes(): Promise<HomeResponseDto[]> {
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
      where: {
        city: "Owerri",
        price: {
            gte: 10000,
            lte: 2000000
        },
        propertyType: PropertyType.RESIDENTIAL
      }
    });
    return homes.map((home) => {
        const fetchedHome = {...home, image: home.images[0].url}
        delete fetchedHome.images
        return new HomeResponseDto(fetchedHome)
    });
  }
}
