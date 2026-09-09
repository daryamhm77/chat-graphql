import { createBrowserRouter, Navigate } from 'react-router-dom'
import Guard from './auth/Guard.tsx'
import Login from './auth/Login.tsx'
import PublicOnly from './auth/PublicOnly.tsx'
import Signup from './auth/Signup.tsx'
import Chat from './chat/Chat.tsx'
import ChatLayout from './chat/ChatLayout.tsx'
import Home from './home/Home.tsx'
import Profile from './profile/Profile.tsx'
import RootLayout from './RootLayout.tsx'

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <PublicOnly />,
        children: [
          { path: '/login', element: <Login /> },
          { path: '/signup', element: <Signup /> },
        ],
      },
      {
        element: <Guard />,
        children: [
          { path: '/', element: <Navigate to="/direct" replace /> },
          {
            path: '/direct',
            element: <ChatLayout chatType="DIRECT" />,
            children: [
              { index: true, element: <Home chatType="DIRECT" /> },
              { path: ':chatId', element: <Chat /> },
            ],
          },
          {
            path: '/groups',
            element: <ChatLayout chatType="GROUP" />,
            children: [
              { index: true, element: <Home chatType="GROUP" /> },
              { path: ':chatId', element: <Chat /> },
            ],
          },
          { path: '/profile', element: <Profile /> },
        ],
      },
    ],
  },
])

export default router
