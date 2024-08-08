import React from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Typography from '@mui/material/Typography'

export default function NewKey ({ newAPIKey, closeDialog }) {
  async function newKeyCopy () {
    await navigator.clipboard.writeText(newAPIKey)
  }

  return (
    <Dialog open={true} onClose={closeDialog} aria-labelledby='new key'>
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
        <Button onClick={closeDialog} variant='contained' color='primary'>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
