export const formatURL = (url: string): string => {
  if (url.startsWith("http")) return url;
  return `//${url}`;
};
