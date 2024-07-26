import React, { useState } from 'react'
import { Link, redirect, useLoaderData, useNavigate, useRouteLoaderData } from 'react-router-dom'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'

import { States, createUser, deleteUser, getUsers, resetUser, updateUser } from '../../apis/uidataAPI'
import Roles, { InsufficientRoles } from '../../components/Roles'

export default function DeleteUser ({ setLoading, deleteUserUser, closeDialog, setSuccessMessage, setErrorMessage }) {
  const navigate = useNavigate()

  async function deleteUserAction () {
    setLoading(true)
    closeDialog()

    try {
      await deleteUser(deleteUserUser.id)
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
        <DialogContentText>Are you sure you want to delete user "{ deleteUserUser ? deleteUserUser.username : ''}"?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} variant='outlined' color='primary'>Cancel</Button>
        <Button onClick={deleteUserAction} variant='contained' color='primary'>Delete</Button>
      </DialogActions>
    </Dialog>
  )
}

