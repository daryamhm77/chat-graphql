import { Box, Stack } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import { useParams } from 'react-router-dom'
import { PAGE_SIZE } from '../../constants/page-size.ts'
import type { ChatType } from '../../graphql/chat.fragment.ts'
import { useCountChats } from '../../hooks/useCountChats.ts'
import { useGetChats } from '../../hooks/useGetChats.ts'
import { useGetMe } from '../../hooks/useGetMe.ts'
import { useMessageCreated } from '../../hooks/useMessageCreated.ts'
import ChatListAdd from './ChatListAdd.tsx'
import ChatListHeader from './ChatListHeader.tsx'
import ChatListItem from './ChatListItem.tsx'

interface ChatListProps {
  chatType: ChatType
}

const ChatList = ({ chatType }: ChatListProps) => {
  const { chatId: selectedChatId } = useParams()
  const [addOpen, setAddOpen] = useState(false)
  const { data: meData } = useGetMe()
  const { data, fetchMore } = useGetChats({ skip: 0, limit: PAGE_SIZE })
  const { chatsCount, countChats } = useCountChats()

  const chatIds = useMemo(
    () => data?.chats.map((chat) => chat._id) ?? [],
    [data?.chats],
  )

  useMessageCreated(chatIds, {
    selectedChatId,
    meId: meData?.me._id,
  })

  useEffect(() => {
    void countChats()
  }, [countChats, chatIds.length])

  const sortedChats = useMemo(() => {
    if (!data?.chats) {
      return []
    }
    return [...data.chats]
      .filter((chat) => chat.type === chatType)
      .sort((chatA, chatB) => {
        const timeA = chatA.latestMessage
          ? new Date(chatA.latestMessage.createdAt).getTime()
          : 0
        const timeB = chatB.latestMessage
          ? new Date(chatB.latestMessage.createdAt).getTime()
          : 0
        return timeB - timeA
      })
  }, [data?.chats, chatType])

  const hasMore = Boolean(
    data?.chats && chatsCount && data.chats.length < chatsCount,
  )

  return (
    <>
      <ChatListAdd
        open={addOpen}
        onClose={() => setAddOpen(false)}
        defaultTab={chatType === 'GROUP' ? 'group' : 'direct'}
      />
      <Stack
        sx={{
          height: '100%',
          bgcolor: 'rgba(255,255,255,0.92)',
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid rgba(43, 125, 233, 0.1)',
          boxShadow: '0 12px 36px rgba(15, 55, 100, 0.08)',
        }}
      >
        <ChatListHeader
          chatType={chatType}
          onAddChat={() => setAddOpen(true)}
        />
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            maxHeight: 'calc(100dvh - 160px)',
            p: 1,
          }}
        >
          <InfiniteScroll
            pageStart={0}
            loadMore={() => {
              if (!data?.chats.length) {
                return
              }
              void fetchMore({
                variables: { skip: data.chats.length },
              })
            }}
            hasMore={hasMore}
            useWindow={false}
          >
            {sortedChats.map((chat) => (
              <ChatListItem
                key={chat._id}
                chat={chat}
                selected={chat._id === selectedChatId}
                meId={meData?.me._id}
              />
            ))}
          </InfiniteScroll>
        </Box>
      </Stack>
    </>
  )
}

export default ChatList
