import React, { useState } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import ScoreboardRoundedIcon from '@mui/icons-material/ScoreboardRounded';
import Typography from '@mui/material/Typography'
import { useRouteLoaderData } from 'react-router-dom'

// import { GroupMatch as CGroupMatch } from '@vbcompetitions/competitions'
import TeamAndScoreBox from './TeamAndScoreBox.js'
import MatchResultDialog from './MatchResultDialog.js'
import Roles from './Roles.js'

function GroupMatchSimple ({ competition, competitionID, match, setSuccessMessage, setErrorMessage }) {
  const [updating, setUpdating] = useState(null)
  // const [menuWindow, setMenuWindow] = useState(null)
  const [updateScoreOpen, setUpdateScoreOpen] = useState(false)
  // const [editMatchOpen, setEditMatchOpen] = useState(false)
  // const [deleteMatchOpen, setDeleteMatchOpen] = useState(false)
  const userInfo = useRouteLoaderData('root')

  // const openMenu = (event) => {
  //   setMenuWindow(event.currentTarget)
  // }

  const openUpdateScore = () => {
    setUpdateScoreOpen(true)
  }

  const closeUpdateScore = () => {
    setUpdateScoreOpen(false)
  }

  // const closeMenu = () => {
  //   setMenuWindow(null)
  // }

  // const deleteMatchDialogOpen = () => {
  //   setDeleteMatchOpen(true)
  //   closeMenu()
  // }

  // const deleteMatchDialogClose = () => {
  //   setDeleteMatchOpen(false)
  // }

  // const editMatchDialogOpen = () => {
  //   setEditMatchOpen(true)
  //   closeMenu()
  // }

  // const editMatchDialogClose = () => {
  //   setEditMatchOpen(false)
  // }

  const awayTeam = competition.getTeamByID(match.getAwayTeam().getID())
  const homeTeam = competition.getTeamByID(match.getHomeTeam().getID())

  const matchID = <div><Typography variant='subtitle2' component='span'>Match ID: </Typography><Typography variant='caption text' component='span'>{match.getID()}</Typography><br /></div>

  let court = ''
  if (match.hasCourt()) {
    court = <div><Typography variant='subtitle2' component='span'>Court: </Typography><Typography variant='caption text' component='span'>{match.getCourt()}</Typography><br /></div>
  }

  let venue = ''
  if (match.hasVenue()) {
    venue = <div><Typography variant='subtitle2' component='span'>Venue: </Typography><Typography variant='caption text' component='span'>{match.getVenue()}</Typography><br /></div>
  }

  let date = ''
  if (match.hasDate()) {
    date = <div><Typography variant='subtitle2' component='span'>Date: </Typography><Typography variant='caption text' component='span'>{match.getDate()}</Typography><br /></div>
  }

  let warmup = ''
  if (match.hasWarmup()) {
    warmup = <div><Typography variant='subtitle2' component='span'>Warm up: </Typography><Typography variant='caption text' component='span'>{match.getWarmup()}</Typography><br /></div>
  }
  let start = ''
  if (match.hasStart()) {
    start = <div><Typography variant='subtitle2' component='span'>Start: </Typography><Typography variant='caption text' component='span'>{match.getStart()}</Typography><br /></div>
  }
  let duration = ''
  if (match.hasDuration()) {
    duration = <div><Typography variant='subtitle2' component='span'>Duration: </Typography><Typography variant='caption text' component='span'>{match.getDuration()}</Typography><br /></div>
  }

  let matchActions = []
  if (updating) {
    matchActions.push(<Box sx={{ padding: '5px 5px', display: 'inline' }}><CircularProgress size='20px' /></Box>)
  }

  if (Roles.roleCheck(userInfo.roles, Roles.Match.results)) {
    matchActions.push(
      <Box sx={{ padding: '0px 10px', display: 'inline' }}>
        <IconButton size='small' aria-label='match score' aria-controls='score-match-card'
          aria-haspopup='true' onClick={openUpdateScore} color='inherit'>
          <ScoreboardRoundedIcon color='action' />
        </IconButton>
      </Box>
    )
  }

  if (Roles.roleCheck(userInfo.roles, Roles.Match.edit)) {
    matchActions.push(
      <Box sx={{ padding: '0px 10px', display: 'inline' }}>
        <IconButton  size='small' aria-label='match edit' aria-controls='edit-match-card'
          aria-haspopup='true' /*onClick={openMenu}*/ color='inherit'>
          <EditRoundedIcon color='action' />
        </IconButton>
      </Box>
    )
  }

  if (Roles.roleCheck(userInfo.roles, Roles.Match.delete)) {
    matchActions.push(
      <Box sx={{ padding: '0px 10px', display: 'inline' }}>
        <IconButton size='small' aria-label='match delete' aria-controls='delete-match-card'
          aria-haspopup='true' /*onClick={openMenu}*/ color='inherit'>
          <DeleteRoundedIcon color='action' />
        </IconButton>
      </Box>
    )
  }

  return (
    <Box sx={{ padding: '2px 0px' }}>
      <Card width='100%' sx={{ padding: '1px 1px' }}>
        <CardContent sx={{ padding: '5px 5px', display: 'flex' }}>
          <Box className='group-match'>
            <Box className='group-match-info'>
              <Box style={{paddingRight: '16px', textAlign: 'left' }}>
                {matchID}
                {date}
                {venue}
              </Box>
              <Box style={{paddingRight: '16px', textAlign: 'left' }}>
                {warmup}
                {start}
                {duration}
              </Box>
              <Box style={{ textAlign: 'left' }} display='inline'>
                {court}
              </Box>
            </Box>
            <Box className='group-match-team-score'>
              <TeamAndScoreBox competition={competition} match={match} homeTeam={homeTeam} awayTeam={awayTeam} />
            </Box>
            <Box className='group-match-empty'></Box>
            <Box className='group-match-actions'>
              {matchActions.map(action => action)}
            </Box>
          </Box>
        </CardContent>
      </Card>
      <MatchResultDialog competitionID={competitionID} match={match} homeTeam={homeTeam} awayTeam={awayTeam} dialogOpen={updateScoreOpen} closeDialog={closeUpdateScore} setUpdating={setUpdating} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />
    </Box>
  )
}

            // <IconButton size='small' aria-label='match menu' aria-controls='menu-match-card'
            //   aria-haspopup='true' onClick={openMenu} color='inherit'>
            //   <MenuRoundedIcon color='action' />
            // </IconButton>
            // <Menu id='menu-match-card' anchorEl={menuWindow} anchorOrigin={{ vertical: 'top', horizontal: 'right', }}
            //   keepMounted transformOrigin={{ vertical: 'top', horizontal: 'right', }}
            //   open={Boolean(menuWindow)} onClose={closeMenu}>
            //   <MenuItem onClick={editMatchDialogOpen}>Edit</MenuItem>
            //   <MenuItem onClick={deleteMatchDialogOpen}>Delete</MenuItem>
            // </Menu>

/*

**metadata**

id
court
venue
type
date
warmup
start
duration
complete?
officials
  team
  --OR--
  first
  second
  challenge
  assistantChallenge
  reserve
  scorer
  assistantScorer
  linespersons[]
  ballCrew[]
mvp
manager
friendly?
notes

** team and result **
homeTeam
  id
  scores
  mvp
  forfeit
  bonusPoints
  penaltyPoints
  notes
  players
awayTeam
  id
  scores
  mvp
  forfeit
  bonusPoints
  penaltyPoints
  notes
  players

*/

/* all values
id
court
venue
type
date
warmup
start
duration
complete?
homeTeam
  id
  scores
  mvp
  forfeit
  bonusPoints
  penaltyPoints
  notes
  players
awayTeam
  id
  scores
  mvp
  forfeit
  bonusPoints
  penaltyPoints
  notes
  players
officials
  team
  --OR--
  first
  second
  challenge
  assistantChallenge
  reserve
  scorer
  assistantScorer
  linespersons[]
  ballCrew[]
mvp
manager
friendly?
notes
*/

export default GroupMatchSimple
