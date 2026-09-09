import { Container, Grid } from '@mui/material'
import { Outlet } from 'react-router-dom'
import type { ChatType } from '../../graphql/chat.fragment.ts'
import ChatList from '../chat-list/ChatList.tsx'

interface ChatLayoutProps {
  chatType: ChatType
}

const ChatLayout = ({ chatType }: ChatLayoutProps) => {
  return (
    <Container maxWidth="xl" sx={{ py: 2, flex: 1, minHeight: 0 }}>
      <Grid container spacing={2.5} sx={{ minHeight: 'calc(100dvh - 96px)' }}>
        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
          <ChatList chatType={chatType} />
        </Grid>
        <Grid size={{ xs: 12, md: 8, lg: 9 }} sx={{ minHeight: 0 }}>
          <Outlet />
        </Grid>
      </Grid>
    </Container>
  )
}

export default ChatLayout
