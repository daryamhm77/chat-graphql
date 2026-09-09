import {
  Avatar,
  Badge,
  Box,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import type { Chat } from '../../graphql/chat.fragment.ts'
import { getChatTitle } from '../../utils/chat-title.ts'
import './ChatListItem.css'

interface ChatListItemProps {
  chat: Chat
  selected: boolean
  meId: string | undefined
}

const ChatListItem = ({ chat, selected, meId }: ChatListItemProps) => {
  const navigate = useNavigate()
  const title = getChatTitle(chat, meId)
  const previewUser = chat.latestMessage?.user
  const avatarSrc =
    chat.type === 'DIRECT'
      ? chat.participants.find((user) => user._id !== meId)?.imageUrl
      : previewUser?.imageUrl
  const preview =
    chat.latestMessage?.content ||
    (chat.latestMessage?.attachmentName
      ? `📎 ${chat.latestMessage.attachmentName}`
      : 'No messages yet')
  const unread = chat.unreadCount ?? 0
  const basePath = chat.type === 'GROUP' ? '/groups' : '/direct'

  return (
    <ListItem alignItems="flex-start" disablePadding sx={{ mb: 0.75 }}>
      <ListItemButton
        selected={selected}
        onClick={() => {
          void navigate(`${basePath}/${chat._id}`)
        }}
        sx={{
          borderRadius: 3,
          px: 1.5,
          py: 1.25,
          bgcolor: selected ? '#E3F0FF' : unread ? '#F3F8FD' : 'transparent',
          border: selected
            ? '1px solid rgba(43, 125, 233, 0.28)'
            : '1px solid transparent',
          '&:hover': {
            bgcolor: selected ? '#E3F0FF' : '#F3F8FD',
          },
          '&.Mui-selected:hover': {
            bgcolor: '#D8EBFF',
          },
        }}
      >
        <ListItemAvatar sx={{ minWidth: 56 }}>
          <Badge
            color="error"
            badgeContent={unread}
            max={99}
            invisible={!unread || selected}
            overlap="circular"
          >
            <Avatar
              alt={title}
              src={avatarSrc}
              sx={{
                width: 44,
                height: 44,
                border: '2px solid #FFFFFF',
                boxShadow: '0 2px 8px rgba(15, 55, 100, 0.12)',
              }}
            />
          </Badge>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: unread && !selected ? 800 : 700,
                  color: 'text.primary',
                  lineHeight: 1.2,
                }}
              >
                {title}
              </Typography>
              {unread && !selected ? (
                <Box
                  component="span"
                  sx={{
                    minWidth: 22,
                    height: 22,
                    px: 0.75,
                    borderRadius: 999,
                    bgcolor: 'error.main',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {unread > 99 ? '99+' : unread}
                </Box>
              ) : null}
            </Box>
          }
          secondary={
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.25,
                mt: 0.35,
              }}
            >
              {previewUser?.username ? (
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ color: 'primary.main', fontWeight: 600 }}
                >
                  {previewUser.username}
                </Typography>
              ) : null}
              <Box
                component="span"
                className="content"
                sx={{
                  color: 'text.secondary',
                  fontSize: 13,
                  fontWeight: unread && !selected ? 600 : 400,
                  bgcolor: selected ? 'rgba(255,255,255,0.7)' : '#EAF2FA',
                  borderRadius: 2,
                  px: 1,
                  py: 0.5,
                }}
              >
                {preview}
              </Box>
            </Box>
          }
          slotProps={{
            secondary: { component: 'div' },
          }}
        />
      </ListItemButton>
    </ListItem>
  )
}

export default ChatListItem
