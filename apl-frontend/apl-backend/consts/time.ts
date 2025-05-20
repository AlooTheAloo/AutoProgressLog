import dayjs from "dayjs";

export const HHMMSS = "HH:mm:ss";
export const HHMM = "HH:mm";

export const roundSecondsToHours = (seconds: number) =>
  Math.round(seconds / 3600);
export default function formatTime(time: number) {
  const dur = dayjs.duration(time, "s");
  return dur.format(`[${Math.floor(dur.asHours())}]:mm:ss`);
}
