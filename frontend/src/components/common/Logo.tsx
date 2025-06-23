import React from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';

interface LogoProps {
  variant?: 'light' | 'dark' | 'auto';
  size?: 'small' | 'medium' | 'large';
  withText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  variant = 'auto',
  size = 'medium',
  withText = false,
  className,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Determine size based on prop
  const getSizeValue = () => {
    switch (size) {
      case 'small':
        return isMobile ? 24 : 32;
      case 'large':
        return isMobile ? 48 : 64;
      default: // medium
        return isMobile ? 32 : 40;
    }
  };

  // Determine color based on variant and theme
  const getColor = () => {
    if (variant === 'light') return '#ffffff';
    if (variant === 'dark') return theme.palette.primary.dark;
    // Auto variant - adapt based on theme mode
    return theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.primary.dark;
  };

  const logoSize = getSizeValue();
  const color = getColor();

  // Animation variants for the logo
  const pathVariants = {
    hidden: {
      opacity: 0,
      pathLength: 0,
    },
    visible: {
      opacity: 1,
      pathLength: 1,
      transition: {
        duration: 1,
        ease: "easeInOut",
      },
    },
  };

  const nodeVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: theme.spacing(2),
      }}
      className={className}
    >
      <svg
        width={logoSize}
        height={logoSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Connection lines */}
        <motion.path
          d="M50 20 L20 80 L80 80 Z"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          variants={pathVariants}
        />
        
        {/* Nodes */}
        <motion.circle
          cx="50"
          cy="20"
          r="10"
          fill={color}
          variants={nodeVariants}
          transition={{ delay: 0.8 }}
        />
        <motion.circle
          cx="20"
          cy="80"
          r="10"
          fill={color}
          variants={nodeVariants}
          transition={{ delay: 0.9 }}
        />
        <motion.circle
          cx="80"
          cy="80"
          r="10"
          fill={color}
          variants={nodeVariants}
          transition={{ delay: 1 }}
        />
      </svg>

      {withText && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          style={{
            fontFamily: theme.typography.h6.fontFamily,
            fontSize: logoSize * 0.75,
            fontWeight: 600,
            color: color,
            letterSpacing: '-0.02em',
          }}
        >
          HealthBridge
        </motion.div>
      )}
    </motion.div>
  );
};

export default Logo;
