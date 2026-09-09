import AttachFileIcon from '@mui/icons-material/AttachFile'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import SendIcon from '@mui/icons-material/Send'
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  InputBase,
  Link,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import { useParams } from 'react-router-dom'
import { PAGE_SIZE } from '../../constants/page-size.ts'
import { useCountMessages } from '../../hooks/useCountMessages.ts'
import { useCreateMessage } from '../../hooks/useCreateMessage.ts'
import { useGetChat } from '../../hooks/useGetChat.ts'
import { useGetMe } from '../../hooks/useGetMe.ts'
import { useGetMessages } from '../../hooks/useGetMessages.ts'
import { useMarkChatAsRead } from '../../hooks/useMarkChatAsRead.ts'
import { useUploadMessageAttachment } from '../../hooks/useUploadMessageAttachment.ts'
import { useSnackbar } from '../snackbar/snackbar-context.tsx'
import { getChatTitle } from '../../utils/chat-title.ts'
import {
  isImageMimeType,
  validateMessageAttachment,
} from '../../utils/message-attachment.ts'

const Chat = () => {
  const { chatId = '' } = useParams()
  const { notify } = useSnackbar()
  const { data: meData } = useGetMe()
  const { data: chatData } = useGetChat({ _id: chatId })
  const { data: messagesData, fetchMore } = useGetMessages({
    chatId,
    skip: 0,
    limit: PAGE_SIZE,
  })
  const { createMessage, loading: sending } = useCreateMessage()
  const { upload, uploading } = useUploadMessageAttachment()
  const { messagesCount, countMessages } = useCountMessages(chatId)
  const { markChatAsRead } = useMarkChatAsRead()

  const [message, setMessage] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const busy = sending || uploading
  const meId = meData?.me._id

  useEffect(() => {
    void countMessages()
  }, [countMessages])

  useEffect(() => {
    if (!chatId) {
      return
    }
    void markChatAsRead(chatId)
  }, [chatId, markChatAsRead])

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (
      messagesData?.messages &&
      messagesData.messages.length > 0 &&
      messagesData.messages.length <= PAGE_SIZE
    ) {
      scrollToBottom()
    }
  }, [chatId, messagesData?.messages])

  const sortedMessages = useMemo(() => {
    if (!messagesData?.messages) {
      return []
    }
    return [...messagesData.messages].sort(
      (messageA, messageB) =>
        new Date(messageA.createdAt).getTime() -
        new Date(messageB.createdAt).getTime(),
    )
  }, [messagesData?.messages])

  const title = chatData?.chat
    ? getChatTitle(chatData.chat, meId)
    : 'Chat'

  const canSend =
    (message.trim().length > 0 || pendingFile !== null) &&
    !busy &&
    Boolean(chatId)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }
    const validationError = validateMessageAttachment(file)
    if (validationError) {
      notify({ message: validationError, severity: 'error' })
      return
    }
    setPendingFile(file)
  }

  const handleCreateMessage = async () => {
    const content = message.trim()
    if ((!content && !pendingFile) || busy || !chatId) {
      return
    }

    try {
      let attachment:
        | {
            attachmentUrl: string
            attachmentName: string
            attachmentMimeType: string
          }
        | undefined

      if (pendingFile) {
        const uploaded = await upload(pendingFile, chatId)
        attachment = {
          attachmentUrl: uploaded.url,
          attachmentName: uploaded.fileName,
          attachmentMimeType: uploaded.mimeType,
        }
      }

      await createMessage({
        content: content || undefined,
        chatId,
        ...attachment,
      })
      setMessage('')
      setPendingFile(null)
      scrollToBottom()
      void countMessages()
    } catch (error) {
      notify({
        message:
          error instanceof Error ? error.message : 'Could not send message.',
        severity: 'error',
      })
    }
  }

  const hasMore = Boolean(
    messagesData?.messages &&
      messagesCount &&
      messagesData.messages.length < messagesCount,
  )

  return (
    <Stack
      sx={{
        height: 'calc(100dvh - 112px)',
        justifyContent: 'space-between',
        bgcolor: 'rgba(255,255,255,0.92)',
        borderRadius: 4,
        border: '1px solid rgba(43, 125, 233, 0.1)',
        boxShadow: '0 12px 36px rgba(15, 55, 100, 0.08)',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: '1px solid rgba(43, 125, 233, 0.1)',
          bgcolor: 'rgba(255,255,255,0.95)',
        }}
      >
        <Typography
          variant="h6"
          component="h1"
          sx={{ fontWeight: 700, color: 'text.primary' }}
        >
          {title}
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          minHeight: 0,
          px: 2,
          py: 2,
          background:
            'linear-gradient(180deg, #F5F9FD 0%, #EAF2FA 55%, #F7FBFF 100%)',
        }}
      >
        <InfiniteScroll
          pageStart={0}
          isReverse
          loadMore={() => {
            if (!messagesData?.messages.length) {
              return
            }
            void fetchMore({
              variables: { skip: messagesData.messages.length },
            })
          }}
          hasMore={hasMore}
          useWindow={false}
        >
          {sortedMessages.map((item) => {
            const mine = item.user._id === meId
            return (
              <Stack
                key={item._id}
                direction={mine ? 'row-reverse' : 'row'}
                spacing={1.25}
                sx={{ mb: 2, alignItems: 'flex-end' }}
              >
                <Avatar
                  src={item.user.imageUrl}
                  alt={item.user.username}
                  sx={{
                    width: 40,
                    height: 40,
                    border: '2px solid #FFFFFF',
                    boxShadow: '0 2px 8px rgba(15, 55, 100, 0.12)',
                  }}
                />
                <Stack
                  sx={{
                    alignItems: mine ? 'flex-end' : 'flex-start',
                    maxWidth: '75%',
                  }}
                >
                  {!mine ? (
                    <Typography
                      variant="caption"
                      sx={{ mb: 0.5, ml: 0.5, color: 'text.secondary' }}
                    >
                      {item.user.username}
                    </Typography>
                  ) : null}
                  <Box
                    sx={{
                      width: 'fit-content',
                      maxWidth: '100%',
                      px: 1.75,
                      py: 1.25,
                      borderRadius: mine
                        ? '20px 20px 6px 20px'
                        : '20px 20px 20px 6px',
                      bgcolor: mine ? 'primary.main' : '#E3F0FF',
                      color: mine ? '#FFFFFF' : 'text.primary',
                      boxShadow: mine
                        ? '0 8px 18px rgba(43, 125, 233, 0.28)'
                        : '0 6px 16px rgba(15, 55, 100, 0.06)',
                    }}
                  >
                    <Stack sx={{ gap: 1 }}>
                      {item.content ? (
                        <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                          {item.content}
                        </Typography>
                      ) : null}
                      {item.attachmentUrl ? (
                        isImageMimeType(item.attachmentMimeType) ? (
                          <Box
                            component="img"
                            src={item.attachmentUrl}
                            alt={item.attachmentName ?? 'Attachment'}
                            sx={{
                              maxWidth: 'min(280px, 100%)',
                              maxHeight: 240,
                              borderRadius: 2,
                              display: 'block',
                            }}
                          />
                        ) : (
                          <Link
                            href={item.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.75,
                              color: mine ? '#FFFFFF' : 'primary.main',
                            }}
                          >
                            <InsertDriveFileIcon fontSize="small" />
                            {item.attachmentName ?? 'Download file'}
                          </Link>
                        )
                      ) : null}
                    </Stack>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ mt: 0.5, mx: 0.5, color: 'text.secondary' }}
                  >
                    {new Date(item.createdAt).toLocaleString()}
                  </Typography>
                </Stack>
              </Stack>
            )
          })}
          <div ref={bottomRef} />
        </InfiniteScroll>
      </Box>

      {pendingFile ? (
        <Chip
          label={pendingFile.name}
          onDelete={busy ? undefined : () => setPendingFile(null)}
          sx={{ mx: 2, mt: 1, alignSelf: 'flex-start' }}
        />
      ) : null}

      <Box sx={{ p: 2, pt: pendingFile ? 1 : 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            px: 1,
            py: 0.5,
            borderRadius: 999,
            bgcolor: '#F3F8FD',
            border: '1px solid rgba(43, 125, 233, 0.14)',
            boxShadow: 'inset 0 1px 2px rgba(15, 55, 100, 0.04)',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,.doc,.docx,.xls,.xlsx,.zip,.txt,.csv"
            onChange={handleFileChange}
          />
          <IconButton
            disabled={busy}
            aria-label="Attach file"
            onClick={() => fileInputRef.current?.click()}
            sx={{ color: 'primary.main' }}
          >
            <AttachFileIcon />
          </IconButton>
          <InputBase
            sx={{ ml: 0.5, flex: 1, fontSize: 16 }}
            placeholder="Type a message…"
            value={message}
            disabled={busy}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void handleCreateMessage()
              }
            }}
          />
          <IconButton
            disabled={!canSend}
            aria-label="Send message"
            onClick={() => {
              void handleCreateMessage()
            }}
            sx={{
              bgcolor: canSend ? 'primary.main' : 'rgba(43, 125, 233, 0.2)',
              color: '#FFFFFF',
              width: 40,
              height: 40,
              '&:hover': {
                bgcolor: canSend ? 'primary.dark' : 'rgba(43, 125, 233, 0.2)',
              },
              '&.Mui-disabled': {
                color: '#FFFFFF',
              },
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Stack>
  )
}

export default Chat
