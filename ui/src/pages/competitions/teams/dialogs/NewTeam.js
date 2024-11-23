import React, { useState } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'

import CompetitionAPI from '../../../../apis/competitionAPI'

export default function NewTeam ({ competitionID, setLoading, closeDialog, setSuccessMessage, setErrorMessage }) {
  const [newTeamName, setNewTeamName] = useState(null)
  const [newTeamNameBadLength, setNewTeamNameBadLength] = useState(true)
  const [newTeamID, setNewTeamID] = useState(null)
  const [newTeamIDBadLength, setNewTeamIDBadLength] = useState(true)
  // const [newTeamNumber, setNewTeamNumber] = useState(null)
  const [newTeamNotes, setNewTeamNotes] = useState(null)

  function newTeamNameChange (e) {
    if (e.target.value.length <= 0 || e.target.value.length > 1000) {
      setNewTeamNameBadLength(true)
    } else {
      setNewTeamNameBadLength(false)
      setNewTeamName(e.target.value)
    }
  }

  function newTeamIDChange (e) {
    if (e.target.value.length <= 0 || e.target.value.length > 100) {
      setNewTeamIDBadLength(true)
    } else {
      setNewTeamIDBadLength(false)
      setNewTeamID(e.target.value)
    }
  }

  function newTeamNotesChange (e) {
    setNewTeamNotes(e.target.value)
  }

  async function newTeamAction () {
    const competitionAPI = new CompetitionAPI()
    setLoading(true)
    closeDialog(false)

    const team = { name: newTeamName }
    if (newTeamID) {
      team.id = newTeamID
    }
    /* TODO CLUB ID
      team.club = ???
    */
    if (newTeamNotes) {
      team.notes = newTeamNotes
    }
    try {
      const newTeam = await competitionAPI.createTeam(competitionID, team)
      setSuccessMessage(`New team added with ID ${newTeam.id}`)
    } catch (error) {
      setErrorMessage(error.message)
    }

    // TODO - on failure, keep the dialog open with the values so they can be fixed. Or is that a sign that validation has failed?
    setLoading(false)
  }

  // TODO select the club

  // TODO - If the team ID is missing...
  //   look at existing and find the number part and add one?
  //   impose a system?
  //   don't really want a UUID here as this is essentially someone's registration ID number....

  // TODO work out how the page is redrawn and the new team is included

  return (
    <Dialog open={true} onClose={closeDialog} aria-labelledby='add new team'>
      <DialogTitle id='add-team-dialog-title' className='dialog-top'>New Team</DialogTitle>
      <DialogContent>
        <br/>
        <TextField margin='dense' id='add-team-name' onChange={newTeamNameChange} label='name (required)' type='text' fullWidth/>
        <TextField margin='dense' id='add-team-id' onChange={newTeamIDChange} label='id' type='text' fullWidth/>
        {/* <TextField margin='dense' id='add-team-club' onChange={newTeamNumberChange} label='club' type='number' fullWidth/> */}
        <TextField margin='dense' id='add-team-notes' onChange={newTeamNotesChange} label='notes' type='text' fullWidth/>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} variant='outlined' color='primary'>Cancel</Button>
        {
          newTeamNameBadLength || newTeamIDBadLength
          ?
          <Button disabled variant='contained' color='primary'>Create</Button>
          :
          <Button onClick={newTeamAction} variant='contained' color='primary'>Create</Button>
        }
      </DialogActions>
    </Dialog>
  )
}
