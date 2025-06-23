import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

interface DataPoint {
  date: string;
  value: number;
  unit?: string;
}

interface HealthDataChartProps {
  title: string;
  description?: string;
  data: DataPoint[];
  color?: string;
  unit?: string;
  domain?: [number, number];
}

const HealthDataChart: React.FC<HealthDataChartProps> = ({
  title,
  description,
  data,
  color = '#1E88E5',
  unit = '',
  domain,
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  const chartVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.3,
        duration: 0.8
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <Card
        sx={{
          height: '100%',
          minHeight: 400,
          backgroundColor: 'background.paper',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
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

          <motion.div
            variants={chartVariants}
            style={{ width: '100%', height: 300 }}
          >
            <ResponsiveContainer>
              <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#9e9e9e"
                  tick={{ fill: '#9e9e9e' }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#9e9e9e"
                  tick={{ fill: '#9e9e9e' }}
                  tickLine={false}
                  domain={domain || ['auto', 'auto']}
                  unit={unit}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                  }}
                  labelStyle={{ color: '#212121' }}
                  itemStyle={{ color: '#212121' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: color,
                    stroke: '#fff',
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HealthDataChart;
