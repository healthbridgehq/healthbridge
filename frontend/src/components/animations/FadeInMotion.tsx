import React from 'react';
import { motion, Variants } from 'framer-motion';

interface FadeInMotionProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}

const FadeInMotion: React.FC<FadeInMotionProps> = ({
  children,
  delay = 0,
  duration = 0.6,
  direction = 'up',
  distance = 20,
}) => {
  const getDirectionalVariants = (): Variants => {
    const directionMap = {
      up: { y: distance },
      down: { y: -distance },
      left: { x: distance },
      right: { x: -distance },
    };

    const initial = {
      opacity: 0,
      ...directionMap[direction],
    };

    return {
      hidden: initial,
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          duration,
          delay,
          ease: 'easeOut',
        },
      },
    };
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={getDirectionalVariants()}
    >
      {children}
    </motion.div>
  );
};

export default FadeInMotion;
