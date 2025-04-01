import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  GetApp as DownloadIcon,
  Add as AddIcon,
} from '@mui/icons-material';

// Mock data - in real app, this would come from API
const mockRecords = [
  {
    id: 1,
    date: '2025-03-15',
    type: 'Lab Results',
    provider: 'City Labs',
    status: 'Complete',
  },
  {
    id: 2,
    date: '2025-03-10',
    type: 'Consultation',
    provider: 'Dr. Smith',
    status: 'Complete',
  },
  {
    id: 3,
    date: '2025-03-01',
    type: 'Prescription',
    provider: 'Central Pharmacy',
    status: 'Active',
  },
];

const HealthRecords = () => {
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4">Health Records</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            // Handle adding new record
          }}
        >
          Add Record
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.date}</TableCell>
                <TableCell>{record.type}</TableCell>
                <TableCell>{record.provider}</TableCell>
                <TableCell>
                  <Chip
                    label={record.status}
                    color={record.status === 'Active' ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => {
                      // Handle view record
                    }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      // Handle download record
                    }}
                  >
                    <DownloadIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default HealthRecords;
