import React, { useState } from 'react'
import { Link, redirect, useLoaderData, useNavigate, useRouteLoaderData } from 'react-router-dom'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import Divider from '@mui/material/Divider'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded'
import Paper from '@mui/material/Paper'
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

import { getApps, getUsers } from '../../apis/uidataAPI'
import Roles, { InsufficientRoles } from '../components/Roles'
import NewUser from './dialogs/NewUser'
import DeleteUser from './dialogs/DeleteUser'
import EditUser from './dialogs/EditUser'
import UserLink from './dialogs/UserLink'
import ResetUser from './dialogs/ResetUser'

export async function userListLoader() {
  try {
    const userList = await getUsers()
    const usernames = userList.map(user => user.username)
    return { userList, usernames }
  } catch (err) {
    if (err.status === 401) {
      return redirect('/login?returnTo=/c')
    } else if (err.status === 403) {
      return { userList: [], usernames: [] }
    }
    throw err
  }
}

export default function Users ({ setSuccessMessage, setErrorMessage }) {
  const [loading, setLoading] = useState(false)

  const [newUserOpen, setNewUserDialogOpen] = useState(false)
  const [apps, setApps] = useState([])

  const [deleteUserOpen, setDeleteUserDialogOpen] = useState(false)
  const [deleteUserUser, setDeleteUser] = useState(null)

  const [editUserOpen, setEditUserDialogOpen] = useState(false)
  const [editUserUser, setEditUser] = useState(null)

  const [userLinkOpen, setUserLinkDialogOpen] = useState(false)
  const [userLinkTriggerRefresh, setUserLinkTriggerRefresh] = useState(false)
  const [userLinkUser, setUserLinkUser] = useState(null)

  const [resetUserOpen, setResetUserDialogOpen] = useState(false)
  const [resetUserUser, setResetUser] = useState(null)

  const { userList, usernames } = useLoaderData()
  const userInfo = useRouteLoaderData('root')
  const navigate = useNavigate()

  async function openNewUser () {
    setLoading(true)

    try {
      setApps(await getApps())
      setLoading(false)
      setNewUserDialogOpen(true)
    } catch (error) {
      setErrorMessage(error.message)
      setLoading(false)
    }
  }

  function closeNewUser () {
    setNewUserDialogOpen(false)
  }

  async function openEditUser (user) {
    setLoading(true)

    try {
      setApps(await getApps())
      setLoading(false)
      setEditUser(user)
      setEditUserDialogOpen(true)
    } catch (error) {
      setErrorMessage(error.message)
      setLoading(false)
    }
  }

  function closeEditUser () {
    setEditUserDialogOpen(false)
  }

  function openDeleteUser (user) {
    setDeleteUser(user)
    setDeleteUserDialogOpen(true)
  }

  function closeDeleteUser () {
    setDeleteUserDialogOpen(false)
  }

  function openUserLink (user) {
    setUserLinkUser(user)
    setUserLinkDialogOpen(true)
  }

  function closeUserLink () {
    setUserLinkDialogOpen(false)
    if (userLinkTriggerRefresh) {
      setUserLinkTriggerRefresh(false)
      navigate('.', { replace: true })
    }
  }

  function openResetUser (user) {
    setResetUser(user)
    setResetUserDialogOpen(true)
  }

  function closeResetUser () {
    setResetUserDialogOpen(false)
  }

  if (Roles.roleCheck(userInfo.roles, [Roles.ADMIN])) {
    return (
      <Box padding='5px' sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box padding='10px 10px 5px 10px'>
          <Box sx={{ display: 'flex' }}>
            <Link to={`/`}>
              <IconButton size='small' aria-label='refresh list' sx={{ marginRight: '10px' }}  color='inherit'>
                <HomeRoundedIcon color='action' />
              </IconButton>
            </Link>
            <Typography sx={{ flexGrow: '1', marginBottom: '3px' }} variant='h5' textAlign='left' gutterBottom>Users</Typography>
            <IconButton size="small" aria-label="refresh list" onClick={() => { navigate('.', { replace: true }) }} color="inherit">
              <RefreshRoundedIcon color='action' />
            </IconButton>
          </Box>
        </Box>
        <Box padding='10px' paddingBottom={'20px'}>
          {
            loading
            ?
            <LinearProgress />
            :
            <Divider sx={{ borderBottomWidth: 4, borderColor: '#1976d2' }} />
          }
        </Box>
        <Box textAlign='right' padding='0px 30px'>
          <Button aria-label='New user' variant='outlined' startIcon={<PersonAddAltRoundedIcon />} onClick={openNewUser}>New User</Button>
        </Box>
        <Box padding='10px 30px'>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label='simple table'>
              <TableHead>
                <TableRow className='data-table'>
                  <TableCell align='center'>
                    <Typography textAlign='center' variant='button' component='div' className='white'>Username</Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Typography textAlign='center' variant='button' component='div' className='white'>Last Login</Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Typography textAlign='center' variant='button' component='div' className='white'>State</Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Typography textAlign='center' variant='button' component='div' className='white'>Roles</Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Typography textAlign='center' variant='button' component='div' className='white'>App</Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Typography textAlign='center' variant='button' component='div' className='white'>Actions</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userList.sort((a, b) => {
                  if (a.username === 'admin') return -1
                  return a.username.localeCompare(b.username)
                }).map(user => (
                  <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell align='center'>{user.username}</TableCell>
                    <TableCell align='center'>{user.lastLogin}</TableCell>
                    <TableCell align='center'>
                      <Typography textAlign='center' variant='body2' component='span' className={user.state === 'active' ? 'green' : user.state === 'suspended' ? 'orange' : 'blue' }>{user.state}</Typography>
                      {
                        user.state === 'pending'
                        ?
                        <IconButton size='small' edge='start' color='inherit' aria-label='menu' sx={{ marginLeft: '4px', mr: 2 }} onClick={() => { openUserLink(user) }} >
                          <LinkRoundedIcon />
                        </IconButton>
                        :
                        null
                      }
                    </TableCell>
                    <TableCell align='center'>{user.roles.join(', ')}</TableCell>
                    <TableCell align='center'>{user.app}</TableCell>
                    <TableCell align='right'>
                      {
                        user.username === 'admin'
                        ?
                        null
                        :
                        <>
                          {
                            user.state === 'pending'
                            ?
                            null
                            :
                            <IconButton size='small' edge='start' color='inherit' aria-label='menu' sx={{ mr: 2 }} onClick={() => { openResetUser(user) }} >
                              <LockResetRoundedIcon />
                            </IconButton>
                          }
                          <IconButton size='small' edge='start' color='inherit' aria-label='menu' sx={{ mr: 2 }} onClick={() => { openEditUser(user) }} >
                            <EditRoundedIcon />
                          </IconButton>
                          <IconButton size='small' edge='start' color='inherit' aria-label='menu' sx={{ mr: 2 }} onClick={() => { openDeleteUser(user) }} >
                            <DeleteRoundedIcon />
                          </IconButton>
                        </>
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        { newUserOpen ? <NewUser setLoading={setLoading} apps={apps} usernames={usernames} openUserLink={openUserLink} setUserLinkTriggerRefresh={setUserLinkTriggerRefresh} closeDialog={closeNewUser} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} /> : null }
        { deleteUserOpen ? <DeleteUser setLoading={setLoading} user={deleteUserUser} closeDialog={closeDeleteUser} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />: null }
        { editUserOpen ? <EditUser setLoading={setLoading} user={editUserUser} apps={apps} closeDialog={closeEditUser} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} /> : null }
        { userLinkOpen ? <UserLink user={userLinkUser} closeDialog={closeUserLink} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} /> : null }
        { resetUserOpen ? <ResetUser setLoading={setLoading} user={resetUserUser} closeDialog={closeResetUser} openUserLink={openUserLink} setUserLinkTriggerRefresh={setUserLinkTriggerRefresh} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} /> : null }
      </Box>
    )
  } else {
    return ( <InsufficientRoles /> )
  }
}

