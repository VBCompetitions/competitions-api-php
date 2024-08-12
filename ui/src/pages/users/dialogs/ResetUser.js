import React from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { resetUser } from '../../../apis/uidataAPI'

export default function ResetUser ({ user, closeDialog, openUserLink, setUserLinkTriggerRefresh, setLoading, setSuccessMessage, setErrorMessage }) {
  async function resetUserAction () {
    setLoading(true)
    closeDialog()

    try {
      const userInfo = await resetUser(user.id)
      openUserLink(userInfo)
      setUserLinkTriggerRefresh(true)
    } catch (error) {
      setErrorMessage(error.message)
    }

    setLoading(false)
  }

  return (
    <Dialog open={true} onClose={closeDialog} aria-labelledby='reset user'>
      <DialogTitle id='reset-user-dialog-title' className='dialog-top'>Reset User</DialogTitle>
      <DialogContent>
        <br/>
        <DialogContentText>Username</DialogContentText>
        <Box sx={{padding: '10px 0px'}}>
          <TextField id='reset-username' disabled={true} name='reset-username' sx={{ width: '35ch' }} value={user ? user.username : ''} variant='outlined' />
        </Box>
        <Box sx={{padding: '10px 0px'}}>
          <Typography variant='body1' >This will reset the user's password and generate a new activation link.<br />
                                       Once you have sent them their new link, they will be able to set a new<br />
                                       password for their account<br /><br />
                                       Are you sure you want to reset the account?</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} variant='outlined' color='primary'>Cancel</Button>
        <Button onClick={resetUserAction} variant='contained' color='primary'>Reset</Button>
      </DialogActions>
    </Dialog>
  )
}

