import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'

import { deleteApp } from '../../apis/uidataAPI'
import Roles, { InsufficientRoles } from '../../components/Roles'

function DeletePlayerDialog ({ app, closeDialog, setLoading, setSuccessMessage, setErrorMessage }) {
  const navigate = useNavigate()

  async function deleteAppAction () {
    setLoading(true)
    closeDialog()

    try {
      await deleteApp(app.id)
      setSuccessMessage(`App "${app.name}" deleted`)
      navigate('.', { replace: true })
    } catch (error) {
      setErrorMessage(error.message)
    }

    setLoading(false)
  }

  return (
    <Dialog open={true} onClose={closeDialog} aria-labelledby='delete player'>
      <DialogTitle id='delete-player-dialog-title' className='dialog-top'>Delete Player</DialogTitle>
      <DialogContent>
        <DialogContentText>Are you sure you want to delete the App "{app.name}"?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} variant='outlined' color='primary'>Cancel</Button>
        <Button onClick={deleteAppAction} variant='contained' color='primary'>Delete</Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeletePlayerDialog
