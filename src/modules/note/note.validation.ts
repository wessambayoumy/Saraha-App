import joi from "joi";

export const createNoteSchema = {
  body: joi.object({
    title: joi.string().required().min(1).max(100).trim(),
    content: joi.string().required().min(1).max(1000).trim(),
    profileName: joi.string().required().trim().alphanum().min(5).max(40),
  }),
};

export const deleteNoteSchema = {
  params: joi.object({
    noteId: joi
      .string()
      .required()
      .length(24)
      .pattern(/^[0-9a-fA-F]{24}$/),
  }),
};

export const getNoteByIdSchema = {
  params: joi.object({
    noteId: joi
      .string()
      .required()
      .length(24)
      .pattern(/^[0-9a-fA-F]{24}$/),
  }),
};
