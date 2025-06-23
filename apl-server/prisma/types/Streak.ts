import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const StreakPlain = t.Object(
  {
    id: t.Integer(),
    ankiStreak: t.Integer(),
    immersionStreak: t.Integer(),
    reportId: t.Integer(),
  },
  { additionalProperties: false },
);

export const StreakRelations = t.Object(
  {
    report: t.Object(
      {
        id: t.Integer(),
        reportNo: t.Integer(),
        score: t.Integer(),
        userId: t.Integer(),
        syncDataId: t.Integer(),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const StreakPlainInputCreate = t.Object(
  { ankiStreak: t.Integer(), immersionStreak: t.Integer() },
  { additionalProperties: false },
);

export const StreakPlainInputUpdate = t.Object(
  {
    ankiStreak: t.Optional(t.Integer()),
    immersionStreak: t.Optional(t.Integer()),
  },
  { additionalProperties: false },
);

export const StreakRelationsInputCreate = t.Object(
  {
    report: t.Object(
      {
        connect: t.Object(
          {
            id: t.Integer({ additionalProperties: false }),
          },
          { additionalProperties: false },
        ),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const StreakRelationsInputUpdate = t.Partial(
  t.Object(
    {
      report: t.Object(
        {
          connect: t.Object(
            {
              id: t.Integer({ additionalProperties: false }),
            },
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    },
    { additionalProperties: false },
  ),
);

export const StreakWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          ankiStreak: t.Integer(),
          immersionStreak: t.Integer(),
          reportId: t.Integer(),
        },
        { additionalProperties: false },
      ),
    { $id: "Streak" },
  ),
);

export const StreakWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.Integer(), reportId: t.Integer() },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [t.Object({ id: t.Integer() }), t.Object({ reportId: t.Integer() })],
          { additionalProperties: false },
        ),
        t.Partial(
          t.Object({
            AND: t.Union([
              Self,
              t.Array(Self, { additionalProperties: false }),
            ]),
            NOT: t.Union([
              Self,
              t.Array(Self, { additionalProperties: false }),
            ]),
            OR: t.Array(Self, { additionalProperties: false }),
          }),
          { additionalProperties: false },
        ),
        t.Partial(
          t.Object(
            {
              id: t.Integer(),
              ankiStreak: t.Integer(),
              immersionStreak: t.Integer(),
              reportId: t.Integer(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Streak" },
);

export const StreakSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      ankiStreak: t.Boolean(),
      immersionStreak: t.Boolean(),
      reportId: t.Boolean(),
      report: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const StreakInclude = t.Partial(
  t.Object(
    { report: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const StreakOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      ankiStreak: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      immersionStreak: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      reportId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Streak = t.Composite([StreakPlain, StreakRelations], {
  additionalProperties: false,
});

export const StreakInputCreate = t.Composite(
  [StreakPlainInputCreate, StreakRelationsInputCreate],
  { additionalProperties: false },
);

export const StreakInputUpdate = t.Composite(
  [StreakPlainInputUpdate, StreakRelationsInputUpdate],
  { additionalProperties: false },
);
