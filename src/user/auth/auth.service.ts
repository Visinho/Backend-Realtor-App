import { UserType } from '@prisma/client';
import { Injectable, ConflictException, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

interface SignupProps {
  email: string;
  password: string;
  name: string;
  phone: string;
}

interface SigninProps {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signup({ email, name, phone, password }: SignupProps, usertype: UserType) {
    const userExists = await this.prismaService.user.findFirst({
      where: {
        email,
      },
    });
    if (userExists) {
      throw new ConflictException('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.prismaService.user.create({
      data: {
        email,
        name,
        phone,
        password: hashedPassword,
        user_type: usertype,
      },
    });

    const token = await this.generateJWT(name, newUser.id);

    return token;
  }

  async signin({ email, password }: SigninProps) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email,
      },
    });
    if (!user) {
      throw new HttpException('Invalid Credentials', 400);
    }
    const hashedPassword = user.password;

    const isValidPassword = await bcrypt.compare(password, hashedPassword);
    if (!isValidPassword) {
      throw new HttpException('Invalid Credentials', 400);
    }
    return await this.generateJWT(user.name, user.id);
  }

  private generateJWT(name: string, id: number) {
    return jwt.sign(
        {
          name,
          id,
        },
        process.env.JWT_TOKEN_KEY,
        {
          expiresIn: 3600000,
        },
      );
  }

  generateProductKey(email: string, UserType: UserType) {
    const string = `${email}-${UserType}-${process.env.PRODUCT_KEY_SECRET}`
    return bcrypt.hash(string, 10);
  }
}
