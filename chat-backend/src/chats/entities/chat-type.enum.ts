import { registerEnumType } from '@nestjs/graphql';

export enum ChatType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
}

registerEnumType(ChatType, {
  name: 'ChatType',
});
