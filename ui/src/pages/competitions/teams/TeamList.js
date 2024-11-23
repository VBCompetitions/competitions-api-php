import React, { useState } from 'react'

import AddRoundedIcon from '@mui/icons-material/AddRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Unstable_Grid2'
import TeamCard from './TeamCard.js'
import { useRouteLoaderData } from 'react-router-dom'

import NewTeam from './dialogs/NewTeam'
import Roles from '../../components/Roles'

// import { deleteCompetition, updateCompetition } from './apis/competitionAPI.js'

export default function TeamList ({ competition, competitionID, setLoading, setSuccessMessage, setErrorMessage }) {
  const [loadingNewTeam, setLoadingNewTeam] = useState(false)

  const [newTeamOpen, setNewTeamOpen] = useState(false)

  const userInfo = useRouteLoaderData('root')

  function openNewTeam () {
    setNewTeamOpen(true)
  }

  function closeNewTeam () {
    setNewTeamOpen(false)
  }

  return (
    <Box>
      <Grid container spacing={2}>
        {
          Roles.roleCheck(userInfo.roles, Roles.Team.create)
          ?
            loadingNewTeam
            ?
            <Box padding="8px" sx={{ width: 150, height: 120 }}>
              <Button aria-label="Add Team" variant="outlined" startIcon={<CircularProgress size="20px" />} onClick={openNewTeam} sx={{ backgroundColor: 'white', width: 150, height: 120 }}>Add Team</Button>
            </Box>
            :
            <Box padding="8px" sx={{ width: 150, height: 120 }}>
              <Button aria-label="Add Team" variant="outlined" startIcon={<AddRoundedIcon />} onClick={openNewTeam} sx={{ backgroundColor: 'white', width: 150, height: 120 }}>Add Team</Button>
            </Box>
          :
          null
        }
        {
          competition.getTeams().sort((a, b) => {
            return a.getName().localeCompare(b.getName())
          }).map(item => (
            <TeamCard key={item.id} competitionID={competitionID} team={item} setLoading={setLoading} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />
          ))
        }
      </Grid>
      { newTeamOpen ? <NewTeam competitionID={competitionID} setLoading={setLoadingNewTeam} closeDialog={closeNewTeam} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage}/> : null }
    </Box>
  )
}

