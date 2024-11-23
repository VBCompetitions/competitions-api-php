import React, { useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import IconButton from '@mui/material/IconButton'
import Icon from '@mui/material/Icon'
import Paper from '@mui/material/Paper'
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useRouteLoaderData } from 'react-router-dom'

import DeletePlayer from './dialogs/DeletePlayer'
import UpdatePlayer from './dialogs/UpdatePlayer'
import NewPlayer from './dialogs/NewPlayer'
import Roles from '../../components/Roles'

function PlayerTable ({ competition, competitionID, setSuccessMessage, setErrorMessage }) {
  const [loadingNewPlayer, setLoadingNewPlayer] = useState(false)
  const [updating, setUpdating] = useState(null)

  const [newPlayerOpen, setNewPlayerOpen] = useState(false)

  const [deletePlayerOpen, setDeletePlayerDialogOpen] = useState(false)
  const [deletePlayerPlayer, setDeletePlayer] = useState(null)

  const [updatePlayerOpen, setUpdatePlayerDialogOpen] = useState(false)
  const [updatePlayerPlayer, setUpdatePlayer] = useState(null)

  const userInfo = useRouteLoaderData('root')

  function openNewPlayer () {
    setNewPlayerOpen(true)
  }

  function closeNewPlayer () {
    setNewPlayerOpen(false)
  }

  function openUpdatePlayer (player) {
    setUpdatePlayer(player)
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
          Roles.roleCheck(userInfo.roles, Roles.Player.create)
          ?
            loadingNewPlayer
            ?
            <Button aria-label='New user' variant='outlined' startIcon={<CircularProgress size="20px" />} onClick={openNewPlayer}>Add player</Button>
            :
            <Button aria-label='New user' variant='outlined' startIcon={<PersonAddAltRoundedIcon />} onClick={openNewPlayer}>Add player</Button>
          :
          null
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
                        updating && (player.getID() === deletePlayerPlayer?.getID() || player.getID() === updatePlayerPlayer?.getID())
                        ?
                        <CircularProgress size="24px" />
                        :
                        <Icon size="20px" />
                      }
                      <IconButton size='small' edge='start' color='inherit' aria-label='menu' sx={{ ml: 2, mr: 1 }} onClick={() => { openUpdatePlayer(player) }} >
                        <EditRoundedIcon color='action' />
                      </IconButton>
                      <IconButton size='small' edge='start' color='inherit' aria-label='menu' sx={{ mr: 1 }} onClick={() => { openDeletePlayer(player) }} >
                        <DeleteRoundedIcon color='action' />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      { newPlayerOpen ? <NewPlayer competitionID={competitionID} setLoading={setLoadingNewPlayer} closeDialog={closeNewPlayer} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage}/> : null }
      { deletePlayerOpen ? <DeletePlayer competitionID={competitionID} player={deletePlayerPlayer} setLoading={setUpdating} closeDialog={closeDeletePlayer} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage}/> : null }
      { updatePlayerOpen ? <UpdatePlayer competitionID={competitionID} player={updatePlayerPlayer} setUpdating={setUpdating} closeDialog={closeUpdatePlayer} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} /> : null }
    </Box>
  )
}

export default PlayerTable
