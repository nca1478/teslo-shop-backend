import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserProfileDto {
    @ApiProperty({
        description: 'User name',
        example: 'John Doe',
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({
        description: 'User email',
        example: 'john@example.com',
    })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty({
        description: 'User password (optional)',
        example: 'newPassword123',
        required: false,
    })
    @IsString()
    @MinLength(6)
    @IsOptional()
    password?: string;

    @ApiProperty({
        description: 'User image URL',
        example: 'https://example.com/image.jpg',
        required: false,
    })
    @IsString()
    @IsOptional()
    image?: string;
}
