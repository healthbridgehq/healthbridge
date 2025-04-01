import React, { useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useHealthRecords } from '../../hooks/useHealthRecords';
import { ErrorBoundary } from 'react-error-boundary';
import { useVirtualizer } from '@tanstack/react-virtual';

interface HealthRecordItemProps {
  record: any;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// Memoized list item component
const HealthRecordItem = React.memo(({ record, onEdit, onDelete }: HealthRecordItemProps) => (
  <ListItem
    sx={{
      borderBottom: '1px solid',
      borderColor: 'divider',
      '&:hover': {
        bgcolor: 'action.hover',
      },
    }}
  >
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="subtitle1">{record.title}</Typography>
      <Typography variant="body2" color="text.secondary">
        Date: {new Date(record.createdAt).toLocaleDateString()}
      </Typography>
    </Box>
    <Box>
      <Tooltip title="Edit Record">
        <IconButton onClick={() => onEdit(record.id)} size="small">
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete Record">
        <IconButton
          onClick={() => onDelete(record.id)}
          size="small"
          color="error"
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </Box>
  </ListItem>
));

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <Alert
    severity="error"
    action={
      <Button color="inherit" size="small" onClick={resetErrorBoundary}>
        Try again
      </Button>
    }
  >
    {error.message}
  </Alert>
);

// Main component
const HealthRecordList: React.FC = () => {
  const {
    records,
    loading,
    error,
    fetchRecords,
    deleteRecord,
  } = useHealthRecords();

  // Fetch records on mount
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Memoize sorted records
  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [records]);

  // Virtual list setup for performance
  const parentRef = React.useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: sortedRecords.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Approximate height of each row
    overscan: 5, // Number of items to render outside visible area
  });

  // Handlers
  const handleEdit = (id: string) => {
    // Navigate to edit page or open edit modal
    console.log('Edit record:', id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await deleteRecord(id);
      } catch (err) {
        console.error('Failed to delete record:', err);
      }
    }
  };

  if (loading && !records.length) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={fetchRecords}>
      <Card>
        <CardContent>
          <Box
            ref={parentRef}
            style={{
              height: '600px',
              overflow: 'auto',
            }}
          >
            <List
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => (
                <Box
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <HealthRecordItem
                    record={sortedRecords[virtualRow.index]}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </Box>
              ))}
            </List>
          </Box>
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
};

export default React.memo(HealthRecordList);
