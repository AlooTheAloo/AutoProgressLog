import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const UserConfigPlain = t.Object(
  {
    id: t.Integer(),
    togglToken: t.String(),
    autoGenTime: __nullable__(t.Date()),
    createdAt: t.Date(),
    updatedAt: t.Date(),
    userId: t.Integer(),
  },
  { additionalProperties: false },
);

export const UserConfigRelations = t.Object(
  {
    ankiConfig: __nullable__(
      t.Object(
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
      ),
    ),
    user: t.Object(
      {
        id: t.Integer(),
        email: t.String(),
        userName: __nullable__(t.String()),
        profilePicture: __nullable__(t.String()),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const UserConfigPlainInputCreate = t.Object(
  { togglToken: t.String(), autoGenTime: t.Optional(__nullable__(t.Date())) },
  { additionalProperties: false },
);

export const UserConfigPlainInputUpdate = t.Object(
  {
    togglToken: t.Optional(t.String()),
    autoGenTime: t.Optional(__nullable__(t.Date())),
  },
  { additionalProperties: false },
);

export const UserConfigRelationsInputCreate = t.Object(
  {
    ankiConfig: t.Optional(
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

export const UserConfigRelationsInputUpdate = t.Partial(
  t.Object(
    {
      ankiConfig: t.Partial(
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

export const UserConfigWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          togglToken: t.String(),
          autoGenTime: t.Date(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
          userId: t.Integer(),
        },
        { additionalProperties: false },
      ),
    { $id: "UserConfig" },
  ),
);

export const UserConfigWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.Integer(), userId: t.Integer() },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [t.Object({ id: t.Integer() }), t.Object({ userId: t.Integer() })],
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
              togglToken: t.String(),
              autoGenTime: t.Date(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
              userId: t.Integer(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "UserConfig" },
);

export const UserConfigSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      togglToken: t.Boolean(),
      ankiConfig: t.Boolean(),
      autoGenTime: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      userId: t.Boolean(),
      user: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const UserConfigInclude = t.Partial(
  t.Object(
    { ankiConfig: t.Boolean(), user: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const UserConfigOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      togglToken: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      autoGenTime: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      updatedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const UserConfig = t.Composite([UserConfigPlain, UserConfigRelations], {
  additionalProperties: false,
});

export const UserConfigInputCreate = t.Composite(
  [UserConfigPlainInputCreate, UserConfigRelationsInputCreate],
  { additionalProperties: false },
);

export const UserConfigInputUpdate = t.Composite(
  [UserConfigPlainInputUpdate, UserConfigRelationsInputUpdate],
  { additionalProperties: false },
);
