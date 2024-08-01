import React, { useState } from 'react'

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
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import { createUser } from '../../apis/uidataAPI'
import Roles from '../../components/Roles'

export default function NewUser ({ setLoading, apps, closeDialog, usernames, openUserLink, setUserLinkTriggerRefresh, setSuccessMessage, setErrorMessage }) {
  const [usernameBadLength, setUsernameBadLength] = useState(true)
  const [usernameExists, setUsernameExists] = useState(false)
  const [usernameInvalid, setUsernameInvalid] = useState(false)
  const [username, setUsername] = useState(null)
  const [app, setApp] = useState('VBC')
  const [roles, setRoles] = useState({})

  async function newUserAction () {
    setLoading(true)
    closeDialog()
    setUsernameExists(false)
    let newUserRoles = []
    if (app === 'VBC') {
      newUserRoles.push(Roles.VIEWER)
    }
    newUserRoles = newUserRoles.concat(Object.keys(roles).filter(role => roles[role]))

    try {
      const user = await createUser(username, newUserRoles, app)
      setUsername(null)
      openUserLink(user)
      setUserLinkTriggerRefresh(true)
    } catch (error) {
      setUsername(null)
      setErrorMessage(error.message)
    }

    setLoading(false)
  }

  function changeName (e) {
    if (e.target.value.length <= 0 || e.target.value.length > 50) {
      setUsernameBadLength(true)
      setUsernameExists(false)
      setUsernameInvalid(false)
    } else if (usernames.includes(e.target.value)) {
      setUsernameBadLength(false)
      setUsernameExists(true)
      setUsernameInvalid(false)
    } else if (!/^((?![":{}?= ])[\x20-\x7F])+$/.test(e.target.value)) {
      setUsernameBadLength(false)
      setUsernameExists(false)
      setUsernameInvalid(true)
    } else {
      setUsernameBadLength(false)
      setUsernameExists(false)
      setUsernameInvalid(false)
      setUsername(e.target.value)
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

  return (
    <Dialog open={true} onClose={closeDialog} aria-labelledby='add new user'>
      <DialogTitle id='add-user-dialog-title' className='dialog-top'>New User</DialogTitle>
      <DialogContent>
        <br/>
        <DialogContentText>User</DialogContentText>
        {
          usernameExists
          ?
          <TextField error helperText='user already exists' margin='dense' id='add-competition-name' onChange={changeName} label='username' type='text' fullWidth/>
          :
            usernameInvalid
            ?
            <TextField error helperText='invalid username' margin='dense' id='add-competition-name' onChange={changeName} label='username' type='text' fullWidth/>
            :
            <TextField autoFocus helperText='&nbsp;' margin='dense' id='add-competition-name' onChange={changeName} label='username' type='text' fullWidth/>
        }
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
            <FormControlLabel control={<Checkbox onChange={changeRoles} name='ADMIN' />} label='ADMIN' />
            <FormControlLabel control={<Checkbox onChange={changeRoles} name='FIXTURES_SECRETARY' />} label='FIXTURES_SECRETARY' />
            <FormControlLabel control={<Checkbox onChange={changeRoles} name='RESULTS_ENTRY' />} label='RESULTS_ENTRY' />
            <FormControlLabel disabled control={<Checkbox defaultChecked />} label='VIEWER' />
          </FormGroup>
          </>
          :
          <FormGroup>
            {
              apps.find(el => el.name === app).roles.map(role => <FormControlLabel control={<Checkbox onChange={changeRoles} name={role} />} label={role} />)
            }
          </FormGroup>
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} variant='outlined' color='primary'>Cancel</Button>
        {
          usernameBadLength || usernameExists || usernameInvalid
          ?
          <Button disabled variant='contained' color='primary'>Create</Button>
          :
          <Button onClick={newUserAction} variant='contained' color='primary'>Create</Button>
        }
      </DialogActions>
    </Dialog>
  )
}

