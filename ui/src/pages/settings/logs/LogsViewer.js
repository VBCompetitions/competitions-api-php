import React, { useEffect, useState } from 'react'

import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import Select from '@mui/material/Select'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

import { getSystemLogs, getSystemLogsList } from '../../../apis/uidataAPI'

export default function LogsViewer ({ setLoading, setSuccessMessage, setErrorMessage }) {
  // const navigate = useNavigate()

  // TODO - pagination (with all the usual problems of the data changing under you while you're showing page 2)

  const [logLines, setLogLines] = useState([])
  const [systemLogsList, setSystemLogsList] = useState([])
  const [logDate, setLogDate] = useState([])

  useEffect(() => {
    downloadSystemLogs()
  }, [])

  async function downloadSystemLogs () {
    try {
      setLoading(true)
      const logList = await getSystemLogsList()
      setSystemLogsList(logList)
      const systemLogs = await getSystemLogs(logList[0])
      setLogDate(logList[0])
      const logLines = systemLogs.split(/[\r\n]+/)
      setLogLines(logLines)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      setErrorMessage(error.message)
    }
  }

  async function loadLogs (logDateRequested) {
    setLoading(true)
    try {
      setLogDate(logDateRequested)
      const systemLogs = await getSystemLogs(logDateRequested)
      const logLines = systemLogs.split(/[\r\n]+/)
      setLogLines(logLines)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      setErrorMessage(error.message)
    }
  }

  function changeLogDate (event) {
    loadLogs(event.target.value)
  }

  return (
    <Box sx={{ padding: '10px' }}>
      <Box padding="10px">
        <Box sx={{ display: 'flex' }}>
          <FormControl>
            <InputLabel id="select-log-date-label">Date</InputLabel>
            <Select
              labelId="select-log-date-label"
              id="select-log-date"
              value={logDate}
              label="Date"
              onChange={changeLogDate}
            >
              {
                systemLogsList.map(logDate => {
                  return (
                    <MenuItem key={logDate} value={logDate}>{logDate}</MenuItem>
                  )
                })
              }
            </Select>
          </FormControl>
          <Box sx={{ flexGrow: '1', marginBottom: '3px' }}></Box>
          <Box>
            <IconButton size="small" aria-label="refresh list" onClick={() => { loadLogs(logDate) }} color="inherit">
              <RefreshRoundedIcon color='action' />
            </IconButton>
          </Box>
        </Box>
      </Box>
      <Box>
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
                      <TableCell align='center' className='log-table'>{logLineParsed.datetime.split('T').join(' ')}</TableCell>
                      <TableCell align='center' className='log-table'>{logLineParsed.level_name}</TableCell>
                      <TableCell align='left' className='log-table'>{logLineParsed.message}</TableCell>
                      <TableCell align='center' className='log-table'>{`${logLineParsed.context.username} (${logLineParsed.context.user_id.substring(0, 8)})`}</TableCell>
                      <TableCell align='center' className='log-table'>{logLineParsed.context.app ? logLineParsed.context.app : 'VBC'}</TableCell>
                      <TableCell align='center' className='log-table'>{logLineParsed.context.id}</TableCell>
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
    </Box>
  )
}
