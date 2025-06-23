import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Button,
  Chip,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  Lock,
  LockOpen,
  Share,
  Edit,
  Add,
  Visibility,
  VisibilityOff,
  Psychology,
  LocalHospital,
  Assignment,
  History,
  People,
  CalendarToday,
  Security,
} from '@mui/icons-material';
import { useQuery, useMutation } from 'react-query';
import { format } from 'date-fns';
import { ComprehensivePatientRecord, PatientNote, AiGeneratedInsight, DataSharingConsent } from '../../types/patientRecord';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`patient-record-tabpanel-${index}`}
      aria-labelledby={`patient-record-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const AIEnhancedPatientRecord: React.FC<{ patientId: string }> = ({ patientId }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [showSharingDialog, setShowSharingDialog] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [newNote, setNewNote] = useState('');
  const [showEncryptedData, setShowEncryptedData] = useState(false);

  // Fetch patient record
  const { data: patientRecord, isLoading } = useQuery<ComprehensivePatientRecord>(
    ['patientRecord', patientId],
    async () => {
      // API call to fetch patient record
      return {} as ComprehensivePatientRecord; // Replace with actual API call
    }
  );

  // AI note generation mutation
  const generateAiNote = useMutation(async (content: string) => {
    // API call to generate AI note
    return {} as PatientNote;
  });

  // Data sharing mutation
  const shareData = useMutation(async (consent: DataSharingConsent) => {
    // API call to share data
    return consent;
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleNewNote = async () => {
    if (!newNote.trim()) return;

    try {
      // First, save the manual note
      // Then, generate AI insights
      const aiNote = await generateAiNote.mutateAsync(newNote);
      setNewNote('');
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleShareData = async () => {
    if (!selectedClinic) return;

    try {
      const consent: DataSharingConsent = {
        clinicId: selectedClinic,
        grantedAt: new Date().toISOString(),
        dataTypes: ['notes', 'history', 'medications'],
        purpose: 'treatment',
        accessLevel: 'full',
      };

      await shareData.mutateAsync(consent);
      setShowSharingDialog(false);
    } catch (error) {
      console.error('Failed to share data:', error);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const renderOverview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title="Patient Summary"
            action={
              <IconButton onClick={() => setShowEncryptedData(!showEncryptedData)}>
                {showEncryptedData ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            }
          />
          <CardContent>
            <Typography variant="body1" paragraph>
              <strong>Name:</strong> {patientRecord?.personalInfo.firstName}{' '}
              {patientRecord?.personalInfo.lastName}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>DOB:</strong>{' '}
              {patientRecord?.personalInfo.dateOfBirth &&
                format(new Date(patientRecord.personalInfo.dateOfBirth), 'PP')}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Contact:</strong> {patientRecord?.personalInfo.phone}
            </Typography>
            {/* Add more summary information */}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="AI Insights" />
          <CardContent>
            {patientRecord?.aiInsights.map((insight) => (
              <Alert
                key={insight.id}
                severity={
                  insight.type === 'alert'
                    ? 'warning'
                    : insight.type === 'recommendation'
                    ? 'info'
                    : 'success'
                }
                sx={{ mb: 2 }}
              >
                {insight.content}
              </Alert>
            ))}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader title="Recent Activity" />
          <CardContent>
            <Timeline>
              {patientRecord?.notes.slice(0, 5).map((note) => (
                <TimelineItem key={note.id}>
                  <TimelineSeparator>
                    <TimelineDot color="primary" />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="subtitle2">
                      {format(new Date(note.createdAt), 'PPp')}
                    </Typography>
                    <Typography>{note.content}</Typography>
                    {note.aiSummary && (
                      <Typography color="textSecondary" sx={{ mt: 1 }}>
                        AI Summary: {note.aiSummary}
                      </Typography>
                    )}
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderNotes = () => (
    <Box>
      <Box mb={3}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="New Note"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <Box mt={1} display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            onClick={handleNewNote}
            disabled={!newNote.trim() || generateAiNote.isLoading}
            startIcon={<Psychology />}
          >
            Generate AI Note
          </Button>
        </Box>
      </Box>

      <List>
        {patientRecord?.notes.map((note) => (
          <Paper key={note.id} sx={{ mb: 2, p: 2 }}>
            <Typography variant="subtitle2" color="textSecondary">
              {format(new Date(note.createdAt), 'PPp')}
            </Typography>
            <Typography paragraph>{note.content}</Typography>
            {note.aiSummary && (
              <Alert severity="info" icon={<Psychology />}>
                <Typography variant="subtitle2">AI Summary</Typography>
                {note.aiSummary}
              </Alert>
            )}
            {note.nextSteps && (
              <Box mt={2}>
                <Typography variant="subtitle2">Next Steps:</Typography>
                <List>
                  {note.nextSteps.map((step, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={step} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            <Box mt={1}>
              {note.tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" sx={{ mr: 1 }} />
              ))}
            </Box>
          </Paper>
        ))}
      </List>
    </Box>
  );

  const renderHistory = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Medical History" />
          <CardContent>
            <List>
              {patientRecord?.medicalHistory.map((history) => (
                <ListItem key={history.condition}>
                  <ListItemText
                    primary={history.condition}
                    secondary={`Diagnosed: ${format(
                      new Date(history.diagnosedDate),
                      'PP'
                    )} - Status: ${history.status}`}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Family History" />
          <CardContent>
            <List>
              {patientRecord?.familyHistory.map((history, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`${history.relationship}: ${history.condition}`}
                    secondary={history.notes}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader title="Medications" />
          <CardContent>
            <List>
              {patientRecord?.medications.map((medication) => (
                <ListItem key={medication.name}>
                  <ListItemText
                    primary={medication.name}
                    secondary={`${medication.dosage} - ${medication.frequency}`}
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={medication.status}
                      color={medication.status === 'active' ? 'success' : 'default'}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderSharing = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Manage how your health information is shared with healthcare providers.
        Your data is always encrypted and secure.
      </Alert>

      <Card>
        <CardHeader
          title="Active Sharing Consents"
          action={
            <Button
              startIcon={<Add />}
              onClick={() => setShowSharingDialog(true)}
            >
              New Consent
            </Button>
          }
        />
        <CardContent>
          <List>
            {patientRecord?.dataSharingConsents.map((consent) => (
              <ListItem key={consent.clinicId}>
                <ListItemText
                  primary={consent.clinicId}
                  secondary={`Granted: ${format(
                    new Date(consent.grantedAt),
                    'PP'
                  )} - Level: ${consent.accessLevel}`}
                />
                <ListItemSecondaryAction>
                  <IconButton>
                    <Edit />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Dialog
        open={showSharingDialog}
        onClose={() => setShowSharingDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Share Health Information</DialogTitle>
        <DialogContent>
          {/* Add clinic selection and sharing options */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSharingDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleShareData}
            disabled={!selectedClinic}
          >
            Share
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Patient Record</Typography>
        <Box>
          <Tooltip title="Share Health Information">
            <IconButton onClick={() => setShowSharingDialog(true)}>
              <Share />
            </IconButton>
          </Tooltip>
          <Tooltip title={showEncryptedData ? 'Hide Sensitive Data' : 'Show Sensitive Data'}>
            <IconButton onClick={() => setShowEncryptedData(!showEncryptedData)}>
              {showEncryptedData ? <LockOpen /> : <Lock />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<Assignment />} label="Overview" />
        <Tab icon={<Psychology />} label="Notes" />
        <Tab icon={<History />} label="History" />
        <Tab icon={<LocalHospital />} label="Medications" />
        <Tab icon={<People />} label="Contacts" />
        <Tab icon={<CalendarToday />} label="Care Plan" />
        <Tab icon={<Security />} label="Sharing" />
      </Tabs>

      <TabPanel value={activeTab} index={0}>
        {renderOverview()}
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        {renderNotes()}
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        {renderHistory()}
      </TabPanel>
      <TabPanel value={activeTab} index={6}>
        {renderSharing()}
      </TabPanel>
    </Box>
  );
};
