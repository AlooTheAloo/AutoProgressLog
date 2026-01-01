import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const AnkiRetentionMode = t.Union(
  [t.Literal("ANKI_DEFAULT"), t.Literal("TRUE_RETENTION")],
  { additionalProperties: false },
);
