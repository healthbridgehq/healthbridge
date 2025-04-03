import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Chip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Description,
  MoreVert,
  CloudUpload,
  Share,
  Download,
  Delete,
  FilterList,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import {
  fetchHealthRecords,
  uploadHealthRecord,
  deleteHealthRecord,
  shareHealthRecord,
} from '../../services/api/patient';
import { formatDate } from '../../utils/dateUtils';

interface HealthRecord {
  id: string;
  title: string;
  type: string;
  date: string;
  source: string;
  fileUrl: string;
  sharedWith: string[];
}

const HealthRecords: React.FC = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');

  // Fetch health records
  const { data: records, isLoading } = useQuery(
    ['healthRecords', filter],
    () => fetchHealthRecords(filter)
  );

  // Upload mutation
  const uploadMutation = useMutation(
    ({ file, metadata }: { file: File; metadata: any }) => uploadHealthRecord(file, metadata),
    {
    onSuccess: () => {
      queryClient.invalidateQueries('healthRecords');
      enqueueSnackbar('Record uploaded successfully', { variant: 'success' });
      handleCloseUploadDialog();
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to upload record', { variant: 'error' });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation(
    (recordId: string) => deleteHealthRecord(recordId),
    {
    onSuccess: () => {
      queryClient.invalidateQueries('healthRecords');
      enqueueSnackbar('Record deleted successfully', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to delete record', { variant: 'error' });
    },
  });

  // Share mutation
  const shareMutation = useMutation(
    ({ recordId, recipientId }: { recordId: string; recipientId: string }) => shareHealthRecord(recordId, recipientId),
    {
    onSuccess: () => {
      queryClient.invalidateQueries('healthRecords');
      enqueueSnackbar('Record shared successfully', { variant: 'success' });
      handleCloseShareDialog();
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to share record', { variant: 'error' });
    },
  });

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, record: HealthRecord) => {
    setSelectedRecord(record);
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenUploadDialog = () => {
    setUploadDialogOpen(true);
  };

  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
    setUploadFile(null);
    setUploadType('');
    setUploadTitle('');
  };

  const handleOpenShareDialog = () => {
    setShareDialogOpen(true);
    handleCloseMenu();
  };

  const handleCloseShareDialog = () => {
    setShareDialogOpen(false);
    setSelectedRecord(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setUploadFile(event.target.files[0]);
      setUploadTitle(event.target.files[0].name);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadType || !uploadTitle) {
      enqueueSnackbar('Please fill in all fields', { variant: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('type', uploadType);
    formData.append('title', uploadTitle);

    uploadMutation.mutate(formData as any);
  };

  const handleDelete = () => {
    if (selectedRecord) {
      deleteMutation.mutate(selectedRecord.id as any);
      handleCloseMenu();
    }
  };

  const handleShare = (clinicIds: string[]) => {
    if (selectedRecord) {
      shareMutation.mutate({
        recordId: selectedRecord.id,
        clinicIds,
      } as any);
    }
  };

  const handleDownload = () => {
    if (selectedRecord) {
      window.open(selectedRecord.fileUrl, '_blank');
      handleCloseMenu();
    }
  };

  const filteredRecords = records?.filter((record: HealthRecord) =>
    record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Health Records</Typography>
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={handleOpenUploadDialog}
          >
            Upload Record
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Search Records"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Filter by Type</InputLabel>
                    <Select
                      value={filter}
                      label="Filter by Type"
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Records</MenuItem>
                      <MenuItem value="medical">Medical Reports</MenuItem>
                      <MenuItem value="lab">Lab Results</MenuItem>
                      <MenuItem value="imaging">Imaging</MenuItem>
                      <MenuItem value="prescription">Prescriptions</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {isLoading ? (
                <Box display="flex" justifyContent="center" mt={4}>
                  <CircularProgress />
                </Box>
              ) : filteredRecords?.length ? (
                <List>
                  {filteredRecords.map((record: HealthRecord) => (
                    <ListItem
                      key={record.id}
                      divider
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={(e) => handleOpenMenu(e, record)}
                        >
                          <MoreVert />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <Description />
                      </ListItemIcon>
                      <ListItemText
                        primary={record.title}
                        secondary={
                          <>
                            {formatDate(record.date)} • {record.source}
                            {record.sharedWith.length > 0 && (
                              <Chip
                                size="small"
                                label={`Shared with ${record.sharedWith.length} clinic${record.sharedWith.length > 1 ? 's' : ''}`}
                                color="primary"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" mt={4}>
                  <Typography color="textSecondary">
                    No health records found
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={handleCloseUploadDialog}>
        <DialogTitle>Upload Health Record</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Record Type</InputLabel>
              <Select
                value={uploadType}
                label="Record Type"
                onChange={(e) => setUploadType(e.target.value)}
              >
                <MenuItem value="medical">Medical Report</MenuItem>
                <MenuItem value="lab">Lab Result</MenuItem>
                <MenuItem value="imaging">Imaging</MenuItem>
                <MenuItem value="prescription">Prescription</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<CloudUpload />}
            >
              Choose File
              <input
                type="file"
                hidden
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </Button>
            {uploadFile && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Selected file: {uploadFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={uploadMutation.isLoading}
          >
            {uploadMutation.isLoading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={handleCloseShareDialog}>
        <DialogTitle>Share Health Record</DialogTitle>
        <DialogContent>
          {/* Implement clinic selection component */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseShareDialog}>Cancel</Button>
          <Button
            onClick={() => handleShare([])}
            variant="contained"
            disabled={shareMutation.isLoading}
          >
            {shareMutation.isLoading ? <CircularProgress size={24} /> : 'Share'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Record Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleDownload}>
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          Download
        </MenuItem>
        <MenuItem onClick={handleOpenShareDialog}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          Share
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default HealthRecords;
