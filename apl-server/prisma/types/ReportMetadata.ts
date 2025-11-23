import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const ReportMetadataPlain = t.Object(
  { id: t.Integer(), reportId: t.Integer(), hasAnki: t.Boolean() },
  { additionalProperties: false },
);

export const ReportMetadataRelations = t.Object(
  {
    report: t.Object(
      {
        id: t.Integer(),
        reportNo: t.Integer(),
        score: t.Integer(),
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

export const ReportMetadataPlainInputCreate = t.Object(
  { hasAnki: t.Boolean() },
  { additionalProperties: false },
);

export const ReportMetadataPlainInputUpdate = t.Object(
  { hasAnki: t.Optional(t.Boolean()) },
  { additionalProperties: false },
);

export const ReportMetadataRelationsInputCreate = t.Object(
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

export const ReportMetadataRelationsInputUpdate = t.Partial(
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

export const ReportMetadataWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          reportId: t.Integer(),
          hasAnki: t.Boolean(),
        },
        { additionalProperties: false },
      ),
    { $id: "ReportMetadata" },
  ),
);

export const ReportMetadataWhereUnique = t.Recursive(
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
            { id: t.Integer(), reportId: t.Integer(), hasAnki: t.Boolean() },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "ReportMetadata" },
);

export const ReportMetadataSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      reportId: t.Boolean(),
      report: t.Boolean(),
      hasAnki: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const ReportMetadataInclude = t.Partial(
  t.Object(
    { report: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const ReportMetadataOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      reportId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      hasAnki: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const ReportMetadata = t.Composite(
  [ReportMetadataPlain, ReportMetadataRelations],
  { additionalProperties: false },
);

export const ReportMetadataInputCreate = t.Composite(
  [ReportMetadataPlainInputCreate, ReportMetadataRelationsInputCreate],
  { additionalProperties: false },
);

export const ReportMetadataInputUpdate = t.Composite(
  [ReportMetadataPlainInputUpdate, ReportMetadataRelationsInputUpdate],
  { additionalProperties: false },
);
