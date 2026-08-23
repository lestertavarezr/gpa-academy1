import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { CreateBacktestDto } from './dto/create-backtest.dto';
import { BacktestRecord } from './entities/backtest-record.entity';

/**
 * El `detail` de un error de FastAPI puede ser un string simple (cuando
 * nosotros mismos lanzamos HTTPException con un mensaje) o una lista de
 * objetos de error de Pydantic (cuando falla la validacion automatica del
 * body, ej. {"msg": "...", "loc": [...], ...}). Normalizamos ambos casos a
 * un string legible para el cliente.
 */
function extractErrorMessage(detail: unknown): string {
  if (typeof detail === 'string') {
    return detail;
  }
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => (item && typeof item === 'object' && 'msg' in item ? String(item.msg) : null))
      .filter((msg): msg is string => Boolean(msg));
    if (messages.length > 0) {
      return messages.join('; ');
    }
  }
  return 'Solicitud de backtest invalida';
}

@Injectable()
export class BacktestingService {
  private readonly logger = new Logger(BacktestingService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(BacktestRecord)
    private readonly backtestRecordRepository: Repository<BacktestRecord>,
  ) {}

  async runBacktest(dto: CreateBacktestDto) {
    const botEngineUrl = this.configService.get<string>(
      'BOT_ENGINE_URL',
      'http://localhost:8000',
    );

    let result: any;
    try {
      const { data } = await firstValueFrom(this.httpService.post(`${botEngineUrl}/backtest`, dto));
      result = data;
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: unknown }>;
      const status = axiosError.response?.status;

      // El bot-engine devuelve 400 para errores de dominio propios (ej. "no
      // hay datos suficientes") y 422 para errores de validacion de Pydantic
      // sobre el body (ej. thresholds invertidos, rango de fechas invalido).
      // En ambos casos son errores del cliente, no una falla del bot-engine:
      // se los pasamos tal cual en vez de convertirlos en un generico 502.
      if (status === 400 || status === 422) {
        throw new HttpException(
          extractErrorMessage(axiosError.response?.data?.detail),
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.error(`Error consultando bot-engine (backtest): ${axiosError.message}`);
      throw new HttpException(
        'No se pudo ejecutar el backtest en el bot engine',
        HttpStatus.BAD_GATEWAY,
      );
    }

    await this.persistResult(dto, result);

    return result;
  }

  private async persistResult(dto: CreateBacktestDto, result: any): Promise<void> {
    try {
      const record = this.backtestRecordRepository.create({
        symbol: dto.symbol,
        startDate: dto.start_date,
        endDate: dto.end_date,
        buyScoreThreshold: dto.buy_score_threshold,
        sellScoreThreshold: dto.sell_score_threshold,
        initialCapital: dto.initial_capital,
        commissionRate: result.commission_rate,
        slippageRate: result.slippage_rate,
        metrics: result.metrics,
        equityCurve: result.equity_curve,
        trades: result.trades,
        underperformedBuyHold: result.underperformed_buy_hold,
      });
      await this.backtestRecordRepository.save(record);
    } catch (error) {
      // No perder el resultado ya calculado para el usuario solo porque
      // falle la persistencia del historico.
      this.logger.error(`Error guardando backtest en Postgres: ${(error as Error).message}`);
    }
  }

  async getHistory(symbol: string, limit = 20): Promise<BacktestRecord[]> {
    return this.backtestRecordRepository.find({
      where: { symbol },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
