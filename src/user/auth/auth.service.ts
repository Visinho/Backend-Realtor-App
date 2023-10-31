import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from "bcryptjs";
import { UserType } from "@prisma/client";

interface SignupProps {
    email: string;
    password: string;
    name: string;
    phone: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

    async signup({email, name, phone, password}: SignupProps) {
        const userExists = await this.prismaService.user.findFirst({
            where: {
                email 
            }
        })
        if(userExists) {
            throw new ConflictException("User already exists")
        }
        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await this.prismaService.user.create({
            data: {
                email, name, phone, password: hashedPassword, user_type: UserType.BUYER
            }
        });
        return newUser;
    }
}
