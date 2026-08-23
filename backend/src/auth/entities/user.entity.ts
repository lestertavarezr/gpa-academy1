import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  email: string;

  @Column()
  passwordHash: string;

  // Secreto TOTP (base32). Se genera en el registro y no cambia salvo que
  // el usuario rehaga el setup de 2FA (no implementado en esta fase).
  @Column()
  totpSecret: string;

  // El 2FA es obligatorio: el usuario no puede loguearse hasta terminar el
  // setup (ver AuthService.verifySetup), asi que no hay estado intermedio
  // "logueado sin 2FA".
  @Column({ default: false })
  twoFactorEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
