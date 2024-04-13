import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default function ErrorPage () {

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '500px' }}>
      <Box padding="10px 10px 5px 10px">
        <Typography sx={{ flexGrow: '1', marginBottom: '0' }} variant="h5" textAlign="left" gutterBottom>{'Oops! Something went wrong'}</Typography>
      </Box>
    </Box>
  )
}

