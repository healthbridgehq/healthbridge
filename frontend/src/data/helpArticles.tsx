import React from 'react';
import { Typography, Box } from '@mui/material';

export interface HelpArticleData {
  id: string;
  title: string;
  category: string;
  categoryPath: string;
  content: React.ReactNode;
  lastUpdated: string;
  type: 'public' | 'patient' | 'clinic';
  tags: string[];
}

export const helpArticles: HelpArticleData[] = [
  // Public Articles
  {
    id: 'about-healthbridge',
    title: 'What is HealthBridge?',
    category: 'About HealthBridge',
    categoryPath: '/help/about',
    type: 'public',
    tags: ['overview', 'introduction'],
    lastUpdated: '2025-04-04',
    content: (
      <>
        <Typography variant="body1" paragraph>
          HealthBridge is a comprehensive healthcare platform that connects patients with healthcare providers, streamlines medical record management, and enhances the overall healthcare experience.
        </Typography>
        <Typography variant="h6" gutterBottom>Key Features:</Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <li>Secure health record management</li>
          <li>Easy appointment scheduling</li>
          <li>Integration with My Health Record</li>
          <li>Real-time communication with healthcare providers</li>
          <li>Advanced analytics and health insights</li>
        </Box>
      </>
    ),
  },
  {
    id: 'getting-started-guide',
    title: 'Getting Started with HealthBridge',
    category: 'Getting Started',
    categoryPath: '/help/getting-started',
    type: 'public',
    tags: ['setup', 'onboarding'],
    lastUpdated: '2025-04-04',
    content: (
      <>
        <Typography variant="body1" paragraph>
          Welcome to HealthBridge! This guide will help you get started with our platform.
        </Typography>
        <Typography variant="h6" gutterBottom>Steps to Get Started:</Typography>
        <Box component="ol" sx={{ pl: 2 }}>
          <li>Create your account by clicking "Sign Up" on the homepage</li>
          <li>Choose your account type (Patient or Healthcare Provider)</li>
          <li>Complete your profile with relevant information</li>
          <li>Connect your My Health Record (optional but recommended)</li>
          <li>Explore the platform's features</li>
        </Box>
      </>
    ),
  },
  {
    id: 'security-overview',
    title: 'Security and Data Protection',
    category: 'Privacy & Security',
    categoryPath: '/help/privacy',
    type: 'public',
    tags: ['security', 'privacy', 'data protection'],
    lastUpdated: '2025-04-04',
    content: (
      <>
        <Typography variant="body1" paragraph>
          At HealthBridge, we take your data security seriously. Learn about our comprehensive security measures.
        </Typography>
        <Typography variant="h6" gutterBottom>Our Security Measures:</Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <li>End-to-end encryption for all data</li>
          <li>Compliance with healthcare data regulations</li>
          <li>Regular security audits</li>
          <li>Multi-factor authentication</li>
          <li>Secure data centers</li>
        </Box>
      </>
    ),
  },
  // Patient Articles
  {
    id: 'patient-records-guide',
    title: 'Managing Your Health Records',
    category: 'Managing Your Profile',
    categoryPath: '/help/patient/profile',
    type: 'patient',
    tags: ['health records', 'medical history'],
    lastUpdated: '2025-04-04',
    content: (
      <>
        <Typography variant="body1" paragraph>
          Learn how to effectively manage your health records on HealthBridge.
        </Typography>
        <Typography variant="h6" gutterBottom>Key Features:</Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <li>Upload and organize medical documents</li>
          <li>Track medications and allergies</li>
          <li>Share records with healthcare providers</li>
          <li>Set privacy preferences</li>
        </Box>
      </>
    ),
  },
  // Clinic Articles
  {
    id: 'clinic-integration-guide',
    title: 'System Integration Guide',
    category: 'Integrations',
    categoryPath: '/help/clinic/integrations',
    type: 'clinic',
    tags: ['integration', 'setup', 'technical'],
    lastUpdated: '2025-04-04',
    content: (
      <>
        <Typography variant="body1" paragraph>
          Technical guide for integrating HealthBridge with your clinic's existing systems.
        </Typography>
        <Typography variant="h6" gutterBottom>Integration Steps:</Typography>
        <Box component="ol" sx={{ pl: 2 }}>
          <li>API Configuration</li>
          <li>Data Mapping Setup</li>
          <li>Testing and Validation</li>
          <li>Staff Training</li>
        </Box>
      </>
    ),
  },
];
