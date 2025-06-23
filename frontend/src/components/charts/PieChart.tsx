import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';

interface DataItem {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  title: string;
  description?: string;
  data: DataItem[];
}

const ANIMATION_DURATION = 0.8;

const PieChart: React.FC<PieChartProps> = ({ title, description, data }) => {
  const theme = useTheme();

  const defaultColors = [
    theme.palette.primary.main,    // Deep Blue
    theme.palette.secondary.main,  // Teal Green
    theme.palette.medical.main,    // Soft Yellow
    '#90caf9',                    // Light Blue
    '#81c784',                    // Light Green
    '#fff176',                    // Light Yellow
  ];

  const chartVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: ANIMATION_DURATION,
        ease: 'easeOut',
      },
    },
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: '12px', fontWeight: 500 }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
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
              <RechartsPieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={120}
                  innerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || defaultColors[index % defaultColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                  }}
                  itemStyle={{ color: '#212121' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => (
                    <span style={{ color: '#212121' }}>{value}</span>
                  )}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PieChart;
