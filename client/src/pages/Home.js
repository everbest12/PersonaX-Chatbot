import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Chat as ChatIcon,
  Build as BuildIcon,
  Upload as UploadIcon,
  Translate as TranslateIcon,
} from '@mui/icons-material';

const features = [
  {
    icon: <ChatIcon sx={{ fontSize: 40 }} />,
    title: 'Multi-Persona Chat',
    description: 'Choose from various professional personas like doctors, therapists, developers, and more.',
  },
  {
    icon: <BuildIcon sx={{ fontSize: 40 }} />,
    title: 'Custom Bot Builder',
    description: 'Create and personalize your own chatbots with unique personalities and avatars.',
  },
  {
    icon: <UploadIcon sx={{ fontSize: 40 }} />,
    title: 'File Support',
    description: 'Upload and analyze various file types including videos, PDFs, and text documents.',
  },
  {
    icon: <TranslateIcon sx={{ fontSize: 40 }} />,
    title: 'Multi-language Support',
    description: 'Chat in multiple languages with a user interface that adapts to your preferences.',
  },
];

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography variant="h2" component="h1" gutterBottom>
                  Welcome to PersonaX
                </Typography>
                <Typography variant="h5" gutterBottom>
                  Your Intelligent Multi-Persona Chatbot Platform
                </Typography>
                <Typography variant="body1" paragraph>
                  Experience the future of AI conversations with customizable personas,
                  voice interactions, and file analysis capabilities.
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{ mt: 2 }}
                >
                  Get Started
                </Button>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Box
                  component="img"
                  src="/hero-image.png"
                  alt="PersonaX Hero"
                  sx={{
                    width: '100%',
                    maxWidth: 500,
                    height: 'auto',
                    borderRadius: 2,
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Key Features
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                    <Box
                      sx={{
                        color: 'primary.main',
                        mb: 2,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: 'secondary.main',
          color: 'white',
          py: 8,
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            Ready to Experience PersonaX?
          </Typography>
          <Typography variant="h6" align="center" paragraph>
            Join our community of users and start creating amazing conversations
            with AI personas today.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/register')}
            >
              Create Your Account
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 