/** App-wide toast. Components call `notify()`; Snackbar renders it. */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AlertColor } from '@mui/material'

export interface SnackNotice {
  message: string
  severity: AlertColor
}

interface SnackbarContextValue {
  snack: SnackNotice | undefined
  notify: (snack: SnackNotice) => void
  clear: () => void
}

const SnackbarContext = createContext<SnackbarContextValue | undefined>(
  undefined,
)

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [snack, setSnack] = useState<SnackNotice>()

  const notify = useCallback((next: SnackNotice) => {
    setSnack(next)
  }, [])

  const clear = useCallback(() => {
    setSnack(undefined)
  }, [])

  const value = useMemo(
    () => ({ snack, notify, clear }),
    [snack, notify, clear],
  )

  return (
    <SnackbarContext.Provider value={value}>{children}</SnackbarContext.Provider>
  )
}

export const useSnackbar = () => {
  const context = useContext(SnackbarContext)
  if (!context) {
    throw new Error('useSnackbar must be used inside SnackbarProvider')
  }
  return context
}
