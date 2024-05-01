import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import GroupRoundedIcon from '@mui/icons-material/GroupRounded'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import SportsVolleyballRoundedIcon from '@mui/icons-material/SportsVolleyballRounded'
import { Link, useRouteLoaderData } from 'react-router-dom'

import Roles from './Roles'

export default function MenuDrawer ( { drawerOpen, toggleDrawer }) {
  const userInfo = useRouteLoaderData('root')

  // TODO - If not logged in - show only the login?

  let users = null
  if (Roles.roleCheck(userInfo.roles, [Roles.ADMIN])) {
    users = (
      <Link to='/users' key='users'>
        <ListItem>
          <ListItemButton>
            <ListItemIcon>
              <GroupRoundedIcon />
            </ListItemIcon>
            <ListItemText primary={'Users'} />
          </ListItemButton>
        </ListItem>
      </Link>
    )
  }

  const home = (
    <Link to='/' key='home'>
      <ListItem>
        <ListItemButton>
          <ListItemIcon>
            <HomeRoundedIcon />
          </ListItemIcon>
          <ListItemText primary={'Home'} />
        </ListItemButton>
      </ListItem>
    </Link>
  )

  const competitions = (
    <Link to='/c' key='competitions'>
      <ListItem>
        <ListItemButton>
          <ListItemIcon>
            <SportsVolleyballRoundedIcon />
          </ListItemIcon>
          <ListItemText primary={'Competitions'} />
        </ListItemButton>
      </ListItem>
    </Link>
  )

  return (
    <Drawer open={drawerOpen} onClose={toggleDrawer(false)}>
      <Box className='menu-drawer' onClick={toggleDrawer(false)}>
        <List>
          {home}
          {competitions}
          {users}
        </List>
      </Box>
    </Drawer>
  )
}
