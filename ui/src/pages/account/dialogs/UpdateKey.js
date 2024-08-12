import React, { useState } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import TextField from '@mui/material/TextField'

import { updateKey } from '../../../apis/uidataAPI'

export default function UpdateKey ({ updateKeyID, currentUpdateKeyDescription, closeDialog, setLoading, setSuccessMessage, setErrorMessage }) {

  const [updateKeyDescription, setUpdateKeyDescription] = useState('')
  const [updateKeyDescriptionInvalid, setUpdateKeyDescriptionInvalid] = useState(false)

  async function updateKeyAction () {
    try {
      setLoading(true)
      closeDialog()
      await updateKey(updateKeyID, updateKeyDescription)
      setLoading(false)
      setSuccessMessage('API Key updated')
    } catch (error) {
      setLoading(false)
      setErrorMessage(error.message)
    }
  }

  function updateKeyDescriptionChange (e) {
    if (e.target.value.length > 1000 || !/^[a-zA-Z0-9!"#£$%&'()*+,.:;<=>?@[^_`{|}~ /\-\\\]]*$/.test(e.target.value)) {
      setUpdateKeyDescriptionInvalid(true)
    } else {
      setUpdateKeyDescriptionInvalid(false)
      setUpdateKeyDescription(e.target.value)
    }
  }

  return (
    <Dialog open={true} onClose={closeDialog} aria-labelledby="update new api key">
      <DialogTitle id="update-key-dialog-title">Update API Key</DialogTitle>
      <DialogContent>
        <DialogContentText>Enter a new description for the API Key</DialogContentText>
        <TextField autoFocus defaultValue={currentUpdateKeyDescription} fullWidth error={updateKeyDescriptionInvalid} helperText={updateKeyDescriptionInvalid ? 'invalid description' : ' ' } margin="dense" id="update-key-description" onChange={updateKeyDescriptionChange} label="API Key description" type="text" />
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} variant="outlined" color="primary">Cancel</Button>
        <Button onClick={updateKeyAction} disabled={updateKeyDescriptionInvalid || updateKeyDescription.length <= 0} variant="contained" color="primary">Update</Button>
      </DialogActions>
    </Dialog>
  )
}
