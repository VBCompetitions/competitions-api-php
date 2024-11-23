import React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'

import CompetitionAPI from '../../../../apis/competitionAPI'

export default function DeleteTeam ({ competitionID, team, closeDialog, setLoading, setSuccessMessage, setErrorMessage }) {

  async function deleteTeamAction () {
    const competitionAPI = new CompetitionAPI()
    setLoading(true)
    closeDialog()

    try {
      await competitionAPI.deleteTeam(competitionID, team.getID())
      setSuccessMessage('Team deleted')
    } catch (error) {
      setErrorMessage(error.message)
    }

    setLoading(false)
  }

  return (
    <Dialog open={true} onClose={closeDialog} aria-labelledby='delete team'>
      <DialogTitle id='delete-team-dialog-title' className='dialog-top'>Delete Team</DialogTitle>
      <DialogContent>
        <DialogContentText>Are you sure you want to delete team "{team.getName()}"?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} variant='outlined' color='primary'>Cancel</Button>
        <Button onClick={deleteTeamAction} variant='contained' color='primary'>Delete</Button>
      </DialogActions>
    </Dialog>
  )
}

