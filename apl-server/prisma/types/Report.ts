import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const ReportPlain = t.Object(
  {
    id: t.Integer(),
    reportNo: t.Integer(),
    score: t.Integer(),
    userId: t.Integer(),
  },
  { additionalProperties: false },
);

export const ReportRelations = t.Object(
  {
    streak: __nullable__(
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
    user: t.Object(
      {
        id: t.Integer(),
        email: t.String(),
        firstName: __nullable__(t.String()),
        lastName: __nullable__(t.String()),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const ReportPlainInputCreate = t.Object(
  { reportNo: t.Integer(), score: t.Integer() },
  { additionalProperties: false },
);

export const ReportPlainInputUpdate = t.Object(
  { reportNo: t.Optional(t.Integer()), score: t.Optional(t.Integer()) },
  { additionalProperties: false },
);

export const ReportRelationsInputCreate = t.Object(
  {
    streak: t.Optional(
      t.Object(
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
    ),
    user: t.Object(
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

export const ReportRelationsInputUpdate = t.Partial(
  t.Object(
    {
      streak: t.Partial(
        t.Object(
          {
            connect: t.Object(
              {
                id: t.Integer({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            disconnect: t.Boolean(),
          },
          { additionalProperties: false },
        ),
      ),
      user: t.Object(
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

export const ReportWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          reportNo: t.Integer(),
          score: t.Integer(),
          userId: t.Integer(),
        },
        { additionalProperties: false },
      ),
    { $id: "Report" },
  ),
);

export const ReportWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            {
              id: t.Integer(),
              reportNo_userId: t.Object(
                { reportNo: t.Integer(), userId: t.Integer() },
                { additionalProperties: false },
              ),
            },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [
            t.Object({ id: t.Integer() }),
            t.Object({
              reportNo_userId: t.Object(
                { reportNo: t.Integer(), userId: t.Integer() },
                { additionalProperties: false },
              ),
            }),
          ],
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
              reportNo: t.Integer(),
              score: t.Integer(),
              userId: t.Integer(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Report" },
);

export const ReportSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      reportNo: t.Boolean(),
      score: t.Boolean(),
      streak: t.Boolean(),
      userId: t.Boolean(),
      user: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const ReportInclude = t.Partial(
  t.Object(
    { streak: t.Boolean(), user: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const ReportOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      reportNo: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      score: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Report = t.Composite([ReportPlain, ReportRelations], {
  additionalProperties: false,
});

export const ReportInputCreate = t.Composite(
  [ReportPlainInputCreate, ReportRelationsInputCreate],
  { additionalProperties: false },
);

export const ReportInputUpdate = t.Composite(
  [ReportPlainInputUpdate, ReportRelationsInputUpdate],
  { additionalProperties: false },
);
