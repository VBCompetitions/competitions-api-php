import React, { useState } from 'react'
import { Link, redirect, useLoaderData, useNavigate, useNavigation } from 'react-router-dom'

import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import Divider from '@mui/material/Divider'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import LinearProgress from '@mui/material/LinearProgress'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Grid from '@mui/material/Unstable_Grid2'
import IconButton from '@mui/material/IconButton'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import ClubCard from '../components/ClubCard.js'
import PlayerTable from '../components/PlayerTable.js'
import TeamCard from '../components/TeamCard.js'
import GroupMatchSimple from '../components/GroupMatchSimple.js'
import GroupBreak from '../components/GroupBreak.js'
import { GroupMatch as CGroupMatch } from '@vbcompetitions/competitions'

import CompetitionAPI from '../apis/competitionAPI'

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

export default function CompetitionViewer ({ selectCompetition, setSuccessMessage, setErrorMessage }) {
  const { competitionID, competition } = useLoaderData()
  const navigate = useNavigate()
  const navigation = useNavigation()

  // const [competition, setCompetitionData] = useState(null)
  // const [loading, setLoading] = useState(true)
  // const [error, setError] = useState(null)
  const [editCompetitionOpen, setEditCompetitionOpen] = useState(false)
  // const [newCompetitionName, setNewCompetitionName] = useState(null)

  // const competitionID = useLoaderData()

  // useEffect(() => {
  //   refreshCompetitionData()
  // }, [])

  function returnToList () {
    // selectCompetition()
  }

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

  const editCompetitionDialogOpen = () => {
    setEditCompetitionOpen(true)
  }

  const editCompetitionDialogClose = () => {
    setEditCompetitionOpen(false)
  }

  const editCompetitionDialogUpdate = async () => {
    // setLoading(true)
    // editCompetitionDialogClose()
    // const updatedCompetition = {
    //   name: newCompetitionName,
    // //   teams: [],
    // //   stages: []
    // }
    // try {
    //   let response = await fetch(`http://localhost/competitions-api-php/example/api/v1/c/${competitionID}`, {
    //     method: 'PUT',
    //     mode: "cors",
    //     headers: { 'content-type': 'application/json' },
    //     body: JSON.stringify(updatedCompetition)
    //   })
    //   console.log(await response.json())
    // } catch (error) {
    //   // setError(error)
    //   // setLoading(false)
    //   console.log(error.body)
    // }
    // await refreshCompetitionData()
    // setLoading(false)
  }

  const editCompetitionDialogNameChange = e => {
    // setNewCompetitionName(e.target.value)
  }

  function addTeamDialogOpen () {}

  function addClubDialogOpen () {}

  console.log(navigation)

  if (navigation.state === 'loading') {
    console.log(navigation)
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
            <IconButton size="small" aria-label="refresh list" sx={{ marginRight: '10px' }} onClick={returnToList} color="inherit">
              <ArrowBackRoundedIcon color='action' />
            </IconButton>
          </Link>
          <Typography sx={{ flexGrow: '1', marginBottom: '3px' }} variant="h5" textAlign="left" gutterBottom>{competition.getName()}</Typography>
          <IconButton size="small" aria-label="refresh list" sx={{ marginRight: '10px' }} onClick={editCompetitionDialogOpen} color="inherit">
            <EditRoundedIcon color='action' />
          </IconButton>
          <IconButton size="small" aria-label="refresh list" onClick={() => { navigate('.', { replace: true }) }} color="inherit">
            <RefreshRoundedIcon color='action' />
          </IconButton>
        </Box>
      </Box>
      <Box padding="10px">
        {navigation.location ? <LinearProgress /> : <Divider sx={{ borderBottomWidth: 4, borderColor: '#1976d2' }} />}
      </Box>
      <Box padding="10px">
        <Accordion sx={{ backgroundColor: '#1976d2', color: 'white' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} aria-controls="panel1-content" id="panel1-header"><Typography variant="h6" textAlign="left">Clubs</Typography></AccordionSummary>
          <AccordionDetails sx={{ backgroundColor: '#eaf5ff' }}>
            <Grid container spacing={2}>
              {competition.getClubs().sort((a, b) => {
                return a.getName().localeCompare(b.getName())
              }).map(item => (
                <ClubCard key={item.id} selectAction={selectCompetition} competition={competition} club={item} triggerLoading={triggerLoading} triggerRefresh={refreshCompetitionData} />
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
            <Grid container spacing={2}>
              {competition.getTeams().sort((a, b) => {
                return a.getName().localeCompare(b.getName())
              }).map(item => (
                <TeamCard key={item.id} selectAction={selectCompetition} competition={competition} setErrorMessage={setErrorMessage} team={item} triggerLoading={triggerLoading} triggerRefresh={refreshCompetitionData} />
              ))}
              <Box padding="8px" sx={{ width: 150, height: 120 }}>
                <Button aria-label="Add Team" variant="outlined" startIcon={<AddRoundedIcon />} onClick={addTeamDialogOpen} sx={{ backgroundColor: 'white', width: 150, height: 120 }}>Add Team</Button>
              </Box>
            </Grid>
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
      <Dialog open={editCompetitionOpen} onClose={editCompetitionDialogClose} aria-labelledby="edit competition">
        <DialogTitle id="edit-competition-dialog-title">Edit Competition</DialogTitle>
        <DialogContent>
          <DialogContentText>Edit the name for the competition</DialogContentText>
          <TextField autoFocus margin="dense" id="add-competition-name" onChange={editCompetitionDialogNameChange} label="Competition name" type="text" fullWidth defaultValue={competition.getName()} />
        </DialogContent>
        <DialogActions>
          <Button onClick={editCompetitionDialogClose} variant="outlined" color="primary">Cancel</Button>
          <Button onClick={editCompetitionDialogUpdate} variant="contained" color="primary">Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
