import React, { useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import Divider from '@mui/material/Divider'
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { createCompetition } from '../../apis/competitionAPI.js'

function NewCompetitionDialog ({ closeDialog, loadCompetition, setSuccessMessage, setErrorMessage }) {

  const [competitionName, setCompetitionName] = useState(null)
  const [competitionNotes, setCompetitionNotes] = useState(null)

  async function newCompetitionAction (e) {
    const newCompetition = {
      name: competitionName,
      teams: [],
      stages: []
    }
    if (competitionNotes) {
      newCompetition.notes = competitionNotes
    }

    try {
      const competitionID = await createCompetition(newCompetition)
      setSuccessMessage('New competition created')
      closeDialog()
      loadCompetition(competitionID)
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

export default NewCompetitionDialog
