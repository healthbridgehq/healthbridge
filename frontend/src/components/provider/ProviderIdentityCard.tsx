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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Edit as EditIcon,
  VerifiedUser as VerifiedIcon,
  Warning as WarningIcon,
  School as EducationIcon,
  LocalHospital as HospitalIcon,
  HealthAndSafety as HealthIcon,
  Assignment as InsuranceIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { colors } from '../../theme/colors';

interface ProviderIdentityCardProps {
  firstName: string;
  lastName: string;
  ahpraNumber: string;
  providerNumber: string;
  subspecialties: string[];
  qualifications: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  clinicAffiliations: Array<{
    clinicId: string;
    clinicName: string;
    role: string;
    startDate: string;
  }>;
  insurance: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
  };
  verificationStatus: {
    ahpra: boolean;
    providerNumber: boolean;
    qualifications: boolean;
    insurance: boolean;
  };
  onEdit?: () => void;
  onVerify?: () => void;
}

const ProviderIdentityCard: React.FC<ProviderIdentityCardProps> = ({
  firstName,
  lastName,
  ahpraNumber,
  providerNumber,
  subspecialties,
  qualifications,
  clinicAffiliations,
  insurance,
  verificationStatus,
  onEdit,
  onVerify,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

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
            <Typography variant="h6">Healthcare Provider Identity</Typography>
            {Object.values(verificationStatus).every(status => status) ? (
              <Chip
                icon={<VerifiedIcon />}
                label="Fully Verified"
                color="success"
                size="small"
                sx={{ ml: 2 }}
              />
            ) : (
              <Chip
                icon={<WarningIcon />}
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
              <Tooltip title="Verify Credentials" arrow>
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
          {/* Professional Registration */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Professional Registration
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Name:</strong> Dr. {firstName} {lastName}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>AHPRA Number:</strong> {ahpraNumber}
                {getVerificationIcon(verificationStatus.ahpra)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Provider Number:</strong> {providerNumber}
                {getVerificationIcon(verificationStatus.providerNumber)}
              </Typography>
            </Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Subspecialties
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {subspecialties.map((specialty) => (
                <Chip
                  key={specialty}
                  label={specialty}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>

          {/* Qualifications */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Qualifications {getVerificationIcon(verificationStatus.qualifications)}
            </Typography>
            <List dense>
              {qualifications.map((qual, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <EducationIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={qual.degree}
                    secondary={`${qual.institution}, ${qual.year}`}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>

          {/* Clinic Affiliations */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Current Clinic Affiliations
            </Typography>
            <List dense>
              {clinicAffiliations.map((affiliation, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <HospitalIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={affiliation.clinicName}
                    secondary={`${affiliation.role} - Since ${format(
                      new Date(affiliation.startDate),
                      'MMMM yyyy'
                    )}`}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>

          {/* Insurance */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Professional Indemnity Insurance {getVerificationIcon(verificationStatus.insurance)}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <InsuranceIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={insurance.provider}
                  secondary={`Policy: ${insurance.policyNumber} - Expires: ${format(
                    new Date(insurance.expiryDate),
                    'dd/MM/yyyy'
                  )}`}
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ProviderIdentityCard;
