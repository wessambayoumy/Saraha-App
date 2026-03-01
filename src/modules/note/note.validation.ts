import joi from "joi";
export const createNoteSchema = {
  body: joi.object({
    message: joi.string().required().min(3).max(150).trim(),
    image: joi.string().uri().optional(),
  }),
  params: joi.object({
    userId: joi.string().hex().length(24).required(),
  }),
};
