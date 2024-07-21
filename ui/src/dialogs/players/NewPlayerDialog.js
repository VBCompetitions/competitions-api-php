import React, { useState } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'

import CompetitionAPI from '../../apis/competitionAPI'
import Roles, { InsufficientRoles } from '../../components/Roles'

function NewPlayerDialog ({ competitionID, setLoading, closeDialog, setSuccessMessage, setErrorMessage }) {
  const [newPlayerName, setNewPlayerName] = useState(null)
  const [newPlayerNameBadLength, setNewPlayerNameBadLength] = useState(true)
  const [newPlayerID, setNewPlayerID] = useState(null)
  const [newPlayerIDBadLength, setNewPlayerIDBadLength] = useState(true)
  const [newPlayerNumber, setNewPlayerNumber] = useState(null)
  const [newPlayerNotes, setNewPlayerNotes] = useState(null)

  function newPlayerDialogNameChange (e) {
    if (e.target.value.length <= 0 || e.target.value.length > 1000) {
      setNewPlayerNameBadLength(true)
    } else {
      setNewPlayerNameBadLength(false)
      setNewPlayerName(e.target.value)
    }
  }

  function newPlayerDialogIDChange (e) {
    if (e.target.value.length <= 0 || e.target.value.length > 100) {
      setNewPlayerIDBadLength(true)
    } else {
      setNewPlayerIDBadLength(false)
      setNewPlayerID(e.target.value)
    }
  }

  function newPlayerDialogNumberChange (e) {
    if (e.target.value.length <= 0 || e.target.value.length > 100) {
      setNewPlayerIDBadLength(true)
    } else {
      setNewPlayerIDBadLength(false)
      setNewPlayerNumber(parseInt(e.target.value))
      // TODO - must be 1 or greater
    }
  }

  function newPlayerDialogNotesChange (e) {
    if (e.target.value.length <= 0 || e.target.value.length > 100) {
      setNewPlayerIDBadLength(true)
    } else {
      setNewPlayerIDBadLength(false)
      setNewPlayerNotes(e.target.value)
    }
  }

  async function newPlayerAction () {
    const competitionAPI = new CompetitionAPI()
    setLoading(true)
    closeDialog(false)

    const player = { name: newPlayerName }
    if (newPlayerID) {
      player.id = newPlayerID
    }
    if (newPlayerNumber) {
      player.number = newPlayerNumber
    }
    if (newPlayerNotes) {
      player.notes = newPlayerNotes
    }
    try {
      const newPlayer = await competitionAPI.createPlayer(competitionID, player)
      setSuccessMessage(`New player added with ID ${newPlayer.id}`)
    } catch (error) {
      setErrorMessage(error.message)
    }

    // TODO - on failure, keep the dialog open with the values so they can be fixed. Or is that a sign that validation has failed?
    setLoading(false)
  }

  // TODO - Add team history

  // TODO - If the player ID is missing...
  //   look at existing and find the number part and add one?
  //   impose a system?
  //   don't really want a UUID here as this is essentially someone's registration ID number....

  // TODO Sort what to draw based on Role

  // TODO work out how the page is redrawn and the new player is included

  return (
    <Dialog open={true} onClose={closeDialog} aria-labelledby='add new player'>
      <DialogTitle id='add-player-dialog-title' className='dialog-top'>New Player</DialogTitle>
      <DialogContent>
        <br/>
        <TextField margin='dense' id='add-player-name' onChange={newPlayerDialogNameChange} label='name (required)' type='text' fullWidth/>
        <TextField margin='dense' id='add-player-id' onChange={newPlayerDialogIDChange} label='id' type='text' fullWidth/>
        <TextField margin='dense' id='add-player-number' onChange={newPlayerDialogNumberChange} label='shirt number' type='number' fullWidth/>
        <TextField margin='dense' id='add-player-notes' onChange={newPlayerDialogNotesChange} label='notes' type='text' fullWidth/>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} variant='outlined' color='primary'>Cancel</Button>
        {
          newPlayerNameBadLength || newPlayerIDBadLength
          ?
          <Button disabled variant='contained' color='primary'>Create</Button>
          :
          <Button onClick={newPlayerAction} variant='contained' color='primary'>Create</Button>
        }
      </DialogActions>
    </Dialog>
  )
}

export default NewPlayerDialog
