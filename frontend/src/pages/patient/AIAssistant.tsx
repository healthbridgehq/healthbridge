import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from 'react-query';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  Info,
  ContentCopy,
  Save,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import {
  sendMessage,
  fetchConversationHistory,
  saveConversation,
  fetchHealthContext,
} from '../../services/api/patient';
import { formatTime } from '../../utils/dateUtils';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  references?: {
    title: string;
    url: string;
  }[];
}

interface HealthContext {
  conditions: string[];
  medications: string[];
  allergies: string[];
  recentAppointments: {
    date: string;
    type: string;
    diagnosis?: string;
  }[];
}

const AIAssistant: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [message, setMessage] = useState('');
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Fetch conversation history
  const { data: history, isLoading: historyLoading } = useQuery(
    'conversationHistory',
    fetchConversationHistory
  );

  // Fetch health context
  const { data: healthContext } = useQuery<HealthContext>(
    'healthContext',
    fetchHealthContext
  );

  // Send message mutation
  const sendMessageMutation = useMutation(sendMessage, {
    onSuccess: (response) => {
      setIsTyping(false);
    },
    onError: (error: any) => {
      setIsTyping(false);
      enqueueSnackbar(error.message || 'Failed to send message', { variant: 'error' });
    },
  });

  // Save conversation mutation
  const saveConversationMutation = useMutation(saveConversation, {
    onSuccess: () => {
      enqueueSnackbar('Conversation saved successfully', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to save conversation', { variant: 'error' });
    },
  });

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsTyping(true);
    const userMessage = message;
    setMessage('');

    sendMessageMutation.mutate(userMessage);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    enqueueSnackbar('Message copied to clipboard', { variant: 'success' });
  };

  const renderMessage = (msg: Message) => (
    <ListItem
      key={msg.id}
      sx={{
        flexDirection: 'column',
        alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
        width: '100%',
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        sx={{
          mb: 0.5,
          width: '100%',
          justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
        }}
      >
        <ListItemAvatar>
          <Avatar>
            {msg.sender === 'ai' ? <SmartToy /> : <Person />}
          </Avatar>
        </ListItemAvatar>
        <Typography variant="caption" color="textSecondary">
          {formatTime(msg.timestamp)}
        </Typography>
      </Box>

      <Paper
        elevation={1}
        sx={{
          p: 2,
          maxWidth: '70%',
          bgcolor: msg.sender === 'user' ? 'primary.light' : 'background.paper',
          color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary',
          position: 'relative',
        }}
      >
        <Typography variant="body1">{msg.content}</Typography>
        
        {msg.references && msg.references.length > 0 && (
          <Box mt={1}>
            <Typography variant="caption" color="textSecondary">
              References:
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
              {msg.references.map((ref, index) => (
                <Chip
                  key={index}
                  label={ref.title}
                  size="small"
                  component="a"
                  href={ref.url}
                  target="_blank"
                  clickable
                />
              ))}
            </Box>
          </Box>
        )}

        <IconButton
          size="small"
          onClick={() => handleCopyMessage(msg.content)}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            opacity: 0.5,
            '&:hover': { opacity: 1 },
          }}
        >
          <ContentCopy fontSize="small" />
        </IconButton>
      </Paper>
    </ListItem>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">AI Health Assistant</Typography>
          <Box>
            <Tooltip title="View Health Context">
              <IconButton onClick={() => setInfoDialogOpen(true)}>
                <Info />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<Save />}
              onClick={() => saveConversationMutation.mutate()}
              sx={{ ml: 1 }}
            >
              Save Conversation
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
              {historyLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <CircularProgress />
                </Box>
              ) : (
                <List>
                  {history?.map((msg) => renderMessage(msg))}
                  {isTyping && (
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <SmartToy />
                        </Avatar>
                      </ListItemAvatar>
                      <CircularProgress size={24} />
                    </ListItem>
                  )}
                  <div ref={messagesEndRef} />
                </List>
              )}
            </CardContent>

            <Box component="form" onSubmit={handleSendMessage} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Grid container spacing={2}>
                <Grid item xs>
                  <TextField
                    fullWidth
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isTyping}
                    multiline
                    maxRows={4}
                  />
                </Grid>
                <Grid item>
                  <Button
                    type="submit"
                    variant="contained"
                    endIcon={<Send />}
                    disabled={!message.trim() || isTyping}
                  >
                    Send
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Health Context Dialog */}
      <Dialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Your Health Context</DialogTitle>
        <DialogContent>
          <List>
            <ListItem>
              <ListItemText
                primary="Medical Conditions"
                secondary={
                  healthContext?.conditions.length
                    ? healthContext.conditions.join(', ')
                    : 'None recorded'
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Current Medications"
                secondary={
                  healthContext?.medications.length
                    ? healthContext.medications.join(', ')
                    : 'None recorded'
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Allergies"
                secondary={
                  healthContext?.allergies.length
                    ? healthContext.allergies.join(', ')
                    : 'None recorded'
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Recent Appointments"
                secondary={
                  healthContext?.recentAppointments.length
                    ? healthContext.recentAppointments.map((apt) => (
                        <Box key={apt.date} mt={1}>
                          {apt.type} on {apt.date}
                          {apt.diagnosis && ` - ${apt.diagnosis}`}
                        </Box>
                      ))
                    : 'No recent appointments'
                }
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIAssistant;
