import React, { useState } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'

import CompetitionAPI from '../../apis/competitionAPI'

function DeleteCompetitionDialog ({ competition, closeDialog, triggerRefresh, setSuccessMessage, setErrorMessage }) {

  async function deleteCompetitionAction () {
    const competitionAPI = new CompetitionAPI()
    try {
      closeDialog()
      await competitionAPI.deleteCompetition(competition.id)
      setSuccessMessage('Competition deleted')
      triggerRefresh()
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  return (
    <Dialog open={true} onClose={closeDialog} aria-labelledby="delete competition">
      <DialogTitle id="delete-competition-dialog-title">Delete Competition</DialogTitle>
      <DialogContent>
        <DialogContentText>Are you sure you want to delete the competition?</DialogContentText>
        <DialogContentText>Name: {competition.name}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} variant="outlined" color="primary">Cancel</Button>
        <Button onClick={deleteCompetitionAction} variant="contained" color="primary">Delete</Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteCompetitionDialog
