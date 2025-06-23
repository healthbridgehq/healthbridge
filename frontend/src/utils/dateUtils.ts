export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (time: string): string => {
  return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};
