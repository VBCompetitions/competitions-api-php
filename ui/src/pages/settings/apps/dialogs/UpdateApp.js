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

import { updateApp } from '../../../../apis/uidataAPI'

export default function UpdateApp ({ app, apps, setLoading, closeDialog, setSuccessMessage, setErrorMessage }) {
  const navigate = useNavigate()

  const [updateAppName, setUpdateAppName] = useState(app.name)
  const [updateAppNameBadLength, setUpdateAppNameBadLength] = useState(false)
  const [updateAppNameExists, setUpdateAppNameExists] = useState(false)
  const [updateAppNameInvalid, setUpdateAppNameInvalid] = useState(false)

  const [updateAppRootPath, setUpdateAppRootPath] = useState(app.rootPath)
  const [updateAppRootPathBadLength, setUpdateAppRootPathBadLength] = useState(false)
  const [updateAppRootPathInvalid, setUpdateAppRootPathInvalid] = useState(false)

  const [updateAppRoles, setUpdateAppRoles] = useState(app.roles)
  const [updateAppRolesInvalid, setUpdateAppRolesInvalid] = useState(app.roles.map(el => false))


  function updateAppNameChange (e) {
    if (e.target.value.length <= 0 || e.target.value.length > 1000) {
      setUpdateAppNameBadLength(true)
      setUpdateAppNameExists(false)
      setUpdateAppNameInvalid(false)
    } else if (apps.some(el => el.name !== app.name && el.name === e.target.value)) {
      setUpdateAppNameBadLength(false)
      setUpdateAppNameExists(true)
      setUpdateAppNameInvalid(false)
    } else if (!/^((?![":{}?= ])[\x20-\x7F])+$/.test(e.target.value)) {
      setUpdateAppNameBadLength(false)
      setUpdateAppNameExists(false)
      setUpdateAppNameInvalid(true)
    } else {
      setUpdateAppNameBadLength(false)
      setUpdateAppNameExists(false)
      setUpdateAppNameInvalid(false)
    }
    setUpdateAppName(e.target.value)
    console.log(updateAppNameBadLength)
    console.log(updateAppRootPathBadLength)
    console.log(updateAppRolesInvalid.includes(true))
  }

  function updateAppRootPathChange (e) {
    if (e.target.value.length <= 0 || e.target.value.length > 1000) {
      setUpdateAppRootPathBadLength(true)
      setUpdateAppRootPathInvalid(false)
    } else if (!e.target.value.match(/^\//)) {
      setUpdateAppRootPathBadLength(false)
      setUpdateAppRootPathInvalid(true)
    } else {
      setUpdateAppRootPathBadLength(false)
      setUpdateAppRootPathInvalid(false)
      setUpdateAppRootPath(e.target.value)
    }
  }

  function updateAppRoleChange (i, e) {
    const newRoles = [...updateAppRoles]
    newRoles[i] = e.target.value
    setUpdateAppRoles(newRoles)
    const newRolesInvalid = [...updateAppRolesInvalid]
    newRolesInvalid[i] = (newRoles[i].length === 0)
    setUpdateAppRolesInvalid(newRolesInvalid)
  }

  function updateAppRoleAdd () {
    const newRoles = [...updateAppRoles]
    newRoles.push('')
    setUpdateAppRoles(newRoles)
    const newRolesInvalid = [...updateAppRolesInvalid]
    newRolesInvalid.push(true)
    setUpdateAppRolesInvalid(newRolesInvalid)
  }

  function updateAppRoleDelete (i) {
    const newRoles = [...updateAppRoles]
    newRoles.splice(i, 1)
    setUpdateAppRoles(newRoles)
    const newRolesInvalid = [...updateAppRolesInvalid]
    newRolesInvalid.splice(i, 1)
    setUpdateAppRolesInvalid(newRolesInvalid)
  }

  async function updateAppAction () {
    setLoading(true)
    closeDialog()

    try {
      const updatedApp = await updateApp(app.id, updateAppName, updateAppRootPath, updateAppRoles)
      setSuccessMessage(`App "${updatedApp.name}" updated`)
      navigate('.', { replace: true })
    } catch (error) {
      setErrorMessage(error.message)
      setLoading(false)
    }
  }

  const roleSet = []
  for (let i = 0; i < updateAppRoles.length; i++) {
    roleSet.push((
      <FormControl id={i} margin='dense' variant='outlined' fullWidth>
        <OutlinedInput value={updateAppRoles[i]} id={`add-player-role-${i}`} name={`add-player-role-${i}`} type='text' onChange={e => { updateAppRoleChange(i, e) }}
          endAdornment={
            <InputAdornment position='end'>
              <IconButton aria-label='delete role' onClick={() => { updateAppRoleDelete(i) }} edge='end'>
                <DeleteRoundedIcon />
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>
    ))
  }

  return (
  <Dialog open={true} onClose={closeDialog} aria-labelledby='edit app'>
    <DialogTitle id='edit-app-dialog-title' className='dialog-top'>Edit App</DialogTitle>
    <DialogContent>
      <br/>
      <DialogContentText>Details</DialogContentText>
      {
        updateAppNameExists
        ?
        <TextField error helperText='app name already used' defaultValue={updateAppName} margin='dense' id='edit-app-name' onChange={updateAppNameChange} label='name (required)' type='text' fullWidth/>
        :
          updateAppNameInvalid
          ?
          <TextField error helperText='invalid app name' defaultValue={updateAppName} margin='dense' id='add-app-name' onChange={updateAppNameChange} label='name (required)' type='text' fullWidth/>
          :
          <TextField autoFocus helperText='&nbsp;' defaultValue={updateAppName} margin='dense' id='add-app-name' onChange={updateAppNameChange} label='name (required)' type='text' fullWidth/>
      }
      {
        updateAppRootPathInvalid
        ?
        <TextField error helperText='root path must have leading /' defaultValue={updateAppRootPath} margin='dense' id='add-app-path' onChange={updateAppRootPathChange} label='root path (required)' type='text' fullWidth/>
        :
        <TextField helperText='&nbsp;' defaultValue={updateAppRootPath} margin='dense' id='add-app-path' onChange={updateAppRootPathChange} label='root path (required)' type='text' fullWidth/>
      }
      <DialogContentText>Roles</DialogContentText>
      {
        roleSet
      }
      <Button aria-label='Add Role' variant='outlined' startIcon={<AddRoundedIcon />} onClick={updateAppRoleAdd}>Add Role</Button>
    </DialogContent>
    <DialogActions>
      <Button onClick={closeDialog} variant='outlined' color='primary'>Cancel</Button>
        {
          updateAppNameBadLength || updateAppNameInvalid || updateAppRootPathBadLength || updateAppRootPathInvalid || updateAppRolesInvalid.includes(true)
          ?
          <Button disabled variant='contained' color='primary'>Update</Button>
          :
          <Button onClick={updateAppAction} variant='contained' color='primary'>Update</Button>
        }
    </DialogActions>
  </Dialog>
  )
}
