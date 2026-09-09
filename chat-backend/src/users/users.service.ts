import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { S3Service } from '../common/s3/s3.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UserDocument } from './entities/user.document';
import { User } from './entities/user.entity';
import { USERS_IMAGE_FILE_EXTENSION } from './users.constants';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserInput: CreateUserInput) {
    try {
      return this.toEntity(
        await this.usersRepository.create({
          ...createUserInput,
          password: await this.hashPassword(createUserInput.password),
        }),
      );
    } catch (err) {
      if (this.isDuplicateEmailError(err)) {
        throw new UnprocessableEntityException('Email already exists.');
      }
      throw err;
    }
  }

  async uploadImage(file: Buffer, userId: string) {
    await this.s3Service.upload({
      bucket: this.usersBucket,
      key: this.getUserImage(userId),
      file,
      contentType: 'image/jpeg',
    });
  }

  async findAll() {
    return (await this.usersRepository.find({})).map((userDocument) =>
      this.toEntity(userDocument),
    );
  }

  async findOne(_id: string) {
    return this.toEntity(
      await this.usersRepository.findOne({ _id: new Types.ObjectId(_id) }),
    );
  }

  async findManyByIds(ids: string[]) {
    const objectIds = ids.map((id) => new Types.ObjectId(id));
    const users = await this.usersRepository.find({
      _id: { $in: objectIds },
    });
    return users.map((userDocument) => this.toEntity(userDocument));
  }

  async update(_id: string, updateUserInput: UpdateUserInput) {
    if (updateUserInput.password) {
      updateUserInput.password = await this.hashPassword(
        updateUserInput.password,
      );
    }
    return this.toEntity(
      await this.usersRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(_id) },
        {
          $set: {
            ...updateUserInput,
          },
        },
      ),
    );
  }

  async remove(_id: string) {
    return this.toEntity(
      await this.usersRepository.findOneAndDelete({
        _id: new Types.ObjectId(_id),
      }),
    );
  }

  async verifyUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({ email });
    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
    return this.toEntity(user);
  }

  toEntity(userDocument: UserDocument): User {
    return {
      _id: userDocument._id,
      email: userDocument.email,
      username: userDocument.username,
      imageUrl: this.s3Service.getObjectUrl(
        this.usersBucket,
        this.getUserImage(userDocument._id.toHexString()),
      ),
    };
  }

  private get usersBucket() {
    return this.configService.getOrThrow<string>('MINIO_USERS_BUCKET');
  }

  private async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  private getUserImage(userId: string) {
    return `${userId}.${USERS_IMAGE_FILE_EXTENSION}`;
  }

  private isDuplicateEmailError(err: unknown) {
    if (!err || typeof err !== 'object') {
      return false;
    }
    const error = err as { code?: number; message?: string };
    return error.code === 11000 || error.message?.includes('E11000');
  }
}
