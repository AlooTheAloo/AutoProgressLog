import dayjs from "dayjs";

export default function formatTime(time: number): string {
  if(time < 0){
    return "-" + formatTime(-time);
  }
  const dur = dayjs.duration(time, "s");
  return dur.format(`[${Math.floor(dur.asHours())}]:mm:ss`);
}
