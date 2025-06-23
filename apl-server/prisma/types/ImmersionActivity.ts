import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const ImmersionActivityPlain = t.Object(
  {
    id: t.Integer(),
    time: t.Date(),
    seconds: t.Integer(),
    activityName: t.String(),
    userId: t.Integer(),
  },
  { additionalProperties: false },
);

export const ImmersionActivityRelations = t.Object(
  {
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

export const ImmersionActivityPlainInputCreate = t.Object(
  { time: t.Date(), seconds: t.Integer(), activityName: t.String() },
  { additionalProperties: false },
);

export const ImmersionActivityPlainInputUpdate = t.Object(
  {
    time: t.Optional(t.Date()),
    seconds: t.Optional(t.Integer()),
    activityName: t.Optional(t.String()),
  },
  { additionalProperties: false },
);

export const ImmersionActivityRelationsInputCreate = t.Object(
  {
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

export const ImmersionActivityRelationsInputUpdate = t.Partial(
  t.Object(
    {
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

export const ImmersionActivityWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          time: t.Date(),
          seconds: t.Integer(),
          activityName: t.String(),
          userId: t.Integer(),
        },
        { additionalProperties: false },
      ),
    { $id: "ImmersionActivity" },
  ),
);

export const ImmersionActivityWhereUnique = t.Recursive(
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
              time: t.Date(),
              seconds: t.Integer(),
              activityName: t.String(),
              userId: t.Integer(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "ImmersionActivity" },
);

export const ImmersionActivitySelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      time: t.Boolean(),
      seconds: t.Boolean(),
      activityName: t.Boolean(),
      userId: t.Boolean(),
      user: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const ImmersionActivityInclude = t.Partial(
  t.Object(
    { user: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const ImmersionActivityOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      time: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      seconds: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      activityName: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const ImmersionActivity = t.Composite(
  [ImmersionActivityPlain, ImmersionActivityRelations],
  { additionalProperties: false },
);

export const ImmersionActivityInputCreate = t.Composite(
  [ImmersionActivityPlainInputCreate, ImmersionActivityRelationsInputCreate],
  { additionalProperties: false },
);

export const ImmersionActivityInputUpdate = t.Composite(
  [ImmersionActivityPlainInputUpdate, ImmersionActivityRelationsInputUpdate],
  { additionalProperties: false },
);
