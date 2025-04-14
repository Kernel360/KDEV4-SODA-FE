import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { Button, TableCell, Typography } from '@mui/material';
import { LayoutDashboard } from 'lucide-react';

const Projects = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div>
      {/* Table content */}
    </div>
  );
};

export default Projects; 