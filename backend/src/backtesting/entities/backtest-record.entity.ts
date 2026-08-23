import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('backtest_records')
export class BacktestRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  symbol: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column('int')
  buyScoreThreshold: number;

  @Column('int')
  sellScoreThreshold: number;

  @Column('float')
  initialCapital: number;

  @Column('float')
  commissionRate: number;

  @Column('float')
  slippageRate: number;

  @Column('jsonb')
  metrics: unknown;

  @Column('jsonb')
  equityCurve: unknown;

  @Column('jsonb')
  trades: unknown;

  @Column('boolean')
  underperformedBuyHold: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
