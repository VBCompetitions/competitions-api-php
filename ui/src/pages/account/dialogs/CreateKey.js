import React, { useState } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import TextField from '@mui/material/TextField'

import { createKey } from '../../../apis/uidataAPI'

export default function CreateKey ({ setNewAPIKey, openNewKey, closeDialog, setLoading, setSuccessMessage, setErrorMessage }) {

  const [createKeyDescription, setCreateKeyDescription] = useState('')
  const [createKeyDescriptionInvalid, setCreateKeyDescriptionInvalid] = useState(false)

  async function createKeyAction () {
    try {
      setLoading(true)
      closeDialog()
      const newKey = await createKey(createKeyDescription)
      setNewAPIKey(newKey.key)
      openNewKey()
      setLoading(false)
      setSuccessMessage('API Key created')
    } catch (error) {
      setLoading(false)
      setErrorMessage(error.message)
    }
  }

  function createKeyDescriptionChange (e) {
    if (e.target.value.length > 1000 || !/^[a-zA-Z0-9!"#£$%&'()*+,.:;<=>?@[^_`{|}~ /\-\\\]]*$/.test(e.target.value)) {
      setCreateKeyDescriptionInvalid(true)
    } else {
      setCreateKeyDescriptionInvalid(false)
      setCreateKeyDescription(e.target.value)
    }
  }

  return (
    <Dialog open={true} onClose={closeDialog} aria-labelledby="create new api key">
      <DialogTitle id="create-key-dialog-title">New API Key</DialogTitle>
      <DialogContent>
        <DialogContentText>Enter a description for the new API Key</DialogContentText>
        <TextField autoFocus fullWidth error={createKeyDescriptionInvalid} helperText={createKeyDescriptionInvalid ? 'invalid description' : ' ' } margin="dense" id="add-key-description" onChange={createKeyDescriptionChange} label="API Key description" type="text" />
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} variant="outlined" color="primary">Cancel</Button>
        <Button onClick={createKeyAction} disabled={createKeyDescriptionInvalid || createKeyDescription.length <= 0} variant="contained" color="primary">Create</Button>
      </DialogActions>
    </Dialog>
  )
}
