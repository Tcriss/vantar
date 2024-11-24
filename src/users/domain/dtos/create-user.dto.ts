import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsStrongPassword, Matches, MaxLength, MinLength } from "class-validator";

import { Roles } from "@common/domain/enums";
import { nameRegex } from "@/common/application/constants";

export class CreateUserDto {
    @ApiProperty({ example: 'Haroldy Martinez', description: 'User name' })
    @IsString()
    @Matches(nameRegex, '', { message: 'name must not contain numbers' })
    @MaxLength(30)
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'example@email.com', description: 'User email' })
    @IsEmail()
    @MaxLength(60)
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'User Password' })
    @IsStrongPassword()
    @MinLength(6)
    @MaxLength(130)
    @IsNotEmpty()
    password: string;

    @ApiProperty({ enum: Roles, example: Roles.CUSTOMER, description: 'User role', required: false })
    @IsEnum(Roles)
    @IsOptional()
    role?: Roles
}