/**
 * Převede Date na string pro datetime-local input (v lokálním čase)
 */
export const toLocalDateTimeString = (date: Date): string => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

/**
 * Formats the date for display to the user in their local time.
 * E.g., "Monday, March 15, 2:00 PM"
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
 * Formats only the date (without time) in local time
 * E.g., "March 15, 2025"
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
 * Formats only the time in local time
 * E.g., "14:00"
 */
export const formatLocalTime = (dateInput: string | Date): string => {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
