import React from 'react'
import { useSearchParams } from 'react-router-dom'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import VisibilityRounded from '@mui/icons-material/VisibilityRounded'
import VisibilityOffRounded from '@mui/icons-material/VisibilityOffRounded'

export default function Login () {
  const [showPassword, setShowPassword] = React.useState(false)
  const [searchParams, _] = useSearchParams()

  const handleClickShowPassword = () => setShowPassword((show) => !show)

  const handleMouseDownPassword = e => { e.preventDefault() }

  // if (navigation.state !== 'idle') {
  //   return (
  //     <Box padding='5px'>
  //       <Box padding='10px 10px 5px 10px'>
  //         <Box sx={{ display: 'flex' }}>
  //           <Typography sx={{ flexGrow: '1', marginBottom: '3px' }} variant='h5' textAlign='left' gutterBottom>Getting Competition List...</Typography>
  //         </Box>
  //       </Box>
  //       <Box padding='10px'>
  //         <LinearProgress />
  //       </Box>
  //     </Box>
  //   )
  // }

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
          <form method='post' action={`${window.VBC_UI_URL}/login${searchParams.has('returnTo') ? '?returnTo='+searchParams.get('returnTo') : ''}`}>
            <Box className='login-input'>
              <TextField id='login-username' name='login-username' sx={{ width: '35ch' }} label='Username' variant='outlined' />
            </Box>
            <Box className='login-input'>
              <FormControl sx={{ m: 1, width: '35ch' }} variant='outlined'>
                <InputLabel htmlFor='outlined-adornment-password'>Password</InputLabel>
                <OutlinedInput
                  id='login-password'
                  name='login-password'
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
                />
              </FormControl>
            </Box>
            <Box className='login-bottom'>
              <Box className='login-forgotten'></Box>
              <Box className='login-login-button'><Button type='submit' variant='contained'>Log in</Button></Box>
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
