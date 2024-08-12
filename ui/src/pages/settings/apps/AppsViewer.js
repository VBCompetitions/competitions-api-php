import React, { useEffect, useState } from 'react'

import AddRoundedIcon from '@mui/icons-material/AddRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

import NewApp from './dialogs/NewApp'
import UpdateApp from './dialogs/UpdateApp'
import DeleteApp from './dialogs/DeleteApp'

import { getApps } from '../../../apis/uidataAPI'

export default function AppsViewer ({ setLoading, setSuccessMessage, setErrorMessage }) {
  const [apps, setApps] = useState([])
  const [newAppOpen, setNewAppOpen] = useState(false)
  const [deleteAppOpen, setDeleteAppDialogOpen] = useState(false)
  const [deleteAppApp, setDeleteApp] = useState(null)
  const [updateAppOpen, setUpdateAppDialogOpen] = useState(false)
  const [updateAppApp, setUpdateApp] = useState(null)

  useEffect(() => {
    getAppsList()
  }, [])

  async function getAppsList () {
    try {
      setLoading(true)
      setApps(await getApps())
      setLoading(false)
    } catch (error) {
      setLoading(false)
      setErrorMessage(error.message)
    }
  }

  function openNewApp() {
    setNewAppOpen(true)
  }

  function closeNewApp() {
    setNewAppOpen(false)
  }

  function openUpdateApp (app) {
    setUpdateApp(app)
    setUpdateAppDialogOpen(true)
  }

  function closeUpdateApp () {
    setUpdateAppDialogOpen(false)
  }

  function openDeleteApp (app) {
    setDeleteApp(app)
    setDeleteAppDialogOpen(true)
  }

  function closeDeleteApp () {
    setDeleteAppDialogOpen(false)
  }

  return (
    <Box sx={{ padding: '10px' }}>
      <Box textAlign='right' padding='0px 30px'>
        <Button aria-label='New App' variant='outlined' startIcon={<AddRoundedIcon />} onClick={openNewApp}>Define New App</Button>
      </Box>
      <Box padding='10px 30px'>
        <TableContainer component={Paper}>
          <Table sx={{ padding: '10px', minWidth: 650 }} aria-label='simple table'>
            <TableHead>
              <TableRow className='data-table'>
                <TableCell align='center'>
                  <Typography textAlign='center' variant='button' component='div' className='white'>Name</Typography>
                </TableCell>
                <TableCell align='center'>
                  <Typography textAlign='center' variant='button' component='div' className='white'>Root Path</Typography>
                </TableCell>
                <TableCell align='center'>
                  <Typography textAlign='center' variant='button' component='div' className='white'>Roles</Typography>
                </TableCell>
                  <TableCell align='center'>
                    <Typography textAlign='center' variant='button' component='div' className='white'>Actions</Typography>
                  </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {apps.map(app =>
                <TableRow key={app.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell align='center'>{app.name}</TableCell>
                  <TableCell align='center'>{app.rootPath}</TableCell>
                  <TableCell align='center'>{app.roles.join(', ')}</TableCell>
                  <TableCell align='right'>
                      <IconButton size='small' edge='start' color='inherit' aria-label='menu' sx={{ mr: 2 }} onClick={() => { openUpdateApp(app) }} >
                        <EditRoundedIcon />
                      </IconButton>
                      <IconButton size='small' edge='start' color='inherit' aria-label='menu' sx={{ mr: 2 }} onClick={() => { openDeleteApp(app) }} >
                        <DeleteRoundedIcon />
                      </IconButton>
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      { newAppOpen ? <NewApp apps={apps} setLoading={setLoading} closeDialog={closeNewApp} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} /> : null }
      { updateAppOpen ? <UpdateApp app={updateAppApp} apps={apps} setLoading={setLoading} closeDialog={closeUpdateApp} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} /> : null }
      { deleteAppOpen ? <DeleteApp app={deleteAppApp} setLoading={setLoading} closeDialog={closeDeleteApp} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} /> : null }
    </Box>
  )
}
