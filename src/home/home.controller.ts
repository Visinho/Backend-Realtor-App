import { Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Body, UnauthorizedException, UseGuards } from '@nestjs/common';
import { HomeService } from './home.service';
import { CreateHomeDto, HomeResponseDto, MessageDto, UpdateHomeDto } from './dto/home.dto';
import { PropertyType, UserType } from '@prisma/client';
import { User } from 'src/user/decorators/user.decorator';
import { UserData } from 'src/user/interceptors/user.interceptor';
import { AuthGuard } from "src/guards/auth.guard";
import { Roles } from 'src/decorators/roles.decorator';

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

    @Roles(UserType.REALTOR, UserType.ADMIN)
    @Post()
    createHome(
        @Body() body: CreateHomeDto, @User() user: UserData
    ) {
        return this.homeService.createHome(body, user.id);
    }

    @Roles(UserType.REALTOR, UserType.ADMIN)
    @Put(":id")
    async updateHomeById(@Param("id", ParseIntPipe) id: number, @Body() body: UpdateHomeDto, @User() user: UserData) {
        const realtor = await this.homeService.getRealtorByHomeId(id);
        if(realtor.id !== user.id) {
            throw new UnauthorizedException()
        }
        return this.homeService.updateHomeById(id, body);
    }

    @Roles(UserType.REALTOR, UserType.ADMIN)
    @Delete(":id")
    async deleteHomeById(
        @Param("id", ParseIntPipe) id: number,  @User() user: UserData
    ) {
        const realtor = await this.homeService.getRealtorByHomeId(id);
        if(realtor.id !== user.id) {
            throw new UnauthorizedException()
        }
        return this.homeService.deleteHomeById(id);
    }

    @Roles(UserType.BUYER)
    @Post("/inquire/:id")
    inquire(
        @Param("id", ParseIntPipe) homeId: number,  @User() user: UserData,
        @Body() {message}: MessageDto
    ){
        return this.homeService.inquire(user, message, homeId)
    }
}
