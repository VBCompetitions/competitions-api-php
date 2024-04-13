import React, { useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import Divider from '@mui/material/Divider'
import DriveFileRenameOutlineRoundedIcon from '@mui/icons-material/DriveFileRenameOutlineRounded'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import LinearProgress from '@mui/material/LinearProgress'
import OutlinedInput from '@mui/material/OutlinedInput'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import VisibilityRounded from '@mui/icons-material/VisibilityRounded'
import VisibilityOffRounded from '@mui/icons-material/VisibilityOffRounded'
import { Link, redirect, useLoaderData, useRouteLoaderData } from 'react-router-dom'

import { createKey, deleteKey, getKeys, updateAccount,updateKey } from './apis/uidataAPI'

export async function accountLoader() {
  try {
    const apiKeys = await getKeys()
    return { apiKeys }
  } catch (err) {
    if (err.status === 401) {
      return redirect('/login?returnTo=/c')
    }
    throw err
  }
}

export default function Account ({ username: usernameFromRoot,  setSuccessMessage, setErrorMessage, setUsername: setRootUsername }) {
  const accountInfo = useLoaderData()
  const userInfo = useRouteLoaderData('root')

  const [showPassword, setShowPassword] = useState(false)
  const [showRePassword, setShowRePassword] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [accountUsername, setAccountUsername] = useState(usernameFromRoot && usernameFromRoot !== '' ? usernameFromRoot : userInfo.username)
  const [accountUsernameInvalid, setAccountUsernameInvalid] = useState(false)
  const [accountPassword, setAccountPassword] = useState('')
  const [accountPasswordInvalid, setAccountPasswordInvalid] = useState(false)
  const [accountRePassword, setAccountRePassword] = useState('')
  const [createKeyOpen, setCreateKeyDialogOpen] = useState(false)
  const [createKeyDescription, setCreateKeyDescription] = useState('')
  const [createKeyDescriptionInvalid, setCreateKeyDescriptionInvalid] = useState(false)
  const [newAPIKey, setNewAPIKey] = useState()
  const [newKeyOpen, setNewKeyDialogOpen] = useState(false)
  const [updateKeyOpen, setUpdateKeyDialogOpen] = useState(false)
  const [updateKeyDescription, setUpdateKeyDescription] = useState('')
  const [updateKeyDescriptionInvalid, setUpdateKeyDescriptionInvalid] = useState(false)
  const [updateKeyID, setUpdateKeyID] = useState('')
  const [deleteKeyOpen, setDeleteKeyDialogOpen] = useState(false)
  const [deleteKeyID, setDeleteKeyID] = useState('')

  const accountUsernameButtonDisabled = accountUsernameInvalid || accountUsername === usernameFromRoot || usernameFromRoot === 'admin' || accountUsername.length < 1 || accountUsername.length > 50
  const accountPasswordButtonDisabled = accountPasswordInvalid || accountPassword.length < 10 || accountPassword.length > 100 || accountRePassword !== accountPassword

  let deleteKeyDescription = 'unknown'
  const foundDeleteKey = accountInfo.apiKeys.find(el => el.keyID === deleteKeyID)
  if (typeof foundDeleteKey === 'object') {
    deleteKeyDescription = foundDeleteKey.description
  }

  let currentUpdateKeyDescription = ''
  const foundUpdateKey = accountInfo.apiKeys.find(el => el.keyID === updateKeyID)
  if (typeof foundUpdateKey === 'object') {
    currentUpdateKeyDescription = foundUpdateKey.description
  }

  function handleClickShowPassword () { setShowPassword(show => !show) }
  function handleMouseDownPassword (e) { e.preventDefault() }
  function handleClickShowRePassword () { setShowRePassword(show => !show) }
  function handleMouseDownRePassword (e) { e.preventDefault() }

  function changePasswordChange (e) {
    // The regex only checks the characters and leaves checking the length to other functions, so that the UI doesn't show an "error" while typing in the new password
    if (e.target.value.length > 50 || (e.target.value.length > 0 && !/^[a-zA-Z0-9!"#£$%&'()*+,.:;<=>?@[^_`{|}~/\-\\\]]*$/.test(e.target.value))) {
      setAccountPasswordInvalid(true)
      setAccountPassword(e.target.value)
    } else {
      setAccountPasswordInvalid(false)
      setAccountPassword(e.target.value)
    }
  }

  function changeRePasswordChange (e) {
    setAccountRePassword(e.target.value)
  }

  async function changePasswordAction () {
    try {
      setUpdating(true)
      setAccountPassword('')
      setAccountRePassword('')
      await updateAccount(undefined, accountPassword)
      setUpdating(false)
      setSuccessMessage('Password updated')
    } catch (error) {
      setUpdating(false)
      setErrorMessage(error.message)
    }
  }

  function changeUsernameChange (e) {
    if (e.target.value.length <= 0 || e.target.value.length > 50 || !/^((?![":{}?= ])[\x20-\x7F])+$/.test(e.target.value)) {
      setAccountUsernameInvalid(true)
      setAccountUsername(e.target.value)
    } else {
      setAccountUsernameInvalid(false)
      setAccountUsername(e.target.value)
    }
  }

  async function changeUsernameAction () {
    try {
      setUpdating(true)
      await updateAccount(accountUsername)
      setRootUsername(accountUsername)
      setUpdating(false)
      setSuccessMessage('Username updated')
    } catch (error) {
      setUpdating(false)
      setErrorMessage(error.message)
    }
  }

  function createKeyDialogOpen () {
    setCreateKeyDialogOpen(true)
  }

  function createKeyDialogClose () {
    setCreateKeyDialogOpen(false)
  }

  function createKeyDescriptionChange (e) {
    if (e.target.value.length > 1000 || !/^[a-zA-Z0-9!"#£$%&'()*+,.:;<=>?@[^_`{|}~ /\-\\\]]*$/.test(e.target.value)) {
      setCreateKeyDescriptionInvalid(true)
    } else {
      setCreateKeyDescriptionInvalid(false)
      setCreateKeyDescription(e.target.value)
    }
  }

  async function createKeyAction () {
    try {
      setUpdating(true)
      createKeyDialogClose()
      const newKey = await createKey(createKeyDescription)
      setNewAPIKey(newKey.key)
      newKeyDialogOpen()
      setUpdating(false)
      setSuccessMessage('API Key created')
    } catch (error) {
      setUpdating(false)
      setErrorMessage(error.message)
    }
  }

  function newKeyDialogOpen () {
    setNewKeyDialogOpen(true)
  }

  function newKeyDialogClose () {
    setNewKeyDialogOpen(false)
  }

  async function newKeyCopy () {
    await navigator.clipboard.writeText(newAPIKey)
  }

  function updateKeyDialogOpen (keyID) {
    setUpdateKeyID(keyID)
    setUpdateKeyDialogOpen(true)
  }

  function updateKeyDialogClose () {
    setUpdateKeyDialogOpen(false)
  }

  function updateKeyDescriptionChange (e) {
    if (e.target.value.length > 1000 || !/^[a-zA-Z0-9!"#£$%&'()*+,.:;<=>?@[^_`{|}~ /\-\\\]]*$/.test(e.target.value)) {
      setUpdateKeyDescriptionInvalid(true)
    } else {
      setUpdateKeyDescriptionInvalid(false)
      setUpdateKeyDescription(e.target.value)
    }
  }

  async function updateKeyAction () {
    try {
      setUpdating(true)
      updateKeyDialogClose()
      await updateKey(updateKeyID, updateKeyDescription)
      setUpdating(false)
      setSuccessMessage('API Key updated')
    } catch (error) {
      setUpdating(false)
      setErrorMessage(error.message)
    }
  }

  function deleteKeyDialogOpen (keyID) {
    setDeleteKeyID(keyID)
    setDeleteKeyDialogOpen(true)
  }

  function deleteKeyDialogClose () {
    setDeleteKeyDialogOpen(false)
  }

  async function deleteKeyAction () {
    try {
      setUpdating(true)
      deleteKeyDialogClose()
      await deleteKey(deleteKeyID)
      setUpdating(false)
      setSuccessMessage('API Key deleted')
    } catch (error) {
      setUpdating(false)
      setErrorMessage(error.message)
    }
  }

  const CreateKeyDialog = (<Dialog open={createKeyOpen} onClose={createKeyDialogClose} aria-labelledby="create new api key">
    <DialogTitle id="create-key-dialog-title">New API Key</DialogTitle>
    <DialogContent>
      <DialogContentText>Enter a description for the new API Key</DialogContentText>
      <TextField autoFocus fullWidth error={createKeyDescriptionInvalid} helperText={createKeyDescriptionInvalid ? 'invalid description' : ' ' } margin="dense" id="add-key-description" onChange={createKeyDescriptionChange} label="API Key description" type="text" />
    </DialogContent>
    <DialogActions>
      <Button onClick={createKeyDialogClose} variant="outlined" color="primary">Cancel</Button>
      <Button onClick={createKeyAction} disabled={createKeyDescriptionInvalid || createKeyDescription.length <= 0} variant="contained" color="primary">Create</Button>
    </DialogActions>
  </Dialog>)

  const NewKeyDialog = (<Dialog open={newKeyOpen} onClose={newKeyDialogClose} aria-labelledby='new key'>
    <DialogTitle id='new-key-dialog-title' className='dialog-top'>New API Key</DialogTitle>
    <DialogContent>
      <Box sx={{padding: '10px 0px'}}>
        <Typography variant='body1' >Copy the new key and save it somewhere secure.  Once this window closes you will not be able to get the key again</Typography>
      </Box>
      <Box className='data-box' >
        <Box sx={{padding: '5px 10px'}}>
          <Typography variant='body1' >{newAPIKey}</Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'left', alignItems: 'center', padding: '10px 0px 0px 0px'}}>
        <Button aria-label='Copy' variant='outlined' startIcon={<ContentCopyRoundedIcon />} onClick={newKeyCopy}>Copy Key</Button>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={newKeyDialogClose} variant='contained' color='primary'>Close</Button>
    </DialogActions>
  </Dialog>)

  const UpdateKeyDialog = (<Dialog open={updateKeyOpen} onClose={updateKeyDialogClose} aria-labelledby="update new api key">
    <DialogTitle id="update-key-dialog-title">Update API Key</DialogTitle>
    <DialogContent>
      <DialogContentText>Enter a new description for the API Key</DialogContentText>
      <TextField autoFocus defaultValue={currentUpdateKeyDescription} fullWidth error={updateKeyDescriptionInvalid} helperText={updateKeyDescriptionInvalid ? 'invalid description' : ' ' } margin="dense" id="update-key-description" onChange={updateKeyDescriptionChange} label="API Key description" type="text" />
    </DialogContent>
    <DialogActions>
      <Button onClick={updateKeyDialogClose} variant="outlined" color="primary">Cancel</Button>
      <Button onClick={updateKeyAction} disabled={updateKeyDescriptionInvalid || updateKeyDescription.length <= 0} variant="contained" color="primary">Update</Button>
    </DialogActions>
  </Dialog>)

  const DeleteKeyDialog = (<Dialog open={deleteKeyOpen} onClose={deleteKeyDialogClose} aria-labelledby="delete api key">
    <DialogTitle id="delete-key-dialog-title">Delete API Key</DialogTitle>
    <DialogContent>
      <DialogContentText>
      <Typography variant='body1'>Are you sure you want to delete the key with description:</Typography>
      <Typography variant='body1' sx={{ fontStyle: 'italic' }}>{deleteKeyDescription}</Typography>
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={deleteKeyDialogClose} variant="outlined" color="primary">Cancel</Button>
      <Button onClick={deleteKeyAction} variant="contained" color="primary">Delete</Button>
    </DialogActions>
  </Dialog>)

  return (
    <Box padding='5px' sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box padding='10px 10px 5px 10px'>
        <Box sx={{ display: 'flex' }}>
          <Link to={`/`}>
            <IconButton size="small" aria-label="refresh list" sx={{ marginRight: '10px' }}  color="inherit">
              <HomeRoundedIcon color='action' />
            </IconButton>
          </Link>
          <Typography sx={{ flexGrow: '1', marginBottom: '3px' }} variant='h5' textAlign='left'>Account</Typography>
        </Box>
      </Box>
      <Box padding='10px'>
        {
          updating
          ?
          <LinearProgress />
          :
          <Divider sx={{ borderBottomWidth: 4, borderColor: '#1976d2' }} />
        }
      </Box>
      <Box padding="10px 30px">
        <Box className='data-box'>
          <Box className='data-box-header'>
            <Typography sx={{ flexGrow: '1', marginBottom: '3px' }} variant='h5' textAlign='left'>User profile</Typography>
          </Box>
          <Box>
            <Box className='data-box-section'>
              <Box className='data-box-object'>
                {
                  usernameFromRoot === 'admin'
                  ?
                  <TextField id='username' name='username' sx={{ width: '35ch' }} disabled={true} onChange={changeUsernameChange} label='Username' defaultValue={accountUsername} variant='outlined' />
                  :
                    accountUsernameInvalid
                    ?
                    <TextField error helperText='invalid username' id='username' name='username' sx={{ marginTop: '20px', width: '35ch' }} onChange={changeUsernameChange} label='Username' variant='outlined' />
                    :
                    <TextField helperText=' ' id='username' name='username' sx={{ marginTop: '20px', width: '35ch' }} onChange={changeUsernameChange} label='Username' defaultValue={accountUsername} variant='outlined' />
                }
              </Box>
              <Box className='data-box-buttons'>
                <Button aria-label='New username' disabled={accountUsernameButtonDisabled} variant='outlined' onClick={changeUsernameAction}>change Username</Button>
              </Box>
            </Box>
            <Box className='data-box-section'>
              <Box className='data-box-object'>
                <FormControl sx={{ marginTop: '20px', width: '35ch' }} variant='outlined'>
                  <InputLabel error={accountPasswordInvalid} htmlFor='outlined-adornment-new-password'>New password</InputLabel>
                  <OutlinedInput
                    id='password'
                    name='password'
                    type={showPassword ? 'text' : 'password'}
                    label='New Password'
                    error={accountPasswordInvalid}
                    onChange={changePasswordChange}
                    value={accountPassword}
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton
                          aria-label='toggle password visibility'
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge='end'
                          color={accountPasswordInvalid ? 'error' : ''}
                        >
                          {showPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                  <FormHelperText error={accountPasswordInvalid} id="new-password-helper-text">{accountPasswordInvalid ? 'invalid password' : accountPassword.length < 10 ? 'must be at least 10 characters long' : ' '}</FormHelperText>
                </FormControl>
                <FormControl sx={{ marginTop: '20px', width: '35ch' }} variant='outlined'>
                  <InputLabel htmlFor='outlined-adornment-new-password'>Retype password</InputLabel>
                  <OutlinedInput
                    id='repassword'
                    name='repassword'
                    type={showRePassword ? 'text' : 'password'}
                    label='Retype Password'
                    onChange={changeRePasswordChange}
                    value={accountRePassword}
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton
                          aria-label='toggle repassword visibility'
                          onClick={handleClickShowRePassword}
                          onMouseDown={handleMouseDownRePassword}
                          edge='end'
                        >
                          {showRePassword ? <VisibilityOffRounded /> : <VisibilityRounded />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                  <FormHelperText id="new-repassword-helper-text">{accountRePassword === accountPassword ? ' ' : 'password does not match'}</FormHelperText>
                </FormControl>
              </Box>
              <Box className='data-box-buttons'>
                <Button aria-label='New password' disabled={accountPasswordButtonDisabled} variant='outlined' onClick={changePasswordAction}>Update Password</Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box padding="10px 30px">
        <Box className='data-box'>
          <Box className='data-box-header'>
            <Typography sx={{ flexGrow: '1', marginBottom: '3px' }} variant='h5' textAlign='left'>API Keys</Typography>
          </Box>
          <Box>
            <Box className='data-box-section'>
              <Box className='data-box-object'>
                <Typography sx={{ marginBottom: '3px' }} variant='body2' textAlign='left'>API Keys can be used to call the Competitions API directly</Typography>
              </Box>
              <Box className='data-box-buttons'>
                <Button aria-label='New API Key' variant='outlined' onClick={createKeyDialogOpen}>Create New Key</Button>
              </Box>
            </Box>
            {
              accountInfo.apiKeys.map(apiKey => (
                <Box key={apiKey.keyID} className='data-box-section'>
                  <Box className='data-box-object'>
                    <Typography sx={{ marginBottom: '3px' }} variant='subtitle1' textAlign='left'>{apiKey.description}</Typography>
                    <Typography sx={{ marginBottom: '3px', fontStyle: 'italic' }} variant='body2' textAlign='left'>created: {apiKey.created}</Typography>
                    <Typography sx={{ marginBottom: '3px', fontStyle: 'italic' }} variant='body2' textAlign='left'>last used: {apiKey.lastUsed === '' ? 'never' : apiKey.lastUsed}</Typography>
                  </Box>
                  <Box className='data-box-buttons'>
                  <IconButton size="large" onClick={() => {updateKeyDialogOpen(apiKey.keyID)}} aria-label="refresh list" sx={{ marginRight: '10px' }}  color="inherit">
                    <DriveFileRenameOutlineRoundedIcon color='action' />
                  </IconButton>
                  <IconButton size="large" onClick={() => {deleteKeyDialogOpen(apiKey.keyID)}} aria-label="refresh list" sx={{ marginRight: '10px' }}  color="inherit">
                    <DeleteRoundedIcon color='action' />
                  </IconButton>
                  </Box>
                </Box>
              ))
            }
          </Box>
        </Box>
      </Box>
      {createKeyOpen ? CreateKeyDialog : null}
      {newKeyOpen ? NewKeyDialog : null}
      {updateKeyOpen ? UpdateKeyDialog : null}
      {deleteKeyOpen ? DeleteKeyDialog : null}
    </Box>
  )
}
