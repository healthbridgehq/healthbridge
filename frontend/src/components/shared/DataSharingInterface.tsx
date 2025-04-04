import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Chip,
  TextField,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Share,
  Edit,
  Delete,
  Search,
  Timer,
  Lock,
  LockOpen,
  Info,
  ContentCopy,
  QrCode,
} from '@mui/icons-material';
import {
  ActionButton,
  StyledCard,
  ConsentToggle,
  LoadingIndicator,
  Notification,
  EmptyState,
  FadeIn,
} from './UIComponents';

interface DataCategory {
  id: string;
  name: string;
  description: string;
  sensitive: boolean;
}

interface SharingPermission {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientType: 'clinic' | 'doctor' | 'patient';
  categories: string[];
  granted: Date;
  expires?: Date;
  status: 'active' | 'expired' | 'revoked';
}

interface DataSharingInterfaceProps {
  userId: string;
  userType: 'patient' | 'clinic';
  onShare?: (data: any) => Promise<void>;
  onRevoke?: (permissionId: string) => Promise<void>;
}

export const DataSharingInterface: React.FC<DataSharingInterfaceProps> = ({
  userId,
  userType,
  onShare,
  onRevoke,
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [permissions, setPermissions] = useState<SharingPermission[]>([]);

  // Mock data categories - replace with actual data from your backend
  const dataCategories: DataCategory[] = [
    {
      id: 'demographics',
      name: 'Demographics',
      description: 'Basic personal information',
      sensitive: false,
    },
    {
      id: 'medical_history',
      name: 'Medical History',
      description: 'Past medical conditions and treatments',
      sensitive: true,
    },
    {
      id: 'medications',
      name: 'Medications',
      description: 'Current and past medications',
      sensitive: true,
    },
    {
      id: 'test_results',
      name: 'Test Results',
      description: 'Laboratory and imaging results',
      sensitive: true,
    },
  ];

  const handleShare = async () => {
    try {
      setLoading(true);
      if (onShare) {
        await onShare({
          categories: selectedCategories,
          // Add other sharing parameters
        });
      }
      setNotification({ message: 'Data shared successfully', type: 'success' });
      setShareDialogOpen(false);
    } catch (error) {
      setNotification({ message: 'Failed to share data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (permissionId: string) => {
    try {
      setLoading(true);
      if (onRevoke) {
        await onRevoke(permissionId);
      }
      setNotification({ message: 'Access revoked successfully', type: 'success' });
    } catch (error) {
      setNotification({ message: 'Failed to revoke access', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderShareDialog = () => (
    <Dialog
      open={shareDialogOpen}
      onClose={() => setShareDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Share Health Data</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" gutterBottom>
          Select data categories to share:
        </Typography>
        <Box sx={{ mt: 2 }}>
          {dataCategories.map((category) => (
            <ConsentToggle
              key={category.id}
              label={category.name}
              description={category.description}
              value={selectedCategories.includes(category.id)}
              onChange={(checked) => {
                if (checked) {
                  setSelectedCategories([...selectedCategories, category.id]);
                } else {
                  setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                }
              }}
            />
          ))}
        </Box>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Share settings:
          </Typography>
          <TextField
            fullWidth
            label="Expires after"
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">days</InputAdornment>,
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Add note (optional)"
            multiline
            rows={2}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <ActionButton
          onClick={() => setShareDialogOpen(false)}
          color="inherit"
        >
          Cancel
        </ActionButton>
        <ActionButton
          onClick={handleShare}
          loading={loading}
          disabled={selectedCategories.length === 0}
          variant="contained"
          color="primary"
        >
          Share Data
        </ActionButton>
      </DialogActions>
    </Dialog>
  );

  const renderPermissionsList = () => (
    <List>
      {permissions.map((permission) => (
        <FadeIn key={permission.id}>
          <StyledCard sx={{ mb: 2 }}>
            <ListItem>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1">
                      {permission.recipientName}
                    </Typography>
                    <Chip
                      size="small"
                      label={permission.status}
                      color={permission.status === 'active' ? 'success' : 'default'}
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Shared categories:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {permission.categories.map((categoryId) => {
                        const category = dataCategories.find(c => c.id === categoryId);
                        return category ? (
                          <Chip
                            key={categoryId}
                            size="small"
                            label={category.name}
                            variant="outlined"
                            icon={category.sensitive ? <Lock /> : undefined}
                          />
                        ) : null;
                      })}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Timer fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {permission.expires
                            ? `Expires ${new Date(permission.expires).toLocaleDateString()}`
                            : 'No expiration'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Tooltip title="Edit sharing settings">
                  <IconButton
                    edge="end"
                    onClick={() => {/* Handle edit */}}
                    sx={{ mr: 1 }}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Revoke access">
                  <IconButton
                    edge="end"
                    onClick={() => handleRevoke(permission.id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          </StyledCard>
        </FadeIn>
      ))}
    </List>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">Data Sharing</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage who has access to your health data
        </Typography>
      </Box>

      {/* Search and Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search shared access..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <ActionButton
          variant="contained"
          startIcon={<Share />}
          onClick={() => setShareDialogOpen(true)}
        >
          Share Data
        </ActionButton>
      </Box>

      {/* Active Permissions */}
      <Typography variant="subtitle1" gutterBottom>
        Active Sharing
      </Typography>
      {permissions.length > 0 ? (
        renderPermissionsList()
      ) : (
        <EmptyState
          icon={<LockOpen sx={{ fontSize: 48 }} />}
          title="No active sharing"
          description="You haven't shared your health data with anyone yet."
          action={
            <ActionButton
              variant="outlined"
              startIcon={<Share />}
              onClick={() => setShareDialogOpen(true)}
            >
              Share Data
            </ActionButton>
          }
        />
      )}

      {/* Share Dialog */}
      {renderShareDialog()}

      {/* Notification */}
      {notification && (
        <Notification
          open={!!notification}
          message={notification.message}
          severity={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Loading Overlay */}
      {loading && <LoadingIndicator />}
    </Box>
  );
};
