import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const AutoGenConfigPlain = t.Object(
  {
    id: t.Integer(),
    secondsSinceMidnight: t.Integer(),
    timezone: t.String(),
    userConfigId: t.Integer(),
  },
  { additionalProperties: false },
);

export const AutoGenConfigRelations = t.Object(
  {
    userConfig: t.Object(
      {
        id: t.Integer(),
        togglToken: t.String(),
        togglUserId: t.String(),
        createdAt: t.Date(),
        updatedAt: t.Date(),
        userId: t.Integer(),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const AutoGenConfigPlainInputCreate = t.Object(
  { secondsSinceMidnight: t.Integer(), timezone: t.String() },
  { additionalProperties: false },
);

export const AutoGenConfigPlainInputUpdate = t.Object(
  {
    secondsSinceMidnight: t.Optional(t.Integer()),
    timezone: t.Optional(t.String()),
  },
  { additionalProperties: false },
);

export const AutoGenConfigRelationsInputCreate = t.Object(
  {
    userConfig: t.Object(
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

export const AutoGenConfigRelationsInputUpdate = t.Partial(
  t.Object(
    {
      userConfig: t.Object(
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

export const AutoGenConfigWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          secondsSinceMidnight: t.Integer(),
          timezone: t.String(),
          userConfigId: t.Integer(),
        },
        { additionalProperties: false },
      ),
    { $id: "AutoGenConfig" },
  ),
);

export const AutoGenConfigWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.Integer(), userConfigId: t.Integer() },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [
            t.Object({ id: t.Integer() }),
            t.Object({ userConfigId: t.Integer() }),
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
              secondsSinceMidnight: t.Integer(),
              timezone: t.String(),
              userConfigId: t.Integer(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "AutoGenConfig" },
);

export const AutoGenConfigSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      secondsSinceMidnight: t.Boolean(),
      timezone: t.Boolean(),
      userConfigId: t.Boolean(),
      userConfig: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const AutoGenConfigInclude = t.Partial(
  t.Object(
    { userConfig: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const AutoGenConfigOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      secondsSinceMidnight: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      timezone: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userConfigId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const AutoGenConfig = t.Composite(
  [AutoGenConfigPlain, AutoGenConfigRelations],
  { additionalProperties: false },
);

export const AutoGenConfigInputCreate = t.Composite(
  [AutoGenConfigPlainInputCreate, AutoGenConfigRelationsInputCreate],
  { additionalProperties: false },
);

export const AutoGenConfigInputUpdate = t.Composite(
  [AutoGenConfigPlainInputUpdate, AutoGenConfigRelationsInputUpdate],
  { additionalProperties: false },
);
