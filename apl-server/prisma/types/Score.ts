import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const ScorePlain = t.Object(
  {
    id: t.Integer(),
    immersionScore: t.Integer(),
    ankiScore: t.Integer(),
    totalScore: t.Integer(),
    reportId: t.Integer(),
  },
  { additionalProperties: false },
);

export const ScoreRelations = t.Object(
  {
    report: t.Object(
      {
        id: t.Integer(),
        reportNo: t.Integer(),
        userId: t.Integer(),
        syncDataId: t.Integer(),
        averageImmersionTime: t.Integer(),
        bestImmersionTime: t.Integer(),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const ScorePlainInputCreate = t.Object(
  {
    immersionScore: t.Integer(),
    ankiScore: t.Integer(),
    totalScore: t.Integer(),
  },
  { additionalProperties: false },
);

export const ScorePlainInputUpdate = t.Object(
  {
    immersionScore: t.Optional(t.Integer()),
    ankiScore: t.Optional(t.Integer()),
    totalScore: t.Optional(t.Integer()),
  },
  { additionalProperties: false },
);

export const ScoreRelationsInputCreate = t.Object(
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

export const ScoreRelationsInputUpdate = t.Partial(
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

export const ScoreWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          immersionScore: t.Integer(),
          ankiScore: t.Integer(),
          totalScore: t.Integer(),
          reportId: t.Integer(),
        },
        { additionalProperties: false },
      ),
    { $id: "Score" },
  ),
);

export const ScoreWhereUnique = t.Recursive(
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
              immersionScore: t.Integer(),
              ankiScore: t.Integer(),
              totalScore: t.Integer(),
              reportId: t.Integer(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Score" },
);

export const ScoreSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      immersionScore: t.Boolean(),
      ankiScore: t.Boolean(),
      totalScore: t.Boolean(),
      reportId: t.Boolean(),
      report: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const ScoreInclude = t.Partial(
  t.Object(
    { report: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const ScoreOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      immersionScore: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      ankiScore: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      totalScore: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      reportId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Score = t.Composite([ScorePlain, ScoreRelations], {
  additionalProperties: false,
});

export const ScoreInputCreate = t.Composite(
  [ScorePlainInputCreate, ScoreRelationsInputCreate],
  { additionalProperties: false },
);

export const ScoreInputUpdate = t.Composite(
  [ScorePlainInputUpdate, ScoreRelationsInputUpdate],
  { additionalProperties: false },
);
