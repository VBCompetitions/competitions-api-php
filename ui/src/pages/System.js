import React, { useState } from 'react'
import { Link, redirect, useLoaderData, useNavigate, useRouteLoaderData } from 'react-router-dom'

import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import Divider from '@mui/material/Divider'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded'
import Paper from '@mui/material/Paper'
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'

import { getSystemLogs } from '../apis/uidataAPI'
import Roles, { InsufficientRoles } from '../components/Roles'

export default function System ({ setSuccessMessage, setErrorMessage }) {
  const [tab, setTab] = React.useState(0)
  const [systemLogs, setSystemLogs] = React.useState('')
  const [updating, setUpdating] = useState(false)

  const userInfo = useRouteLoaderData('root')

  async function downloadSystemLogs () {
    try {
      setUpdating(true)
      setSystemLogs(await getSystemLogs())
      setUpdating(false)
      setSuccessMessage('Logs retrieved')
    } catch (error) {
      setUpdating(false)
      setErrorMessage(error.message)
    }
  }

  function changeTab (_, tab) {
    setTab(tab)
    if (tab === 1) {
      downloadSystemLogs()
    }
  }

  let ui = ( <InsufficientRoles /> )
  if (Roles.roleCheck(userInfo.roles,[Roles.ADMIN])) {
    let panel
    switch (tab) {
      case 1:
        const logLines = systemLogs.split(/[\r\n]+/)
        panel = (
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
                      <Typography textAlign='center' variant='button' component='div' className='white'>Context</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logLines.map(logLine => {
                    let logLineParsed
                    try {
                      logLineParsed = JSON.parse(logLine)
                      return (
                        <TableRow key={logLineParsed.timestamp} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell align='center'>{logLineParsed.timestamp}</TableCell>
                          <TableCell align='center'>{logLineParsed.level}</TableCell>
                          <TableCell align='left'>{logLineParsed.message}</TableCell>
                          <TableCell align='center'>{`${logLineParsed.username} (${logLineParsed.user_id})`}</TableCell>
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
        break

      default:
        panel = (
          <p>Settings</p>
        )
    }
    ui = (
      <Box padding="5px">
        <Box padding="10px 10px 5px 10px">
          <Box sx={{ display: 'flex' }}>
            <Link to={`/`}>
              <IconButton size="small" aria-label="refresh list" sx={{ marginRight: '10px' }}  color="inherit">
                <HomeRoundedIcon color='action' />
              </IconButton>
            </Link>
            <Typography sx={{ flexGrow: '1', marginBottom: '3px' }} variant="h5" textAlign="left" gutterBottom>System</Typography>
          </Box>
        </Box>
        <Box padding="10px">
        {
          updating
          ?
          <LinearProgress />
          :
          <Divider sx={{ borderBottomWidth: 4, borderColor: '#1976d2' }} />
        }
        </Box>
        <Box padding="10px">
          <Tabs value={tab} onChange={changeTab} aria-label="basic tabs example">
            <Tab icon={<SettingsRoundedIcon />} iconPosition="start" label="Settings" id='simple-tab-settings' aria-controls='simple-tabpanel-0' />
            <Tab icon={<ArticleRoundedIcon />} iconPosition="start" label="Logs" id='simple-tab-logs' aria-controls='simple-tabpanel-1' />
          </Tabs>
        </Box>
        {panel}
      </Box>
    )
  }

  return ui
}

