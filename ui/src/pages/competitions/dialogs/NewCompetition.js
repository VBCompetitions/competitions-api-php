import React, { useState } from 'react'

import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'

import CompetitionAPI from '../../../apis/competitionAPI'

function NewCompetition ({ closeDialog, loadCompetition, setSuccessMessage, setErrorMessage }) {

  const [competitionName, setCompetitionName] = useState(null)
  const [competitionNotes, setCompetitionNotes] = useState(null)

  async function newCompetitionAction (e) {
    const competitionAPI = new CompetitionAPI()
    const newCompetition = {
      name: competitionName,
      teams: [],
      stages: []
    }
    if (competitionNotes) {
      newCompetition.notes = competitionNotes
    }

    try {
      const competition = await competitionAPI.createCompetition(newCompetition)
      setSuccessMessage('New competition created')
      closeDialog()
      loadCompetition(competition.id)
    } catch (error) {
      setErrorMessage(error.message)
      closeDialog()
    }
  }

  function newCompetitionDialogNameChange (e) {
    setCompetitionName(e.target.value)
  }

  function newCompetitionDialogNotesChange (e) {
    setCompetitionNotes(e.target.value)
  }

  return (
    <Dialog open={true} onClose={closeDialog} aria-labelledby="add new competition">
      <DialogTitle id="add-competition-dialog-title">New Competition</DialogTitle>
      <DialogContent>
        <DialogContentText>Enter the name for the new competition</DialogContentText>
        <TextField autoFocus margin="dense" id="add-competition-name" onChange={newCompetitionDialogNameChange} label="Competition name" type="text" fullWidth/>
        <br/><br/>
        <DialogContentText>Enter any notes on the competition</DialogContentText>
        <TextField autoFocus margin="dense" id="add-competition-notes" onChange={newCompetitionDialogNotesChange} label="Notes" type="text" fullWidth/>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} variant="outlined" color="primary">Cancel</Button>
        <Button onClick={newCompetitionAction} variant="contained" color="primary">Create</Button>
      </DialogActions>
    </Dialog>
  )
}

export default NewCompetition
