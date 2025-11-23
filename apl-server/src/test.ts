import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import tz from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(duration);
dayjs.extend(tz);
dayjs.extend(utc);

import { secondsSinceMidnightToDateInTZ_A } from "./services/util/time";

const time = secondsSinceMidnightToDateInTZ_A(120, "Japan");
dayjs(time);
console.log(time);
