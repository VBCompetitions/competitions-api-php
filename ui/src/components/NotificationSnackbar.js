import React from 'react'

import Alert from '@mui/material/Alert'
import Grow from '@mui/material/Grow'
import Snackbar from '@mui/material/Snackbar'

function NotificationSnackbar ({successMessage, errorMessage, setSuccessMessage, setErrorMessage}) {
  const handleClose = () => {
    setSuccessMessage(null)
    setErrorMessage(null)
  }

  return (
    <>
      <Snackbar onClose={handleClose} open={successMessage} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} autoHideDuration={2000} TransitionComponent={Grow}>
        <Alert onClose={handleClose} severity="success" variant="filled" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
      <Snackbar onClose={handleClose} open={errorMessage} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} autoHideDuration={4000} TransitionComponent={Grow} >
        <Alert onClose={handleClose} severity="error" variant="filled" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

export default NotificationSnackbar
