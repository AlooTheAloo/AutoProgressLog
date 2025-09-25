import dayjs from "dayjs";

export default function formatTime(time: number) {
  const dur = dayjs.duration(time, "s");
  return dur.format(`[${Math.floor(dur.asHours())}]:mm:ss`);
}
