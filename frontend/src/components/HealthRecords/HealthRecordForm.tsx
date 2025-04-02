import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useHealthRecords } from '../../hooks/useHealthRecords';
import { debounce } from 'lodash';

// Form validation schema
const schema = yup.object().shape({
  title: yup
    .string()
    .required('Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: yup
    .string()
    .required('Description is required')
    .max(1000, 'Description must be less than 1000 characters'),
  type: yup
    .string()
    .required('Record type is required')
    .oneOf(['consultation', 'test', 'prescription', 'other']),
  date: yup
    .date()
    .required('Date is required')
    .max(new Date(), 'Date cannot be in the future'),
  provider: yup
    .string()
    .required('Healthcare provider is required'),
  attachments: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().required(),
        type: yup.string().required(),
        size: yup.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
      })
    ),
});

interface HealthRecord {
  id?: string;
  title: string;
  description: string;
  type: 'consultation' | 'test' | 'prescription' | 'other';
  date: string;
  provider: string;
  attachments: Array<{
    name: string;
    type: string;
    size: number;
  }>;
}

interface HealthRecordFormProps {
  initialData?: Partial<HealthRecord>;
  onSuccess?: () => void;
}

const HealthRecordForm: React.FC<HealthRecordFormProps> = ({
  initialData,
  onSuccess,
}) => {
  const { createRecord, updateRecord, loading, error } = useHealthRecords();
  
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialData || {
      title: '',
      description: '',
      type: '',
      date: new Date().toISOString().split('T')[0],
      provider: '',
      attachments: [],
    },
    mode: 'onChange',
  });

  // Debounced auto-save for drafts
  const debouncedSave = React.useCallback(
    debounce((data) => {
      localStorage.setItem('healthRecordDraft', JSON.stringify(data));
    }, 1000),
    []
  );

  // Handle form submission
  const onSubmit = async (data: HealthRecord) => {
    try {
      if (initialData?.id) {
        await updateRecord(initialData.id, data);
      } else {
        await createRecord(data);
      }
      
      // Clear draft and reset form
      localStorage.removeItem('healthRecordDraft');
      reset();
      
      // Notify parent of success
      onSuccess?.();
    } catch (err) {
      console.error('Form submission failed:', err);
    }
  };

  // Load draft on mount
  React.useEffect(() => {
    if (!initialData) {
      const draft = localStorage.getItem('healthRecordDraft');
      if (draft) {
        reset(JSON.parse(draft));
      }
    }
  }, [initialData, reset]);

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Title"
                  fullWidth
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  onChange={(e) => {
                    field.onChange(e);
                    debouncedSave({ ...field.value, title: e.target.value });
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  multiline
                  rows={4}
                  fullWidth
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  onChange={(e) => {
                    field.onChange(e);
                    debouncedSave({ ...field.value, description: e.target.value });
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Record Type"
                  fullWidth
                  error={!!errors.type}
                  helperText={errors.type?.message}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Select type</option>
                  <option value="consultation">Consultation</option>
                  <option value="test">Test Result</option>
                  <option value="prescription">Prescription</option>
                  <option value="other">Other</option>
                </TextField>
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  label="Date"
                  fullWidth
                  error={!!errors.date}
                  helperText={errors.date?.message}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="provider"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Healthcare Provider"
                  fullWidth
                  error={!!errors.provider}
                  helperText={errors.provider?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => reset()}
                disabled={loading || !isDirty}
              >
                Reset
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !isDirty || !isValid}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {initialData ? 'Update' : 'Create'} Record
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default React.memo(HealthRecordForm);
