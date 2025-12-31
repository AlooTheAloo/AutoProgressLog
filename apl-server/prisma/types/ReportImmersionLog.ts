import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const ReportImmersionLogPlain = t.Object(
  {
    id: t.Integer(),
    activityName: t.String(),
    seconds: t.Integer(),
    reportId: t.Integer(),
  },
  { additionalProperties: false },
);

export const ReportImmersionLogRelations = t.Object(
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

export const ReportImmersionLogPlainInputCreate = t.Object(
  { activityName: t.String(), seconds: t.Integer() },
  { additionalProperties: false },
);

export const ReportImmersionLogPlainInputUpdate = t.Object(
  { activityName: t.Optional(t.String()), seconds: t.Optional(t.Integer()) },
  { additionalProperties: false },
);

export const ReportImmersionLogRelationsInputCreate = t.Object(
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

export const ReportImmersionLogRelationsInputUpdate = t.Partial(
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

export const ReportImmersionLogWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          activityName: t.String(),
          seconds: t.Integer(),
          reportId: t.Integer(),
        },
        { additionalProperties: false },
      ),
    { $id: "ReportImmersionLog" },
  ),
);

export const ReportImmersionLogWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object({ id: t.Integer() }, { additionalProperties: false }),
          { additionalProperties: false },
        ),
        t.Union([t.Object({ id: t.Integer() })], {
          additionalProperties: false,
        }),
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
              activityName: t.String(),
              seconds: t.Integer(),
              reportId: t.Integer(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "ReportImmersionLog" },
);

export const ReportImmersionLogSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      activityName: t.Boolean(),
      seconds: t.Boolean(),
      reportId: t.Boolean(),
      report: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const ReportImmersionLogInclude = t.Partial(
  t.Object(
    { report: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const ReportImmersionLogOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      activityName: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      seconds: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      reportId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const ReportImmersionLog = t.Composite(
  [ReportImmersionLogPlain, ReportImmersionLogRelations],
  { additionalProperties: false },
);

export const ReportImmersionLogInputCreate = t.Composite(
  [ReportImmersionLogPlainInputCreate, ReportImmersionLogRelationsInputCreate],
  { additionalProperties: false },
);

export const ReportImmersionLogInputUpdate = t.Composite(
  [ReportImmersionLogPlainInputUpdate, ReportImmersionLogRelationsInputUpdate],
  { additionalProperties: false },
);
