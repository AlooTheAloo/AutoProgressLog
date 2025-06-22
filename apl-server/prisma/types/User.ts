import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const UserPlain = t.Object(
  {
    id: t.Integer(),
    email: t.String(),
    firstName: __nullable__(t.String()),
    lastName: __nullable__(t.String()),
  },
  { additionalProperties: false },
);

export const UserRelations = t.Object(
  {
    tokens: t.Array(
      t.Object(
        {
          id: t.Integer(),
          token: t.String(),
          type: t.Union([t.Literal("EMAIL"), t.Literal("SESSION")], {
            additionalProperties: false,
          }),
          valid: t.Boolean(),
          expiration: __nullable__(t.Date()),
          createdAt: t.Date(),
          lastUsedAt: t.Date(),
          deviceId: __nullable__(t.String()),
          deviceName: __nullable__(t.String()),
          userAgent: __nullable__(t.String()),
          userId: t.Integer(),
        },
        { additionalProperties: false },
      ),
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const UserPlainInputCreate = t.Object(
  {
    email: t.String(),
    firstName: t.Optional(__nullable__(t.String())),
    lastName: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const UserPlainInputUpdate = t.Object(
  {
    email: t.Optional(t.String()),
    firstName: t.Optional(__nullable__(t.String())),
    lastName: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const UserRelationsInputCreate = t.Object(
  {
    tokens: t.Optional(
      t.Object(
        {
          connect: t.Array(
            t.Object(
              {
                id: t.Integer({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    ),
  },
  { additionalProperties: false },
);

export const UserRelationsInputUpdate = t.Partial(
  t.Object(
    {
      tokens: t.Partial(
        t.Object(
          {
            connect: t.Array(
              t.Object(
                {
                  id: t.Integer({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
            disconnect: t.Array(
              t.Object(
                {
                  id: t.Integer({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
          },
          { additionalProperties: false },
        ),
      ),
    },
    { additionalProperties: false },
  ),
);

export const UserWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          email: t.String(),
          firstName: t.String(),
          lastName: t.String(),
        },
        { additionalProperties: false },
      ),
    { $id: "User" },
  ),
);

export const UserWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.Integer(), email: t.String() },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [t.Object({ id: t.Integer() }), t.Object({ email: t.String() })],
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
              email: t.String(),
              firstName: t.String(),
              lastName: t.String(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "User" },
);

export const UserSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      email: t.Boolean(),
      firstName: t.Boolean(),
      lastName: t.Boolean(),
      tokens: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const UserInclude = t.Partial(
  t.Object(
    { tokens: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const UserOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      email: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      firstName: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      lastName: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const User = t.Composite([UserPlain, UserRelations], {
  additionalProperties: false,
});

export const UserInputCreate = t.Composite(
  [UserPlainInputCreate, UserRelationsInputCreate],
  { additionalProperties: false },
);

export const UserInputUpdate = t.Composite(
  [UserPlainInputUpdate, UserRelationsInputUpdate],
  { additionalProperties: false },
);
