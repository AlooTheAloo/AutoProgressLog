import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const SyncDataPlain = t.Object(
  { id: t.Integer(), generationTime: t.Date(), userId: t.Integer() },
  { additionalProperties: false },
);

export const SyncDataRelations = t.Object(
  {
    ankiData: __nullable__(
      t.Object(
        {
          id: t.Integer(),
          totalCardsStudied: t.Integer(),
          cardsStudied: t.Integer(),
          mature: t.Integer(),
          retention: t.Number(),
          syncDataId: t.Integer(),
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

export const SyncDataPlainInputCreate = t.Object(
  { generationTime: t.Optional(t.Date()) },
  { additionalProperties: false },
);

export const SyncDataPlainInputUpdate = t.Object(
  { generationTime: t.Optional(t.Date()) },
  { additionalProperties: false },
);

export const SyncDataRelationsInputCreate = t.Object(
  {
    ankiData: t.Optional(
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

export const SyncDataRelationsInputUpdate = t.Partial(
  t.Object(
    {
      ankiData: t.Partial(
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

export const SyncDataWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          generationTime: t.Date(),
          userId: t.Integer(),
        },
        { additionalProperties: false },
      ),
    { $id: "SyncData" },
  ),
);

export const SyncDataWhereUnique = t.Recursive(
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
            { id: t.Integer(), generationTime: t.Date(), userId: t.Integer() },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "SyncData" },
);

export const SyncDataSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      generationTime: t.Boolean(),
      ankiData: t.Boolean(),
      userId: t.Boolean(),
      user: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const SyncDataInclude = t.Partial(
  t.Object(
    { ankiData: t.Boolean(), user: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const SyncDataOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      generationTime: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const SyncData = t.Composite([SyncDataPlain, SyncDataRelations], {
  additionalProperties: false,
});

export const SyncDataInputCreate = t.Composite(
  [SyncDataPlainInputCreate, SyncDataRelationsInputCreate],
  { additionalProperties: false },
);

export const SyncDataInputUpdate = t.Composite(
  [SyncDataPlainInputUpdate, SyncDataRelationsInputUpdate],
  { additionalProperties: false },
);
