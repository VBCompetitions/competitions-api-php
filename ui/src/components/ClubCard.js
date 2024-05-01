import React, { useState } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Unstable_Grid2'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

function TeamCard ({ competition, club, selectAction, triggerLoading, triggerRefresh }) {
  const [menuWindow, setMenuWindow] = useState(null)
  const [deleteCompetitionOpen, setDeleteCompetitionOpen] = useState(false)
  const [editCompetitionOpen, setEditCompetitionOpen] = useState(false)
  const [newCompetitionName, setNewCompetitionName] = useState(competition.getName())
  const [updating, setUpdating] = useState(null)

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
      let response = await fetch(`${window.VBC_API_URL}/c/${competition.id}`, {
        method: 'DELETE',
        mode: "cors"
      })
      console.log(response)
    } catch (error) {
      console.log(`Error: ${error}`)
    }
    triggerRefresh()
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
      let response = await fetch(`${window.VBC_API_URL}/c/${competition.id}`, {
        method: 'PUT',
        mode: "cors",
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(updatedCompetition)
      })
      console.log(await response.json())
    } catch (error) {
      // setError(error)
      // setLoading(false)
      console.log(error.body)
    }
    await triggerRefresh()
    setUpdating(false)
  }

  const editCompetitionDialogNameChange = e => {
    setNewCompetitionName(e.target.value)
  }

  return (
    <Grid>
      <Box sx={{ minWidth: 150 }}>
        <Card variant="outlined" sx={{ width: 150, height: 120 }}>
          <CardActionArea onClick={() => {selectAction(competition.id)}}>
            <CardContent sx={{ height: 40 }}>
              {
                club.getName().length > 50
                ?
                <Tooltip title={club.getName().substring(0, 150)} >
                  <Typography sx={{ height: '100%' }} variant="body2" component="div">{club.getName().substring(0, 49)}...</Typography>
                </Tooltip>
                :
                <Typography sx={{ height: '100%' }} variant="body2" component="div">{club.getName()}</Typography>
              }
            </CardContent>
          </CardActionArea>
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
                <MenuItem onClick={editCompetitionDialogOpen}>Edit</MenuItem>
                <MenuItem onClick={deleteCompetitionDialogOpen}>Delete</MenuItem>
              </Menu>
            </Box>
          </CardActions>
        </Card>
      </Box>
    </Grid>
  )
}

export default TeamCard
