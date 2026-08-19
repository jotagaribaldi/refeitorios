import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  logout(@Request() req: any) {
    return this.authService.logout(req.user.id);
  }
}
