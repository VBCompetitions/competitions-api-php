import React, { useState } from 'react'
import { Link, redirect, useLoaderData, useNavigate, useNavigation, useRouteLoaderData } from 'react-router-dom'

import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import LinearProgress from '@mui/material/LinearProgress'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Grid from '@mui/material/Unstable_Grid2'
import IconButton from '@mui/material/IconButton'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import Typography from '@mui/material/Typography'

import ClubCard from './clubs/ClubCard.js'
import PlayerTable from './players/PlayerTable.js'
import TeamList from './teams/TeamList.js'
import GroupMatchSimple from './groups/GroupMatchSimple.js'
import GroupBreak from './groups/GroupBreak.js'
import { GroupMatch as CGroupMatch } from '@vbcompetitions/competitions'

import CompetitionAPI from '../../apis/competitionAPI.js'
import UpdateCompetition from './dialogs/UpdateCompetition.js'
import Roles from '../components/Roles'

export async function competitionLoader (url) {
  const competitionAPI = new CompetitionAPI()
  const competitionID = url.params.competitionID
  try {
    const competition = await competitionAPI.getCompetition(competitionID)
    return { competitionID, competition }
  } catch (err) {
    if (err.status === 401) {
      return redirect(`/login?returnTo=/c/${competitionID}`)
    }
    throw err
  }
}

export default function CompetitionViewer ({ setSuccessMessage, setErrorMessage }) {
  const { competitionID, competition } = useLoaderData()
  const simpleCompetition = {
    id: competitionID,
    name: competition.getName()
  }
  const navigate = useNavigate()
  const navigation = useNavigation()

  const [loading, setLoading] = useState(false)
  const [editCompetitionOpen, setEditCompetitionOpen] = useState(false)
  const userInfo = useRouteLoaderData('root')

  async function refreshCompetitionData() {
  //   setLoading(true)
  //   try {
  //     const competitionData = await fetch(`http://localhost/competitions-api-php/example/vbc/api/v1/c/${competitionID}`)
  //     const competitionJSON = await competitionData.text()
  //     const competition = await Competition.loadFromCompetitionJSON(competitionJSON)
  //     setCompetitionData(competition)
  //     setNewCompetitionName(competition.getName())
  //     setLoading(false)
  //   } catch (error) {
  //     setError(error)
  //     setLoading(false)
  //   }
  }

  function triggerLoading () {
    // setLoading(true)
  }

  const openEditCompetition = () => {
    setEditCompetitionOpen(true)
  }

  const closeEditCompetition = () => {
    setEditCompetitionOpen(false)
  }

  function addClubDialogOpen () {}

  if (navigation.state === 'loading') {
    return <Box padding="5px">
      <Box padding="10px 10px 5px 10px">
        <Box sx={{ display: 'flex' }}>
          <Link to={`/`}>
            <IconButton size="small" aria-label="refresh list" sx={{ marginRight: '10px' }}  color="inherit">
              <ArrowBackRoundedIcon color='action' />
            </IconButton>
          </Link>
          <Typography sx={{ flexGrow: '1', marginBottom: '3px' }} variant="h5" textAlign="left" gutterBottom>
            {
              navigation.location && navigation.location.pathname === '/c' ? 'Getting Competition List...' : 'Loading Competition...'
            }
          </Typography>
        </Box>
      </Box>
      <Box padding="10px">
        {navigation.location ? <LinearProgress /> : <Divider sx={{ borderBottomWidth: 4, borderColor: '#1976d2' }} />}
      </Box>
    </Box>
  }

  return (
    <Box padding="5px">
      <Box padding="10px 10px 5px 10px">
        <Box sx={{ display: 'flex' }}>
          <Link to={`/c`}>
            <IconButton size="small" aria-label="refresh list" sx={{ marginRight: '10px' }} color="inherit">
              <ArrowBackRoundedIcon color='action' />
            </IconButton>
          </Link>
          <Typography sx={{ flexGrow: '1', marginBottom: '3px' }} variant="h5" textAlign="left" gutterBottom>{competition.getName()}</Typography>
          {
            Roles.roleCheck(userInfo.roles, Roles.Competition.update)
            ?
            <IconButton size="small" aria-label="refresh list" sx={{ marginRight: '10px' }} onClick={openEditCompetition} color="inherit">
              <EditRoundedIcon color='action' />
            </IconButton>
            :
            null
          }
          <IconButton size="small" aria-label="refresh list" onClick={() => { navigate('.', { replace: true }) }} color="inherit">
            <RefreshRoundedIcon color='action' />
          </IconButton>
        </Box>
      </Box>
      <Box padding="10px">
        { navigation.location || loading ? <LinearProgress /> : <Divider sx={{ borderBottomWidth: 4, borderColor: '#1976d2' }} /> }
      </Box>
      <Box padding="10px">
        <Accordion sx={{ backgroundColor: '#1976d2', color: 'white' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} aria-controls="panel1-content" id="panel1-header"><Typography variant="h6" textAlign="left">Clubs</Typography></AccordionSummary>
          <AccordionDetails sx={{ backgroundColor: '#eaf5ff' }}>
            <Grid container spacing={2}>
              {competition.getClubs().sort((a, b) => {
                return a.getName().localeCompare(b.getName())
              }).map(item => (
                <ClubCard key={item.id} selectAction={() => { /* TODO */ }} competition={competition} club={item} triggerLoading={triggerLoading} triggerRefresh={refreshCompetitionData} />
              ))}
              <Box padding="8px" sx={{ width: 150, height: 120 }}>
                <Button aria-label="Club Team" variant="outlined" startIcon={<AddRoundedIcon />} onClick={addClubDialogOpen} sx={{ backgroundColor: 'white', width: 150, height: 120 }}>Add Club</Button>
              </Box>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>
      <Box padding="10px">
        <Accordion sx={{ backgroundColor: '#1976d2', color: 'white' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} aria-controls="panel1-content" id="panel1-header"><Typography variant="h6" textAlign="left">Teams</Typography></AccordionSummary>
          <AccordionDetails sx={{ backgroundColor: '#eaf5ff' }}>
            <TeamList competition={competition} competitionID={competitionID} setLoading={setLoading} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />
          </AccordionDetails>
        </Accordion>
      </Box>
      <Box padding="10px">
        <Accordion sx={{ backgroundColor: '#1976d2', color: 'white' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} aria-controls="panel1-content" id="panel1-header"><Typography variant="h6" textAlign="left">Players</Typography></AccordionSummary>
          <AccordionDetails sx={{ backgroundColor: '#eaf5ff' }}>
            <PlayerTable competition={competition} competitionID={competitionID} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />
          </AccordionDetails>
        </Accordion>
      </Box>
      <Box padding="10px">
        <Typography variant="subtitle1" textAlign="left" gutterBottom>Stages</Typography>
        {
          competition.getStages().map(stage => (
            <Accordion defaultExpanded={true} sx={{ backgroundColor: '#1976d2', color: 'white' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} aria-controls="panel1-content" id="panel1-header"><Typography variant="h6" textAlign="left">{stage.getName()}</Typography></AccordionSummary>
              <AccordionDetails sx={{ backgroundColor: '#eaf5ff' }}>
                {
                  Array.isArray(stage.getDescription())
                  ?
                  <Typography sx={{ color: 'black'}} variant="body2" textAlign="left">Description:<br/>{stage.getDescription().join(<br/>)}<br/><br/></Typography>
                  :
                  <></>
                }
                <Typography sx={{ color: 'black'}} variant="subtitle1" textAlign="left" gutterBottom>Groups</Typography>
                {
                  stage.getGroups().map(group => (
                    <Accordion sx={{ backgroundColor: '#1976d2', color: 'white' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }}/>} aria-controls="panel1-content" id="panel1-header"><Typography variant="h6" textAlign="left">{group.getName()}</Typography></AccordionSummary>
                      <AccordionDetails sx={{ backgroundColor: '#eaf5ff' }}>
                      {
                        Array.isArray(group.getDescription())
                        ?
                        <Typography sx={{ color: 'black'}} variant="body2" textAlign="left">Description:<br/>{group.getDescription().join(<br/>)}<br/><br/></Typography>
                        :
                        <></>
                      }
                      <Typography sx={{ color: 'black'}} variant="subtitle1" textAlign="left" gutterBottom>Matches</Typography>
                        {
                          group.getMatches().map(match => (
                            match instanceof CGroupMatch
                            ?
                            <GroupMatchSimple competition={competition} competitionID={competitionID} match={match} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />
                            :
                            <GroupBreak competition={competition} groupBreak={match} />
                          ))
                        }
                      </AccordionDetails>
                    </Accordion>
                  ))
                }
              </AccordionDetails>
            </Accordion>
          ))
        }
      </Box>
      { editCompetitionOpen ? <UpdateCompetition competition={simpleCompetition} closeDialog={closeEditCompetition} setUpdating={setLoading} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} /> : null }
    </Box>
  )
}
