import React, { useState } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'

export default function UpdatePlayer ({ closeDialog, setSuccessMessage, setErrorMessage }) {
  const [newPlayerName, setNewPlayerName] = useState(null)
  const [updatePlayerNameBadLength, setUpdatePlayerNameBadLength] = useState(true)
  const [newPlayerID, setNewPlayerID] = useState(null)
  const [updatePlayerIDBadLength, setUpdatePlayerIDBadLength] = useState(true)
  const [newPlayerNumber, setNewPlayerNumber] = useState(null)
  const [newPlayerNotes, setNewPlayerNotes] = useState(null)

  function updatePlayerNameChange (e) {
    if (e.target.value.length <= 0 || e.target.value.length > 1000) {
      setUpdatePlayerNameBadLength(true)
    } else {
      setUpdatePlayerNameBadLength(false)
      setNewPlayerName(e.target.value)
    }
  }

  function updatePlayerIDChange (e) {
    if (e.target.value.length <= 0 || e.target.value.length > 100) {
      setUpdatePlayerIDBadLength(true)
    } else {
      setUpdatePlayerIDBadLength(false)
      setNewPlayerID(e.target.value)
    }
  }

  function updatePlayerNumberChange (e) {
    if (e.target.value.length <= 0 || e.target.value.length > 100) {
      setUpdatePlayerIDBadLength(true)
    } else {
      setUpdatePlayerIDBadLength(false)
      setNewPlayerNumber(e.target.value)
    }
  }

  function updatePlayerNotesChange (e) {
    if (e.target.value.length <= 0 || e.target.value.length > 100) {
      setUpdatePlayerIDBadLength(true)
    } else {
      setUpdatePlayerIDBadLength(false)
      setNewPlayerNotes(e.target.value)
    }
  }

  async function updatePlayerAction () {
    // setLoadingNewPlayer(true)
    // setNewPlayerDialogOpen(false)

    // try {
    //   const user = await createPlayer(competitionID, )
    //   setSuccessMessage('New player added')
    // } catch (error) {
    //   setErrorMessage(error.message)
    // }

    // setLoadingNewPlayer(false)
  }

  return (
  <Dialog open={true} onClose={closeDialog} aria-labelledby='edit player'>
    <DialogTitle id='edit-player-dialog-title' className='dialog-top'>Edit Player</DialogTitle>
    <DialogContent>
      <br/>
      <TextField margin='dense' id='edit-player-name' onChange={updatePlayerNameChange} label='name (required)' type='text' fullWidth/>
      <TextField margin='dense' id='edit-player-id' onChange={updatePlayerIDChange} label='id' type='text' fullWidth/>
      <TextField margin='dense' id='edit-player-number' onChange={updatePlayerNumberChange} label='shirt number' type='number' fullWidth/>
      <TextField margin='dense' id='edit-player-notes' onChange={updatePlayerNotesChange} label='notes' type='text' fullWidth/>
    </DialogContent>
    <DialogActions>
      <Button onClick={closeDialog} variant='outlined' color='primary'>Cancel</Button>
      {
        updatePlayerNameBadLength || updatePlayerIDBadLength
        ?
        <Button disabled variant='contained' color='primary'>Update</Button>
        :
        <Button onClick={updatePlayerAction} variant='contained' color='primary'>Update</Button>
      }
    </DialogActions>
  </Dialog>
  )
}
