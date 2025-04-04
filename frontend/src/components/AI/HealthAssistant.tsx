import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  IconButton,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  Info,
  ContentCopy,
  Check,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { APIClient } from '../../api/client';
import analytics from '../../utils/analytics';
import { useStore } from '../../store';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
}

const HealthAssistant: React.FC = () => {
  const theme = useTheme();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { state } = useStore();
  const queryClient = useQueryClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  interface ChatResponse {
    response: string;
  }

  const mutation = useMutation<ChatResponse, Error, string>({
    mutationFn: async (message: string): Promise<ChatResponse> => {
      const response = await APIClient.getInstance().post<ChatResponse>('/ai/chat', {
        query: message,
        patientContext: {
          age: state.user?.age,
          gender: state.user?.gender,
          conditions: state.user?.conditions,
        },
      });
      return response;
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: data?.response || 'No response received',
          sender: 'assistant',
          timestamp: new Date().toISOString(),
        },
      ]);
      analytics.trackEvent({
        category: 'AI',
        action: 'Chat Response',
        label: 'Success',
      });
      queryClient.invalidateQueries({ queryKey: ['chatHistory'] });
    },
    onError: (error) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: 'I apologize, but I encountered an error. Please try again.',
          sender: 'assistant',
          timestamp: new Date().toISOString(),
        },
      ]);
      analytics.trackError(error as Error, 'AI Chat');
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    mutation.mutate(userMessage.content);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(content);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box mb={2}>
          <Typography variant="h6" gutterBottom>
            Health Assistant
          </Typography>
          <Alert severity="info" icon={<Info />}>
            I can help answer general health questions, but always consult your healthcare provider
            for medical advice.
          </Alert>
        </Box>

        {/* Messages */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            mb: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Paper
                  sx={{
                    p: 2,
                    maxWidth: '80%',
                    ml: message.sender === 'assistant' ? 0 : 'auto',
                    mr: message.sender === 'assistant' ? 'auto' : 0,
                    bgcolor: message.sender === 'assistant'
                      ? 'background.paper'
                      : theme.palette.primary.main,
                    color: message.sender === 'assistant'
                      ? 'text.primary'
                      : 'white',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    {message.sender === 'assistant' ? (
                      <SmartToy fontSize="small" />
                    ) : (
                      <Person fontSize="small" />
                    )}
                    <Typography variant="caption">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Box>
                  <Typography variant="body1">{message.content}</Typography>
                  {message.sender === 'assistant' && (
                    <Box display="flex" justifyContent="flex-end" mt={1}>
                      <Tooltip title={copied === message.content ? 'Copied!' : 'Copy'}>
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(message.content)}
                        >
                          {copied === message.content ? (
                            <Check fontSize="small" />
                          ) : (
                            <ContentCopy fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Paper>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </Box>

        {/* Input */}
        <Box display="flex" gap={1}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your health-related question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={mutation.isPending}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!input.trim() || mutation.isPending}
          >
            {mutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              <Send />
            )}
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default HealthAssistant;
