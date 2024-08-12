import React, { useState } from 'react'
import { Link, redirect, useLoaderData, useRouteLoaderData } from 'react-router-dom'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
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

import { getKeys, updateAccount } from '../../apis/uidataAPI'
import CreateKey from './dialogs/CreateKey'
import DeleteKey from './dialogs/DeleteKey'
import NewKey from './dialogs/NewKey'
import UpdateKey from './dialogs/UpdateKey'

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
  const [loading, setLoading] = useState(false)
  const [accountUsername, setAccountUsername] = useState(usernameFromRoot && usernameFromRoot !== '' ? usernameFromRoot : userInfo.username)
  const [accountUsernameInvalid, setAccountUsernameInvalid] = useState(false)
  const [accountPassword, setAccountPassword] = useState('')
  const [accountPasswordInvalid, setAccountPasswordInvalid] = useState(false)
  const [accountRePassword, setAccountRePassword] = useState('')
  const [createKeyOpen, setCreateKeyOpen] = useState(false)
  const [newAPIKey, setNewAPIKey] = useState()
  const [newKeyOpen, setNewKeyOpen] = useState(false)
  const [updateKeyOpen, setUpdateKeyOpen] = useState(false)

  const [updateKeyID, setUpdateKeyID] = useState('')
  const [deleteKeyOpen, setDeleteKeyOpen] = useState(false)
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
      setLoading(true)
      setAccountPassword('')
      setAccountRePassword('')
      await updateAccount(undefined, accountPassword)
      setLoading(false)
      setSuccessMessage('Password updated')
    } catch (error) {
      setLoading(false)
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
      setLoading(true)
      await updateAccount(accountUsername)
      setRootUsername(accountUsername)
      setLoading(false)
      setSuccessMessage('Username updated')
    } catch (error) {
      setLoading(false)
      setErrorMessage(error.message)
    }
  }

  function openCreateKey () {
    setCreateKeyOpen(true)
  }

  function closeCreateKey () {
    setCreateKeyOpen(false)
  }

  function openNewKey () {
    setNewKeyOpen(true)
  }

  function closeNewKey () {
    setNewKeyOpen(false)
  }

  function openUpdateKey (keyID) {
    setUpdateKeyID(keyID)
    setUpdateKeyOpen(true)
  }

  function closeUpdateKey () {
    setUpdateKeyOpen(false)
  }

  function openDeleteKey (keyID) {
    setDeleteKeyID(keyID)
    setDeleteKeyOpen(true)
  }

  function closeDeleteKey () {
    setDeleteKeyOpen(false)
  }

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
          loading
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
                <Button aria-label='New API Key' variant='outlined' onClick={openCreateKey}>Create New Key</Button>
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
                  <IconButton size="large" onClick={() => {openUpdateKey(apiKey.keyID)}} aria-label="refresh list" sx={{ marginRight: '10px' }}  color="inherit">
                    <DriveFileRenameOutlineRoundedIcon color='action' />
                  </IconButton>
                  <IconButton size="large" onClick={() => {openDeleteKey(apiKey.keyID)}} aria-label="refresh list" sx={{ marginRight: '10px' }}  color="inherit">
                    <DeleteRoundedIcon color='action' />
                  </IconButton>
                  </Box>
                </Box>
              ))
            }
          </Box>
        </Box>
      </Box>
      {createKeyOpen ? <CreateKey setNewAPIKey={setNewAPIKey} openNewKey={openNewKey} closeDialog={closeCreateKey} setLoading={setLoading} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} /> : null}
      {newKeyOpen ? <NewKey newAPIKey={newAPIKey} closeDialog={closeNewKey} setLoading={setLoading} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} /> : null}
      {updateKeyOpen ? <UpdateKey updateKeyID={updateKeyID} currentUpdateKeyDescription={currentUpdateKeyDescription} closeDialog={closeUpdateKey} setLoading={setLoading} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} /> : null}
      {deleteKeyOpen ? <DeleteKey deleteKeyID={deleteKeyID} deleteKeyDescription={deleteKeyDescription} closeDialog={closeDeleteKey} setLoading={setLoading} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} /> : null}
    </Box>
  )
}
