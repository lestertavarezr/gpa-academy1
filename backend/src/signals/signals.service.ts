import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import { SignalHistoryService } from '../signal-history/signal-history.service';

const DEFAULT_CACHE_TTL_SECONDS = 180;

@Injectable()
export class SignalsService {
  private readonly logger = new Logger(SignalsService.name);
  private readonly cacheTtlSeconds: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly signalHistoryService: SignalHistoryService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.cacheTtlSeconds = Number(
      this.configService.get('SIGNAL_CACHE_TTL_SECONDS', DEFAULT_CACHE_TTL_SECONDS),
    );
  }

  async getSignal(symbol: string) {
    const cacheKey = `signal:${symbol}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return { ...(cached as Record<string, unknown>), cached: true };
    }

    const data = await this.fetchFromBotEngine(symbol);

    await this.cacheManager.set(cacheKey, data, this.cacheTtlSeconds * 1000);
    await this.signalHistoryService.recordSignal(symbol, data);

    return { ...data, cached: false };
  }

  private async fetchFromBotEngine(symbol: string) {
    const botEngineUrl = this.configService.get<string>(
      'BOT_ENGINE_URL',
      'http://localhost:8000',
    );

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${botEngineUrl}/signals/${symbol}`),
      );
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(`Error consultando bot-engine (signals): ${axiosError.message}`);
      throw new HttpException(
        'No se pudo generar la señal desde el bot engine',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
