/**
 * Format API date or datetime strings using English locale.
 * Date-only strings parse as UTC in JS which can shift a day in some timezones;
 * force local midnight when time info is absent to keep the calendar day stable.
 */
export function formatEnDateTime(value: string, options?: { hideTime?: boolean }) {
    const parsed = value.includes("T") ? new Date(value) : new Date(`${value}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    const hasTime = value.includes("T");
    const showTime = hasTime && options?.hideTime !== true;

    return new Intl.DateTimeFormat("en", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        ...(showTime ? { hour: "2-digit", minute: "2-digit" } : null),
    }).format(parsed);
}
