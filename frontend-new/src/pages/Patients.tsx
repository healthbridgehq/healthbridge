import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  useTheme,
} from '@mui/material';
import {
  Search,
  Add,
  FilterList,
  MoreVert,
  PersonAdd,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import Card from '../components/common/Card';
import StatusChip from '../components/common/StatusChip';

const MotionBox = motion(Box);

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  nextAppointment: string | null;
  status: 'active' | 'inactive' | 'pending';
}

const Patients: React.FC = () => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      // Replace with actual API call
      return {
        patients: [
          {
            id: 1,
            name: 'Sarah Johnson',
            email: 'sarah.j@example.com',
            phone: '(555) 123-4567',
            lastVisit: '2025-03-28',
            nextAppointment: '2025-04-15',
            status: 'active',
          },
          {
            id: 2,
            name: 'Michael Chen',
            email: 'michael.c@example.com',
            phone: '(555) 234-5678',
            lastVisit: '2025-03-25',
            nextAppointment: null,
            status: 'inactive',
          },
          {
            id: 3,
            name: 'Emily Davis',
            email: 'emily.d@example.com',
            phone: '(555) 345-6789',
            lastVisit: '2025-03-30',
            nextAppointment: '2025-04-10',
            status: 'active',
          },
        ] as Patient[],
      };
    },
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredPatients = data?.patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone.includes(searchQuery)
  );

  return (
    <Box>
      {/* Header Section */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Patients
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            sx={{ px: 3 }}
          >
            Add Patient
          </Button>
        </Box>
      </MotionBox>

      {/* Search and Filter Bar */}
      <Card sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                sx={{ px: 3 }}
              >
                Filters
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Patients Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Last Visit</TableCell>
                <TableCell>Next Appointment</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPatients?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((patient) => (
                <TableRow
                  key={patient.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      cursor: 'pointer',
                    },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar>{patient.name.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="subtitle2">{patient.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {String(patient.id).padStart(6, '0')}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{patient.email}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {patient.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>{patient.lastVisit}</TableCell>
                  <TableCell>
                    {patient.nextAppointment || (
                      <Typography variant="body2" color="text.secondary">
                        No upcoming
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusChip
                      label={patient.status}
                      status={
                        patient.status === 'active'
                          ? 'success'
                          : patient.status === 'inactive'
                          ? 'error'
                          : 'warning'
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton>
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPatients?.length || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Box>
  );
};

export default Patients;
