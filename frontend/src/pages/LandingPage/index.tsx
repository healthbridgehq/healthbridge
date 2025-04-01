import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Container, useTheme } from '@mui/material';
import Hero from './sections/Hero';
import Features from './sections/Features';
import HowItWorks from './sections/HowItWorks';
import SecuritySection from './sections/SecuritySection';
import Testimonials from './sections/Testimonials';
import CTASection from './sections/CTASection';
import { useInView } from 'react-intersection-observer';

const LandingPage: React.FC = () => {
  const theme = useTheme();
  
  // Lazy load sections as they come into view
  const [featuresRef, featuresInView] = useInView({ triggerOnce: true });
  const [howItWorksRef, howItWorksInView] = useInView({ triggerOnce: true });
  const [securityRef, securityInView] = useInView({ triggerOnce: true });
  const [testimonialsRef, testimonialsInView] = useInView({ triggerOnce: true });
  
  // SEO metadata
  const seoMetadata = {
    title: 'HealthBridge - Secure Patient Data Platform',
    description: 'HealthBridge is a privacy-first, AI-powered healthcare platform that gives patients control over their health data while enabling secure sharing with healthcare providers.',
    keywords: 'healthcare data, patient privacy, health records, secure data sharing, AI healthcare',
  };

  return (
    <>
      <Helmet>
        <title>{seoMetadata.title}</title>
        <meta name="description" content={seoMetadata.description} />
        <meta name="keywords" content={seoMetadata.keywords} />
        
        {/* Open Graph tags */}
        <meta property="og:title" content={seoMetadata.title} />
        <meta property="og:description" content={seoMetadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://healthbridge.com" />
        <meta property="og:image" content="/og-image.jpg" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoMetadata.title} />
        <meta name="twitter:description" content={seoMetadata.description} />
        <meta name="twitter:image" content="/twitter-card.jpg" />
        
        {/* Structured data for rich snippets */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HealthcareService",
            "name": "HealthBridge",
            "description": seoMetadata.description,
            "provider": {
              "@type": "Organization",
              "name": "HealthBridge",
              "sameAs": ["https://healthbridge.com"]
            },
            "areaServed": "Australia",
            "availableChannel": {
              "@type": "ServiceChannel",
              "serviceUrl": "https://healthbridge.com"
            }
          })}
        </script>
      </Helmet>

      <Box
        component="main"
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Hero />

        <Container maxWidth="lg">
          <Box ref={featuresRef}>
            {featuresInView && <Features />}
          </Box>

          <Box ref={howItWorksRef}>
            {howItWorksInView && <HowItWorks />}
          </Box>

          <Box ref={securityRef}>
            {securityInView && <SecuritySection />}
          </Box>

          <Box ref={testimonialsRef}>
            {testimonialsInView && <Testimonials />}
          </Box>

          <CTASection />
        </Container>
      </Box>
    </>
  );
};

export default LandingPage;
