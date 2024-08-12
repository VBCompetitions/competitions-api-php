import React, { useState } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import Typography from '@mui/material/Typography'

import { deleteKey } from '../../../apis/uidataAPI'

export default function DeleteKey ({ deleteKeyID, deleteKeyDescription, closeDialog, setLoading, setSuccessMessage, setErrorMessage }) {
  async function deleteKeyAction () {
    try {
      setLoading(true)
      closeDialog()
      await deleteKey(deleteKeyID)
      setLoading(false)
      setSuccessMessage('API Key deleted')
    } catch (error) {
      setLoading(false)
      setErrorMessage(error.message)
    }
  }

  return (
    <Dialog open={true} onClose={closeDialog} aria-labelledby="delete api key">
      <DialogTitle id="delete-key-dialog-title">Delete API Key</DialogTitle>
      <DialogContent>
        <DialogContentText>
        <Typography variant='body1'>Are you sure you want to delete the key with description:</Typography>
        <Typography variant='body1' sx={{ fontStyle: 'italic' }}>{deleteKeyDescription}</Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} variant="outlined" color="primary">Cancel</Button>
        <Button onClick={deleteKeyAction} variant="contained" color="primary">Delete</Button>
      </DialogActions>
    </Dialog>
  )
}
