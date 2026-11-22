/**
 * Formats a date string (e.g. "2026-11-25") into a readable due date string like "Due Nov 25".
 * If dateStr is empty, null, or invalid, returns null.
 * 
 * @param {string} dateStr 
 * @returns {string|null} Formatted date like "Due Nov 25" or null if no due date.
 */
export function formatDueDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // If already prefixed with "Due "
  if (trimmed.startsWith('Due ')) {
    return trimmed;
  }

  // Parse YYYY-MM-DD format explicitly to prevent local timezone shifts
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  let date;
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    date = new Date(year, month, day);
  } else {
    date = new Date(trimmed);
  }

  if (isNaN(date.getTime())) {
    return null;
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const currentYear = new Date().getFullYear();

  if (date.getFullYear() !== currentYear) {
    return `Due ${month} ${day}, ${date.getFullYear()}`;
  }

  return `Due ${month} ${day}`;
}
