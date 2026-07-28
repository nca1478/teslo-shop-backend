import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/auth/register.use-case';
import { RequestOtpUseCase } from '../../application/use-cases/auth/request-otp.use-case';
import { VerifyOtpUseCase } from '../../application/use-cases/auth/verify-otp.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/auth/reset-password.use-case';
import { LoginDto } from '../../application/dtos/auth/login.dto';
import { RegisterDto } from '../../application/dtos/auth/register.dto';
import { RequestOtpDto } from '../../application/dtos/auth/request-otp.dto';
import { VerifyOtpDto } from '../../application/dtos/auth/verify-otp.dto';
import { ResetPasswordDto } from '../../application/dtos/auth/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly loginUseCase: LoginUseCase,
        private readonly registerUseCase: RegisterUseCase,
        private readonly requestOtpUseCase: RequestOtpUseCase,
        private readonly verifyOtpUseCase: VerifyOtpUseCase,
        private readonly resetPasswordUseCase: ResetPasswordUseCase,
    ) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'User login' })
    @ApiResponse({ status: 200, description: 'Login successful' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Body() loginDto: LoginDto) {
        return this.loginUseCase.execute(loginDto);
    }

    @Post('register')
    @ApiOperation({ summary: 'User registration' })
    @ApiResponse({ status: 201, description: 'User registered successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async register(@Body() registerDto: RegisterDto) {
        return this.registerUseCase.execute(registerDto);
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Request password reset OTP' })
    async requestOtp(@Body() requestOtpDto: RequestOtpDto) {
        return this.requestOtpUseCase.execute(requestOtpDto);
    }

    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verify OTP code' })
    async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
        return this.verifyOtpUseCase.execute(verifyOtpDto);
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reset password with OTP' })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.resetPasswordUseCase.execute(resetPasswordDto);
    }
}
