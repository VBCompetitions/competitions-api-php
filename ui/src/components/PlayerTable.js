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
import Icon from '@mui/material/Icon'
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

import { createPlayer, deletePlayer, updatePlayer } from '../apis/competitionAPI'
import Roles, { InsufficientRoles } from '../components/Roles'
import DeletePlayerDialog from '../dialogs/players/DeletePlayerDialog.js'
import EditPlayerDialog from '../dialogs/players/EditPlayerDialog.js'
import NewPlayerDialog from '../dialogs/players/NewPlayerDialog.js'

function PlayerTable ({ competition, competitionID, setSuccessMessage, setErrorMessage }) {
  const [loadingNewPlayer, setLoadingNewPlayer] = useState(false)
  const [loadingUpdatePlayer, setLoadingUpdatePlayer] = useState(null)

  const [newPlayerOpen, setNewPlayerOpen] = useState(false)

  const [deletePlayerOpen, setDeletePlayerDialogOpen] = useState(false)
  const [deletePlayerPlayer, setDeletePlayer] = useState(null)

  const [updatePlayerOpen, setUpdatePlayerDialogOpen] = useState(false)
  const [updatePlayerPlayer, setUpdatePlayer] = useState(null)

  const navigate = useNavigate()

  function openNewPlayer () {
    setNewPlayerOpen(true)
  }

  function closeNewPlayer () {
    setNewPlayerOpen(false)
  }

  function openUpdatePlayer () {
    setUpdatePlayerDialogOpen(true)
  }

  function closeUpdatePlayer () {
    setUpdatePlayerDialogOpen(false)
  }

  function openDeletePlayer (player) {
    setDeletePlayer(player)
    setDeletePlayerDialogOpen(true)
  }

  function closeDeletePlayer () {
    setDeletePlayerDialogOpen(false)
  }

  return (
    <Box>
      <Box textAlign='right' padding='0px 30px'>
        {
          loadingNewPlayer
          ?
          <Button aria-label='New user' variant='outlined' startIcon={<CircularProgress size="20px" />} onClick={openNewPlayer}>Add player</Button>
          :
          <Button aria-label='New user' variant='outlined' startIcon={<PersonAddAltRoundedIcon />} onClick={openNewPlayer}>Add player</Button>
        }
      </Box>
      <Box padding='10px 30px'>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label='simple table'>
            <TableHead>
              <TableRow className='data-table'>
                <TableCell sx={{ padding: '5px' }} align='center'>
                  <Typography textAlign='center' variant='button' component='div' className='white'>Name</Typography>
                </TableCell>
                <TableCell sx={{ padding: '5px' }} align='center'>
                  <Typography textAlign='center' variant='button' component='div' className='white'>ID</Typography>
                </TableCell>
                <TableCell sx={{ padding: '5px' }} align='center'>
                  <Typography textAlign='center' variant='button' component='div' className='white'>Number</Typography>
                </TableCell>
                <TableCell sx={{ padding: '5px' }} align='center'>
                  <Typography textAlign='center' variant='button' component='div' className='white'>Team</Typography>
                </TableCell>
                  <TableCell sx={{ padding: '5px' }} align='right'>
                    <Typography textAlign='right' variant='button' component='div' className='white'>Actions</Typography>
                  </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {competition.getPlayers().sort((a, b) => {
                return a.getName().localeCompare(b.getName())
              }).map(player => (
                <TableRow key={player.getID()} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ padding: '5px' }} align='center'>{player.getName()}</TableCell>
                  <TableCell sx={{ padding: '5px' }} align='center'>{player.getID()}</TableCell>
                  <TableCell sx={{ padding: '5px' }} align='center'>{player.getNumber()}</TableCell>
                  <TableCell sx={{ padding: '5px' }} align='center'>{player.getLatestTeamEntry() ? player.getCompetition().getTeam(player.getLatestTeamEntry().getID()).getName() : ''}</TableCell>
                  <TableCell sx={{ padding: '5px' }} align='right'>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right' }}>
                      {
                        loadingUpdatePlayer && (player.getID() === deletePlayerPlayer?.getID() || player.getID() === updatePlayerPlayer?.getID())
                        ?
                        <CircularProgress size="24px" />
                        :
                        <Icon size="20px" />
                      }
                      <IconButton size='small' edge='start' color='inherit' aria-label='menu' sx={{ ml: 2, mr: 1 }} onClick={() => { openUpdatePlayer(player) }} >
                        <EditRoundedIcon />
                      </IconButton>
                      <IconButton size='small' edge='start' color='inherit' aria-label='menu' sx={{ mr: 1 }} onClick={() => { openDeletePlayer(player) }} >
                        <DeleteRoundedIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      { newPlayerOpen ? <NewPlayerDialog competitionID={competitionID} setLoading={setLoadingNewPlayer} closeDialog={closeNewPlayer} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage}/> : null }
      { deletePlayerOpen ? <DeletePlayerDialog competitionID={competitionID} player={deletePlayerPlayer} setLoading={setLoadingUpdatePlayer} closeDialog={closeDeletePlayer} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage}/> : null }
      { updatePlayerOpen ? <EditPlayerDialog setLoading={setLoadingUpdatePlayer} closeDialog={closeUpdatePlayer} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} /> : null }
    </Box>
  )
}

export default PlayerTable
