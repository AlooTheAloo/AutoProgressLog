import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const TokenPlain = t.Object(
  {
    id: t.Integer(),
    token: t.String(),
    type: t.Union([t.Literal("EMAIL"), t.Literal("SESSION")], {
      additionalProperties: false,
    }),
    valid: t.Boolean(),
    expiration: t.Date(),
    createdAt: t.Date(),
    lastUsedAt: t.Date(),
    deviceId: __nullable__(t.String()),
    deviceName: __nullable__(t.String()),
    userAgent: __nullable__(t.String()),
    userId: t.Integer(),
  },
  { additionalProperties: false },
);

export const TokenRelations = t.Object(
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

export const TokenPlainInputCreate = t.Object(
  {
    token: t.String(),
    type: t.Union([t.Literal("EMAIL"), t.Literal("SESSION")], {
      additionalProperties: false,
    }),
    expiration: t.Date(),
    lastUsedAt: t.Optional(t.Date()),
    deviceName: t.Optional(__nullable__(t.String())),
    userAgent: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const TokenPlainInputUpdate = t.Object(
  {
    token: t.Optional(t.String()),
    type: t.Optional(
      t.Union([t.Literal("EMAIL"), t.Literal("SESSION")], {
        additionalProperties: false,
      }),
    ),
    expiration: t.Optional(t.Date()),
    lastUsedAt: t.Optional(t.Date()),
    deviceName: t.Optional(__nullable__(t.String())),
    userAgent: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const TokenRelationsInputCreate = t.Object(
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

export const TokenRelationsInputUpdate = t.Partial(
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

export const TokenWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          token: t.String(),
          type: t.Union([t.Literal("EMAIL"), t.Literal("SESSION")], {
            additionalProperties: false,
          }),
          valid: t.Boolean(),
          expiration: t.Date(),
          createdAt: t.Date(),
          lastUsedAt: t.Date(),
          deviceId: t.String(),
          deviceName: t.String(),
          userAgent: t.String(),
          userId: t.Integer(),
        },
        { additionalProperties: false },
      ),
    { $id: "Token" },
  ),
);

export const TokenWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.Integer(), token: t.String() },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [t.Object({ id: t.Integer() }), t.Object({ token: t.String() })],
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
              token: t.String(),
              type: t.Union([t.Literal("EMAIL"), t.Literal("SESSION")], {
                additionalProperties: false,
              }),
              valid: t.Boolean(),
              expiration: t.Date(),
              createdAt: t.Date(),
              lastUsedAt: t.Date(),
              deviceId: t.String(),
              deviceName: t.String(),
              userAgent: t.String(),
              userId: t.Integer(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Token" },
);

export const TokenSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      token: t.Boolean(),
      type: t.Boolean(),
      valid: t.Boolean(),
      expiration: t.Boolean(),
      createdAt: t.Boolean(),
      lastUsedAt: t.Boolean(),
      deviceId: t.Boolean(),
      deviceName: t.Boolean(),
      userAgent: t.Boolean(),
      userId: t.Boolean(),
      user: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const TokenInclude = t.Partial(
  t.Object(
    { type: t.Boolean(), user: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const TokenOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      token: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      valid: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      expiration: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      lastUsedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      deviceId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      deviceName: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userAgent: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Token = t.Composite([TokenPlain, TokenRelations], {
  additionalProperties: false,
});

export const TokenInputCreate = t.Composite(
  [TokenPlainInputCreate, TokenRelationsInputCreate],
  { additionalProperties: false },
);

export const TokenInputUpdate = t.Composite(
  [TokenPlainInputUpdate, TokenRelationsInputUpdate],
  { additionalProperties: false },
);
