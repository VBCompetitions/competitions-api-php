import React, { useState } from 'react'
import { Link, redirect, useLoaderData, useNavigate, useNavigation, useRouteLoaderData } from 'react-router-dom'

import AddRoundedIcon from '@mui/icons-material/AddRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Unstable_Grid2'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { createCompetition, getCompetitions } from '../apis/competitionAPI.js'
import CompetitionCard from '../components/CompetitionCard.js'
import Roles from '../components/Roles.js'


export async function competitionListLoader() {
  try {
    const competitionList = await getCompetitions()
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

  // const [data, setData] = useState([])
  // const [loading, setLoading] = useState(false)
  const [addCompetitionOpen, setAddCompetitionOpen] = useState(false)
  const [newCompetitionName, setNewCompetitionName] = useState(null)

  // useEffect(() => {
  //   refreshCompetitionList()
  // }, [])

  // async function refreshCompetitionList () {
  //   setLoading(true)
  //   try {
  //     let competitionList = await fetch('http://localhost/competitions-api-php/example/vbc/api/v1/c')
  //     competitionList = await competitionList.json()
  //     setData(competitionList)
  //     setLoading(false)
  //   } catch (error) {
  //     setError(error)
  //     setLoading(false)
  //   }
  // }

  function triggerLoading () {
    // setLoading(true)
  }

  function newCompetitionDialogOpen () {
    setAddCompetitionOpen(true)
  }

  function newCompetitionDialogClose () {
    setAddCompetitionOpen(false)
  }

  async function newCompetitionAction () {
    // setLoading(true)
    newCompetitionDialogClose()
    const newCompetition = {
      name: newCompetitionName,
      teams: [],
      stages: []
    }
    try {
      //const newC =
      await createCompetition(newCompetition)
    } catch (error) {
      setErrorMessage(error.message)
      // setLoading(false)
    }
    // refreshCompetitionList()
  }

  function newCompetitionDialogNameChange (e) {
    setNewCompetitionName(e.target.value)
  }

  // if (error) {
  //   return <div>Error: {error.message}</div>
  // }

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
        <Button aria-label="New competition" variant="outlined" startIcon={<AddRoundedIcon />} onClick={newCompetitionDialogOpen}>New Competition</Button>
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
            <CompetitionCard key={item.id} competition={item} setErrorMessage={setErrorMessage} triggerLoading={triggerLoading} triggerRefresh={ () => {} /*refreshCompetitionList*/} />
          ))}
        </Grid>
      </Box>
      <Dialog open={addCompetitionOpen} onClose={newCompetitionDialogClose} aria-labelledby="add new competition">
        <DialogTitle id="add-competition-dialog-title">New Competition</DialogTitle>
        <DialogContent>
          <DialogContentText>Enter the name for the new competition</DialogContentText>
          <TextField autoFocus margin="dense" id="add-competition-name" onChange={newCompetitionDialogNameChange} label="Competition name" type="text" fullWidth/>
        </DialogContent>
        <DialogActions>
          <Button onClick={newCompetitionDialogClose} variant="outlined" color="primary">Cancel</Button>
          <Button onClick={newCompetitionAction} variant="contained" color="primary">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
