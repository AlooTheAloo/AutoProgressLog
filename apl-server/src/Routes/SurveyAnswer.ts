import { t, Elysia, Static } from "elysia";
import { InsertSurvey } from "../Database/Survey/Survey";


export type SurveyAnswer = Static<typeof t_surveyAnswer>;

// Define surveyAnswer type
const t_surveyAnswer = t.Object({
    track: t.Optional(t.String()),
    refoldData: t.Optional(t.Object({
        knows: t.Boolean(),
        stage: t.Optional(t.String()),
    })),
    years: t.Optional(t.Number()),
    language: t.Optional(t.String()),
    appsUsing: t.Optional(t.Array(t.String())),
});

export default new Elysia()
	.post('/survery-answer/v1', ({ set, body }) => {
        InsertSurvey(body);
        set.status = 200;
        return "Survey answer saved successfully"
    }, {
		body: t_surveyAnswer
	})