import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  IconButton,
  Chip,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
} from '@mui/material';
import {
  Search,
  FilterList,
  Description,
  LocalHospital,
  Assignment,
  Event,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import Card from '../components/common/Card';
import StatusChip from '../components/common/StatusChip';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ width: '100%' }}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const MotionBox = motion(Box);

const HealthRecords: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['healthRecords'],
    queryFn: async () => {
      // Replace with actual API call
      return {
        records: [
          {
            id: 1,
            type: 'Medical Report',
            title: 'Annual Physical Examination',
            date: '2025-04-01',
            doctor: 'Dr. Sarah Johnson',
            status: 'completed',
          },
          {
            id: 2,
            type: 'Lab Results',
            title: 'Blood Work Analysis',
            date: '2025-03-28',
            doctor: 'Dr. Michael Chen',
            status: 'pending',
          },
          {
            id: 3,
            type: 'Prescription',
            title: 'Medication Update',
            date: '2025-03-25',
            doctor: 'Dr. Emily Davis',
            status: 'active',
          },
        ],
      };
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'active':
        return 'info';
      default:
        return 'neutral';
    }
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'Medical Report':
        return <Description />;
      case 'Lab Results':
        return <Assignment />;
      case 'Prescription':
        return <LocalHospital />;
      default:
        return <Description />;
    }
  };

  const filteredRecords = data?.records.filter(record =>
    record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.doctor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      {/* Header Section */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Health Records
          </Typography>
        </Box>
      </MotionBox>

      {/* Search and Filter Bar */}
      <Card>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label="All Records" color="primary" onClick={() => {}} />
              <Chip label="Medical Reports" onClick={() => {}} />
              <Chip label="Lab Results" onClick={() => {}} />
              <Chip label="Prescriptions" onClick={() => {}} />
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Tabs Section */}
      <Box sx={{ mt: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="All Records" />
          <Tab label="Recent" />
          <Tab label="Archived" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <List>
            {filteredRecords?.map((record, index) => (
              <MotionBox
                key={record.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ListItem
                  sx={{
                    mb: 2,
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    '&:hover': {
                      bgcolor: 'action.hover',
                      cursor: 'pointer',
                    },
                  }}
                >
                  <ListItemIcon>{getRecordIcon(record.type)}</ListItemIcon>
                  <ListItemText
                    primary={record.title}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Event sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {record.date}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          •
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {record.doctor}
                        </Typography>
                      </Box>
                    }
                  />
                  <StatusChip
                    label={record.status}
                    status={getStatusColor(record.status) as 'success' | 'warning' | 'error' | 'info' | 'neutral'}
                  />
                </ListItem>
              </MotionBox>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography color="text.secondary">Recent records will be displayed here</Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography color="text.secondary">Archived records will be displayed here</Typography>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default HealthRecords;
