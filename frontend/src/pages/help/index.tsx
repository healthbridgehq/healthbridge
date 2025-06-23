import React from 'react';
import { HelpCentre } from '../../components/help/HelpCentre';
import GettingStartedArticle from '../../components/help/articles/patient/GettingStarted';

export const PatientHelpCentre: React.FC = () => (
  <HelpCentre type="patient" />
);

export const ClinicHelpCentre: React.FC = () => (
  <HelpCentre type="clinic" />
);

export const PatientGettingStarted: React.FC = () => (
  <GettingStartedArticle />
);
