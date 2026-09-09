import { PutObjectCommand, S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileUploadOptions } from './file-upload-options.interface';

@Injectable()
export class S3Service {
  private readonly defaultClient?: S3Client;
  private readonly usersClient?: S3Client;
  private readonly messagesClient?: S3Client;
  private readonly publicUrl: string;
  private readonly usersBucket: string;
  private readonly messagesBucket: string;

  constructor(configService: ConfigService) {
    const endpoint = configService.getOrThrow<string>('MINIO_ENDPOINT');
    this.usersBucket = configService.getOrThrow<string>('MINIO_USERS_BUCKET');
    this.messagesBucket =
      configService.getOrThrow<string>('MINIO_MESSAGES_BUCKET');
    this.publicUrl = (
      configService.get<string>('MINIO_PUBLIC_URL') ?? endpoint
    ).replace(/\/$/, '');

    const clientConfig: S3ClientConfig = {
      region: configService.get<string>('MINIO_REGION') ?? 'us-east-1',
      endpoint,
      forcePathStyle: true,
    };

    const defaultAccessKeyId = configService.get<string>('MINIO_ACCESS_KEY');
    const defaultSecretAccessKey = configService.get<string>('MINIO_SECRET_KEY');
    if (defaultAccessKeyId && defaultSecretAccessKey) {
      this.defaultClient = new S3Client({
        ...clientConfig,
        credentials: {
          accessKeyId: defaultAccessKeyId,
          secretAccessKey: defaultSecretAccessKey,
        },
      });
    }

    const usersAccessKeyId = configService.get<string>('MINIO_USERS_ACCESS_KEY');
    const usersSecretAccessKey = configService.get<string>(
      'MINIO_USERS_SECRET_KEY',
    );
    if (usersAccessKeyId && usersSecretAccessKey) {
      this.usersClient = new S3Client({
        ...clientConfig,
        credentials: {
          accessKeyId: usersAccessKeyId,
          secretAccessKey: usersSecretAccessKey,
        },
      });
    }

    const messagesAccessKeyId = configService.get<string>(
      'MINIO_MESSAGES_ACCESS_KEY',
    );
    const messagesSecretAccessKey = configService.get<string>(
      'MINIO_MESSAGES_SECRET_KEY',
    );
    if (messagesAccessKeyId && messagesSecretAccessKey) {
      this.messagesClient = new S3Client({
        ...clientConfig,
        credentials: {
          accessKeyId: messagesAccessKeyId,
          secretAccessKey: messagesSecretAccessKey,
        },
      });
    }
  }

  async upload({ bucket, key, file, contentType }: FileUploadOptions) {
    await this.resolveClient(bucket).send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
      }),
    );
  }

  getObjectUrl(bucket: string, key: string) {
    return `${this.publicUrl}/${bucket}/${key}`;
  }

  private resolveClient(bucket: string): S3Client {
    if (bucket === this.usersBucket) {
      return this.usersClient ?? this.defaultClient ?? this.missingClientError();
    }

    if (bucket === this.messagesBucket) {
      return (
        this.messagesClient ?? this.defaultClient ?? this.missingClientError()
      );
    }

    return this.defaultClient ?? this.missingClientError();
  }

  private missingClientError(): never {
    throw new BadRequestException(
      'Missing S3 credentials. Set MINIO_ACCESS_KEY/MINIO_SECRET_KEY or per-bucket key pairs.',
    );
  }
}
