import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError, AxiosResponse } from 'axios';
import { Observable, firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '../common/fastapi-errors';
import { CreatePaperBotDto } from './dto/create-paper-bot.dto';

@Injectable()
export class PaperBotsService {
  private readonly logger = new Logger(PaperBotsService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  createBot(dto: CreatePaperBotDto) {
    return this.forward(() => this.httpService.post(`${this.botEngineUrl()}/paper-bots`, dto));
  }

  listBots() {
    return this.forward(() => this.httpService.get(`${this.botEngineUrl()}/paper-bots`));
  }

  getBot(id: number) {
    return this.forward(() => this.httpService.get(`${this.botEngineUrl()}/paper-bots/${id}`));
  }

  pauseBot(id: number) {
    return this.forward(() =>
      this.httpService.patch(`${this.botEngineUrl()}/paper-bots/${id}/pause`, {}),
    );
  }

  async deleteBot(id: number): Promise<void> {
    await this.forward(() => this.httpService.delete(`${this.botEngineUrl()}/paper-bots/${id}`));
  }

  private botEngineUrl(): string {
    return this.configService.get<string>('BOT_ENGINE_URL', 'http://localhost:8000');
  }

  private async forward<T>(request: () => Observable<AxiosResponse<T>>): Promise<T> {
    try {
      const { data } = await firstValueFrom(request());
      return data;
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: unknown }>;
      const status = axiosError.response?.status;

      // El bot-engine devuelve 404 (bot inexistente) o 400/422 (validacion) —
      // son errores del cliente, se los pasamos tal cual en vez de un 502.
      if (status === 404) {
        throw new HttpException(
          extractErrorMessage(axiosError.response?.data?.detail),
          HttpStatus.NOT_FOUND,
        );
      }
      if (status === 400 || status === 422) {
        throw new HttpException(
          extractErrorMessage(axiosError.response?.data?.detail),
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.error(`Error consultando bot-engine (paper-bots): ${axiosError.message}`);
      throw new HttpException(
        'No se pudo completar la operacion sobre el bot en el bot engine',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
