import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default class Roles {
  static ADMIN = 'ADMIN'
  static FIXTURES_SECRETARY = 'FIXTURES_SECRETARY'
  static RESULTS_ENTRY = 'RESULTS_ENTRY'
  static VIEWER = 'VIEWER'

  static _ALL = [
    Roles.ADMIN,
    Roles.FIXTURES_SECRETARY,
    Roles.RESULTS_ENTRY,
    Roles.VIEWER
  ]

  static roleCheck(roles, requiredRoles) {
    for (let requiredRole of requiredRoles) {
      if (roles.includes(requiredRole)) {
        return true
      }
    }
    return false
  }

  static Competition = {
    create: [Roles.ADMIN, Roles.FIXTURES_SECRETARY],
    delete: [Roles.ADMIN, Roles.FIXTURES_SECRETARY],
    get: Roles._ANY,
    update: [Roles.ADMIN, Roles.FIXTURES_SECRETARY]
  }

  static Match = {
    delete: [Roles.ADMIN, Roles.FIXTURES_SECRETARY],
    edit: [Roles.ADMIN, Roles.FIXTURES_SECRETARY],
    results: [Roles.ADMIN, Roles.FIXTURES_SECRETARY, Roles.RESULTS_ENTRY]
  }

  static User = {
    create: [Roles.ADMIN],
    get: [Roles.ADMIN],
    reset: [Roles.ADMIN],
    update: [Roles.ADMIN],
    delete: [Roles.ADMIN]
  }
}

export function InsufficientRoles () {
  return (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', height: '100%' }}>
    <Box sx={{ flexGrow: '1' }}></Box>
    <Box className='data-box'>
      <Box className='data-box-header'>
        <Typography sx={{ flexGrow: '1', marginBottom: '3px' }} variant='h5' textAlign='left'>Permission Denied</Typography>
      </Box>
      <Box className='data-box-section'>
        You do not have sufficient permission to see this page
      </Box>
    </Box>
    <Box sx={{ flexGrow: '2' }}></Box>
  </Box>
  )
}
