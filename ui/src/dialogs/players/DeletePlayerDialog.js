import React, { useState } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'

import CompetitionAPI from '../../apis/competitionAPI'
import Roles, { InsufficientRoles } from '../../components/Roles'

function DeletePlayerDialog ({ competitionID, player, closeDialog, setLoading, setSuccessMessage, setErrorMessage }) {

  async function deletePlayerAction () {
    const competitionAPI = new CompetitionAPI()
    setLoading(true)
    closeDialog()

    try {
      await competitionAPI.deletePlayer(competitionID, player.getID())
      setSuccessMessage('Player deleted')
    } catch (error) {
      setErrorMessage(error.message)
    }

    setLoading(false)
  }

  return (
    <Dialog open={true} onClose={closeDialog} aria-labelledby='delete player'>
      <DialogTitle id='delete-player-dialog-title' className='dialog-top'>Delete Player</DialogTitle>
      <DialogContent>
        <DialogContentText>Are you sure you want to delete player "{player.getName()}"?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} variant='outlined' color='primary'>Cancel</Button>
        <Button onClick={deletePlayerAction} variant='contained' color='primary'>Delete</Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeletePlayerDialog
