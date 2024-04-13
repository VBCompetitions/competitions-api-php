import React, { useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import Grid from '@mui/material/Unstable_Grid2'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { Link, useRouteLoaderData } from 'react-router-dom'

import { deleteCompetition, updateCompetition } from './apis/competitionAPI'
import Roles from './Roles'

export default function CompetitionCard ({ competition, setErrorMessage, triggerLoading, triggerRefresh }) {
  const [menuWindow, setMenuWindow] = useState(null)
  const [deleteCompetitionOpen, setDeleteCompetitionOpen] = useState(false)
  const [editCompetitionOpen, setEditCompetitionOpen] = useState(false)
  const [newCompetitionName, setNewCompetitionName] = useState(competition.name)
  const [updating, setUpdating] = useState(null)
  const userInfo = useRouteLoaderData('root')

  const openMenu = (event) => {
    setMenuWindow(event.currentTarget)
  }

  const closeMenu = () => {
    setMenuWindow(null)
  }

  const deleteCompetitionAction = async () => {
    triggerLoading()
    setUpdating(true)
    deleteCompetitionDialogClose()
    try {
      await deleteCompetition(competition.id)
      setUpdating(false)
    } catch (error) {
      setUpdating(false)
      setErrorMessage(error.message)
    }
    await triggerRefresh()
  }

  const deleteCompetitionDialogOpen = () => {
    setDeleteCompetitionOpen(true)
    closeMenu()
  }

  const deleteCompetitionDialogClose = () => {
    setDeleteCompetitionOpen(false)
  }

  const editCompetitionDialogOpen = () => {
    setEditCompetitionOpen(true)
    closeMenu()
  }

  const editCompetitionDialogClose = () => {
    setEditCompetitionOpen(false)
  }

  const editCompetitionDialogUpdate = async () => {
    triggerLoading()
    setUpdating(true)
    editCompetitionDialogClose()
    const updatedCompetition = {
      name: newCompetitionName,
    //   teams: [],
    //   stages: []
    }
    try {
      await updateCompetition(competition.id, updatedCompetition)
    } catch (error) {
      setErrorMessage(error.message)
    }
    await triggerRefresh()
    setUpdating(false)
  }

  const editCompetitionDialogNameChange = e => {
    setNewCompetitionName(e.target.value)
  }

  const competitionMenuActions = []

  if (Roles.roleCheck(userInfo.roles, Roles.Competition.update)) {
    competitionMenuActions.push(<MenuItem onClick={editCompetitionDialogOpen}>Edit</MenuItem>)
  }

  if (Roles.roleCheck(userInfo.roles, Roles.Competition.delete)) {
    competitionMenuActions.push(<MenuItem onClick={deleteCompetitionDialogOpen}>Delete</MenuItem>)
  }

  let competitionActions = ( <CardActions></CardActions> )
  if (competitionMenuActions.length > 0) {
    competitionActions = (
      <CardActions>
        {updating ? <Box sx={{ display: 'flex' }}><CircularProgress size="20px" /></Box> : null }
        <Box sx={{ width: "100%", textAlign: "right" }}>
          <IconButton size="small" aria-label="competition menu" aria-controls="menu-competition-card"
            aria-haspopup="true" onClick={openMenu} color="inherit">
            <MenuRoundedIcon color='action' />
          </IconButton>
          <Menu id="menu-competition-card" anchorEl={menuWindow} anchorOrigin={{ vertical: 'top', horizontal: 'right', }}
            keepMounted transformOrigin={{ vertical: 'top', horizontal: 'right', }}
            open={Boolean(menuWindow)} onClose={closeMenu}>
            {
              competitionMenuActions.map(menuItem => menuItem)
            }
          </Menu>
        </Box>
      </CardActions>
    )
  }

  return (
    <Grid>
      <Box sx={{ minWidth: 200 }}>
        <Card variant="outlined" sx={{ width: 250, height: 250 }}>
          <CardActionArea>
            <Link to={`/c/${competition.id}`}>
              <CardContent sx={{ height: 168 }}>
                <Typography textAlign='center' variant="body2" component="div" className={competition.complete ? 'green' : 'blue'} sx={{ marginBottom: '20px' }}>{competition.complete ? '[complete]' : '[ongoing]'}</Typography>
                {
                  competition.name.length > 50
                  ?
                  <Tooltip title={competition.name.substring(0, 150)} >
                    <Typography sx={{ height: '100%' }} variant="h5" component="div">{competition.name.substring(0, 49)}...</Typography>
                  </Tooltip>
                  :
                  <Typography sx={{ height: '100%' }} variant="h5" component="div">{competition.name}</Typography>
                }
              </CardContent>
            </Link>
          </CardActionArea>
          {competitionActions}
        </Card>
      </Box>
      <Dialog open={deleteCompetitionOpen} onClose={deleteCompetitionDialogClose} aria-labelledby="delete competition">
        <DialogTitle id="delete-competition-dialog-title">Delete Competition</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete the competition?</DialogContentText>
          <DialogContentText>Name: {competition.name}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={deleteCompetitionDialogClose} variant="outlined" color="primary">Cancel</Button>
          <Button onClick={deleteCompetitionAction} variant="contained" color="primary">Delete</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={editCompetitionOpen} onClose={editCompetitionDialogClose} aria-labelledby="edit competition">
        <DialogTitle id="edit-competition-dialog-title">Edit Competition</DialogTitle>
        <DialogContent>
          <DialogContentText>Edit the name for the competition</DialogContentText>
          <TextField autoFocus margin="dense" id="add-competition-name" onChange={editCompetitionDialogNameChange} label="Competition name" type="text" fullWidth defaultValue={competition.name} />
        </DialogContent>
        <DialogActions>
          <Button onClick={editCompetitionDialogClose} variant="outlined" color="primary">Cancel</Button>
          <Button onClick={editCompetitionDialogUpdate} variant="contained" color="primary">Update</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}
