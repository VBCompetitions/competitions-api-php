import React, { useEffect, useState } from 'react'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

import { getSystemLogs } from '../../../apis/uidataAPI'

export default function LogsViewer ({ setLoading, setSuccessMessage, setErrorMessage }) {
  // TODO - pagination (with all the usual problems of the data changing under you while you're showing page 2)
  const [logLines, setLogLines] = useState([])

  useEffect(() => {
    downloadSystemLogs()
  }, [])

  async function downloadSystemLogs () {
    try {
      setLoading(true)
      const systemLogs = await getSystemLogs()
      const logLines = systemLogs.split(/[\r\n]+/)
      setLogLines(logLines)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      setErrorMessage(error.message)
    }
  }

  return (
    <Box sx={{ padding: '10px' }}>
      <TableContainer component={Paper}>
        <Table sx={{ padding: '10px', minWidth: 650 }} aria-label='simple table'>
          <TableHead>
            <TableRow className='data-table'>
              <TableCell align='center'>
                <Typography textAlign='center' variant='button' component='div' className='white'>Timestamp</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography textAlign='center' variant='button' component='div' className='white'>Level</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography textAlign='center' variant='button' component='div' className='white'>Message</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography textAlign='center' variant='button' component='div' className='white'>User</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography textAlign='center' variant='button' component='div' className='white'>App</Typography>
              </TableCell>
              <TableCell align='center'>
                <Typography textAlign='center' variant='button' component='div' className='white'>Context</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              logLines.map((logLine, index) => {
              let logLineParsed
              try {
                logLineParsed = JSON.parse(logLine)
                return (
                  <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell align='center'>{logLineParsed.timestamp}</TableCell>
                    <TableCell align='center'>{logLineParsed.level}</TableCell>
                    <TableCell align='left'>{logLineParsed.message}</TableCell>
                    <TableCell align='center'>{`${logLineParsed.username} (${logLineParsed.user_id})`}</TableCell>
                    <TableCell align='center'>{logLineParsed.app ? logLineParsed.app : 'VBC'}</TableCell>
                    <TableCell align='center'>{logLineParsed.context_id}</TableCell>
                  </TableRow>
                )
              } catch (err) {
                return null
              }
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
