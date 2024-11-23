import React, { useState } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'

import CompetitionAPI from '../../../../apis/competitionAPI'

export default function UpdateTeam ({ competitionID, team, closeDialog, setUpdating, setSuccessMessage, setErrorMessage }) {
  const [updateTeamName, setUpdateTeamName] = useState(team.getName())
  const [updateTeamNameBadLength, setUpdateTeamNameBadLength] = useState(team.getName().length === 0)
  const [updateTeamNotes, setUpdateTeamNotes] = useState(team.getNotes())

  function updateTeamNameChange (e) {
    if (e.target.value.length <= 0 || e.target.value.length > 1000) {
      setUpdateTeamNameBadLength(true)
    } else {
      setUpdateTeamNameBadLength(false)
      setUpdateTeamName(e.target.value)
    }
  }

  function updateTeamNotesChange (e) {
    setUpdateTeamNotes(e.target.value)
  }

  async function updateTeamAction () {
    const competitionAPI = new CompetitionAPI()
    setUpdating(true)
    closeDialog(false)

    const teamUpdate = { name: updateTeamName }
    /* TODO CLUB ID
      team.club = ???
    */
    if (updateTeamNotes) {
      teamUpdate.notes = updateTeamNotes
    }
    try {
      await competitionAPI.updateTeam(competitionID, team.getID(), teamUpdate)
      setSuccessMessage(`Updated team with ID ${team.getID()}`)
    } catch (error) {
      setErrorMessage(error.message)
    }

    // TODO - on failure, keep the dialog open with the values so they can be fixed. Or is that a sign that validation has failed?
    setUpdating(false)
  }

  return (
  <Dialog open={true} onClose={closeDialog} aria-labelledby='edit team'>
    <DialogTitle id='edit-team-dialog-title' className='dialog-top'>Edit Team</DialogTitle>
    <DialogContent>
      <br/>
      <TextField margin='dense' id='edit-team-name' onChange={updateTeamNameChange} label='name (required)' type='text' defaultValue={team.getName()} fullWidth/>
      {/* <TextField margin='dense' id='edit-team-number' onChange={updateTeamNumberChange} label='shirt number' type='number' fullWidth/> */}
      <TextField margin='dense' id='edit-team-notes' onChange={updateTeamNotesChange} label='notes' type='text' defaultValue={team.getNotes()} fullWidth/>
    </DialogContent>
    <DialogActions>
      <Button onClick={closeDialog} variant='outlined' color='primary'>Cancel</Button>
      {
        updateTeamNameBadLength
        ?
        <Button disabled variant='contained' color='primary'>Update</Button>
        :
        <Button onClick={updateTeamAction} variant='contained' color='primary'>Update</Button>
      }
    </DialogActions>
  </Dialog>
  )
}
