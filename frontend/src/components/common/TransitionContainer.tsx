import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Box, BoxProps } from '@mui/material';

interface TransitionContainerProps extends BoxProps {
  children: React.ReactNode;
  delay?: number;
  staggerChildren?: number;
  animation?: 'fadeIn' | 'slideUp' | 'scale';
}

const containerVariants: Record<string, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  },
  slideUp: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  },
  scale: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  },
};

const itemVariants: Record<string, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  },
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  },
};

const TransitionContainer: React.FC<TransitionContainerProps> = ({
  children,
  delay = 0,
  staggerChildren = 0.1,
  animation = 'fadeIn',
  ...boxProps
}) => {
  const selectedContainer = containerVariants[animation];
  const selectedItem = itemVariants[animation];

  return (
    <Box component={motion.div} {...boxProps}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={selectedContainer}
        transition={{ delay, staggerChildren }}
      >
        {React.Children.map(children, (child) => (
          <motion.div variants={selectedItem}>
            {child}
          </motion.div>
        ))}
      </motion.div>
    </Box>
  );
};

export default TransitionContainer;
