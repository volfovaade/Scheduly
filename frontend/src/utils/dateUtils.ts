/**
 * Converts a Date to a string suitable for datetime-local input fields.
 * Accounts for timezone offset to display the correct local time.
 *
 * @param date - The date to convert
 * @returns String in format YYYY-MM-DDTHH:mm suitable for datetime-local inputs
 */
export const toLocalDateTimeString = (date: Date): string => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

/**
 * Formats a date for user-friendly display in their local time.
 * Default format: "Monday, March 15, 2:00 PM"
 *
 * @param dateInput - Date string or Date object
 * @param options - Optional Intl.DateTimeFormatOptions for custom formatting
 * @returns Formatted date string
 */
export const formatLocalDateTime = (
  dateInput: string | Date,
  options?: Intl.DateTimeFormatOptions,
): string => {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toLocaleString(
    "en-US",
    options ?? {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
};

/**
 * Formats only the date portion (no time) in local time.
 * Example format: "March 15, 2025"
 *
 * @param dateInput - Date string or Date object
 * @returns Formatted date string without time
 */
export const formatLocalDate = (dateInput: string | Date): string => {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/**
 * Formats only the time portion (no date) in local time.
 * Example format: "14:00"
 *
 * @param dateInput - Date string or Date object
 * @returns Formatted time string (HH:MM format)
 */
export const formatLocalTime = (dateInput: string | Date): string => {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
