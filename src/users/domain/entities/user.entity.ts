import { ApiProperty } from "@nestjs/swagger";
import { Role, User } from "@prisma/client";
import { Exclude } from "class-transformer";

export class UserEntity implements User {
    @ApiProperty({ format: 'uuid', uniqueItems: true })
    id: string;

    @ApiProperty({ default: 'Robert Ramos'})
    name: string;

    @ApiProperty({ format: 'email', uniqueItems: true })
    email: string;

    @ApiProperty({ enum: Role })
    role: Role;

    @ApiProperty({ example: true })
    active: boolean;

    @ApiProperty({ format: 'date' })
    created_at: Date;

    @Exclude()
    password: string;

    @Exclude()
    refresh_token: string | null;

    constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial);
    }
}