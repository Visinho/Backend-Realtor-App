import { Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Body } from '@nestjs/common';
import { HomeService } from './home.service';
import { CreateHomeDto, HomeResponseDto, UpdateHomeDto } from './dto/home.dto';
import { PropertyType } from '@prisma/client';
import { User } from 'src/user/decorators/user.decorator';
import { UserData } from 'src/user/interceptors/user.interceptor';

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

        const price = minPrice || maxPrice ? {
            ...(minPrice && {gte: parseFloat(minPrice)}),
            ...(maxPrice && {lte: parseFloat(maxPrice)}),
        } : undefined

        const filters = {
            ...(city && {city}),
            ...(price && {price}),
            ...(propertyType && {propertyType})
        }
        return this.homeService.getHomes(filters);
    }

    @Get(":id")
    getHomeById(@Param("id", ParseIntPipe) id: number) {
        return this.homeService.getHomeById(id);
    }

    @Post()
    createHome(
        @Body() body: CreateHomeDto, @User() user: UserData
    ) {
        return this.homeService.createHome(body, user.id);
    }

    @Put(":id")
    updateHomeById(@Param("id", ParseIntPipe) id: number, @Body() body: UpdateHomeDto) {
        return this.homeService.updateHomeById(id, body);
    }

    @Delete(":id")
    deleteHomeById(
        @Param("id", ParseIntPipe) id: number
    ) {
        return this.homeService.deleteHomeById(id);
    }
}
