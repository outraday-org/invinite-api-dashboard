/**
 * Format API date or datetime strings using English locale.
 * Date-only strings parse as UTC in JS which can shift a day in some timezones;
 * force local midnight when time info is absent to keep the calendar day stable.
 * Time is hidden by default; pass { hideTime: false } to show time.
 */
export function formatEnDateTime(value: string, options?: { hideTime?: boolean }) {
    const hasTime = /[T ]\d{2}:\d{2}/.test(value);

    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);

    const normalized = isDateOnly ? `${value}T00:00:00` : value.replace(" ", "T");

    const parsed = hasTime || isDateOnly ? new Date(normalized) : new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    const showTime = hasTime && options?.hideTime === false;

    return new Intl.DateTimeFormat("en", {
        day: "2-digit",
        month: "numeric",
        year: "numeric",
        ...(showTime ? { hour: "2-digit", minute: "2-digit" } : null),
    }).format(parsed);
}
