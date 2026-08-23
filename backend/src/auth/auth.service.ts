import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Verify2faSetupDto } from './dto/verify-2fa-setup.dto';
import { User } from './entities/user.entity';

const TOTP_ISSUER = 'TradingHub SaaS';
const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Ya existe una cuenta con ese email');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const totpSecret = authenticator.generateSecret();

    const user = this.userRepository.create({
      email: dto.email,
      passwordHash,
      totpSecret,
      twoFactorEnabled: false,
    });
    await this.userRepository.save(user);

    const otpauthUrl = authenticator.keyuri(dto.email, TOTP_ISSUER, totpSecret);
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    return {
      userId: user.id,
      qrCodeDataUrl,
      // Alternativa a escanear el QR: cargar el secreto a mano en la app de
      // autenticacion (Google Authenticator, Authy, etc.).
      manualEntryCode: totpSecret,
    };
  }

  async verifySetup(dto: Verify2faSetupDto): Promise<{ success: true }> {
    const user = await this.userRepository.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    if (user.twoFactorEnabled) {
      throw new ConflictException('El 2FA ya esta configurado para esta cuenta');
    }

    const isValid = authenticator.verify({ token: dto.code, secret: user.totpSecret });
    if (!isValid) {
      throw new UnauthorizedException('Codigo de verificacion invalido');
    }

    user.twoFactorEnabled = true;
    await this.userRepository.save(user);

    return { success: true };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; userId: number; email: string }> {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });

    // Mensaje generico en todos los casos de fallo (usuario inexistente,
    // 2FA sin configurar, password incorrecta, codigo incorrecto) para no
    // filtrar por enumeracion cual parte de las credenciales fallo.
    const invalidCredentials = () => new UnauthorizedException('Credenciales invalidas');

    if (!user || !user.twoFactorEnabled) {
      throw invalidCredentials();
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw invalidCredentials();
    }

    const codeIsValid = authenticator.verify({ token: dto.code, secret: user.totpSecret });
    if (!codeIsValid) {
      throw invalidCredentials();
    }

    const accessToken = await this.jwtService.signAsync({ sub: user.id, email: user.email });

    return { accessToken, userId: user.id, email: user.email };
  }
}
