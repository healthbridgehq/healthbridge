import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Box,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  useTheme,
} from '@mui/material';
import {
  Lock as LockIcon,
  Security as SecurityIcon,
  DataUsage as DataIcon,
  MedicalServices as MedicalIcon,
} from '@mui/icons-material';
import { colors } from '../../theme/colors';

interface PrivacyRestriction {
  providerType: string;
  restrictionType: 'full' | 'partial' | 'none';
  notes?: string;
}

interface PatientPrivacySettingsProps {
  consentStatus: 'granted' | 'partial' | 'withdrawn';
  dataSharing: {
    myHealthRecord: boolean;
    researchParticipation: boolean;
    thirdPartyAccess: boolean;
  };
  restrictions: PrivacyRestriction[];
  onUpdateConsent: (status: 'granted' | 'partial' | 'withdrawn') => void;
  onUpdateDataSharing: (settings: {
    myHealthRecord: boolean;
    researchParticipation: boolean;
    thirdPartyAccess: boolean;
  }) => void;
  onUpdateRestrictions: (restrictions: PrivacyRestriction[]) => void;
}

const providerTypes = [
  'General Practitioner',
  'Specialist',
  'Allied Health',
  'Mental Health',
  'Emergency Services',
  'Pathology',
  'Radiology',
  'Hospital',
];

const PatientPrivacySettings: React.FC<PatientPrivacySettingsProps> = ({
  consentStatus,
  dataSharing,
  restrictions,
  onUpdateConsent,
  onUpdateDataSharing,
  onUpdateRestrictions,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [restrictionDialogOpen, setRestrictionDialogOpen] = React.useState(false);
  const [editingRestriction, setEditingRestriction] = React.useState<PrivacyRestriction | null>(
    null
  );

  const handleDataSharingChange = (setting: keyof typeof dataSharing) => {
    onUpdateDataSharing({
      ...dataSharing,
      [setting]: !dataSharing[setting],
    });
  };

  const handleAddRestriction = () => {
    setEditingRestriction(null);
    setRestrictionDialogOpen(true);
  };

  const handleEditRestriction = (restriction: PrivacyRestriction) => {
    setEditingRestriction(restriction);
    setRestrictionDialogOpen(true);
  };

  const handleSaveRestriction = (restriction: PrivacyRestriction) => {
    if (editingRestriction) {
      onUpdateRestrictions(
        restrictions.map((r) =>
          r.providerType === editingRestriction.providerType ? restriction : r
        )
      );
    } else {
      onUpdateRestrictions([...restrictions, restriction]);
    }
    setRestrictionDialogOpen(false);
  };

  const handleRemoveRestriction = (providerType: string) => {
    onUpdateRestrictions(restrictions.filter((r) => r.providerType !== providerType));
  };

  return (
    <>
      <Card
        elevation={1}
        sx={{
          backgroundColor: isDarkMode ? colors.background.darkPaper : colors.background.paper,
          borderRadius: 2,
        }}
      >
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon color="primary" />
              <Typography variant="h6">Privacy & Consent Settings</Typography>
            </Box>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            {/* Consent Status */}
            <Grid item xs={12}>
              <Alert
                severity={
                  consentStatus === 'granted'
                    ? 'success'
                    : consentStatus === 'partial'
                    ? 'warning'
                    : 'error'
                }
                icon={<LockIcon />}
              >
                Your current consent status is:{' '}
                <strong>
                  {consentStatus.charAt(0).toUpperCase() + consentStatus.slice(1)}
                </strong>
              </Alert>
            </Grid>

            {/* Data Sharing Settings */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <DataIcon sx={{ mr: 1 }} />
                Data Sharing Preferences
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={dataSharing.myHealthRecord}
                        onChange={() => handleDataSharingChange('myHealthRecord')}
                        color="primary"
                      />
                    }
                    label="Share with My Health Record"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={dataSharing.researchParticipation}
                        onChange={() => handleDataSharingChange('researchParticipation')}
                        color="primary"
                      />
                    }
                    label="Participate in Medical Research"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={dataSharing.thirdPartyAccess}
                        onChange={() => handleDataSharingChange('thirdPartyAccess')}
                        color="primary"
                      />
                    }
                    label="Allow Third-Party Access"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Provider Restrictions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                  <MedicalIcon sx={{ mr: 1 }} />
                  Provider Access Restrictions
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddRestriction}
                >
                  Add Restriction
                </Button>
              </Box>
              <Grid container spacing={2}>
                {restrictions.map((restriction) => (
                  <Grid item xs={12} key={restriction.providerType}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2">
                            {restriction.providerType}
                          </Typography>
                          <Box>
                            <Button
                              size="small"
                              onClick={() => handleEditRestriction(restriction)}
                              sx={{ mr: 1 }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleRemoveRestriction(restriction.providerType)}
                            >
                              Remove
                            </Button>
                          </Box>
                        </Box>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ mb: 1 }}
                        >
                          Access Level: {restriction.restrictionType.toUpperCase()}
                        </Typography>
                        {restriction.notes && (
                          <Typography variant="body2" color="textSecondary">
                            Notes: {restriction.notes}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Restriction Dialog */}
      <Dialog
        open={restrictionDialogOpen}
        onClose={() => setRestrictionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingRestriction ? 'Edit Restriction' : 'Add Restriction'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Provider Type</InputLabel>
              <Select
                value={editingRestriction?.providerType || ''}
                label="Provider Type"
                onChange={(e) =>
                  setEditingRestriction({
                    ...editingRestriction || { restrictionType: 'none' },
                    providerType: e.target.value,
                  })
                }
              >
                {providerTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Restriction Level</InputLabel>
              <Select
                value={editingRestriction?.restrictionType || 'none'}
                label="Restriction Level"
                onChange={(e) =>
                  setEditingRestriction({
                    ...editingRestriction || { providerType: '' },
                    restrictionType: e.target.value as 'full' | 'partial' | 'none',
                  })
                }
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="partial">Partial</MenuItem>
                <MenuItem value="full">Full</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={editingRestriction?.notes || ''}
              onChange={(e) =>
                setEditingRestriction(
                  editingRestriction
                    ? { ...editingRestriction, notes: e.target.value }
                    : { providerType: '', restrictionType: 'none', notes: e.target.value }
                )
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestrictionDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() =>
              editingRestriction &&
              handleSaveRestriction(editingRestriction)
            }
            variant="contained"
            color="primary"
            disabled={!editingRestriction?.providerType}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PatientPrivacySettings;
