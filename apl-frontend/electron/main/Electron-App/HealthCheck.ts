import { z } from "zod";

// --- Primitive & domain schemas ------------------

// Time
const timeSchema = z.object({
  hours: z.number(),
  minutes: z.number(),
});

// ServerOptions
const serverOptionsSchema = z.object({
  generationTime: timeSchema,
});

// RetentionMode
const retentionModeSchema = z.enum(["default_anki", "true_retention"]);

// AnkiOptions
const ankiOptionsSchema = z.object({
  retentionMode: retentionModeSchema,
  trackedDecks: z.array(z.number()),
});

// ankiIntegration
const ankiIntegrationSchema = z.object({
  url: z.string(),
  key: z.string(),
});

// ReportExtension
const reportExtensionSchema = z.enum([".png", ".jpg", ".jpeg", ".webp"]);

// OutputOptions
const outputOptionsSchema = z.object({
  outputFile: z.object({
    path: z.string(),
    name: z.string(),
    extension: reportExtensionSchema,
  }),
  outputQuality: z.number(),
});

// --- Generic ConditionalOption<T> helper --------

/**
 * ConditionalOption<T> =
 *   | { enabled: true;  options: T }
 *   | { enabled: false; options?: undefined }
 */
const conditionalOption = <T extends z.ZodTypeAny>(inner: T) =>
  z.union([
    z.object({
      enabled: z.literal(true),
      options: inner,
    }),
    z.object({
      enabled: z.literal(false),
      // explicit undefined or missing
      options: z.undefined().optional(),
    }),
  ]);

// --- Top-level Options schema -------------------

export const optionsSchema = z.object({
  general: z.object({
    autogen: conditionalOption(serverOptionsSchema),
    discordIntegration: z.boolean(),
  }),

  account: z.object({
    userName: z.string(),
    profilePicture: z.string(),
  }),

  appearance: z.object({
    glow: z.boolean(),
  }),

  toggl: z.object({
    togglToken: z.string(),
  }),

  anki: z
    // base ConditionalOption<AnkiOptions>
    .intersection(
      conditionalOption(ankiOptionsSchema),
      // & { ankiIntegration?: ankiIntegration }
      z.object({
        ankiIntegration: ankiIntegrationSchema.optional(),
      })
    ),

  outputOptions: outputOptionsSchema,
});

// derive the TS type if you like:
export type Options = z.infer<typeof optionsSchema>;

export default async function checkHealth(rawInput: unknown) {
  if (rawInput == undefined) return true;
  const result = optionsSchema.safeParse(rawInput);
  if (!result.success) {
    console.error(result.error.format());
    return false;
  } else {
    return true;
  }
}
