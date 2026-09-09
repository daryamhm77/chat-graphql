import { Logger, Module, UnauthorizedException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { ChatsModule } from './chats/chats.module';
import { DatabaseModule } from './common/database/database.module';
import { PubSubModule } from './common/pubsub/pubsub.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        MONGODB_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.number().required(),
        MINIO_ENDPOINT: Joi.string().uri().required(),
        MINIO_PUBLIC_URL: Joi.string().uri().optional(),
        MINIO_ACCESS_KEY: Joi.string().optional(),
        MINIO_SECRET_KEY: Joi.string().optional(),
        MINIO_USERS_ACCESS_KEY: Joi.string().optional(),
        MINIO_USERS_SECRET_KEY: Joi.string().optional(),
        MINIO_MESSAGES_ACCESS_KEY: Joi.string().optional(),
        MINIO_MESSAGES_SECRET_KEY: Joi.string().optional(),
        MINIO_REGION: Joi.string().optional(),
        MINIO_USERS_BUCKET: Joi.string().required(),
        MINIO_MESSAGES_BUCKET: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        REDIS_PASSWORD: Joi.string().allow('').optional(),
        REDIS_TLS: Joi.string().valid('true', 'false').optional(),
        FRONTEND_URL: Joi.string().optional(),
        COOKIE_SECURE: Joi.string().valid('true', 'false').optional(),
        NODE_ENV: Joi.string().optional(),
      }),
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [AuthModule],
      inject: [AuthService],
      useFactory: (authService: AuthService) => ({
        autoSchemaFile: true,
        path: '/api/graphql',
        subscriptions: {
          'graphql-ws': {
            path: '/api/graphql',
            onConnect: (context: {
              connectionParams?: Record<string, unknown>;
              extra: unknown;
            }) => {
              const extra = context.extra as {
                request: import('express').Request;
                user?: ReturnType<AuthService['verifyWs']>;
              };
              try {
                const connectionParams = context.connectionParams as
                  { token?: string } | undefined;
                const user = authService.verifyWs(
                  extra.request,
                  connectionParams,
                );
                extra.user = user;
              } catch (err) {
                new Logger('GraphQLWS').error(err);
                throw new UnauthorizedException();
              }
            },
          },
        },
        context: ({
          req,
          res,
          extra,
        }: {
          req?: import('express').Request & {
            user?: ReturnType<AuthService['verifyWs']>;
          };
          res?: import('express').Response;
          extra?: {
            request?: import('express').Request;
            user?: ReturnType<AuthService['verifyWs']>;
          };
        }) => {
          if (extra?.user) {
            const request = (extra.request ??
              req ??
              {}) as import('express').Request & {
              user?: ReturnType<AuthService['verifyWs']>;
            };
            request.user = extra.user;
            return {
              req: request,
              res,
              user: extra.user,
            };
          }

          return { req, res };
        },
      }),
    }),
    DatabaseModule,
    PubSubModule,
    UsersModule,
    AuthModule,
    ChatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
