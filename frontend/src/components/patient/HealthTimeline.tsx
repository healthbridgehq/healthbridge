import React, { useState } from 'react';
import {
  Box,
  Typography,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  MedicalServices,
  Medication,
  LocalHospital,
  Science,
  Image,
  Description,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useHealthTimeline } from '../../hooks/useHealthTimeline';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';

interface HealthTimelineProps {
  patientId: string;
}

interface TimelineEvent {
  id: string;
  type: 'appointment' | 'prescription' | 'pathology' | 'imaging' | 'document' | 'hospital';
  date: string;
  title: string;
  description: string;
  provider: string;
  status: 'completed' | 'scheduled' | 'cancelled';
  details?: Record<string, any>;
}

const eventTypeConfig = {
  appointment: {
    icon: <MedicalServices />,
    color: 'primary',
    label: 'Appointment',
  },
  prescription: {
    icon: <Medication />,
    color: 'secondary',
    label: 'Prescription',
  },
  pathology: {
    icon: <Science />,
    color: 'info',
    label: 'Pathology',
  },
  imaging: {
    icon: <Image />,
    color: 'warning',
    label: 'Imaging',
  },
  document: {
    icon: <Description />,
    color: 'success',
    label: 'Document',
  },
  hospital: {
    icon: <LocalHospital />,
    color: 'error',
    label: 'Hospital',
  },
};

export const HealthTimeline: React.FC<HealthTimelineProps> = ({ patientId }) => {
  const theme = useTheme();
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const { data: events, isLoading, error } = useHealthTimeline(patientId);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert error={error} />;
  }

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };

  const renderEventDetails = (event: TimelineEvent) => {
    if (!expandedEvents.has(event.id)) {
      return null;
    }

    switch (event.type) {
      case 'appointment':
        return (
          <Box mt={1}>
            <Typography variant="body2">
              Provider: {event.provider}
              <br />
              Location: {event.details?.location}
              <br />
              Duration: {event.details?.duration} minutes
            </Typography>
          </Box>
        );

      case 'prescription':
        return (
          <Box mt={1}>
            <Typography variant="body2">
              Medication: {event.details?.medication}
              <br />
              Dosage: {event.details?.dosage}
              <br />
              Instructions: {event.details?.instructions}
            </Typography>
          </Box>
        );

      case 'pathology':
      case 'imaging':
        return (
          <Box mt={1}>
            <Typography variant="body2">
              Test: {event.details?.testName}
              <br />
              Status: {event.details?.status}
              <br />
              Results: {event.details?.results || 'Pending'}
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Health Timeline
      </Typography>

      <Timeline position="alternate">
        {events?.map((event: TimelineEvent) => (
          <TimelineItem key={event.id}>
            <TimelineOppositeContent color="text.secondary">
              <Typography variant="body2">
                {format(new Date(event.date), 'PPp')}
              </Typography>
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot
                sx={{
                  bgcolor: theme.palette[eventTypeConfig[event.type].color].main,
                }}
              >
                {eventTypeConfig[event.type].icon}
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>

            <TimelineContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="subtitle1">{event.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {event.description}
                  </Typography>
                  <Box mt={1}>
                    <Chip
                      label={eventTypeConfig[event.type].label}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={event.status}
                      size="small"
                      color={
                        event.status === 'completed'
                          ? 'success'
                          : event.status === 'cancelled'
                          ? 'error'
                          : 'primary'
                      }
                    />
                  </Box>
                  {renderEventDetails(event)}
                </Box>
                <Tooltip
                  title={
                    expandedEvents.has(event.id) ? 'Show less' : 'Show more'
                  }
                >
                  <IconButton
                    size="small"
                    onClick={() => toggleEventExpansion(event.id)}
                  >
                    {expandedEvents.has(event.id) ? (
                      <ExpandLess />
                    ) : (
                      <ExpandMore />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  );
};
