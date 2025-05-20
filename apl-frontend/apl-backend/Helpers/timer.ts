import dayjs from "dayjs";
import { Time } from "../types/options";

const timeouts: Map<string, Timer> = new Map();

export function listenForTime(time: Time, callback: () => void): string {
  const now = dayjs();

  // Calculate the next occurrence of the time
  let reportTime = now.hour(time.hours).minute(time.minutes).second(0);
  if (reportTime.isBefore(now)) {
    reportTime = reportTime.add(1, "day");
  }

  const delay = 500;

  // Generate a unique ID for the timeout
  const id = `${time.hours}:${time.minutes}`;

  // Set a timeout to execute the callback at the specified time
  const timeout = setTimeout(() => {
    callback();
    // Re-schedule for the next day
    listenForTime(time, callback);
  }, delay);

  // Store the timeout reference
  timeouts.set(id, timeout);

  return id;
}

export function deleteListener(id: string): void {
  const timeout = timeouts.get(id);
  if (timeout) {
    clearTimeout(timeout);
    timeouts.delete(id);
  }
}

export function deleteAllListeners(): void {
  timeouts.forEach((timeout, id) => {
    clearTimeout(timeout);
    timeouts.delete(id);
  });
}
