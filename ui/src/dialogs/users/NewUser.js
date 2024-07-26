import React, { useState } from 'react'
import { Link, redirect, useLoaderData, useNavigate, useRouteLoaderData } from 'react-router-dom'

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

import { States, createUser, deleteUser, getUsers, resetUser, updateUser } from '../../apis/uidataAPI'
import Roles, { InsufficientRoles } from '../../components/Roles'

export default function NewUser ({ setLoading, apps, closeDialog, usernames, openUserLink, setUserLinkTriggerRefresh, setSuccessMessage, setErrorMessage }) {
  const [newUserNameBadLength, setNewUserNameBadLength] = useState(true)
  const [newUserNameExists, setNewUserNameExists] = useState(false)
  const [newUserNameInvalid, setNewUserNameInvalid] = useState(false)
  const [newUserName, setNewUserName] = useState(null)
  const [newUserApp, setNewUserApp] = useState('VBC')
  const [newUserRoles, setNewUserRoles] = useState({})

  async function newUserAction () {
    setLoading(true)
    closeDialog()
    setNewUserNameExists(false)
    let roles = []
    if (newUserApp === 'VBC') {
      roles.push(Roles.VIEWER)
    }
    roles = roles.concat(Object.keys(newUserRoles))

    try {
      const user = await createUser(newUserName, roles, newUserApp)
      setNewUserName(null)
      openUserLink(user)
      setUserLinkTriggerRefresh(true)
    } catch (error) {
      setNewUserName(null)
      setErrorMessage(error.message)
    }

    setLoading(false)
  }

  function newUserNameChange (e) {
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

  function newUserRolesChange (e) {
    setNewUserRoles({
      ...newUserRoles,
      [e.target.name]: e.target.checked
    })
  }

  function changeApp (e) {
    setNewUserApp(e.target.value)
    setNewUserRoles({})
  }

  return (
    <Dialog open={true} onClose={closeDialog} aria-labelledby='add new user'>
      <DialogTitle id='add-user-dialog-title' className='dialog-top'>New User</DialogTitle>
      <DialogContent>
        <br/>
        <DialogContentText>User</DialogContentText>
        {
          newUserNameExists
          ?
          <TextField error helperText='user already exists' margin='dense' id='add-competition-name' onChange={newUserNameChange} label='username' type='text' fullWidth/>
          :
            newUserNameInvalid
            ?
            <TextField error helperText='invalid username' margin='dense' id='add-competition-name' onChange={newUserNameChange} label='username' type='text' fullWidth/>
            :
            <TextField autoFocus helperText='&nbsp;' margin='dense' id='add-competition-name' onChange={newUserNameChange} label='username' type='text' fullWidth/>
        }
        {
          apps.length > 0
          ?
          <>
            <DialogContentText>App</DialogContentText>
            <FormControl>
              <Select labelId="select-app" id="select-app" value={newUserApp} label="App" onChange={changeApp} >
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
        <DialogContentText>Roles</DialogContentText>
        {
          newUserApp === 'VBC'
          ?
          <>
          <FormGroup>
            <FormControlLabel control={<Checkbox onChange={newUserRolesChange} name='ADMIN' />} label='ADMIN' />
            <FormControlLabel control={<Checkbox onChange={newUserRolesChange} name='FIXTURES_SECRETARY' />} label='FIXTURES_SECRETARY' />
            <FormControlLabel control={<Checkbox onChange={newUserRolesChange} name='RESULTS_ENTRY' />} label='RESULTS_ENTRY' />
            <FormControlLabel disabled control={<Checkbox defaultChecked />} label='VIEWER' />
          </FormGroup>
          </>
          :
          <FormGroup>
            {
              apps.find(el => el.name === newUserApp).roles.map(role => <FormControlLabel control={<Checkbox onChange={newUserRolesChange} name={role} />} label={role} />)
            }
          </FormGroup>
        }

      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} variant='outlined' color='primary'>Cancel</Button>
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
}

