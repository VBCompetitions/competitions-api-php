import React from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'

import CompetitionAPI from '../../../apis/competitionAPI'

function DeleteCompetition ({ competition, closeDialog, setLoading, setSuccessMessage, setErrorMessage }) {
  const navigate = useNavigate()

  async function deleteCompetitionAction () {
    setLoading(true)
    closeDialog()
    const competitionAPI = new CompetitionAPI()
    try {
      await competitionAPI.deleteCompetition(competition.id)
      setLoading(false)
      setSuccessMessage('Competition deleted')
      navigate('.', { replace: true })
    } catch (error) {
      setErrorMessage(error.message)
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onClose={closeDialog} aria-labelledby="delete competition">
      <DialogTitle id="delete-competition-dialog-title">Delete Competition</DialogTitle>
      <DialogContent>
        <DialogContentText>Are you sure you want to delete the competition?</DialogContentText>
        <DialogContentText>Name: {competition.name}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} variant="outlined" color="primary">Cancel</Button>
        <Button onClick={deleteCompetitionAction} variant="contained" color="primary">Delete</Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteCompetition
