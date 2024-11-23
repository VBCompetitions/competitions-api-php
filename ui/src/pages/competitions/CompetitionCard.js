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
import { Link, useRouteLoaderData } from 'react-router-dom'

import UpdateCompetition from './dialogs/UpdateCompetition'
import DeleteCompetition from './dialogs/DeleteCompetition'
import Roles from '../components/Roles'

export default function CompetitionCard ({ competition, setLoading, setSuccessMessage, setErrorMessage }) {
  const [menuWindow, setMenuWindow] = useState(null)
  const [deleteCompetitionOpen, setDeleteCompetitionOpen] = useState(false)
  const [updateCompetitionOpen, setUpdateCompetitionOpen] = useState(false)
  const [updating, setUpdating] = useState(null)
  const userInfo = useRouteLoaderData('root')

  const openMenu = (event) => {
    setMenuWindow(event.currentTarget)
  }

  const closeMenu = () => {
    setMenuWindow(null)
  }

  const openDeleteCompetition = () => {
    setDeleteCompetitionOpen(true)
    closeMenu()
  }

  const closeDeleteCompetition = () => {
    setDeleteCompetitionOpen(false)
  }

  const openEditCompetition = () => {
    setUpdateCompetitionOpen(true)
    closeMenu()
  }

  const closeEditCompetition = () => {
    setUpdateCompetitionOpen(false)
  }

  const competitionMenuActions = []

  if (Roles.roleCheck(userInfo.roles, Roles.Competition.update)) {
    competitionMenuActions.push(<MenuItem onClick={openEditCompetition}>Edit</MenuItem>)
  }

  if (Roles.roleCheck(userInfo.roles, Roles.Competition.delete)) {
    competitionMenuActions.push(<MenuItem onClick={openDeleteCompetition}>Delete</MenuItem>)
  }

  let competitionActions = ( <CardActions></CardActions> )
  if (competitionMenuActions.length > 0) {
    competitionActions = (
      <CardActions>
        { updating ? <Box sx={{ display: 'flex' }}><CircularProgress size="20px" /></Box> : null }
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
      { deleteCompetitionOpen ? <DeleteCompetition competition={competition} closeDialog={closeDeleteCompetition} setLoading={setLoading} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} /> : null }
      { updateCompetitionOpen ? <UpdateCompetition competition={competition} closeDialog={closeEditCompetition} setUpdating={setUpdating} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} /> : null }
    </Grid>
  )
}
