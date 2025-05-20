import dayjs from "dayjs";

export default function formatTime(time: number) {
  const dur = dayjs.duration(time, "s");
  return dur.format(`[${Math.floor(dur.asHours())}]:mm:ss`);
}

export function getHours(time: number) {
  const dur = dayjs.duration(time, "s");
  return Math.floor(dur.asHours());
}

export function getMinutes(time: number) {
  const dur = dayjs.duration(time, "s");
  return dur.minutes();
}
