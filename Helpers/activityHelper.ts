import { activity } from "../types/activity";

export function compareActivities(a:activity,b:activity) {
    if (a.activitySeconds < b.activitySeconds)
        return -1;
    if (a.activitySeconds > b.activitySeconds)
        return 1;
    return 0;
}
  