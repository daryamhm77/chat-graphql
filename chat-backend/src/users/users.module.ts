import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { S3Module } from '../common/s3/s3.module';
import { User } from './entities/user.entity';
import { UserSchema } from './entities/user.document';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [
    S3Module,
    DatabaseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UsersResolver, UsersService, UsersRepository],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
