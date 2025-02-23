export const isHtmlResponse = (data: any): boolean => {
  if (typeof data === 'string') {
    return (
      data.trim().toLowerCase().startsWith('<!doctype html') ||
      data.trim().toLowerCase().startsWith('<html')
    );
  }
  return false;
};
