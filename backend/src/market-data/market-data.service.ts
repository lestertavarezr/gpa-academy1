import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getBtcUsdt() {
    const botEngineUrl = this.configService.get<string>(
      'BOT_ENGINE_URL',
      'http://localhost:8000',
    );

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${botEngineUrl}/market/btc-usdt`),
      );
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(`Error consultando bot-engine: ${axiosError.message}`);
      throw new HttpException(
        'No se pudo obtener la informacion de mercado desde el bot engine',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
