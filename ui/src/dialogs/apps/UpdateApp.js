import React, { useState } from 'react'
import { Link, redirect, useLoaderData, useNavigate, useRouteLoaderData } from 'react-router-dom'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import Divider from '@mui/material/Divider'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded'
import Paper from '@mui/material/Paper'
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

import CompetitionAPI from '../../apis/competitionAPI'
import Roles, { InsufficientRoles } from '../../components/Roles'

export default function UpdateApp ({ app, closeDialog, setSuccessMessage, setErrorMessage }) {
  const [newPlayerName, setNewPlayerName] = useState(null)
  const [newPlayerNameBadLength, setNewPlayerNameBadLength] = useState(true)
  const [newPlayerID, setNewPlayerID] = useState(null)
  const [newPlayerIDBadLength, setNewPlayerIDBadLength] = useState(true)
  const [newPlayerNumber, setNewPlayerNumber] = useState(null)
  const [newPlayerNotes, setNewPlayerNotes] = useState(null)

  function newPlayerNameChange (e) {
    if (e.target.value.length <= 0 || e.target.value.length > 1000) {
      setNewPlayerNameBadLength(true)
    } else {
      setNewPlayerNameBadLength(false)
      setNewPlayerName(e.target.value)
    }
  }

  function newPlayerIDChange (e) {
    if (e.target.value.length <= 0 || e.target.value.length > 100) {
      setNewPlayerIDBadLength(true)
    } else {
      setNewPlayerIDBadLength(false)
      setNewPlayerID(e.target.value)
    }
  }

  function newPlayerNumberChange (e) {
    if (e.target.value.length <= 0 || e.target.value.length > 100) {
      setNewPlayerIDBadLength(true)
    } else {
      setNewPlayerIDBadLength(false)
      setNewPlayerNumber(e.target.value)
    }
  }

  function newPlayerNotesChange (e) {
    if (e.target.value.length <= 0 || e.target.value.length > 100) {
      setNewPlayerIDBadLength(true)
    } else {
      setNewPlayerIDBadLength(false)
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
      <TextField margin='dense' id='edit-player-name' onChange={newPlayerNameChange} label='name (required)' type='text' fullWidth/>
      <TextField margin='dense' id='edit-player-id' onChange={newPlayerIDChange} label='id' type='text' fullWidth/>
      <TextField margin='dense' id='edit-player-number' onChange={newPlayerNumberChange} label='shirt number' type='number' fullWidth/>
      <TextField margin='dense' id='edit-player-notes' onChange={newPlayerNotesChange} label='notes' type='text' fullWidth/>
    </DialogContent>
    <DialogActions>
      <Button onClick={closeDialog} variant='outlined' color='primary'>Cancel</Button>
      {
        newPlayerNameBadLength || newPlayerIDBadLength
        ?
        <Button disabled variant='contained' color='primary'>Create</Button>
        :
        <Button onClick={updatePlayerAction} variant='contained' color='primary'>Create</Button>
      }
    </DialogActions>
  </Dialog>
  )
}
