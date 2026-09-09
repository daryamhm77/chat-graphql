import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  List,
  ListItemButton,
  ListItemText,
  Modal,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from '../snackbar/snackbar-context.tsx'
import { useCreateGroupChat } from '../../hooks/useCreateGroupChat.ts'
import { useGetMe } from '../../hooks/useGetMe.ts'
import { useGetUsers } from '../../hooks/useGetUsers.ts'
import { useStartDirectChat } from '../../hooks/useStartDirectChat.ts'

type AddTab = 'direct' | 'group'

interface ChatListAddProps {
  open: boolean
  onClose: () => void
  defaultTab?: AddTab
}

const ChatListAdd = ({
  open,
  onClose,
  defaultTab = 'direct',
}: ChatListAddProps) => {
  const navigate = useNavigate()
  const { notify } = useSnackbar()
  const { data: meData } = useGetMe()
  const { data: usersData, loading: usersLoading } = useGetUsers()
  const { startDirectChat, loading: startingDm } = useStartDirectChat()
  const { createGroupChat, loading: creatingGroup } = useCreateGroupChat()

  const [tab, setTab] = useState<AddTab>(defaultTab)
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      setTab(defaultTab)
    }
  }, [open, defaultTab])

  const meId = meData?.me._id
  const otherUsers = useMemo(
    () => (usersData?.users ?? []).filter((user) => user._id !== meId),
    [usersData?.users, meId],
  )

  const resetAndClose = () => {
    setTab(defaultTab)
    setName('')
    setNameError('')
    setSelectedIds([])
    onClose()
  }

  const toggleParticipant = (userId: string) => {
    setSelectedIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    )
  }

  const handleStartDirect = async (userId: string) => {
    try {
      const chat = await startDirectChat(userId)
      resetAndClose()
      void navigate(`/direct/${chat._id}`)
    } catch (error) {
      notify({
        message:
          error instanceof Error ? error.message : 'Could not start chat.',
        severity: 'error',
      })
    }
  }

  const handleCreateGroup = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setNameError('Group name is required.')
      return
    }

    try {
      const chat = await createGroupChat({
        name: trimmed,
        participantIds: selectedIds,
      })
      resetAndClose()
      void navigate(`/groups/${chat._id}`)
    } catch (error) {
      notify({
        message:
          error instanceof Error ? error.message : 'Could not create group.',
        severity: 'error',
      })
    }
  }

  const busy = startingDm || creatingGroup

  return (
    <Modal open={open} onClose={resetAndClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 420 },
          maxHeight: '80dvh',
          overflow: 'auto',
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 24,
          p: 3,
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h6" component="h2">
            New chat
          </Typography>
          <Tabs
            value={tab}
            onChange={(_event, value: AddTab) => {
              setTab(value)
            }}
          >
            <Tab label="Direct" value="direct" />
            <Tab label="Group" value="group" />
          </Tabs>

          {usersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={28} />
            </Box>
          ) : null}

          {!usersLoading && tab === 'direct' ? (
            <List dense sx={{ maxHeight: 280, overflow: 'auto' }}>
              {otherUsers.length === 0 ? (
                <Typography color="text.secondary" sx={{ px: 1 }}>
                  No other users yet.
                </Typography>
              ) : (
                otherUsers.map((user) => (
                  <ListItemButton
                    key={user._id}
                    disabled={busy}
                    onClick={() => {
                      void handleStartDirect(user._id)
                    }}
                  >
                    <ListItemText
                      primary={user.username}
                      secondary={user.email}
                    />
                  </ListItemButton>
                ))
              )}
            </List>
          ) : null}

          {!usersLoading && tab === 'group' ? (
            <Stack spacing={2}>
              <TextField
                label="Group name"
                value={name}
                error={Boolean(nameError)}
                helperText={nameError}
                disabled={busy}
                onChange={(event) => {
                  setName(event.target.value)
                  if (nameError) {
                    setNameError('')
                  }
                }}
              />
              <Typography variant="subtitle2">Participants</Typography>
              <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                {otherUsers.map((user) => (
                  <FormControlLabel
                    key={user._id}
                    sx={{ display: 'flex', ml: 0, width: '100%' }}
                    control={
                      <Checkbox
                        checked={selectedIds.includes(user._id)}
                        disabled={busy}
                        onChange={() => {
                          toggleParticipant(user._id)
                        }}
                      />
                    }
                    label={`${user.username} (${user.email})`}
                  />
                ))}
              </List>
              <Button
                variant="contained"
                disabled={busy}
                onClick={() => {
                  void handleCreateGroup()
                }}
              >
                {creatingGroup ? 'Creating…' : 'Create group'}
              </Button>
            </Stack>
          ) : null}
        </Stack>
      </Box>
    </Modal>
  )
}

export default ChatListAdd
