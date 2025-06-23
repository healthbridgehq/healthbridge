import React from 'react';
import { Card, CardContent, Typography, Box, useTheme, useMediaQuery } from '@mui/material';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { motion } from 'framer-motion';

interface VitalDataPoint {
  timestamp: string;
  value: number;
  normalRangeLow?: number;
  normalRangeHigh?: number;
}

interface VitalsChartProps {
  title: string;
  description?: string;
  data: VitalDataPoint[];
  unit: string;
  normalRange?: {
    low: number;
    high: number;
  };
  type: 'blood-pressure' | 'heart-rate' | 'temperature' | 'oxygen' | 'glucose';
}

const VitalsChart: React.FC<VitalsChartProps> = ({
  title,
  description,
  data,
  unit,
  normalRange,
  type,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getChartColor = () => {
    switch (type) {
      case 'blood-pressure':
        return theme.palette.primary.main;
      case 'heart-rate':
        return theme.palette.error.main;
      case 'temperature':
        return theme.palette.warning.main;
      case 'oxygen':
        return theme.palette.info.main;
      case 'glucose':
        return theme.palette.secondary.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const chartVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const formatXAxis = (value: string) => {
    const date = new Date(value);
    return isMobile
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleString([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
  };

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const date = new Date(label);
      const isNormal = normalRange
        ? value >= normalRange.low && value <= normalRange.high
        : true;

      return (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            p: 2,
            borderRadius: 2,
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {date.toLocaleString()}
          </Typography>
          <Typography
            variant="body1"
            color={isNormal ? 'text.primary' : 'error.main'}
            sx={{ mt: 1, fontWeight: 'medium' }}
          >
            {value} {unit}
          </Typography>
          {!isNormal && (
            <Typography variant="body2" color="error.main" sx={{ mt: 0.5 }}>
              Outside normal range
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={chartVariants}
    >
      <Card
        sx={{
          height: '100%',
          minHeight: isMobile ? 300 : 400,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.08)',
          },
        }}
      >
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
          </Box>

          <Box sx={{ height: isMobile ? 200 : 300, width: '100%' }}>
            <ResponsiveContainer>
              <ComposedChart
                data={data}
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: isMobile ? 0 : 20,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatXAxis}
                  stroke="#9e9e9e"
                  tick={{ fill: '#9e9e9e', fontSize: isMobile ? 10 : 12 }}
                  tickLine={false}
                  interval={isMobile ? 'preserveEnd' : 0}
                />
                <YAxis
                  stroke="#9e9e9e"
                  tick={{ fill: '#9e9e9e', fontSize: isMobile ? 10 : 12 }}
                  tickLine={false}
                  unit={unit}
                  width={isMobile ? 30 : 40}
                />
                <Tooltip content={customTooltip} />
                
                {normalRange && (
                  <ReferenceArea
                    y1={normalRange.low}
                    y2={normalRange.high}
                    fill={getChartColor()}
                    fillOpacity={0.1}
                  />
                )}

                {normalRange && (
                  <>
                    <ReferenceLine
                      y={normalRange.low}
                      stroke={getChartColor()}
                      strokeDasharray="3 3"
                      strokeOpacity={0.5}
                    />
                    <ReferenceLine
                      y={normalRange.high}
                      stroke={getChartColor()}
                      strokeDasharray="3 3"
                      strokeOpacity={0.5}
                    />
                  </>
                )}

                <Area
                  type="monotone"
                  dataKey="value"
                  fill={getChartColor()}
                  fillOpacity={0.1}
                  stroke="none"
                />
                
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={getChartColor()}
                  strokeWidth={2}
                  dot={{
                    r: isMobile ? 2 : 3,
                    fill: getChartColor(),
                    stroke: '#fff',
                    strokeWidth: 1,
                  }}
                  activeDot={{
                    r: isMobile ? 4 : 6,
                    fill: getChartColor(),
                    stroke: '#fff',
                    strokeWidth: 2,
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VitalsChart;
