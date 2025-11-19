export function isSameDate(date1: string, date2?: string): boolean {
  const d1 = new Date(date1);
  const d2 = date2 ? new Date(date2) : new Date(); // default to today if not provided

  // Compare only year, month, and day (ignore time zone/time)
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export type FormattedDate = {
    text: string;
    month: string;
    day: string;
    year: string;
}

export function getFormattedDate(month?: number, day?: number, year?: number): FormattedDate {
  const today = new Date();

  // Use provided values or fallback to today's components
  const m = month ?? today.getMonth(); // Months are zero-based
  const d = day ?? today.getDate();
  const y = year ?? today.getFullYear();

  // Format with leading zeros
  const formattedMonth = (m + 1).toString().padStart(2, "0");
  const formattedDay = d.toString().padStart(2, "0");
  const formattedYear = y.toString(); // Last two digits

  return { text:`${formattedMonth}/${formattedDay}/${formattedYear.slice(-2)}`, month: formattedMonth, day: formattedDay, year: formattedYear };
}