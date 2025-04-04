import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Info,
  Edit,
  History,
  HealthAndSafety,
} from '@mui/icons-material';
import { useConsents } from '../../hooks/useConsents';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';
import { DataCategory } from '../../types/consent';

interface ConsentManagerProps {
  patientId: string;
}

interface ConsentSetting {
  id: string;
  clinicId: string;
  clinicName: string;
  accessLevel: 'none' | 'limited' | 'full';
  dataCategories: DataCategory[];
  lastUpdated: string;
  purposes: string[];
  isActive: boolean;
}

export const ConsentManager: React.FC<ConsentManagerProps> = ({ patientId }) => {
  const theme = useTheme();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState<ConsentSetting | null>(
    null
  );
  const { data: consents, isLoading, error, updateConsent } = useConsents(patientId);

  const handleConsentToggle = async (
    consent: ConsentSetting,
    newIsActive: boolean
  ) => {
    try {
      await updateConsent({
        ...consent,
        isActive: newIsActive,
        accessLevel: newIsActive ? 'limited' : 'none',
      });
    } catch (error) {
      console.error('Failed to update consent:', error);
    }
  };

  const handleEditConsent = (consent: ConsentSetting) => {
    setSelectedConsent(consent);
    setEditDialogOpen(true);
  };

  const handleSaveConsent = async () => {
    if (!selectedConsent) return;

    try {
      await updateConsent(selectedConsent);
      setEditDialogOpen(false);
      setSelectedConsent(null);
    } catch (error) {
      console.error('Failed to save consent:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert error={error} />;
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <HealthAndSafety
          sx={{ mr: 1, color: theme.palette.primary.main }}
        />
        <Typography variant="h6">Data Sharing Consents</Typography>
      </Box>

      <List>
        {consents?.map((consent: ConsentSetting) => (
          <ListItem
            key={consent.id}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              mb: 1,
              bgcolor: 'background.paper',
            }}
          >
            <ListItemText
              primary={
                <Box display="flex" alignItems="center">
                  <Typography variant="subtitle1">
                    {consent.clinicName}
                  </Typography>
                  <Chip
                    size="small"
                    label={consent.accessLevel}
                    color={
                      consent.accessLevel === 'full'
                        ? 'success'
                        : consent.accessLevel === 'limited'
                        ? 'warning'
                        : 'error'
                    }
                    sx={{ ml: 1 }}
                  />
                </Box>
              }
              secondary={
                <Box mt={1}>
                  <Typography variant="body2" color="text.secondary">
                    {consent.dataCategories.length} categories shared
                  </Typography>
                  <Box display="flex" alignItems="center" mt={0.5}>
                    <History sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="caption" color="text.secondary">
                      Last updated: {new Date(consent.lastUpdated).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <Box display="flex" alignItems="center">
                <Tooltip title="Edit sharing preferences">
                  <IconButton
                    edge="end"
                    onClick={() => handleEditConsent(consent)}
                    sx={{ mr: 1 }}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Switch
                  edge="end"
                  checked={consent.isActive}
                  onChange={(e) =>
                    handleConsentToggle(consent, e.target.checked)
                  }
                />
              </Box>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Sharing Preferences</DialogTitle>
        <DialogContent>
          {selectedConsent && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {selectedConsent.clinicName}
              </Typography>

              <Typography variant="subtitle2" mt={2} mb={1}>
                Access Level
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedConsent.accessLevel === 'full'}
                      onChange={(e) =>
                        setSelectedConsent({
                          ...selectedConsent,
                          accessLevel: e.target.checked ? 'full' : 'limited',
                        })
                      }
                    />
                  }
                  label="Full Access"
                />
              </FormGroup>

              <Typography variant="subtitle2" mt={2} mb={1}>
                Data Categories
              </Typography>
              <FormGroup>
                {Object.values(DataCategory).map((category) => (
                  <FormControlLabel
                    key={category}
                    control={
                      <Checkbox
                        checked={selectedConsent.dataCategories.includes(
                          category
                        )}
                        onChange={(e) =>
                          setSelectedConsent({
                            ...selectedConsent,
                            dataCategories: e.target.checked
                              ? [...selectedConsent.dataCategories, category]
                              : selectedConsent.dataCategories.filter(
                                  (c) => c !== category
                                ),
                          })
                        }
                      />
                    }
                    label={category}
                  />
                ))}
              </FormGroup>

              <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  display="flex"
                  alignItems="center"
                >
                  <Info sx={{ fontSize: 20, mr: 1 }} />
                  Your privacy is important. You can change these settings at any
                  time.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveConsent}
            variant="contained"
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
