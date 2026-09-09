import type { Chat } from '../graphql/chat.fragment.ts'

/** Group name, or the other participant’s username for DMs. */
export const getChatTitle = (chat: Chat, meId: string | undefined) => {
  if (chat.type === 'GROUP') {
    return chat.name?.trim() || 'Group chat'
  }

  const other = chat.participants.find((user) => user._id !== meId)
  return other?.username ?? 'Direct chat'
}
