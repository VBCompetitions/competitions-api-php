import React, { useEffect, useState } from 'react'
import { Link, redirect, useLoaderData, useNavigate, useParams, useRouteLoaderData } from 'react-router-dom'

import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import AppsRoundedIcon from '@mui/icons-material/AppsRounded'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'

import Roles, { InsufficientRoles } from '../components/Roles'

import LogsViewer from '../components/LogsViewer'
import AppsViewer from '../components/AppsViewer'

export default function Settings ({ tabSelected, setSuccessMessage, setErrorMessage }) {
  const navigate = useNavigate()

  const [tabID, setTabID] = useState(tabSelected)
  const [loading, setLoading] = useState(false)

  const userInfo = useRouteLoaderData('root')

  function changeTab (_, tab) {
    setTabID(tab)
    switch (tab) {
      case 0:
        navigate('/settings', { replace: true })
        break
      case 1:
        navigate('/settings/apps', { replace: true })
        break
      case 2:
        navigate('/settings/logs', { replace: true })
        break
    }
  }

  let ui = ( <InsufficientRoles /> )
  if (Roles.roleCheck(userInfo.roles, [Roles.ADMIN])) {
    let panel
    switch (tabID) {
      case 1:
        panel = (<AppsViewer setLoading={setLoading} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />)
        break
      case 2:
        panel = (<LogsViewer setLoading={setLoading} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />)
        break

      default:
        panel = (
          <p>Config</p>
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
            <Typography sx={{ flexGrow: '1', marginBottom: '3px' }} variant="h5" textAlign="left" gutterBottom>Settings</Typography>
          </Box>
        </Box>
        <Box padding="10px">
        {
          loading
          ?
          <LinearProgress />
          :
          <Divider sx={{ borderBottomWidth: 4, borderColor: '#1976d2' }} />
        }
        </Box>
        <Box padding="10px">
          <Tabs value={tabID} onChange={changeTab} aria-label="settings tabs">
            <Tab icon={<SettingsRoundedIcon />} iconPosition="start" label="Config" id='simple-tab-config' aria-controls='simple-tabpanel-0' />
            <Tab icon={<AppsRoundedIcon />} iconPosition="start" label="Apps" id='simple-tab-apps' aria-controls='simple-tabpanel-1' />
            <Tab icon={<ArticleRoundedIcon />} iconPosition="start" label="Logs" id='simple-tab-logs' aria-controls='simple-tabpanel-2' />
          </Tabs>
        </Box>
        {panel}
      </Box>
    )
  }

  return ui
}

