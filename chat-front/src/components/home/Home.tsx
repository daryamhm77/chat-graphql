/** Empty pane when no chat is selected. */
import { Stack, Typography } from '@mui/material'
import type { ChatType } from '../../graphql/chat.fragment.ts'

interface HomeProps {
  chatType: ChatType
}

const Home = ({ chatType }: HomeProps) => {
  const label = chatType === 'DIRECT' ? 'direct' : 'group'

  return (
    <Stack
      spacing={1}
      sx={{
        height: 'calc(100dvh - 112px)',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        px: 2,
        borderRadius: 4,
        bgcolor: 'rgba(255,255,255,0.85)',
        border: '1px solid rgba(43, 125, 233, 0.1)',
        boxShadow: '0 12px 36px rgba(15, 55, 100, 0.08)',
      }}
    >
      <Typography
        variant="h5"
        component="h1"
        sx={{ fontWeight: 700, color: 'primary.dark' }}
      >
        Select a {label} chat or start a new one
      </Typography>
      <Typography color="text.secondary">
        Pick a conversation from the list, or use + to message someone.
      </Typography>
    </Stack>
  )
}

export default Home
