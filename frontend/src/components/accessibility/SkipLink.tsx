import React from 'react';
import { Box, Button, styled } from '@mui/material';

const StyledSkipLink = styled(Button)(({ theme }) => ({
  position: 'absolute',
  top: -100,
  left: theme.spacing(2),
  zIndex: theme.zIndex.tooltip + 1,
  transition: 'top 0.2s ease-in-out',
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: theme.shadows[4],
  '&:focus': {
    top: theme.spacing(2),
  },
}));

interface SkipLinkProps {
  targetId: string;
  label?: string;
}

const SkipLink: React.FC<SkipLinkProps> = ({
  targetId,
  label = 'Skip to main content',
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.tabIndex = -1;
      target.focus();
      target.addEventListener(
        'blur',
        () => {
          target.tabIndex = 0;
        },
        { once: true }
      );
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <StyledSkipLink
        variant="contained"
        onClick={handleClick}
        aria-label={label}
      >
        {label}
      </StyledSkipLink>
    </Box>
  );
};

export default SkipLink;
