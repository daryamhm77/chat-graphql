import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { TokenPayload } from '../auth/token-payload.interface';
import { ChatsService } from './chats.service';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('count')
  async countChats(@CurrentUser() user: TokenPayload) {
    return {
      chats: await this.chatsService.countChats(user._id),
    };
  }
}
