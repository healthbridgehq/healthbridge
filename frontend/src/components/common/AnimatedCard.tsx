import React from 'react';
import { Card, CardContent, CardProps, styled } from '@mui/material';
import { motion } from 'framer-motion';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  borderRadius: 8,
  overflow: 'hidden',
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.08)',
  },
}));

interface AnimatedCardProps extends CardProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  animate?: 'fadeIn' | 'slideUp' | 'scale' | 'none';
}

const variants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  },
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  },
};

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  duration = 0.6,
  animate = 'fadeIn',
  ...props
}) => {
  if (animate === 'none') {
    return (
      <StyledCard {...props}>
        <CardContent>{children}</CardContent>
      </StyledCard>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants[animate]}
      transition={{
        delay,
        duration,
      }}
    >
      <StyledCard {...props}>
        <CardContent>{children}</CardContent>
      </StyledCard>
    </motion.div>
  );
};

export default AnimatedCard;
