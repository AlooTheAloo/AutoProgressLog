import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const AnkiDataPlain = t.Object(
  {
    id: t.Integer(),
    totalCardsStudied: t.Integer(),
    cardsStudied: t.Integer(),
    mature: t.Integer(),
    retention: t.Number(),
    syncDataId: t.Integer(),
  },
  { additionalProperties: false },
);

export const AnkiDataRelations = t.Object(
  {
    syncData: t.Object(
      { id: t.Integer(), generationTime: t.Date(), userId: t.Integer() },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const AnkiDataPlainInputCreate = t.Object(
  {
    totalCardsStudied: t.Integer(),
    cardsStudied: t.Integer(),
    mature: t.Integer(),
    retention: t.Number(),
  },
  { additionalProperties: false },
);

export const AnkiDataPlainInputUpdate = t.Object(
  {
    totalCardsStudied: t.Optional(t.Integer()),
    cardsStudied: t.Optional(t.Integer()),
    mature: t.Optional(t.Integer()),
    retention: t.Optional(t.Number()),
  },
  { additionalProperties: false },
);

export const AnkiDataRelationsInputCreate = t.Object(
  {
    syncData: t.Object(
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

export const AnkiDataRelationsInputUpdate = t.Partial(
  t.Object(
    {
      syncData: t.Object(
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

export const AnkiDataWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          totalCardsStudied: t.Integer(),
          cardsStudied: t.Integer(),
          mature: t.Integer(),
          retention: t.Number(),
          syncDataId: t.Integer(),
        },
        { additionalProperties: false },
      ),
    { $id: "AnkiData" },
  ),
);

export const AnkiDataWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.Integer(), syncDataId: t.Integer() },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [
            t.Object({ id: t.Integer() }),
            t.Object({ syncDataId: t.Integer() }),
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
              totalCardsStudied: t.Integer(),
              cardsStudied: t.Integer(),
              mature: t.Integer(),
              retention: t.Number(),
              syncDataId: t.Integer(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "AnkiData" },
);

export const AnkiDataSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      totalCardsStudied: t.Boolean(),
      cardsStudied: t.Boolean(),
      mature: t.Boolean(),
      retention: t.Boolean(),
      syncDataId: t.Boolean(),
      syncData: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const AnkiDataInclude = t.Partial(
  t.Object(
    { syncData: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const AnkiDataOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      totalCardsStudied: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      cardsStudied: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      mature: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      retention: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      syncDataId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const AnkiData = t.Composite([AnkiDataPlain, AnkiDataRelations], {
  additionalProperties: false,
});

export const AnkiDataInputCreate = t.Composite(
  [AnkiDataPlainInputCreate, AnkiDataRelationsInputCreate],
  { additionalProperties: false },
);

export const AnkiDataInputUpdate = t.Composite(
  [AnkiDataPlainInputUpdate, AnkiDataRelationsInputUpdate],
  { additionalProperties: false },
);
