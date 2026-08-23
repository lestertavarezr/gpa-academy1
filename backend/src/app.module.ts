import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { redisStore } from 'cache-manager-redis-yet';
import { MarketDataModule } from './market-data/market-data.module';
import { SignalHistoryModule } from './signal-history/signal-history.module';
import { SignalsModule } from './signals/signals.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL', 'redis://localhost:6379');
        const store = await redisStore({ url: redisUrl });
        return { store };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>(
          'DATABASE_URL',
          'postgresql://postgres:postgres@localhost:5432/tradinghub',
        ),
        autoLoadEntities: true,
        // TODO fase posterior: reemplazar por migraciones antes de produccion.
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    MarketDataModule,
    SignalHistoryModule,
    SignalsModule,
  ],
})
export class AppModule {}
