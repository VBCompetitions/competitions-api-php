import React, { useState } from 'react'
import { Link, Outlet, useLoaderData, useLocation, useNavigate, useNavigation } from 'react-router-dom'

import AccountCircleRounded from '@mui/icons-material/AccountCircleRounded'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Menu from '@mui/material/Menu'
import MenuIcon from '@mui/icons-material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

import MenuDrawer from '../components/MenuDrawer'
import { getAccount } from '../apis/uidataAPI'

export async function loggedIn () {
  try {
    const userInfo = await getAccount()
    return userInfo
  } catch (error) {
    return {
      loggedIn: false,
      roles: []
    }
  }
}

export default function Root ({ username, setUsername }) {
  const userInfo = useLoaderData()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const location = useLocation()

  if (!userInfo.loggedIn &&
    (location.pathname !== '/login' && !/\/account\/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/.test(location.pathname))) {
    navigate('/login', { replace: true })
  }

  const [anchorEl, setAnchorEl] = useState(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  if (username !== userInfo.username) {
    setUsername(userInfo.username)
  }

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const toggleMenuDrawer = (openState) => () => {
    setDrawerOpen(openState);
  }

  let body
  if (navigation.state === 'loading' && navigation.location) {
    let loadingMessage = ''
    if (navigation.location.pathname === `${window.VBC_BASE_PATH}/ui/c`) {
      loadingMessage = 'Loading Competition List...'
    } else if (navigation.location.pathname === `${window.VBC_BASE_PATH}/ui/account`) {
      loadingMessage = 'Loading Account...'
    } else if (navigation.location.pathname === `${window.VBC_BASE_PATH}/ui/users`) {
      loadingMessage = 'Loading Users...'
    } else if (navigation.location.pathname === `${window.VBC_BASE_PATH}/ui/account/`) {
      loadingMessage = 'Getting New User...'
    } else {
      loadingMessage = 'Loading...'
    }
    body = <Box  sx={{ flexGrow: '1' }} padding='5px'>
      <Box padding='10px 10px 5px 10px'>
        <Box sx={{ display: 'flex' }}>
          <Typography sx={{ flexGrow: '1', marginBottom: '3px' }} variant='h5' textAlign='left' gutterBottom>{loadingMessage}</Typography>
        </Box>
      </Box>
      <Box padding='10px'>
        <LinearProgress />
      </Box>
    </Box>
  } else {
    if (location.pathname === '/') {
      body = <Box padding='5px' sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box padding='10px 10px 5px 10px'>
          <Box sx={{ display: 'flex' }}>
            <Typography sx={{ flexGrow: '1', marginBottom: '3px' }} variant='h5' textAlign='left' gutterBottom>Home</Typography>
          </Box>
        </Box>
        <Box padding='10px'>
          <Divider sx={{ borderBottomWidth: 4, borderColor: '#1976d2' }} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: '1', flexDirection: 'column' }}>
          <Box sx={{ flexGrow: '1' }}></Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} padding='10px' >
            <Link to={'/c'}>
              <Button variant='contained'>Competitions</Button>
            </Link>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} padding='10px' >
            <Link to={'/account'}>
              <Button variant='contained'>My Account</Button>
            </Link>
          </Box>
          <Box sx={{ flexGrow: '2' }}></Box>
        </Box>
      </Box>
    } else {
      body = <Outlet sx={{ flexGrow: '1' }} />
    }
  }

  return (
    <Box className='Root'>
      { userInfo.loggedIn ? <MenuDrawer drawerOpen={drawerOpen} toggleDrawer={toggleMenuDrawer} /> : null }
      <AppBar position='static'>
        <Toolbar>
          {
            userInfo.loggedIn
            ?
            <IconButton size='large' edge='start' color='inherit' aria-label='menu' sx={{ mr: 2 }} onClick={toggleMenuDrawer(true)} >
              <MenuIcon />
            </IconButton>
            :
            null
          }
          <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
            VBCompetitions
          </Typography>
          <Box>
            {
              userInfo.loggedIn
              ?
              <>
                <Typography variant='body' component='span' sx={{ paddingRight: '5px' }}>{username}</Typography>
                <IconButton size='large' aria-label='account of current user' aria-controls='menu-appbar'
                  aria-haspopup='true' onClick={handleMenu} color='inherit'>
                  <AccountCircleRounded />
                </IconButton>
              </>
              :
              null
            }
            <Menu id='menu-appbar' anchorEl={anchorEl} anchorOrigin={{ vertical: 'top', horizontal: 'right', }}
              keepMounted transformOrigin={{ vertical: 'top', horizontal: 'right', }}
              open={Boolean(anchorEl)} onClose={handleClose}>
              {
                [
                <Link key='account' to={'/account'}>
                  <MenuItem onClick={handleClose}>Account</MenuItem>
                </Link>,
                <a key='logout' href={`${window.VBC_UI_URL}/logout`}>
                  <MenuItem onClick={handleClose}>Log out</MenuItem>
                </a>
                ]
              }
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      {body}
    </Box>
  )
}
