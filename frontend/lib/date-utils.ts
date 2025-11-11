export const getRelativeDateText = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  if (diffDays <= 7) return `In ${diffDays} days`;
  
  return date.toLocaleDateString();
};

export const isDateOverdue = (dateString: string): boolean => {
  return new Date(dateString) < new Date();
};

export const isDateToday = (dateString: string): boolean => {
  return new Date(dateString).toDateString() === new Date().toDateString();
};

export const getDateSortValue = (dateString: string): number => {
  return new Date(dateString).getTime();
};