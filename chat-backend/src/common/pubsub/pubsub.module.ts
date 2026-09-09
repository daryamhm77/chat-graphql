import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { PUB_SUB } from '../constants/injection-tokens';
import { reviver } from './reviver';

@Global()
@Module({
  providers: [
    {
      provide: PUB_SUB,
      useFactory: (configService: ConfigService) => {
        const password = configService.get<string>('REDIS_PASSWORD');
        const useTls = configService.get<string>('REDIS_TLS') === 'true';

        const connection = {
          host: configService.getOrThrow<string>('REDIS_HOST'),
          port: Number(configService.getOrThrow('REDIS_PORT')),
          ...(password ? { password } : {}),
          ...(useTls ? { tls: {} } : {}),
        };

        return new RedisPubSub({
          connection,
          reviver,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [PUB_SUB],
})
export class PubSubModule {}
