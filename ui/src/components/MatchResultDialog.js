import React, { useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import Divider from '@mui/material/Divider'

import { MatchType } from '@vbcompetitions/competitions'
import { updateMatch } from '../apis/competitionAPI.js'

function MatchResultDialog ({ competitionID, match, homeTeam, awayTeam, dialogOpen, closeDialog, setUpdating, setSuccessMessage, setErrorMessage }) {
  const initialScoresData = { homeScores: [], awayScores: [] }
  for (let i = 0; i < match.getHomeTeamScores().length; i++) {
    initialScoresData.homeScores.push(match.getHomeTeamScores()[i])
    initialScoresData.awayScores.push(match.getAwayTeamScores()[i])
  }

  const [scores, setScores] = useState(initialScoresData)
  let homeWin = ''
  let awayWin = ''


  const handleScoreChange = (e, homeTeam, set) => {
    if (isNaN(parseInt(e.target.value)) && e.target.value !== '') {
      return
    }

    if (set > scores.homeScores.length) {
      while (scores.homeScores.length < set) {
        scores.homeScores.push(0)
        scores.awayScores.push(0)
      }
    }

    if (homeTeam) {
      scores.homeScores[set - 1] = e.target.value === '' ? '' : parseInt(e.target.value)
    } else {
      scores.awayScores[set - 1] = e.target.value === '' ? '' : parseInt(e.target.value)
    }

    for (let i = scores.homeScores.length - 1; i >= 0; i--) {
      if ((scores.homeScores[i] === 0 || scores.homeScores[i] === '') &&
          (scores.awayScores[i] === 0 || scores.awayScores[i] === '')) {
        scores.homeScores.pop()
        scores.awayScores.pop()
      } else {
        break
      }
    }
    setScores(scores)
  }

  if (match.isComplete()) {
    if (match.getWinnerTeamID() === homeTeam.getID()) {
      homeWin = '-winner'
    } else if (match.getWinnerTeamID() === awayTeam.getID()) {
      awayWin = '-winner'
    }
  }

  let sets = null
  let points = []
  if (match.getGroup().getMatchType() === MatchType.SETS) {
    sets = (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box className={`team-and-score-highlighted-score${homeWin}`}>
          <Typography variant="h6" component='span' className={`team-and-score-highlighted-score${homeWin}`}>{match.getHomeTeamSets()}</Typography>
        </Box>
        <Box className={`team-and-score-highlighted-score${awayWin}`}>
          <Typography variant="h6" component='span' className={`team-and-score-highlighted-score${awayWin}`}>{match.getAwayTeamSets()}</Typography>
        </Box>
      </Box>
    )

    for (let i = 1; i <= match.getGroup().getSetConfig().getMaxSets(); i++ ) {
      points.push(
        <Box sx={{ display: 'flex' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '50%', borderStyle: 'solid', borderWidth: '0px 1px 0px 0px', borderColor: '#d7d7d7', padding: '0px 5px' }}>
            <DialogContentText  sx={{ flexGrow: '1', textAlign: 'right', padding: '0px 10px' }} >{`Set\u00A0${i}`}</DialogContentText>
            <TextField sx={{ width: '55px', minWidth: '40px' }} autoFocus margin="dense" size="small" id="score-save-name" defaultValue={match.getHomeTeamScores().length >= i ? match.getHomeTeamScores()[i - 1] : ''} onChange={e => { handleScoreChange(e, true, i) }} type="text"/>
          </Box>
          <Box sx={{ display: 'flex', width: '50%', padding: '0px 5px' }}>
            <TextField sx={{ width: '55px', minWidth: '40px' }} margin="dense" size="small" id="score-save-name" defaultValue={match.getAwayTeamScores().length > (i - 1) ? match.getAwayTeamScores()[i - 1] : ''} onChange={e => { handleScoreChange(e, false, i)} } type="text"/>
          </Box>
        </Box>
      )
    }
  } else {

  }

  const scoreEntrySave = async () => {
    const stageID = match.getGroup().getStage().getID()
    const groupID = match.getGroup().getID()

    try {
      match.setScores(scores.homeScores, scores.awayScores, true)
    } catch (error) {
      setErrorMessage(error.message)
      return
    }

    const matchData = match.serialize()
    try {
      setUpdating(true)
      closeDialog()
      await updateMatch(competitionID, stageID, groupID, match.getID(), matchData)
      setUpdating(false)
      setSuccessMessage('Match updated')
    } catch (error) {
      setUpdating(false)
      setErrorMessage(error.message)
    }
  }

  return (
    <Dialog open={dialogOpen} aria-labelledby="add new competition">
      <DialogTitle id="add-competition-dialog-title">Update score</DialogTitle>
      <DialogContent>
        <Box id='teams' sx={{ minWidth: '100px', maxWidth: '500px', display: 'flex' }}>
          <Box id='homeTeam' sx={{ width: '50%', justifyContent: "center", display: 'flex' }}>
            <Typography sx={{ padding: '5px 10px', display: 'inline' }} variant="h6" component='span' textAlign='center'>{homeTeam.getName()}</Typography>
          </Box>
          <Box id='awayTeam' sx={{ width: '50%', justifyContent: "center", display: 'flex' }}>
            <Typography sx={{ padding: '5px 10px', display: 'inline', justifyContent: "center" }} variant="h6" component='span' textAlign='center'>{awayTeam.getName()}</Typography>
          </Box>
        </Box>
        <Divider />
        <Box sx ={{ padding: '5px 0px' }}>
          {sets}
        </Box>
        <Box sx ={{ padding: '5px 0px' }}>
          {points}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} variant="outlined" color="primary">Cancel</Button>
        <Button onClick={scoreEntrySave} variant="contained" color="primary">Save</Button>
      </DialogActions>
    </Dialog>
  )
}

export default MatchResultDialog
