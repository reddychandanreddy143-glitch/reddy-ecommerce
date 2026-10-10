import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';
import { UserLogin } from './entities/user-login.entity';
import { MailService } from '../mail/mail.service';
import {
  SendOtpDto,
  VerifyRegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserLogin)
    private readonly userLoginRepository: Repository<UserLogin>,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  private generateSixDigitOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(dto: SendOtpDto) {
    const existingVerifiedUser = await this.userRepository.findOne({
      where: { email: dto.email, isEmailVerified: true },
    });
    if (existingVerifiedUser) {
      throw new BadRequestException('An account with this email already exists.');
    }

    const otp = this.generateSixDigitOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    let user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) {
      user = this.userRepository.create({
        email: dto.email,
        name: 'Pending User',
        password: '',
        role: UserRole.CUSTOMER,
        isEmailVerified: false,
        otpCode: otp,
        otpExpiresAt,
      });
    } else {
      user.otpCode = otp;
      user.otpExpiresAt = otpExpiresAt;
    }

    await this.userRepository.save(user);
    this.mailService.sendOtpEmail(dto.email, otp).catch(() => {});

    return { message: 'Verification code sent to your email.' };
  }

  async verifyAndRegister(dto: VerifyRegisterDto) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new BadRequestException('No pending registration found for this email.');
    }
    if (user.isEmailVerified) {
      throw new BadRequestException('This account is already verified. Please log in.');
    }
    if (!user.otpCode || !user.otpExpiresAt) {
      throw new BadRequestException('No active OTP found. Please request a new one.');
    }
    if (new Date() > new Date(user.otpExpiresAt)) {
      throw new BadRequestException('OTP has expired. Please request a new code.');
    }
    if (user.otpCode !== dto.otp) {
      throw new BadRequestException('Invalid OTP entered.');
    }

    user.name = dto.name;
    user.password = await bcrypt.hash(dto.password, 10);
    user.isEmailVerified = true;
    user.otpCode = null;
    user.otpExpiresAt = null;

    const savedUser = await this.userRepository.save(user);

    // Record initial registration login
    try {
      await this.userLoginRepository.save(
        this.userLoginRepository.create({
          userId: savedUser.id,
          email: savedUser.email,
          loginMethod: 'Registration & Verification',
          status: 'Success',
        }),
      );
    } catch (err: any) {
      this.logger.error(`Error saving registration login record: ${err.message}`);
    }

    const token = this.generateToken(savedUser);
    const { password, ...safeUser } = savedUser;
    return { user: safeUser, accessToken: token };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    // Save login audit record to Neon PostgreSQL
    try {
      await this.userLoginRepository.save(
        this.userLoginRepository.create({
          userId: user.id,
          email: user.email,
          loginMethod: 'Email/Password',
          status: 'Success',
        }),
      );
      this.logger.log(`Login event recorded in database for: ${user.email} (${user.id})`);
    } catch (err: any) {
      this.logger.error(`Failed to record login audit: ${err.message}`);
    }

    const token = this.generateToken(user);
    const { password, ...safeUser } = user;
    return { user: safeUser, accessToken: token };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });

    if (!user || !user.isEmailVerified) {
      return { message: 'If an account exists with this email, a reset code has been sent.' };
    }

    const otp = this.generateSixDigitOtp();
    user.otpCode = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.userRepository.save(user);
    this.mailService.sendPasswordResetOtpEmail(user.email, otp).catch(() => {});

    return { message: 'If an account exists with this email, a reset code has been sent.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user || !user.isEmailVerified) {
      throw new BadRequestException('Invalid request or expired reset session.');
    }
    if (!user.otpCode || !user.otpExpiresAt) {
      throw new BadRequestException('No password reset was requested.');
    }
    if (new Date() > new Date(user.otpExpiresAt)) {
      throw new BadRequestException('Reset code has expired. Please request a new one.');
    }
    if (user.otpCode !== dto.otp) {
      throw new BadRequestException('Invalid reset code provided.');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    user.otpCode = null;
    user.otpExpiresAt = null;

    await this.userRepository.save(user);

    return { message: 'Password has been successfully reset. You can now log in.' };
  }

  private generateToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }
}