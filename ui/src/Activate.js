import React, { useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import VisibilityRounded from '@mui/icons-material/VisibilityRounded'
import VisibilityOffRounded from '@mui/icons-material/VisibilityOffRounded'
import { useLoaderData } from 'react-router-dom'

import { getUsernameFromLinkID } from './apis/uidataAPI'

export async function loadUserActivation (url) {
  const linkID = url.params.linkID
  const user = await getUsernameFromLinkID(linkID)
  return { ...user, linkID }
}

export default function Activate () {
  const user = useLoaderData()
  const [showPassword, setShowPassword] = useState(false)

  const [passwordToShort, setPasswordToShort] = useState(true)
  const [passwordInvalid, setPasswordInvalid] = useState(false)

  const handleClickShowPassword = () => setShowPassword((show) => !show)

  const handleMouseDownPassword = e => { e.preventDefault() }

  function passwordChange (e) {
    setPasswordToShort(e.target.value.length < 10)
    // TODO - max length for password
    setPasswordInvalid(!/^[a-zA-Z0-9!'#£$%&'()*+.,/:;<=>?@[^_`{|}~\-\\\]]{8,50}$/.test(e.target.value))
  }

  return (
    <Box padding='5px' sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box padding='10px 10px 5px 10px'>
        <Box sx={{ display: 'flex' }}>
          <Typography sx={{ flexGrow: '1', marginBottom: '3px' }} variant='h5' textAlign='left' gutterBottom>{'\u00A0'}</Typography>
        </Box>
      </Box>
      <Box padding='10px'>
        <Divider sx={{ borderBottomWidth: 4, borderColor: '#1976d2' }} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: '1', flexDirection: 'column' }}>
        <Box sx={{ flexGrow: '1' }}></Box>
        <Box className='login-box'>
          <Box className='login-top'>
            <Typography sx={{ flexGrow: '1', marginBottom: '0' }} variant='h5' textAlign='center'>VBCompetitions</Typography>
          </Box>
          <form method='post' action={`${window.VBC_UI_URL}/account/${user.linkID}`}>
            <Box className='login-input'>
              <Typography sx={{padding: '10px'}} variant='body2' textAlign='center'>Make a note of your username,<br />you will need it every time you log in</Typography>
              <TextField id='login-username' disabled={true} name='login-username' sx={{ width: '35ch' }} label='Username' value={user.username} variant='outlined' />
            </Box>
            <Box className='login-input'>
              <Typography sx={{padding: '10px'}} variant='body2' textAlign='center'>Enter a password for your new account<br />The password must be at least 10 characters long</Typography>
              <FormControl sx={{ m: 1, width: '35ch' }} variant='outlined'>
                <InputLabel htmlFor='outlined-adornment-password'>Password</InputLabel>
                <OutlinedInput
                  error={passwordInvalid}
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  endAdornment={
                    <InputAdornment position='end'>
                      <IconButton
                        aria-label='toggle password visibility'
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge='end'
                      >
                        {showPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label='Password'
                  onChange={passwordChange}
                />
                {
                  passwordInvalid
                  ?
                  <FormHelperText className='Mui-error' id='password-error-text'>password includes invalid character</FormHelperText>
                  :
                  <FormHelperText id='password-error-text'> </FormHelperText>
                }
              </FormControl>
            </Box>
            <Box className='login-bottom'>
              <Box className='login-forgotten'></Box>
              <Box className='login-login-button'>
                {
                  passwordToShort
                  ?
                  <Button disabled variant='contained'>Activate Account</Button>
                  :
                  <Button type='submit' variant='contained'>Activate Account</Button>
                }
              </Box>
            </Box>
          </form>
        </Box>
        <Box sx={{ flexGrow: '2' }}></Box>
      </Box>
    </Box>
  )
}


/*

*/
