import React, { useState } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'

import CompetitionAPI from '../../../../apis/competitionAPI'

export default function UpdatePlayer ({ competitionID, player, closeDialog, setUpdating, setSuccessMessage, setErrorMessage }) {
  const [updatePlayerName, setUpdatePlayerName] = useState(player.getName())
  const [updatePlayerNameBadLength, setUpdatePlayerNameBadLength] = useState(player.getName() === 0)
  // const [updatePlayerIDBadLength, setUpdatePlayerIDBadLength] = useState(true)
  const [updatePlayerNumber, setUpdatePlayerNumber] = useState(player.getNumber())
  const [updatePlayerNotes, setUpdatePlayerNotes] = useState(player.getNotes())

  function updatePlayerNameChange (e) {
    if (e.target.value.length <= 0 || e.target.value.length > 1000) {
      setUpdatePlayerNameBadLength(true)
    } else {
      setUpdatePlayerNameBadLength(false)
      setUpdatePlayerName(e.target.value)
    }
  }

  // function updatePlayerIDChange (e) {
  //   if (e.target.value.length <= 0 || e.target.value.length > 100) {
  //     setUpdatePlayerIDBadLength(true)
  //   } else {
  //     setUpdatePlayerIDBadLength(false)
  //     setNewPlayerID(e.target.value)
  //   }
  // }

  function updatePlayerNumberChange (e) {
    setUpdatePlayerNumber(e.target.value)
    // if (e.target.value.length <= 0 || e.target.value.length > 100) {
    //   setUpdatePlayerIDBadLength(true)
    // } else {
    //   setUpdatePlayerIDBadLength(false)
    //   setUpdatePlayerNumber(e.target.value)
    // }
  }

  function updatePlayerNotesChange (e) {
    setUpdatePlayerNotes(e.target.value)
    // if (e.target.value.length <= 0 || e.target.value.length > 100) {
    //   setUpdatePlayerIDBadLength(true)
    // } else {
    //   setUpdatePlayerIDBadLength(false)
    // }
  }

  async function updatePlayerAction () {
    const competitionAPI = new CompetitionAPI()
    setUpdating(true)
    closeDialog(false)

    const playerUpdate = { name: updatePlayerName }
    /* TODO CLUB ID
      team.club = ???
    */
   if (updatePlayerNumber) {
    playerUpdate.number = updatePlayerNumber
   }
    if (updatePlayerNotes) {
      playerUpdate.notes = updatePlayerNotes
    }
    try {
      await competitionAPI.updatePlayer(competitionID, player.getID(), playerUpdate)
      setSuccessMessage(`Updated player with ID ${player.getID()}`)
    } catch (error) {
      setErrorMessage(error.message)
    }

    // TODO - on failure, keep the dialog open with the values so they can be fixed. Or is that a sign that validation has failed?
    setUpdating(false)
  }

  // TODO Change a player's ID?  You'd have to change every match they played in!
  // If not allowed then remove from the schema for player updates

  return (
  <Dialog open={true} onClose={closeDialog} aria-labelledby='edit player'>
    <DialogTitle id='edit-player-dialog-title' className='dialog-top'>Edit Player</DialogTitle>
    <DialogContent>
      <br/>
      <TextField margin='dense' id='edit-player-name' onChange={updatePlayerNameChange} label='name (required)' type='text' defaultValue={player.getName()} fullWidth/>
      {/* <TextField margin='dense' id='edit-player-id' onChange={updatePlayerIDChange} label='id' type='text' defaultValue={player.getID()} fullWidth/> */}
      <TextField margin='dense' id='edit-player-number' onChange={updatePlayerNumberChange} label='shirt number' type='number' defaultValue={player.getNumber()} fullWidth/>
      <TextField margin='dense' id='edit-player-notes' onChange={updatePlayerNotesChange} label='notes' type='text' defaultValue={player.getNotes()} fullWidth/>
    </DialogContent>
    <DialogActions>
      <Button onClick={closeDialog} variant='outlined' color='primary'>Cancel</Button>
      {
        updatePlayerNameBadLength
        ?
        <Button disabled variant='contained' color='primary'>Update</Button>
        :
        <Button onClick={updatePlayerAction} variant='contained' color='primary'>Update</Button>
      }
    </DialogActions>
  </Dialog>
  )
}
