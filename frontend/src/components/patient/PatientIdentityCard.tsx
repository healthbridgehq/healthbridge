import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  VerifiedUser as VerifiedIcon,
  Warning as WarningIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { colors } from '../../theme/colors';

interface PatientIdentityCardProps {
  ihi: string;
  medicareNumber: string;
  medicareIRN: string;
  medicareExpiryDate: string;
  verificationStatus: {
    ihi: boolean;
    medicare: boolean;
    identity: boolean;
  };
  personalDetails: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    indigenousStatus?: string;
    culturalBackground?: string;
    preferredLanguage: string;
    interpreterRequired: boolean;
  };
  onEdit?: () => void;
  onVerify?: () => void;
}

const PatientIdentityCard: React.FC<PatientIdentityCardProps> = ({
  ihi,
  medicareNumber,
  medicareIRN,
  medicareExpiryDate,
  verificationStatus,
  personalDetails,
  onEdit,
  onVerify,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const formatMedicareNumber = (number: string) => {
    return number.replace(/(\d{4})(\d{4})(\d{2})/, '$1 $2 $3');
  };

  const getVerificationIcon = (isVerified: boolean) => {
    if (isVerified) {
      return (
        <Tooltip title="Verified" arrow>
          <VerifiedIcon
            sx={{
              color: theme.palette.success.main,
              fontSize: '1.2rem',
              verticalAlign: 'middle',
              ml: 1,
            }}
          />
        </Tooltip>
      );
    }
    return (
      <Tooltip title="Verification Required" arrow>
        <WarningIcon
          sx={{
            color: theme.palette.warning.main,
            fontSize: '1.2rem',
            verticalAlign: 'middle',
            ml: 1,
          }}
        />
      </Tooltip>
    );
  };

  return (
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
            <Typography variant="h6">Patient Identity</Typography>
            {Object.values(verificationStatus).every(status => status) ? (
              <Chip
                icon={<LockIcon />}
                label="Verified"
                color="success"
                size="small"
                sx={{ ml: 2 }}
              />
            ) : (
              <Chip
                icon={<UnlockIcon />}
                label="Verification Required"
                color="warning"
                size="small"
                sx={{ ml: 2 }}
              />
            )}
          </Box>
        }
        action={
          <Box>
            {onVerify && !Object.values(verificationStatus).every(status => status) && (
              <Tooltip title="Verify Identity" arrow>
                <IconButton onClick={onVerify} size="small" sx={{ mr: 1 }}>
                  <VerifiedIcon />
                </IconButton>
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip title="Edit Details" arrow>
                <IconButton onClick={onEdit} size="small">
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        }
      />
      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Healthcare Identifiers
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>IHI:</strong> {ihi}
                {getVerificationIcon(verificationStatus.ihi)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Medicare Number:</strong> {formatMedicareNumber(medicareNumber)}
                {getVerificationIcon(verificationStatus.medicare)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Medicare IRN:</strong> {medicareIRN}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Medicare Expiry:</strong>{' '}
                {format(new Date(medicareExpiryDate), 'MM/yyyy')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Personal Details
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Name:</strong> {personalDetails.firstName} {personalDetails.lastName}
                {getVerificationIcon(verificationStatus.identity)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Date of Birth:</strong>{' '}
                {format(new Date(personalDetails.dateOfBirth), 'dd/MM/yyyy')}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Gender:</strong> {personalDetails.gender}
              </Typography>
              {personalDetails.indigenousStatus && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Indigenous Status:</strong> {personalDetails.indigenousStatus}
                </Typography>
              )}
              {personalDetails.culturalBackground && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Cultural Background:</strong>{' '}
                  {personalDetails.culturalBackground}
                </Typography>
              )}
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Preferred Language:</strong> {personalDetails.preferredLanguage}
                {personalDetails.interpreterRequired && (
                  <Chip
                    label="Interpreter Required"
                    size="small"
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PatientIdentityCard;
