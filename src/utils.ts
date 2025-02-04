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

export function timeSince(date: Date) {

    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
    let interval = seconds / 31536000;
  
    if (interval > 1) {
      return Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutes";
    }
    return Math.floor(seconds) + " seconds";
  }