import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import AddRoundedIcon from '@mui/icons-material/AddRounded'
import Button from '@mui/material/Button'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import OutlinedInput from '@mui/material/OutlinedInput'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'

import { createApp } from '../../apis/uidataAPI'

export default function NewAppDialog ({ apps, setLoading, closeDialog, setSuccessMessage, setErrorMessage }) {
  const navigate = useNavigate()

  const [newAppName, setNewAppName] = useState(null)
  const [newAppNameBadLength, setNewAppNameBadLength] = useState(true)
  const [newAppNameExists, setNewAppNameExists] = useState(false)
  const [newAppNameInvalid, setNewAppNameInvalid] = useState(false)

  const [newAppRootPath, setNewAppRootPath] = useState(null)
  const [newAppRootPathBadLength, setNewAppRootPathBadLength] = useState(true)
  const [newAppRootPathInvalid, setNewAppRootPathInvalid] = useState(false)

  const [newAppRoles, setNewAppRoles] = useState([])
  const [newAppRolesInvalid, setNewAppRolesInvalid] = useState([])

  function newAppNameChange (e) {
    if (e.target.value.length <= 0 || e.target.value.length > 1000) {
      setNewAppNameBadLength(true)
      setNewAppNameExists(false)
      setNewAppNameInvalid(false)
    } else if (apps.find(app => app.name === e.target.value) > -1) {
      setNewAppNameBadLength(false)
      setNewAppNameExists(true)
      setNewAppNameInvalid(false)
    } else if (!/^((?![":{}?= ])[\x20-\x7F])+$/.test(e.target.value)) {
      setNewAppNameBadLength(false)
      setNewAppNameExists(false)
      setNewAppNameInvalid(true)
    } else {
      setNewAppNameBadLength(false)
      setNewAppNameExists(false)
      setNewAppNameInvalid(false)
      setNewAppName(e.target.value)
    }
  }

  function newAppRootPathChange (e) {
    if (e.target.value.length <= 0 || e.target.value.length > 1000) {
      setNewAppRootPathBadLength(true)
      setNewAppRootPathInvalid(false)
    } else if (!e.target.value.match(/^\//)) {
      setNewAppRootPathBadLength(false)
      setNewAppRootPathInvalid(true)
    } else {
      setNewAppRootPathBadLength(false)
      setNewAppRootPathInvalid(false)
      setNewAppRootPath(e.target.value)
    }
  }

  function newAppRoleChange (i, e) {
    const newRoles = [...newAppRoles]
    newRoles[i] = e.target.value
    setNewAppRoles(newRoles)
    const newRolesInvalid = [...newAppRolesInvalid]
    newRolesInvalid[i] = (newRoles[i].length === 0)
    setNewAppRolesInvalid(newRolesInvalid)
  }

  function newAppRoleAdd () {
    const newRoles = [...newAppRoles]
    newRoles.push('')
    setNewAppRoles(newRoles)
    const newRolesInvalid = [...newAppRolesInvalid]
    newRolesInvalid.push(true)
    setNewAppRolesInvalid(newRolesInvalid)
  }

  function newAppRoleDelete (i) {
    const newRoles = [...newAppRoles]
    newRoles.splice(i, 1)
    setNewAppRoles(newRoles)
    const newRolesInvalid = [...newAppRolesInvalid]
    newRolesInvalid.splice(i, 1)
    setNewAppRolesInvalid(newRolesInvalid)
  }

  async function newAppAction () {
    setLoading(true)
    closeDialog(false)

    try {
      const newApp = await createApp(newAppName, newAppRootPath, newAppRoles)
      setSuccessMessage(`New app "${newApp.name}" added`)
      navigate('.', { replace: true })
    } catch (error) {
      setErrorMessage(error.message)
      setLoading(false)
    }
  }

  const roleSet = []
  for (let i = 0; i < newAppRoles.length; i++) {
    roleSet.push((
      <FormControl id={i} margin='dense' variant='outlined' fullWidth>
        <OutlinedInput value={newAppRoles[i]} id={`add-player-role-${i}`} name={`add-player-role-${i}`} type='text' onChange={e => { newAppRoleChange(i, e) }}
          endAdornment={
            <InputAdornment position='end'>
              <IconButton aria-label='delete role' onClick={() => { newAppRoleDelete(i) }} edge='end'>
                <DeleteRoundedIcon />
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>
    ))
  }

  return (
    <Dialog open={true} onClose={closeDialog} aria-labelledby='add new app'>
      <DialogTitle id='add-app-dialog-title' className='dialog-top'>New App</DialogTitle>
      <DialogContent>
        <br/>
        <DialogContentText>Details</DialogContentText>
        {
          newAppNameExists
          ?
          <TextField error helperText='app name already used' margin='dense' id='add-app-name' onChange={newAppNameChange} label='name (required)' type='text' fullWidth/>
          :
            newAppNameInvalid
            ?
            <TextField error helperText='invalid app name' margin='dense' id='add-app-name' onChange={newAppNameChange} label='name (required)' type='text' fullWidth/>
            :
            <TextField autoFocus helperText='&nbsp;' margin='dense' id='add-app-name' onChange={newAppNameChange} label='name (required)' type='text' fullWidth/>
        }
        {
          newAppRootPathInvalid
          ?
          <TextField error helperText='root path must have leading /' margin='dense' id='add-app-path' onChange={newAppRootPathChange} label='root path (required)' type='text' fullWidth/>
          :
          <TextField helperText='&nbsp;' margin='dense' id='add-app-path' onChange={newAppRootPathChange} label='root path (required)' type='text' fullWidth/>
        }
        <DialogContentText>Roles</DialogContentText>
        {
          roleSet
        }
        <Button aria-label='Add Role' variant='outlined' startIcon={<AddRoundedIcon />} onClick={newAppRoleAdd}>Add Role</Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} variant='outlined' color='primary'>Cancel</Button>
        {
          newAppNameBadLength || newAppRootPathBadLength || newAppRolesInvalid.includes(true)
          ?
          <Button disabled variant='contained' color='primary'>Create</Button>
          :
          <Button onClick={newAppAction} variant='contained' color='primary'>Create</Button>
        }
      </DialogActions>
    </Dialog>
  )
}
