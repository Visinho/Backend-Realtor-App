import { Controller, Delete, Get, Post, Put, Query } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeResponseDto } from './dto/home.dto';
import { PropertyType } from '@prisma/client';

@Controller('home')
export class HomeController {

    constructor(private readonly homeService: HomeService) {}


    @Get()
    getHomes(
        @Query("city") city?: string,
        @Query("minPrice") minPrice?: string,
        @Query("maxPrice") maxPrice?: string,
        @Query("propertyType") propertyType?: PropertyType
    ): Promise<HomeResponseDto[]> {

        const filters = {
            city: city,
            price: {
                gte: minPrice,
                lte: maxPrice,
            },
            propertyType: propertyType
        }
        return this.homeService.getHomes();
    }

    @Get(":id")
    getHomesById() {
        return []
    }

    @Post("")
    createHome() {
        return []
    }

    @Put(":id")
    updateHome() {
        return []
    }

    @Delete(":id")
    deleteHome() {
        
    }
}
