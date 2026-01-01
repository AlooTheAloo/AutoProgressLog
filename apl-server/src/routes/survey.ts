import { Elysia, t } from "elysia";
import prisma from "../db/client";

export const surveyRoutes = new Elysia({ prefix: "/survey-answer" })
  .get("/v1", async () => {
    try {
      return await prisma.surveyAnswer.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.error("Error fetching survey answers", e);
      throw e;
    }
  }, {
    detail: {
      summary: "Get all survey answers",
      tags: ["Survey"],
      description:
      "This endpoint gets the list of all survey answers.",
    },
  })
  .post("/v1", async ({ body }) => {
    try {
      const { track, refoldData, years, language, appsUsing } = body;
      
      const newSurveyAnswer = await prisma.surveyAnswer.create({
        data: {
          track,
          refoldKnows: refoldData?.knows,
          refoldStage: refoldData?.stage,
          years,
          language,
          appsUsing
        }
      });
      
      return newSurveyAnswer;
    } catch (e) {
      console.error("Error saving survey answer", e);
      throw e;
    }
  }, {
      detail: {
        summary: "Submit survey answer",
        tags: ["Survey"],
        description:
        "Submits an anonymous survey answer.",
      },
    body: t.Object({
      track: t.Optional(t.String()),
      refoldData: t.Optional(t.Object({
        knows: t.Boolean(),
        stage: t.Optional(t.String())
      })),
      years: t.Optional(t.Number()),
      language: t.Optional(t.String()),
      appsUsing: t.Optional(t.Array(t.String()))
    })
  });
