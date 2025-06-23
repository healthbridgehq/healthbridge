import React from 'react';
import { Container, Typography, Box, Paper, List, ListItem, ListItemText, ListItemIcon, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import { Article as ArticleIcon } from '@mui/icons-material';
import { helpArticles, HelpArticleData } from '../../data/helpArticles';

interface HelpCategoryProps {
  category: string;
  type: 'public' | 'patient' | 'clinic';
}

export const HelpCategory: React.FC<HelpCategoryProps> = ({ category, type }) => {
  const articles = helpArticles.filter(
    article => article.category === category && article.type === type
  );

  if (articles.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography>No articles found in this category.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Breadcrumbs sx={{ mb: 4 }}>
        <MuiLink component={Link} to="/help" color="inherit">
          Help Centre
        </MuiLink>
        <Typography color="text.primary">{category}</Typography>
      </Breadcrumbs>

      <Typography variant="h4" component="h1" gutterBottom>
        {category}
      </Typography>

      <Paper sx={{ mt: 4 }}>
        <List>
          {articles.map((article: HelpArticleData) => (
            <ListItem
              key={article.id}
              component={Link}
              to={`${article.categoryPath}/${article.id}`}
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon>
                <ArticleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={article.title}
                secondary={
                  <Box component="span" sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {article.tags.map(tag => (
                      <Typography
                        key={tag}
                        variant="caption"
                        sx={{
                          backgroundColor: 'action.selected',
                          padding: '2px 8px',
                          borderRadius: '12px',
                        }}
                      >
                        {tag}
                      </Typography>
                    ))}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default HelpCategory;
