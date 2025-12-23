import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const SurveyAnswerPlain = t.Object(
  {
    id: t.Integer(),
    createdAt: t.Date(),
    track: __nullable__(t.String()),
    refoldKnows: __nullable__(t.Boolean()),
    refoldStage: __nullable__(t.String()),
    years: __nullable__(t.Integer()),
    language: __nullable__(t.String()),
    appsUsing: t.Array(t.String(), { additionalProperties: false }),
  },
  { additionalProperties: false },
);

export const SurveyAnswerRelations = t.Object(
  {},
  { additionalProperties: false },
);

export const SurveyAnswerPlainInputCreate = t.Object(
  {
    track: t.Optional(__nullable__(t.String())),
    refoldKnows: t.Optional(__nullable__(t.Boolean())),
    refoldStage: t.Optional(__nullable__(t.String())),
    years: t.Optional(__nullable__(t.Integer())),
    language: t.Optional(__nullable__(t.String())),
    appsUsing: t.Array(t.String(), { additionalProperties: false }),
  },
  { additionalProperties: false },
);

export const SurveyAnswerPlainInputUpdate = t.Object(
  {
    track: t.Optional(__nullable__(t.String())),
    refoldKnows: t.Optional(__nullable__(t.Boolean())),
    refoldStage: t.Optional(__nullable__(t.String())),
    years: t.Optional(__nullable__(t.Integer())),
    language: t.Optional(__nullable__(t.String())),
    appsUsing: t.Optional(t.Array(t.String(), { additionalProperties: false })),
  },
  { additionalProperties: false },
);

export const SurveyAnswerRelationsInputCreate = t.Object(
  {},
  { additionalProperties: false },
);

export const SurveyAnswerRelationsInputUpdate = t.Partial(
  t.Object({}, { additionalProperties: false }),
);

export const SurveyAnswerWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          createdAt: t.Date(),
          track: t.String(),
          refoldKnows: t.Boolean(),
          refoldStage: t.String(),
          years: t.Integer(),
          language: t.String(),
          appsUsing: t.Array(t.String(), { additionalProperties: false }),
        },
        { additionalProperties: false },
      ),
    { $id: "SurveyAnswer" },
  ),
);

export const SurveyAnswerWhereUnique = t.Recursive(
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
              createdAt: t.Date(),
              track: t.String(),
              refoldKnows: t.Boolean(),
              refoldStage: t.String(),
              years: t.Integer(),
              language: t.String(),
              appsUsing: t.Array(t.String(), { additionalProperties: false }),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "SurveyAnswer" },
);

export const SurveyAnswerSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      createdAt: t.Boolean(),
      track: t.Boolean(),
      refoldKnows: t.Boolean(),
      refoldStage: t.Boolean(),
      years: t.Boolean(),
      language: t.Boolean(),
      appsUsing: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const SurveyAnswerInclude = t.Partial(
  t.Object({ _count: t.Boolean() }, { additionalProperties: false }),
);

export const SurveyAnswerOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      track: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      refoldKnows: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      refoldStage: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      years: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      language: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      appsUsing: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const SurveyAnswer = t.Composite(
  [SurveyAnswerPlain, SurveyAnswerRelations],
  { additionalProperties: false },
);

export const SurveyAnswerInputCreate = t.Composite(
  [SurveyAnswerPlainInputCreate, SurveyAnswerRelationsInputCreate],
  { additionalProperties: false },
);

export const SurveyAnswerInputUpdate = t.Composite(
  [SurveyAnswerPlainInputUpdate, SurveyAnswerRelationsInputUpdate],
  { additionalProperties: false },
);
