import z from "zod";

export const getTestSchema = z.object({
  test: z.string().min(3).max(10),
});
