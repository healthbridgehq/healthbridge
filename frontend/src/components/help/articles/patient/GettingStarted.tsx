import React from 'react';
import { Typography, Box } from '@mui/material';
import HelpArticle from '../../HelpArticle';

const GettingStartedContent = () => (
  <>
    <Typography variant="body1" paragraph>
      Welcome to HealthBridge! This guide will walk you through setting up your account and getting started with managing your health journey.
    </Typography>

    <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
      Step 1: Creating Your Account
    </Typography>
    <Box component="ol">
      <li>
        <Typography variant="body1" paragraph>
          Visit the HealthBridge sign-up page and click "Create Account"
        </Typography>
      </li>
      <li>
        <Typography variant="body1" paragraph>
          Enter your email address and create a secure password
        </Typography>
      </li>
      <li>
        <Typography variant="body1" paragraph>
          Verify your email address by clicking the link we send you
        </Typography>
      </li>
    </Box>

    <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
      Step 2: Complete Your Profile
    </Typography>
    <Box component="ol">
      <li>
        <Typography variant="body1" paragraph>
          Add your personal information (name, date of birth, contact details)
        </Typography>
      </li>
      <li>
        <Typography variant="body1" paragraph>
          Upload a profile photo (optional)
        </Typography>
      </li>
      <li>
        <Typography variant="body1" paragraph>
          Add your Medicare number and any relevant health insurance information
        </Typography>
      </li>
    </Box>

    <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
      Step 3: Connect Your My Health Record
    </Typography>
    <Box component="ol">
      <li>
        <Typography variant="body1" paragraph>
          Go to the "Integrations" section in your profile
        </Typography>
      </li>
      <li>
        <Typography variant="body1" paragraph>
          Click "Connect My Health Record"
        </Typography>
      </li>
      <li>
        <Typography variant="body1" paragraph>
          Follow the secure authentication process to link your My Health Record
        </Typography>
      </li>
    </Box>

    <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
      Step 4: Find and Connect with Healthcare Providers
    </Typography>
    <Box component="ol">
      <li>
        <Typography variant="body1" paragraph>
          Use the "Find Providers" feature to search for healthcare providers in your area
        </Typography>
      </li>
      <li>
        <Typography variant="body1" paragraph>
          Browse provider profiles and services
        </Typography>
      </li>
      <li>
        <Typography variant="body1" paragraph>
          Add your regular healthcare providers to your "My Care Team"
        </Typography>
      </li>
    </Box>

    <Typography variant="body1" sx={{ mt: 4 }} paragraph>
      Need help? Our support team is available 24/7 to assist you. Contact us through the chat feature or email support@healthbridge.com.au
    </Typography>
  </>
);

const GettingStartedArticle: React.FC = () => {
  return (
    <HelpArticle
      title="Getting Started with HealthBridge"
      category="Getting Started"
      categoryPath="/help/patient/getting-started"
      content={<GettingStartedContent />}
      lastUpdated="April 4, 2025"
    />
  );
};

export default GettingStartedArticle;
