import React, { useState } from 'react'

import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'

import CompetitionAPI from '../../apis/competitionAPI'

function EditCompetition ({ competition, closeDialog, triggerRefresh, setSuccessMessage, setErrorMessage }) {

  const [competitionName, setCompetitionName] = useState(null)

  async function editCompetitionAction () {
    const updatedCompetition = {
      name: competitionName,
      teams: [],
      stages: []
    }
    const competitionAPI = new CompetitionAPI()
    try {
      await competitionAPI.updateCompetition(competition.id, updatedCompetition)
      closeDialog()
      setSuccessMessage('Competition updated')
      triggerRefresh()
    } catch (error) {
      closeDialog()
      setErrorMessage(error.message)
    }
  }

  const editCompetitionDialogNameChange = e => {
    setCompetitionName(e.target.value)
  }

  return (
    <Dialog open={true} onClose={closeDialog} aria-labelledby="edit competition">
      <DialogTitle id="edit-competition-dialog-title">Edit Competition</DialogTitle>
      <DialogContent>
        <DialogContentText>Edit the name for the competition</DialogContentText>
        <TextField autoFocus margin="dense" id="edit-competition-name" onChange={editCompetitionDialogNameChange} label="Competition name" type="text" fullWidth defaultValue={competition.name} />
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} variant="outlined" color="primary">Cancel</Button>
        <Button onClick={editCompetitionAction} variant="contained" color="primary">Update</Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditCompetition
