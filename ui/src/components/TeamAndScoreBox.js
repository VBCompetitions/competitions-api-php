import React from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { MatchType } from '@vbcompetitions/competitions'

function TeamAndScoreBox ({ match, homeTeam, awayTeam }) {
  let homeWin = ''
  let awayWin = ''

  if (match.isComplete() && !match.isDraw()) {
    if (match.getWinnerTeamID() === homeTeam.getID()) {
      homeWin = '-winner'
    } else if (match.getWinnerTeamID() === awayTeam.getID()) {
      awayWin = '-winner'
    }
  }

  let result
  if (match.getGroup().getMatchType() === MatchType.CONTINUOUS) {
    result = (
      <Box className='team-and-score-score'>
        <Box className={`team-and-score-highlighted-score${homeWin}`}>
          <Typography variant='h6' component='span' className={`team-and-score-highlighted-score${homeWin}`}>{match.getHomeTeamScores()[0]}</Typography>
        </Box>
        <Box className={`team-and-score-highlighted-score${awayWin}`}>
          <Typography variant='h6' component='span' className={`team-and-score-highlighted-score${awayWin}`}>{match.getAwayTeamScores()[0]}</Typography>
        </Box>
      </Box>
    )
  } else {
    const homeTeamScores = match.getHomeTeamScores()
    const awayTeamScores = match.getAwayTeamScores()
    const setScores = [<Typography variant='body' component='span' className='team-and-score-highlighted-score'>&nbsp;</Typography>]

    for (let i = 0; i < homeTeamScores.length; i++) {
      let homeSetWin = ''
      let awaySetWin = ''
      if (homeTeamScores[i] > awayTeamScores[i]) {
        homeSetWin = '-winner'
      } else {
        awaySetWin = '-winner'
      }
      setScores.push(
        <>
          <Typography variant='body1' component='span' className={`team-and-score-set-score${homeSetWin}`}>{homeTeamScores[i]}</Typography>
          <Typography variant='body1' component='span' className='team-and-score-highlighted-score'>&#8209;</Typography>
          <Typography variant='body1' component='span' className={`team-and-score-set-score${awaySetWin}`}>{awayTeamScores[i]}</Typography>
          <Typography variant='body1' component='span' className='team-and-score-highlighted-score'>&nbsp;</Typography>
        </>
      )
    }
    result = (
      <Box className='team-and-score-score'>
        <Box sx={{ display: 'block' }}>
          <Box className={`team-and-score-highlighted-score${homeWin}`}>
            <Typography variant='h6' component='span' className={`team-and-score-highlighted-score${homeWin}`}>{match.getHomeTeamSets()}</Typography>
          </Box>
          <Box className={`team-and-score-highlighted-score${awayWin}`}>
            <Typography variant='h6' component='span' className={`team-and-score-highlighted-score${awayWin}`}>{match.getAwayTeamSets()}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'block' }}>
          {setScores}
        </Box>
        {
          match.getMVP()
          ?
          <>
            <br />
            <Typography className='team-and-score-mvp' variant='body2' component='span'>Match MPV: {match.getMVP()}</Typography>
          </>
          :
          null
        }
      </Box>
    )
  }

  let homeMVP
  if (match.getHomeTeam().getMVP()) {
    homeMVP = <Typography className='team-and-score-mvp' variant='body2' component='span'>Team MPV: {match.getHomeTeam().getMVP().getName()}</Typography>
  } else {
    homeMVP = <Typography className='team-and-score-mvp' variant='body2' component='span'></Typography>
  }
  let awayMVP
  if (match.getAwayTeam().getMVP()) {
    awayMVP = <Typography className='team-and-score-mvp' variant='body2' component='span'>Team MPV: {match.getAwayTeam().getMVP().getName()}</Typography>
  } else {
    awayMVP = <Typography className='team-and-score-mvp' variant='body2' component='span'></Typography>
  }

  return (
    <Box sx={{ padding: '10px 0px 0px 0px', display: 'flex' }}>
      <Box sx={{ display: 'inline' }}>
        <Typography className='team-and-score-team' variant='h6' component='span'>{homeTeam.getName()}</Typography>
        <br />
        {homeMVP}
      </Box>
      {result}
      <Box sx={{ display: 'inline' }}>
        <Typography className='team-and-score-team' variant='h6' component='span'>{awayTeam.getName()}</Typography>
        <br />
        {awayMVP}
      </Box>
    </Box>
  )
}

export default TeamAndScoreBox
