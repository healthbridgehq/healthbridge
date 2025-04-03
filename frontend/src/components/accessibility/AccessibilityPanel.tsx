import React from 'react';
import {
  Box,
  Drawer,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  Button,
  useTheme,
  IconButton,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Accessibility,
  Close,
  TextFields,
  Contrast,
  Animation,
  Keyboard,
  RecordVoiceOver,
  FontDownload,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAccessibility } from '../../providers/AccessibilityProvider';

interface AccessibilityPanelProps {
  open: boolean;
  onClose: () => void;
}

const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const { settings, updateSettings } = useAccessibility();

  const handleFontSizeChange = (event: any) => {
    updateSettings({ fontSize: event.target.value });
  };

  const handleContrastChange = (event: any) => {
    updateSettings({ contrast: event.target.value });
  };

  const toggleSetting = (setting: keyof typeof settings) => {
    updateSettings({ [setting]: !settings[setting] });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          p: 3,
        },
      }}
    >
      <Box
        component={motion.div}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Accessibility color="primary" />
            <Typography variant="h6">Accessibility Settings</Typography>
          </Box>
          <IconButton
            onClick={onClose}
            aria-label="Close accessibility panel"
          >
            <Close />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Text Size */}
          <FormControl fullWidth>
            <InputLabel id="font-size-label">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextFields fontSize="small" />
                Text Size
              </Box>
            </InputLabel>
            <Select
              labelId="font-size-label"
              value={settings.fontSize}
              onChange={handleFontSizeChange}
              label="Text Size"
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="large">Large</MenuItem>
              <MenuItem value="x-large">Extra Large</MenuItem>
            </Select>
          </FormControl>

          {/* Contrast */}
          <FormControl fullWidth>
            <InputLabel id="contrast-label">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Contrast fontSize="small" />
                Contrast
              </Box>
            </InputLabel>
            <Select
              labelId="contrast-label"
              value={settings.contrast}
              onChange={handleContrastChange}
              label="Contrast"
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="high">High Contrast</MenuItem>
            </Select>
          </FormControl>

          {/* Toggles */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.reducedMotion}
                  onChange={() => toggleSetting('reducedMotion')}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Animation fontSize="small" />
                  <Typography>Reduce Motion</Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.keyboardNavigation}
                  onChange={() => toggleSetting('keyboardNavigation')}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Keyboard fontSize="small" />
                  <Typography>Enhanced Keyboard Navigation</Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.screenReader}
                  onChange={() => toggleSetting('screenReader')}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RecordVoiceOver fontSize="small" />
                  <Typography>Screen Reader Optimizations</Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.dyslexicFont}
                  onChange={() => toggleSetting('dyslexicFont')}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FontDownload fontSize="small" />
                  <Typography>Dyslexia-Friendly Font</Typography>
                </Box>
              }
            />
          </Box>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              updateSettings(defaultSettings);
            }}
          >
            Reset to Defaults
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default AccessibilityPanel;
