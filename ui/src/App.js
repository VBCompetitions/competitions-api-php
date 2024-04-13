// import logo from './logo.svg'
import React, { useState } from 'react'
import './App.css'
import Box from '@mui/material/Box'
import NotificationSnackbar from './NotificationSnackbar.js'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import Root, { loggedIn } from './Root.js'
import CompetitionList, { competitionListLoader } from './CompetitionList.js'
import CompetitionViewer, { competitionLoader } from './CompetitionViewer.js'
import ErrorPage from './ErrorPage.js'
import Login from './Login.js'
import Account, { accountLoader } from './Account.js'
import Activate, { loadUserActivation } from './Activate.js'
import Users, { userListLoader } from './Users.js'

export default function App () {
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('')

  if (typeof window.VBC_BASE_PATH !== 'string') {
    throw new Error('VBC_BASE_PATH not found')
  }

  if (typeof window.VBC_API_URL !== 'string') {
    throw new Error('VBC_API_URL not found')
  }

  if (typeof window.VBC_UI_URL !== 'string') {
    throw new Error('VBC_UI_URL not found')
  }

  if (typeof window.VBC_UIDATA_URL !== 'string') {
    throw new Error('VBC_UIDATA_URL not found')
  }

  if (typeof window.VBC_GET_POST_MODE !== 'boolean') {
    throw new Error('VBC_GET_POST_MODE not found')
  }

  const router = createBrowserRouter([
    {
      element: <Root username={username} setUsername={setUsername} />,
      path: '/',
      loader: loggedIn,
      id: 'root',
      children: [
        {
          path: '/login',
          element: <Login />,
          errorElement: <ErrorPage />
        },
        {
          path: '/users',
          element: <Users setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />,
          errorElement: <ErrorPage />,
          loader: userListLoader
        },
        {
          path: '/account',
          element: <Account setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} username={username} setUsername={setUsername} />,
          errorElement: <ErrorPage />,
          loader: accountLoader
        },
        {
          path: '/account/:linkID',
          element: <Activate />,
          errorElement: <ErrorPage />,
          loader: loadUserActivation
        },
        {
          path: '/c',
          element: <CompetitionList setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />,
          errorElement: <ErrorPage />,
          loader: competitionListLoader
        },
        {
          path: '/c/:competitionID',
          element: <CompetitionViewer setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />,
          errorElement: <ErrorPage />,
          loader: competitionLoader
        }
      ]
    }
  ], {
    basename: `${window.VBC_BASE_PATH}/ui`
  })

  return (
    <Box className='App'>
      <RouterProvider router={router} />
      {
        successMessage === null && errorMessage === null
        ?
        null
        :
        <NotificationSnackbar successMessage={successMessage} errorMessage={errorMessage} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />
      }
    </Box>
  )
}
