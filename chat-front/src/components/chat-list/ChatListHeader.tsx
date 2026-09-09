import AddCircle from '@mui/icons-material/AddCircle'
import { Box, IconButton, Typography } from '@mui/material'
import type { ChatType } from '../../graphql/chat.fragment.ts'

interface ChatListHeaderProps {
  chatType: ChatType
  onAddChat: () => void
}

const ChatListHeader = ({ chatType, onAddChat }: ChatListHeaderProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1.5,
        borderBottom: '1px solid rgba(43, 125, 233, 0.1)',
      }}
    >
      <Typography
        variant="h6"
        component="h2"
        sx={{ fontWeight: 700, color: 'text.primary' }}
      >
        {chatType === 'DIRECT' ? 'Direct' : 'Group'}
      </Typography>
      <IconButton
        color="primary"
        aria-label="Start a new chat"
        onClick={onAddChat}
        sx={{
          bgcolor: 'primary.main',
          color: '#FFFFFF',
          width: 40,
          height: 40,
          '&:hover': { bgcolor: 'primary.dark' },
        }}
      >
        <AddCircle />
      </IconButton>
    </Box>
  )
}

export default ChatListHeader
