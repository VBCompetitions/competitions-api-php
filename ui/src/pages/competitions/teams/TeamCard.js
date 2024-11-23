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
import { useRouteLoaderData } from 'react-router-dom'

import DeleteTeam from './dialogs/DeleteTeam'
import UpdateTeam from './dialogs/UpdateTeam'
import Roles from '../../components/Roles'

export default function TeamCard ({ competitionID, team, setLoading, setSuccessMessage, setErrorMessage }) {
  const [menuWindow, setMenuWindow] = useState(null)
  const [deleteTeamOpen, setDeleteTeamOpen] = useState(false)
  const [updateTeamOpen, setUpdateTeamOpen] = useState(false)
  const [updating, setUpdating] = useState(null)
  const userInfo = useRouteLoaderData('root')

  const openMenu = (event) => {
    setMenuWindow(event.currentTarget)
  }

  const closeMenu = () => {
    setMenuWindow(null)
  }

  const openDeleteTeam = () => {
    setDeleteTeamOpen(true)
    closeMenu()
  }

  const closeDeleteTeam = () => {
    setDeleteTeamOpen(false)
  }

  const openEditTeam = () => {
    setUpdateTeamOpen(true)
    closeMenu()
  }

  const closeUpdateTeam = () => {
    setUpdateTeamOpen(false)
  }

  const teamMenuActions = []

  if (Roles.roleCheck(userInfo.roles, Roles.Team.update)) {
    teamMenuActions.push(<MenuItem onClick={openEditTeam}>Edit</MenuItem>)
  }

  if (Roles.roleCheck(userInfo.roles, Roles.Team.delete)) {
    teamMenuActions.push(<MenuItem onClick={openDeleteTeam}>Delete</MenuItem>)
  }

  let teamActions = ( <CardActions></CardActions> )
  if (teamMenuActions.length > 0) {
    teamActions = (
      <CardActions>
        {
          updating ? <Box sx={{ display: 'flex' }}><CircularProgress size="20px" /></Box> : null
        }
        <Box sx={{ width: "100%", textAlign: "right" }}>
          <IconButton size="small" aria-label="team menu" aria-controls="menu-team-card"
            aria-haspopup="true" onClick={openMenu} color="inherit">
            <MenuRoundedIcon color='action' />
          </IconButton>
          <Menu id="menu-team-card" anchorEl={menuWindow} anchorOrigin={{ vertical: 'top', horizontal: 'right', }}
            keepMounted transformOrigin={{ vertical: 'top', horizontal: 'right', }}
            open={Boolean(menuWindow)} onClose={closeMenu}>
            {
              teamMenuActions.map(menuItem => menuItem)
            }
          </Menu>
        </Box>
      </CardActions>
    )
  }

  return (
    <Grid>
      <Box sx={{ minWidth: 150 }}>
        <Card variant="outlined" sx={{ width: 150, height: 120 }}>
          <CardActionArea>
            <CardContent sx={{ height: 40 }}>
              {
                team.getName().length > 50
                ?
                <Tooltip title={team.getName().substring(0, 150)} >
                  <Typography sx={{ height: '100%' }} variant="body2" component="div">{team.getName().substring(0, 49)}...</Typography>
                </Tooltip>
                :
                <Typography sx={{ height: '100%' }} variant="body2" component="div">{team.getName()}</Typography>
              }
            </CardContent>
          </CardActionArea>
          {teamActions}
        </Card>
      </Box>
      { deleteTeamOpen ? <DeleteTeam competitionID={competitionID} team={team} closeDialog={closeDeleteTeam} setLoading={setLoading} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage}/> : null }
      { updateTeamOpen ? <UpdateTeam competitionID={competitionID} team={team} closeDialog={closeUpdateTeam} setUpdating={setUpdating} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} /> : null }
    </Grid>
  )
}
