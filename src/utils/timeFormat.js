/**
 * Time formatting helpers for 12-hour AM/PM and square card layouts
 */

export const formatTo12Hour = (timeStr) => {
  if (!timeStr) return '';
  
  // If already contains AM or PM
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    return timeStr;
  }

  // Expects HH:MM or HH:MM:SS
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];

  if (isNaN(hours)) return timeStr;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // '0' should be '12'

  return `${hours}:${minutes} ${ampm}`;
};

export const formatHourTo12Hour = (hourNumber) => {
  const ampm = hourNumber >= 12 ? 'PM' : 'AM';
  const h = hourNumber % 12 === 0 ? 12 : hourNumber % 12;
  return `${h}:00 ${ampm}`;
};
