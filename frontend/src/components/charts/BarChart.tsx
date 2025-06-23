import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { motion } from 'framer-motion';

interface BarChartProps {
  title: string;
  description?: string;
  data: Array<{ name: string; value: number }>;
  color?: string;
  unit?: string;
}

const BarChart: React.FC<BarChartProps> = ({
  title,
  description,
  data,
  color = '#43A047',
  unit = '',
}) => {
  const chartVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  const barVariants = {
    hidden: { scaleY: 0 },
    visible: {
      scaleY: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
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
          minHeight: 400,
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

          <Box sx={{ height: 300 }}>
            <ResponsiveContainer>
              <RechartsBarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#9e9e9e"
                  tick={{ fill: '#9e9e9e' }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#9e9e9e"
                  tick={{ fill: '#9e9e9e' }}
                  tickLine={false}
                  unit={unit}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                  }}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
                />
                <Bar
                  dataKey="value"
                  fill={color}
                  radius={[4, 4, 0, 0]}
                  animationBegin={0}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </RechartsBarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BarChart;
