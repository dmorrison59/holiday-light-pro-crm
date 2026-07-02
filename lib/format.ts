export const formatDate = (value: string) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));

export const customerName = (firstName: string, lastName: string) => [firstName, lastName].filter(Boolean).join(" ");

export const propertyAddress = (property: { address_line_1: string; address_line_2?: string | null; city: string; state: string; zip: string }) =>
  [property.address_line_1, property.address_line_2, [property.city, property.state].filter(Boolean).join(", "), property.zip].filter(Boolean).join(" · ");

const crmTimeZone = "America/New_York";

const zonedParts = (value: string | Date) => {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: crmTimeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(value));
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
};

export const crmDateKey = (value: string | Date) => {
  const parts = zonedParts(value);
  return `${parts.year}-${parts.month}-${parts.day}`;
};

export const toDateTimeLocal = (value?: string | null) => {
  if (!value) return "";
  const parts = zonedParts(value);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
};

export const formatVisitDate = (value?: string | null) => value
  ? new Intl.DateTimeFormat("en-US", { timeZone: crmTimeZone, month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value))
  : "Date to be scheduled";
