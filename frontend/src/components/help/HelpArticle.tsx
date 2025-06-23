import React from 'react';
import { Container, Typography, Paper, Box, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { styled } from '@mui/system';
import { helpArticles } from '../../data/helpArticles';

const ArticleImage = styled('img')({
  maxWidth: '100%',
  height: 'auto',
  borderRadius: '8px',
  marginBottom: '24px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
});

const StepBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& ol': {
    paddingLeft: theme.spacing(2),
    '& li': {
      marginBottom: theme.spacing(2),
    },
  },
}));

interface HelpArticleProps {
  type: 'public' | 'patient' | 'clinic';
}

export const HelpArticle: React.FC<HelpArticleProps> = ({ type }) => {
  const { articleId } = useParams();
  const article = helpArticles.find(a => a.id === articleId && a.type === type);

  if (!article) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography>Article not found.</Typography>
      </Container>
    );
  }

  const { title, category, categoryPath, content, lastUpdated } = article;
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Breadcrumbs sx={{ mb: 4 }}>
        <MuiLink component={Link} to="/help" color="inherit">
          Help Centre
        </MuiLink>
        <MuiLink component={Link} to={categoryPath} color="inherit">
          {category}
        </MuiLink>
        <Typography color="text.primary">{title}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        
        <Box sx={{ my: 4 }}>
          {content}
        </Box>

        <Typography variant="caption" color="text.secondary">
          Last updated: {lastUpdated}
        </Typography>
      </Paper>
    </Container>
  );
};

export default HelpArticle;
