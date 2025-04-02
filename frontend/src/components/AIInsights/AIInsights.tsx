import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Grid,
  LinearProgress
} from '@mui/material';
import {
  Lightbulb as LightbulbIcon,
  TrendingUp as TrendingUpIcon,
  LocalHospital as LocalHospitalIcon,
  Share as ShareIcon
} from '@mui/icons-material';

interface Insight {
  id: string;
  title: string;
  description: string;
  confidence: number;
  category: string;
  timestamp: string;
}

const mockInsights: Insight[] = [
  {
    id: '1',
    title: 'Potential Diagnosis Pattern',
    description: 'Based on recent patient symptoms and test results, consider screening for autoimmune disorders.',
    confidence: 85,
    category: 'Diagnosis',
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    title: 'Treatment Effectiveness',
    description: 'Patients on the new treatment protocol show 40% better recovery rates.',
    confidence: 92,
    category: 'Treatment',
    timestamp: '4 hours ago'
  },
  {
    id: '3',
    title: 'Patient Risk Alert',
    description: 'Three patients show early warning signs of potential complications.',
    confidence: 78,
    category: 'Risk Assessment',
    timestamp: '1 day ago'
  }
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Diagnosis':
      return <LightbulbIcon />;
    case 'Treatment':
      return <LocalHospitalIcon />;
    case 'Risk Assessment':
      return <TrendingUpIcon />;
    default:
      return <LightbulbIcon />;
  }
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 90) return 'success';
  if (confidence >= 70) return 'primary';
  return 'warning';
};

const AIInsights: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        AI-Generated Insights
      </Typography>
      <Grid container spacing={3}>
        {mockInsights.map((insight) => (
          <Grid item xs={12} key={insight.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getCategoryIcon(insight.category)}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {insight.title}
                  </Typography>
                  <Chip
                    label={insight.category}
                    size="small"
                    sx={{ ml: 'auto' }}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {insight.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Box sx={{ flexGrow: 1, mr: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Confidence: {insight.confidence}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={insight.confidence}
                      color={getConfidenceColor(insight.confidence)}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {insight.timestamp}
                  </Typography>
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <ShareIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AIInsights;
