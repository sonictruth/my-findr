export const pluralize = (count: number, noun: string, suffix = 's') =>
  `${count} ${noun}${count !== 1 ? suffix : ''}`;

export const getHTMLColorFromArray = (
  components: Array<number> = [1, 1, 1, 1]
): string => {
  if (Array.isArray(components) && components.length < 3) {
    return '#FF0000';
  }
  const hex = components
    .map((component, index) => {
      const value = index === 0 ? component : component * 255;
      return Math.round(value).toString(16).padStart(2, '0');
    })
    .join('');
  return '#' + hex;
};

export function timeSince(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''}`;
    }
  }

  return `${seconds} second${seconds !== 1 ? 's' : ''}`;
}
