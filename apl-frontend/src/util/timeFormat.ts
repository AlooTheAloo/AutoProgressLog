import dayjs from "dayjs";

export default function formatTime(time: number) {
  const isNegative = time < 0;
  const absTime = Math.abs(time);
  const dur = dayjs.duration(absTime, "s");
  const hours = Math.floor(dur.asHours());
  const hoursStr = hours.toString().padStart(2, "0");
  return `${isNegative ? "-" : ""}${hoursStr}:${dur.format("mm:ss")}`;
}

export function getHours(time: number) {
  const dur = dayjs.duration(time, "s");
  return Math.floor(dur.asHours());
}

export function getMinutes(time: number) {
  const dur = dayjs.duration(time, "s");
  return dur.minutes();
}
