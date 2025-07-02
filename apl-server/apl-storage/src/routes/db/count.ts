import Elysia from "elysia";
import { existsSync } from "fs";
import path from "path";
import { t } from "elysia";
import { CountRevlog } from "../../services/db";
/**
 * @module CountRoute (apl-storage)
 *
 * ## 🧹 Get how many reviews are in all decks
 * ## Pass in the userId to get the count of reviews in all their decks
 */
export const countRoute = new Elysia({ name: "count-reviews" }).get(
  "/count_reviews/:userId",
  async ({ params, set }) => {
    const { userId } = params;

    const filePath = path.resolve(
      "./public/ankidb",
      `${userId}.collection.anki2`
    );

    if (!existsSync(filePath)) {
      set.status = 404;
      return { error: "Database not found" };
    }

    try {
      const count = await CountRevlog(userId);
      const revs: {
        count: number;
        did: number;
      }[] = [];

      // Convert map to array
      count.forEach((v, k) => {
        revs.push({
          count: v,
          did: k,
        });
      });

      return {
        count: revs,
        totalCount: revs.map((x) => x.count).reduce((p, c) => p + c), // Sum up all decks
      };
    } catch (e: any) {
      set.status = 500;
      return { error: e.message };
    }
  },
  {
    params: t.Object({
      userId: t.Numeric(),
    }),
    response: t.Union([
      t.Object({
        count: t.Array(
          t.Object({
            did: t.Integer(),
            count: t.Integer(),
          })
        ),
        totalCount: t.Number(),
      }),
      t.Object({ error: t.String() }),
    ]),
    detail: {
      tags: ["Database"],
      summary: "Get total deck review count",
      description: "Useful",
      responses: {
        200: { description: "Returns the review count" },
        404: { description: "Database not found" },
        500: { description: "SQLite error" },
      },
    },
  }
);
