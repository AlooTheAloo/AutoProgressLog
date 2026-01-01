import dayjs from "dayjs";

/**
 * secondsSinceMidnight: number of seconds since 00:00:00 in timezone A
 * tzA: IANA timezone of the original clock (e.g. "America/New_York")
 *
 * Returns a Date representing that local time in tzA (for "today" in tzA).
 * You can then view/format it in timezone B with dayjs(...).tz(tzB).
 */
export function secondsSinceMidnightToDateInTZ_A(
  secondsSinceMidnight: number,
  tzA: string
): dayjs.Dayjs {
  const hours = Math.floor(secondsSinceMidnight / 3600);
  const minutes = Math.floor((secondsSinceMidnight % 3600) / 60);
  const seconds = secondsSinceMidnight % 60;
  console.log(dayjs.tz(tzA));
  return dayjs()
    .tz(tzA)
    .set("hours", hours)
    .set("minutes", minutes)
    .set("seconds", seconds);
}
