import { PutObjectCommand, S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileUploadOptions } from './file-upload-options.interface';

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly publicUrl: string;

  constructor(configService: ConfigService) {
    const endpoint = configService.getOrThrow<string>('MINIO_ENDPOINT');
    const accessKeyId = configService.getOrThrow<string>('MINIO_ACCESS_KEY');
    const secretAccessKey =
      configService.getOrThrow<string>('MINIO_SECRET_KEY');

    this.publicUrl = (
      configService.get<string>('MINIO_PUBLIC_URL') ?? endpoint
    ).replace(/\/$/, '');

    const clientConfig: S3ClientConfig = {
      region: configService.get<string>('MINIO_REGION') ?? 'us-east-1',
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    };

    this.client = new S3Client(clientConfig);
  }

  async upload({ bucket, key, file, contentType }: FileUploadOptions) {
    await this.client.send(
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
}
