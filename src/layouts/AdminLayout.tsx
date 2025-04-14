import React from 'react';
import { Link } from 'react-router-dom';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { LayoutDashboard, FolderKanban, Users, Building2 } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const location = window.location;

  return (
    <List>
      <ListItem disablePadding>
        <ListItemButton
          component={Link}
          to="/admin"
          selected={location.pathname === '/admin'}
          sx={{
            '&.Mui-selected': {
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
              },
            },
          }}
        >
          <ListItemIcon>
            <LayoutDashboard className="w-5 h-5" />
          </ListItemIcon>
          <ListItemText primary="대시보드" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton
          component={Link}
          to="/admin/projects"
          selected={location.pathname.startsWith('/admin/projects')}
          sx={{
            '&.Mui-selected': {
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
              },
            },
          }}
        >
          <ListItemIcon>
            <FolderKanban className="w-5 h-5" />
          </ListItemIcon>
          <ListItemText primary="프로젝트" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton
          component={Link}
          to="/admin/companies"
          selected={location.pathname.startsWith('/admin/companies')}
          sx={{
            '&.Mui-selected': {
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
              },
            },
          }}
        >
          <ListItemIcon>
            <Building2 className="w-5 h-5" />
          </ListItemIcon>
          <ListItemText primary="회사" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton
          component={Link}
          to="/admin/accounts"
          selected={location.pathname.startsWith('/admin/accounts')}
          sx={{
            '&.Mui-selected': {
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
              },
            },
          }}
        >
          <ListItemIcon>
            <Users className="w-5 h-5" />
          </ListItemIcon>
          <ListItemText primary="계정" />
        </ListItemButton>
      </ListItem>
    </List>
  );
};

export default AdminLayout; 