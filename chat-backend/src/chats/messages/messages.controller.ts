import {
  BadRequestException,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../auth/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { TokenPayload } from '../../auth/token-payload.interface';
import {
  MESSAGES_ALLOWED_FILE_TYPE,
  MESSAGES_MAX_FILE_SIZE,
} from './messages.constants';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('count')
  countMessages(
    @Query('chatId') chatId: string,
    @CurrentUser() user: TokenPayload,
  ) {
    if (!chatId) {
      throw new BadRequestException('chatId is required.');
    }
    return this.messagesService.countMessages(chatId, user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadAttachment(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MESSAGES_MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: MESSAGES_ALLOWED_FILE_TYPE }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Query('chatId') chatId: string,
    @CurrentUser() user: TokenPayload,
  ) {
    if (!chatId) {
      throw new BadRequestException('chatId is required.');
    }
    return this.messagesService.uploadAttachment(file, chatId, user._id);
  }
}
