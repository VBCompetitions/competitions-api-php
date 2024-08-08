import React from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'

import { deleteUser } from '../../../apis/uidataAPI'

export default function DeleteUser ({ setLoading, user, closeDialog, setSuccessMessage, setErrorMessage }) {
  const navigate = useNavigate()

  async function deleteUserAction () {
    setLoading(true)
    closeDialog()

    try {
      await deleteUser(user.id)
      setLoading(false)
      navigate('.', { replace: true })
    } catch (error) {
      setErrorMessage(error.message)
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onClose={closeDialog} aria-labelledby='delete user'>
      <DialogTitle id='delete-user-dialog-title' className='dialog-top'>Delete User</DialogTitle>
      <DialogContent>
        <DialogContentText>Are you sure you want to delete user "{ user ? user.username : ''}"?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} variant='outlined' color='primary'>Cancel</Button>
        <Button onClick={deleteUserAction} variant='contained' color='primary'>Delete</Button>
      </DialogActions>
    </Dialog>
  )
}

