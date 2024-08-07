import { getMatureCards, getRetention } from "../anki/db.ts";

const ret = await getRetention()
process.exit(0);