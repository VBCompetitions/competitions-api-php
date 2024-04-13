import React, { useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import Divider from '@mui/material/Divider'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded'
import Paper from '@mui/material/Paper'
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { Link, redirect, useLoaderData, useNavigate, useRouteLoaderData } from 'react-router-dom'

import { States, createUser, deleteUser, getUsers, resetUser, updateUser } from './apis/uidataAPI'
import Roles, { InsufficientRoles } from './Roles'

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
  const [newUserNameBadLength, setNewUserNameBadLength] = useState(true)
  const [newUserNameExists, setNewUserNameExists] = useState(false)
  const [newUserNameInvalid, setNewUserNameInvalid] = useState(false)
  const [newUserName, setNewUserName] = useState(null)
  const [newUserRoles, setNewUserRoles] = React.useState({ admin: false, fixturesSec: false, resultsEntry: false })

  const [deleteUserOpen, setDeleteUserDialogOpen] = useState(false)
  const [deleteUserUser, setDeleteUser] = useState(null)

  const [editUserOpen, setEditUserDialogOpen] = useState(false)
  const [editUserUser, setEditUser] = useState(null)
  const [editUserState, setEditUserState] = useState('active')
  const [editUserRoles, setEditUserRoles] = React.useState({ admin: false, fixturesSec: false, resultsEntry: false })

  const [userLinkOpen, setUserLinkDialogOpen] = useState(false)
  const [userLinkTriggerRefresh, setUserLinkTriggerRefresh] = useState(false)
  const [userLinkUser, setUserLinkUser] = useState(null)

  const [resetUserOpen, setResetUserDialogOpen] = useState(false)
  const [resetUserUser, setResetUser] = useState(null)

  const { userList, usernames } = useLoaderData()
  const userInfo = useRouteLoaderData('root')
  const navigate = useNavigate()

  function newUserDialogOpen () {
    setNewUserDialogOpen(true)
  }

  function newUserDialogClose () {
    setNewUserDialogOpen(false)
    setNewUserNameExists(false)
    setNewUserName(null)
  }

  async function newUserAction () {
    setLoading(true)
    setNewUserDialogOpen(false)
    const roles = [Roles.VIEWER]
    newUserRoles.admin && roles.push(Roles.ADMIN)
    newUserRoles.fixturesSec && roles.push(Roles.FIXTURES_SECRETARY)
    newUserRoles.resultsEntry && roles.push(Roles.RESULTS_ENTRY)

    try {
      const user = await createUser(newUserName, roles)
      userLinkDialogOpen(user)
      setUserLinkTriggerRefresh(true)
    } catch (error) {
      setErrorMessage(error.message)
    }

    setLoading(false)
  }

  function newUserDialogNameChange (e) {
    if (e.target.value.length <= 0 || e.target.value.length > 50) {
      setNewUserNameBadLength(true)
      setNewUserNameExists(false)
      setNewUserNameInvalid(false)
    } else if (usernames.includes(e.target.value)) {
      setNewUserNameBadLength(false)
      setNewUserNameExists(true)
      setNewUserNameInvalid(false)
    } else if (!/^((?![":{}?= ])[\x20-\x7F])+$/.test(e.target.value)) {
      setNewUserNameBadLength(false)
      setNewUserNameExists(false)
      setNewUserNameInvalid(true)
    } else {
      setNewUserNameBadLength(false)
      setNewUserNameExists(false)
      setNewUserNameInvalid(false)
      setNewUserName(e.target.value)
    }
  }

  function newUserDialogRolesChange (e) {
    setNewUserRoles({
      ...newUserRoles,
      [e.target.name]: e.target.checked
    })
  }

  function editUserDialogOpen (user) {
    setEditUser(user)
    setEditUserDialogOpen(true)
    setEditUserState(user.state)
    setEditUserRoles({ admin: user.roles.includes('ADMIN'), fixturesSec: user.roles.includes('FIXTURES_SECRETARY'), resultsEntry: user.roles.includes('RESULTS_ENTRY') })
  }

  function editUserDialogClose () {
    setEditUserDialogOpen(false)
  }

  function toggleEditUserState () {
    if (editUserState === States.ACTIVE) {
      setEditUserState(States.SUSPENDED)
    } else if (editUserState === States.SUSPENDED) {
      setEditUserState(States.ACTIVE)
    }
  }

  function editUserDialogRolesChange (e) {
    setEditUserRoles({
      ...editUserRoles,
      [e.target.name]: e.target.checked
    })
  }

  async function editUserAction () {
    setLoading(true)
    setEditUserDialogOpen(false)

    const roles = [Roles.VIEWER]
    editUserRoles.admin && roles.push(Roles.ADMIN)
    editUserRoles.fixturesSec && roles.push(Roles.FIXTURES_SECRETARY)
    editUserRoles.resultsEntry && roles.push(Roles.RESULTS_ENTRY)

    try {
      await updateUser(editUserUser.id, editUserState, roles)
      setLoading(false)
      navigate('.', { replace: true })
    } catch (error) {
      setErrorMessage(error.message)
      setLoading(false)
    }
  }

  function deleteUserDialogOpen (user) {
    setDeleteUser(user)
    setDeleteUserDialogOpen(true)
  }

  function deleteUserDialogClose () {
    setDeleteUserDialogOpen(false)
  }

  async function deleteUserAction () {
    setLoading(true)
    setDeleteUserDialogOpen(false)

    try {
      await deleteUser(deleteUserUser.id)
      setLoading(false)
      navigate('.', { replace: true })
    } catch (error) {
      setErrorMessage(error.message)
      setLoading(false)
    }
  }

  async function userLinkCopy () {
    const activationInfo = `Username:\n${userLinkUser ? userLinkUser.username : ''}\nActivation Link:\n${userLinkUser ? `${window.location.href.replace('/users', '/account/')}${userLinkUser.linkID}` : ''}`
    await navigator.clipboard.writeText(activationInfo)

    // TODO - this success message causes a redraw, which causes the loader to fire again and load the new user.
    // When we then close the dialog, we load again
    // setSuccessMessage('Info copied')
  }

  function userLinkDialogOpen (user) {
    setUserLinkUser(user)
    setUserLinkDialogOpen(true)
  }

  function userLinkDialogClose () {
    setUserLinkDialogOpen(false)
    if (userLinkTriggerRefresh) {
      setUserLinkTriggerRefresh(false)
      navigate('.', { replace: true })
    }
  }

  function resetUserDialogOpen (user) {
    setResetUser(user)
    setResetUserDialogOpen(true)
  }

  function resetUserDialogClose () {
    setResetUserDialogOpen(false)
  }

  async function resetUserAction () {
    setLoading(true)
    setResetUserDialogOpen(false)

    try {
      const user = await resetUser(resetUserUser.id)
      userLinkDialogOpen(user)
      setUserLinkTriggerRefresh(true)
    } catch (error) {
      setErrorMessage(error.message)
    }

    setLoading(false)
  }

  const NewUserDialog = (
    <Dialog open={newUserOpen} onClose={newUserDialogClose} aria-labelledby='add new user'>
      <DialogTitle id='add-user-dialog-title' className='dialog-top'>New User</DialogTitle>
      <DialogContent>
        <br/>
        <DialogContentText>User</DialogContentText>
        {
          newUserNameExists
          ?
          <TextField error helperText='user already exists' margin='dense' id='add-competition-name' onChange={newUserDialogNameChange} label='username' type='text' fullWidth/>
          :
            newUserNameInvalid
            ?
            <TextField error helperText='invalid username' margin='dense' id='add-competition-name' onChange={newUserDialogNameChange} label='username' type='text' fullWidth/>
            :
            <TextField autoFocus helperText='&nbsp;' margin='dense' id='add-competition-name' onChange={newUserDialogNameChange} label='username' type='text' fullWidth/>
        }
        <DialogContentText>Roles</DialogContentText>
        <FormGroup>
          <FormControlLabel control={<Checkbox onChange={newUserDialogRolesChange} name='admin' />} label='Admin' />
          <FormControlLabel control={<Checkbox onChange={newUserDialogRolesChange} name='fixturesSec' />} label='Fixtures secretary' />
          <FormControlLabel control={<Checkbox onChange={newUserDialogRolesChange} name='resultsEntry' />} label='Results entry' />
          <FormControlLabel disabled control={<Checkbox defaultChecked />} label='Viewer' />
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={newUserDialogClose} variant='outlined' color='primary'>Cancel</Button>
        {
          newUserNameBadLength || newUserNameExists || newUserNameInvalid
          ?
          <Button disabled variant='contained' color='primary'>Create</Button>
          :
          <Button onClick={newUserAction} variant='contained' color='primary'>Create</Button>
        }
      </DialogActions>
    </Dialog>
  )

  const DeleteUserDialog = (
    <Dialog open={deleteUserOpen} onClose={deleteUserDialogClose} aria-labelledby='delete user'>
      <DialogTitle id='add-user-dialog-title' className='dialog-top'>Delete User</DialogTitle>
      <DialogContent>
        <DialogContentText>Are you sure you want to delete user "{ deleteUserUser ? deleteUserUser.username : ''}"?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={deleteUserDialogClose} variant='outlined' color='primary'>Cancel</Button>
        <Button onClick={deleteUserAction} variant='contained' color='primary'>Delete</Button>
      </DialogActions>
    </Dialog>
  )

  const EditUserDialog = (
    <Dialog open={editUserOpen} onClose={editUserDialogClose} aria-labelledby='delete user'>
      <DialogTitle id='add-user-dialog-title' className='dialog-top'>Edit User</DialogTitle>
      <DialogContent>
        <br/>
        <DialogContentText>Username</DialogContentText>
        <Box sx={{padding: '10px 0px'}}>
          <TextField id='edit-username' disabled={true} name='edit-username' sx={{ width: '35ch' }} value={editUserUser ? editUserUser.username : ''} variant='outlined' />
        </Box>
        <DialogContentText>State</DialogContentText>
        <Box sx={{padding: '10px 0px'}}>
          <Switch onClick={toggleEditUserState} disabled={editUserState === 'pending'} defaultChecked={editUserState === 'active'} ></Switch>
          <Typography variant='body2' component='span' className={editUserState === 'active' ? 'green' : editUserState === 'suspended' ? 'orange' : 'blue' }>{editUserState}</Typography>
        </Box>
        <DialogContentText>Roles</DialogContentText>
        <FormGroup>
          <FormControlLabel control={<Checkbox onChange={editUserDialogRolesChange} defaultChecked={editUserRoles.admin} name='admin' />} label='Admin' />
          <FormControlLabel control={<Checkbox onChange={editUserDialogRolesChange} defaultChecked={editUserRoles.fixturesSec} name='fixturesSec' />} label='Fixtures secretary' />
          <FormControlLabel control={<Checkbox onChange={editUserDialogRolesChange} defaultChecked={editUserRoles.resultsEntry} name='resultsEntry' />} label='Results entry' />
          <FormControlLabel disabled control={<Checkbox defaultChecked />} label='Viewer' />
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={editUserDialogClose} variant='outlined' color='primary'>Cancel</Button>
        <Button onClick={editUserAction} variant='contained' color='primary'>Update</Button>
      </DialogActions>
    </Dialog>
  )

  const UserLinkDialog = (<Dialog open={userLinkOpen} onClose={userLinkDialogClose} aria-labelledby='user link'>
    <DialogTitle id='user-link-dialog-title' className='dialog-top'>User Activation Link</DialogTitle>
    <DialogContent>
      <Box sx={{padding: '10px 0px'}}>
        <Typography variant='body1' >Copy the information below and send it to the new user.  They can then<br/>activate their account and set their own password</Typography>
      </Box>
      <Box className='data-box' >
        <Box sx={{padding: '10px'}}>
          <Typography variant='body1' >Username:</Typography>
          <Typography variant='body2' >{userLinkUser ? userLinkUser.username : ''}</Typography>
        </Box>
        <Box sx={{padding: '10px'}}>
          <Typography variant='body1' >Activation Link:</Typography>
          <Typography variant='body2' >{userLinkUser ? `${window.location.href.replace('/users', '/account/')}${userLinkUser.linkID}` : ''}</Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'left', alignItems: 'center', padding: '10px 0px 0px 0px'}}>
        <Button aria-label='Copy' variant='outlined' startIcon={<ContentCopyRoundedIcon />} onClick={userLinkCopy}>Copy Info</Button>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={userLinkDialogClose} variant='contained' color='primary'>Close</Button>
    </DialogActions>
  </Dialog>
  )

  const ResetUserDialog = (
    <Dialog open={resetUserOpen} onClose={resetUserDialogClose} aria-labelledby='reset user'>
      <DialogTitle id='reset-user-dialog-title' className='dialog-top'>Reset User</DialogTitle>
      <DialogContent>
        <br/>
        <DialogContentText>Username</DialogContentText>
        <Box sx={{padding: '10px 0px'}}>
          <TextField id='reset-username' disabled={true} name='reset-username' sx={{ width: '35ch' }} value={resetUserUser ? resetUserUser.username : ''} variant='outlined' />
        </Box>
        <Box sx={{padding: '10px 0px'}}>
          <Typography variant='body1' >This will reset the user's password and generate a new activation link.<br />
                                       Once you have sent them their new link, they will be able to set a new<br />
                                       password for their account<br /><br />
                                       Are you sure you want to reset the account?</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={resetUserDialogClose} variant='outlined' color='primary'>Cancel</Button>
        <Button onClick={resetUserAction} variant='contained' color='primary'>Reset</Button>
      </DialogActions>
    </Dialog>
  )

  let ui = ( <InsufficientRoles /> )
  if (Roles.roleCheck(userInfo.roles,[Roles.ADMIN])) {
    ui = (
      <Box padding='5px' sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box padding='10px 10px 5px 10px'>
          <Box sx={{ display: 'flex' }}>
            <Link to={`/`}>
              <IconButton size='small' aria-label='refresh list' sx={{ marginRight: '10px' }}  color='inherit'>
                <HomeRoundedIcon color='action' />
              </IconButton>
            </Link>
            <Typography sx={{ flexGrow: '1', marginBottom: '3px' }} variant='h5' textAlign='left' gutterBottom>Users</Typography>
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
          <Button aria-label='New user' variant='outlined' startIcon={<PersonAddAltRoundedIcon />} onClick={newUserDialogOpen}>New User</Button>
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
                        <IconButton size='small' edge='start' color='inherit' aria-label='menu' sx={{ marginLeft: '4px', mr: 2 }} onClick={() => { userLinkDialogOpen(user) }} >
                          <LinkRoundedIcon />
                        </IconButton>
                        :
                        null
                      }
                    </TableCell>
                    <TableCell align='center'>{user.roles.join(', ')}</TableCell>
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
                            <IconButton size='small' edge='start' color='inherit' aria-label='menu' sx={{ mr: 2 }} onClick={() => { resetUserDialogOpen(user) }} >
                              <LockResetRoundedIcon />
                            </IconButton>
                          }
                          <IconButton size='small' edge='start' color='inherit' aria-label='menu' sx={{ mr: 2 }} onClick={() => { editUserDialogOpen(user) }} >
                            <EditRoundedIcon />
                          </IconButton>
                          <IconButton size='small' edge='start' color='inherit' aria-label='menu' sx={{ mr: 2 }} onClick={() => { deleteUserDialogOpen(user) }} >
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
        { newUserOpen ? NewUserDialog : null }
        { deleteUserOpen ? DeleteUserDialog : null }
        { editUserOpen ? EditUserDialog : null }
        { userLinkOpen ? UserLinkDialog : null }
        { resetUserOpen ? ResetUserDialog : null }
      </Box>
    )
  }
  return ui
}

