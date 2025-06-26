import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const AnkiConfigPlain = t.Object(
  {
    id: t.Integer(),
    url: t.String(),
    ankiToken: t.String(),
    retentionMode: t.Union(
      [t.Literal("ANKI_DEFAULT"), t.Literal("TRUE_RETENTION")],
      { additionalProperties: false },
    ),
    trackedDecks: t.Array(t.Integer(), { additionalProperties: false }),
    userConfigId: t.Integer(),
  },
  { additionalProperties: false },
);

export const AnkiConfigRelations = t.Object(
  {
    userConfig: t.Object(
      {
        id: t.Integer(),
        togglToken: t.String(),
        autoGenTime: __nullable__(t.Date()),
        createdAt: t.Date(),
        updatedAt: t.Date(),
        userId: t.Integer(),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const AnkiConfigPlainInputCreate = t.Object(
  {
    url: t.Optional(t.String()),
    ankiToken: t.String(),
    retentionMode: t.Union(
      [t.Literal("ANKI_DEFAULT"), t.Literal("TRUE_RETENTION")],
      { additionalProperties: false },
    ),
    trackedDecks: t.Array(t.Integer(), { additionalProperties: false }),
  },
  { additionalProperties: false },
);

export const AnkiConfigPlainInputUpdate = t.Object(
  {
    url: t.Optional(t.String()),
    ankiToken: t.Optional(t.String()),
    retentionMode: t.Optional(
      t.Union([t.Literal("ANKI_DEFAULT"), t.Literal("TRUE_RETENTION")], {
        additionalProperties: false,
      }),
    ),
    trackedDecks: t.Optional(
      t.Array(t.Integer(), { additionalProperties: false }),
    ),
  },
  { additionalProperties: false },
);

export const AnkiConfigRelationsInputCreate = t.Object(
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

export const AnkiConfigRelationsInputUpdate = t.Partial(
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

export const AnkiConfigWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          url: t.String(),
          ankiToken: t.String(),
          retentionMode: t.Union(
            [t.Literal("ANKI_DEFAULT"), t.Literal("TRUE_RETENTION")],
            { additionalProperties: false },
          ),
          trackedDecks: t.Array(t.Integer(), { additionalProperties: false }),
          userConfigId: t.Integer(),
        },
        { additionalProperties: false },
      ),
    { $id: "AnkiConfig" },
  ),
);

export const AnkiConfigWhereUnique = t.Recursive(
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
              url: t.String(),
              ankiToken: t.String(),
              retentionMode: t.Union(
                [t.Literal("ANKI_DEFAULT"), t.Literal("TRUE_RETENTION")],
                { additionalProperties: false },
              ),
              trackedDecks: t.Array(t.Integer(), {
                additionalProperties: false,
              }),
              userConfigId: t.Integer(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "AnkiConfig" },
);

export const AnkiConfigSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      url: t.Boolean(),
      ankiToken: t.Boolean(),
      retentionMode: t.Boolean(),
      trackedDecks: t.Boolean(),
      userConfigId: t.Boolean(),
      userConfig: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const AnkiConfigInclude = t.Partial(
  t.Object(
    {
      retentionMode: t.Boolean(),
      userConfig: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const AnkiConfigOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      url: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      ankiToken: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      trackedDecks: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userConfigId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const AnkiConfig = t.Composite([AnkiConfigPlain, AnkiConfigRelations], {
  additionalProperties: false,
});

export const AnkiConfigInputCreate = t.Composite(
  [AnkiConfigPlainInputCreate, AnkiConfigRelationsInputCreate],
  { additionalProperties: false },
);

export const AnkiConfigInputUpdate = t.Composite(
  [AnkiConfigPlainInputUpdate, AnkiConfigRelationsInputUpdate],
  { additionalProperties: false },
);
