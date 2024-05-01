import React from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'

function GroupBreak ({ competition, groupBreak }) {

  return (
    <Box sx={{ padding: '2px 0px' }}>
      <Card width='100%' sx={{ padding: '2px 5px' }}>
        <Typography variant="h6" textAlign="left">{groupBreak.getName()}</Typography>
      </Card>
    </Box>
  )
}

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

export default GroupBreak
