// src/lib/utils.ts

export function format12Hour(time24: string): string {
  if (!time24) return 'Por definir';
  
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(time24)) {
    return time24;
  }
  
  const [hours, minutes] = time24.split(':');
  let hour = parseInt(hours);
  const minute = minutes;
  
  const ampm = hour >= 12 ? 'PM' : 'AM';
  
  hour = hour % 12;
  hour = hour ? hour : 12;
  
  return `${hour}:${minute} ${ampm}`;
}

export function formatDateSpanish(dateString: string): string {
  if (!dateString) return 'Por definir';
  
  try {
    const date = new Date(dateString + 'T00:00:00');
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('es-DO', options);
  } catch (error) {
    return dateString;
  }
}

export function capitalizeWords(str: string): string {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function truncateText(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}