import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThanOrEqual, Repository } from 'typeorm';
import { MarketDataService } from '../market-data/market-data.service';
import { SignalBias, SignalOutcome, SignalRecord } from './entities/signal-record.entity';

const EVALUATION_DELAY_HOURS = 24;
const EVALUATION_BATCH_SIZE = 100;

interface SignalPayload {
  score: number;
  bias: SignalBias;
  contributions: unknown;
  indicators: { price: number | null };
}

@Injectable()
export class SignalHistoryService {
  private readonly logger = new Logger(SignalHistoryService.name);

  constructor(
    @InjectRepository(SignalRecord)
    private readonly signalRecordRepository: Repository<SignalRecord>,
    private readonly marketDataService: MarketDataService,
  ) {}

  async recordSignal(symbol: string, signal: SignalPayload): Promise<void> {
    const record = this.signalRecordRepository.create({
      symbol,
      score: signal.score,
      bias: signal.bias,
      contributions: signal.contributions,
      indicators: signal.indicators,
      priceAtSignal: signal.indicators?.price ?? null,
    });
    await this.signalRecordRepository.save(record);
  }

  async getHistory(symbol: string, limit = 50): Promise<SignalRecord[]> {
    return this.signalRecordRepository.find({
      where: { symbol },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Cada hora revisa señales con >=24h de antiguedad sin evaluar y compara el
   * precio actual contra el precio al momento de la señal para etiquetar el
   * resultado (correct/incorrect/neutral). Sienta la base para reportar
   * precisión historica de las señales en una fase posterior.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async evaluatePendingSignals(): Promise<void> {
    const cutoff = new Date(Date.now() - EVALUATION_DELAY_HOURS * 60 * 60 * 1000);

    const pending = await this.signalRecordRepository.find({
      where: { evaluatedAt: IsNull(), createdAt: LessThanOrEqual(cutoff) },
      take: EVALUATION_BATCH_SIZE,
    });

    for (const record of pending) {
      await this.evaluateSignal(record);
    }
  }

  private async evaluateSignal(record: SignalRecord): Promise<void> {
    if (record.priceAtSignal == null) {
      return;
    }

    try {
      const market = await this.marketDataService.getMarketData(record.symbol);
      const priceAfter = market?.price;

      if (priceAfter == null) {
        return;
      }

      const priceChangePct =
        ((priceAfter - record.priceAtSignal) / record.priceAtSignal) * 100;

      record.evaluatedAt = new Date();
      record.priceAfter = priceAfter;
      record.priceChangePct = priceChangePct;
      record.outcome = this.determineOutcome(record.bias, priceChangePct);

      await this.signalRecordRepository.save(record);
    } catch (error) {
      this.logger.error(
        `Error evaluando señal #${record.id} (${record.symbol}): ${(error as Error).message}`,
      );
    }
  }

  private determineOutcome(bias: SignalBias, priceChangePct: number): SignalOutcome {
    if (bias === 'bullish') {
      return priceChangePct > 0 ? 'correct' : 'incorrect';
    }
    if (bias === 'bearish') {
      return priceChangePct < 0 ? 'correct' : 'incorrect';
    }
    return 'neutral';
  }
}
