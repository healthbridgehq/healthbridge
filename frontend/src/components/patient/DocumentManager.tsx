import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Description,
  Download,
  Share,
  Visibility,
  Lock,
  Search,
  FilterList,
} from '@mui/icons-material';
import { useDocuments } from '../../hooks/useDocuments';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';
import { format } from 'date-fns';

interface DocumentManagerProps {
  patientId: string;
}

interface Document {
  id: string;
  title: string;
  type: string;
  date: string;
  provider: string;
  source: string;
  status: 'available' | 'pending' | 'restricted';
  category: string;
  size: number;
  lastAccessed?: string;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({ patientId }) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const { data: documents, isLoading, error } = useDocuments(patientId);

  const categories = [
    'all',
    'clinical_notes',
    'pathology',
    'imaging',
    'prescriptions',
    'referrals',
    'discharge_summaries',
  ];

  const handleShare = (document: Document) => {
    setSelectedDocument(document);
    setShareDialogOpen(true);
  };

  const handleDownload = async (document: Document) => {
    // Implementation would handle secure document download
    console.log('Downloading document:', document.id);
  };

  const handleView = async (document: Document) => {
    // Implementation would handle secure document viewing
    console.log('Viewing document:', document.id);
  };

  const filteredDocuments = documents?.filter((doc: Document) => {
    const matchesSearch = doc.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert error={error} />;
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h6">Health Documents</Typography>
        <Box display="flex" gap={2}>
          <TextField
            size="small"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <TextField
            select
            size="small"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            sx={{ minWidth: 150 }}
            InputProps={{
              startAdornment: (
                <FilterList sx={{ mr: 1, color: 'text.secondary' }} />
              ),
            }}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category.replace('_', ' ').toUpperCase()}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {filteredDocuments?.map((document: Document) => (
          <Grid item xs={12} sm={6} md={4} key={document.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              {document.status === 'restricted' && (
                <Box
                  position="absolute"
                  top={8}
                  right={8}
                  zIndex={1}
                >
                  <Tooltip title="Access restricted">
                    <Lock color="error" />
                  </Tooltip>
                </Box>
              )}
              
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Description
                    sx={{ mr: 1, color: theme.palette.primary.main }}
                  />
                  <Typography variant="subtitle1" noWrap>
                    {document.title}
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                >
                  {document.provider}
                </Typography>

                <Box mt={1}>
                  <Chip
                    label={document.type}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={format(new Date(document.date), 'PP')}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mt={1}
                >
                  Size: {formatFileSize(document.size)}
                  {document.lastAccessed && (
                    <>
                      <br />
                      Last accessed:{' '}
                      {format(new Date(document.lastAccessed), 'PP')}
                    </>
                  )}
                </Typography>
              </CardContent>

              <CardActions>
                <Tooltip title="View">
                  <IconButton
                    size="small"
                    onClick={() => handleView(document)}
                    disabled={document.status === 'restricted'}
                  >
                    <Visibility />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download">
                  <IconButton
                    size="small"
                    onClick={() => handleDownload(document)}
                    disabled={document.status === 'restricted'}
                  >
                    <Download />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share">
                  <IconButton
                    size="small"
                    onClick={() => handleShare(document)}
                    disabled={document.status === 'restricted'}
                  >
                    <Share />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Share Document</DialogTitle>
        <DialogContent>
          {selectedDocument && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {selectedDocument.title}
              </Typography>

              <TextField
                fullWidth
                label="Recipient Healthcare Provider"
                placeholder="Search by name or provider number..."
                margin="normal"
              />

              <TextField
                fullWidth
                select
                label="Access Duration"
                defaultValue="7days"
                margin="normal"
              >
                <MenuItem value="24hours">24 Hours</MenuItem>
                <MenuItem value="7days">7 Days</MenuItem>
                <MenuItem value="30days">30 Days</MenuItem>
                <MenuItem value="custom">Custom Duration</MenuItem>
              </TextField>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Share Note (Optional)"
                placeholder="Add a note for the recipient..."
                margin="normal"
              />

              <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
                <Typography variant="body2" color="text.secondary">
                  The recipient will need to verify their identity to access
                  this document. You can revoke access at any time.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary">
            Share Document
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
