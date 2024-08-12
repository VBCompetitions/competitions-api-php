import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import FormGroup from '@mui/material/FormGroup'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'

import { States, updateUser } from '../../../apis/uidataAPI'
import Roles from '../../components/Roles'

export default function EditUser ({ user, apps, closeDialog, setLoading, setSuccessMessage, setErrorMessage }) {
  const navigate = useNavigate()

  const [userState, setUserState] = useState(user.state === 'active' ? States.ACTIVE : States.SUSPENDED)
  const [app, setApp] = useState(user.app ? user.app : 'VBC')
  let defaultRoles
  if (app === 'VBC') {
    defaultRoles = {
      ADMIN: user.roles.includes('ADMIN'),
      RESULTS_ENTRY: user.roles.includes('RESULTS_ENTRY'),
      FIXTURES_SECRETARY: user.roles.includes('FIXTURES_SECRETARY'),
    }
  } else {
    defaultRoles = {}
    apps.find(el => el.name === app).roles.forEach(role => {
      defaultRoles[role] = user.roles.includes(role)
    })
  }
  const [roles, setRoles] = useState(defaultRoles)

  async function editUserAction () {
    setLoading(true)
    closeDialog()
    let newUserRoles = []
    if (app === 'VBC') {
      newUserRoles.push(Roles.VIEWER)
    }
    newUserRoles = newUserRoles.concat(Object.keys(roles).filter(role => roles[role]))

    try {
      await updateUser(user.id, userState, newUserRoles, app)
      setLoading(false)
      setSuccessMessage('User updated')
      navigate('.', { replace: true })
    } catch (error) {
      setErrorMessage(error.message)
      setLoading(false)
    }
  }

  function changeRoles (e) {
    setRoles({
      ...roles,
      [e.target.name]: e.target.checked
    })
  }

  function changeApp (e) {
    setApp(e.target.value)
    setRoles({})
  }

  function toggleState () {
    if (userState === States.ACTIVE) {
      setUserState(States.SUSPENDED)
    } else if (userState === States.SUSPENDED) {
      setUserState(States.ACTIVE)
    }
  }

  return (
    <Dialog open={true} onClose={closeDialog} aria-labelledby='edit user'>
      <DialogTitle id='edit-user-dialog-title' className='dialog-top'>Edit User</DialogTitle>
      <DialogContent>
        <br/>
        <DialogContentText>User</DialogContentText>
        <Box sx={{padding: '10px 0px'}}>
          <TextField id='edit-username' disabled={true} name='edit-username' sx={{ width: '35ch' }} value={user ? user.username : ''} variant='outlined' />
        </Box>
        <DialogContentText>State</DialogContentText>
        <Box sx={{padding: '10px 0px'}}>
          <Switch onClick={toggleState} disabled={userState === 'pending'} defaultChecked={userState === 'active'} ></Switch>
          <Typography variant='body2' component='span' className={userState === 'active' ? 'green' : userState === 'suspended' ? 'orange' : 'blue' }>{userState}</Typography>
        </Box>
        <DialogContentText>Roles</DialogContentText>
        {
          apps.length > 0
          ?
          <>
            <DialogContentText>App</DialogContentText>
            <FormControl>
              <Select labelId="select-app" id="select-app" value={app} label="App" onChange={changeApp} >
                <MenuItem value='VBC'>VBC</MenuItem>
                {
                  apps.map(app => <MenuItem value={app.name}>{app.name}</MenuItem>)
                }
              </Select>
            </FormControl>
            <br/><br/>
          </>
          :
          null
        }
        {
          app === 'VBC'
          ?
          <>
          <FormGroup>
            <FormControlLabel control={<Checkbox defaultChecked={user.roles.includes('ADMIN')} onChange={changeRoles} name='ADMIN' />} label='ADMIN' />
            <FormControlLabel control={<Checkbox defaultChecked={user.roles.includes('FIXTURES_SECRETARY')} onChange={changeRoles} name='FIXTURES_SECRETARY' />} label='FIXTURES_SECRETARY' />
            <FormControlLabel control={<Checkbox defaultChecked={user.roles.includes('RESULTS_ENTRY')} onChange={changeRoles} name='RESULTS_ENTRY' />} label='RESULTS_ENTRY' />
            <FormControlLabel disabled control={<Checkbox defaultChecked={true} />} label='VIEWER' />
          </FormGroup>
          </>
          :
          <FormGroup>
            {
              apps.find(el => el.name === app).roles.map(role => <FormControlLabel control={<Checkbox defaultChecked={user.roles.includes(role)} onChange={changeRoles} name={role} />} label={role} />)
            }
          </FormGroup>
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} variant='outlined' color='primary'>Cancel</Button>
        <Button onClick={editUserAction} variant='contained' color='primary'>Update</Button>
      </DialogActions>
    </Dialog>
  )
}

