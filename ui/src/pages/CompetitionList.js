import React, { useState } from 'react'
import { Link, redirect, useLoaderData, useNavigate, useNavigation, useRouteLoaderData } from 'react-router-dom'

import AddRoundedIcon from '@mui/icons-material/AddRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Unstable_Grid2'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import Typography from '@mui/material/Typography'

import CompetitionAPI from '../apis/competitionAPI'
import CompetitionCard from '../components/CompetitionCard'
import Roles from '../components/Roles'
import NewCompetition from '../dialogs/competitions/NewCompetition'

export async function competitionListLoader() {
  const competitionAPI = new CompetitionAPI()
  try {
    const competitionList = await competitionAPI.getCompetitions()
    return competitionList
  } catch (err) {
    if (err.status === 401) {
      return redirect('/login?returnTo=/c')
    }
    throw err
  }
}

export default function CompetitionList ({ setSuccessMessage, setErrorMessage }) {
  const competitionList = useLoaderData()
  const userInfo = useRouteLoaderData('root')
  const navigate = useNavigate()
  const navigation = useNavigation()

  const [newCompetitionOpen, setNewCompetitionOpen] = useState(false)

  function openNewCompetition () {
    setNewCompetitionOpen(true)
  }

  function closeNewCompetition () {
    setNewCompetitionOpen(false)
  }

  function refreshList () {
    navigate('.', { replace: true })
  }

  function loadCompetition (competitionID) {
    navigate(`./${competitionID}`)
  }

  if (navigation.state !== 'idle') {
    return  (
      <Box padding="5px">
        <Box padding="10px 10px 5px 10px">
          <Box sx={{ display: 'flex' }}>
            <Typography sx={{ flexGrow: '1', marginBottom: '3px' }} variant="h5" textAlign="left" gutterBottom>Loading Competition...</Typography>
          </Box>
        </Box>
        <Box padding="10px">
          <LinearProgress />
        </Box>
      </Box>
    )
  }

  let newCompetitionButton = null
  if (Roles.roleCheck(userInfo.roles, Roles.Competition.create)) {
    newCompetitionButton = (
      <Box textAlign="left" paddingLeft="10px">
        <Button aria-label="New competition" variant="outlined" startIcon={<AddRoundedIcon />} onClick={openNewCompetition}>New Competition</Button>
      </Box>
    )
  }
  return (
    <Box padding="5px">
      <Box padding="10px 10px 5px 10px">
        <Box sx={{ display: 'flex' }}>
          <Link to={`/`}>
            <IconButton size="small" aria-label="refresh list" sx={{ marginRight: '10px' }}  color="inherit">
              <HomeRoundedIcon color='action' />
            </IconButton>
          </Link>
          <Typography sx={{ flexGrow: '1', marginBottom: '3px' }} variant="h5" textAlign="left" gutterBottom>Competitions</Typography>
          <IconButton size="small" aria-label="refresh list" onClick={() => { navigate('.', { replace: true }) }} color="inherit">
            <RefreshRoundedIcon color='action' />
          </IconButton>
        </Box>
      </Box>
      <Box padding="10px">
        <Divider sx={{ borderBottomWidth: 4, borderColor: '#1976d2' }} />
      </Box>
      {newCompetitionButton}
      <Box padding="10px">
        <Grid container spacing={2}>
          {competitionList.sort((a, b) => {
            if (a.complete && !b.complete) {
              return 1
            } else if (!a.complete && b.complete) {
              return -1
            }
            return a.name.localeCompare(b.name)
          }).map(item => (
            <CompetitionCard key={item.id} competition={item} triggerRefresh={refreshList} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />
          ))}
        </Grid>
      </Box>
      {
        newCompetitionOpen
        ?
        <NewCompetition closeDialog={closeNewCompetition} loadCompetition={loadCompetition} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />
        :
        null
      }
    </Box>
  )
}
