import { getMatureCards, getRetention } from "../anki/db.ts";

const ma = await getRetention()
console.log(ma);
process.exit(0);