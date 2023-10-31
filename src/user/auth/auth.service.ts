import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

interface SignupProps {
    email: string;
    password: string;
    name: string;
    phone: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

    async signup({email}: SignupProps) {
        const userExists = await this.prismaService.user.findFirst({
            where: {
                email 
            }
        })
        if(userExists) {
            throw new ConflictException("User already exists")
        }
    }
}
