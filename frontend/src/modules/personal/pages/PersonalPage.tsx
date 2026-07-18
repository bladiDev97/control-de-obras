import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import DomainIcon from '@mui/icons-material/Domain';

import { PersonalTab } from '../components/PersonalTab';
import { ZonasTab } from '../../zonas/components/ZonasTab';

export default function PersonalPage() {
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%', p: { xs: 2, sm: 3 } }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          variant="standard"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              minHeight: '48px',
              px: 3,
            }
          }}
        >
          <Tab icon={<AssignmentIndIcon />} iconPosition="start" label="Directorio Personal" />
          <Tab icon={<DomainIcon />} iconPosition="start" label="Datos de Zonas" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {activeTab === 0 && (
        <Box>
          <PersonalTab />
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <ZonasTab />
        </Box>
      )}
    </Box>
  );
}
