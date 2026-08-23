import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type SignalBias = 'bullish' | 'bearish' | 'neutral';
export type SignalOutcome = 'correct' | 'incorrect' | 'neutral';

@Entity('signal_records')
export class SignalRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  symbol: string;

  @Column('int')
  score: number;

  @Column()
  bias: SignalBias;

  @Column('jsonb')
  contributions: unknown;

  @Column('jsonb')
  indicators: unknown;

  @Column('float', { nullable: true })
  priceAtSignal: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  evaluatedAt: Date | null;

  @Column('float', { nullable: true })
  priceAfter: number | null;

  @Column('float', { nullable: true })
  priceChangePct: number | null;

  @Column({ type: 'varchar', nullable: true })
  outcome: SignalOutcome | null;
}
