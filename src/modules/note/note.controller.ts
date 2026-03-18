import { Router } from "express";
import * as noteService from "./note.service.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { multerMiddleware } from "../../common/middlewares/multer.middleware.js";
import { validationMiddleware } from "../../common/middlewares/validation.middleware.js";
import { deleteNoteSchema, getNoteByIdSchema } from "./note.validation.js";

const noteRouter = Router();

//POST

noteRouter.post(
  "/",
  multerMiddleware({ customPath: "messages/attachments" }).array("attachments"),
  async (req, res) => {
    const note = await noteService.createNote(req);
    res.status(201).json({ message: "Note created successfully", note });
  },
);

noteRouter.use(authMiddleware);

// GET

noteRouter.get("/", async (req, res) => {
  const notes = await noteService.getUserNotes(req);
  res.json(notes);
});

noteRouter.get(
  "/:noteId",
  validationMiddleware(getNoteByIdSchema),
  async (req, res) => {
    const note = await noteService.getNoteById(req);
    res.json(note);
  },
);

//DELETE

noteRouter.delete("/", async (req, res) => {
  const deletedNotes = await noteService.deleteAllNotes(req);
  res.json({ message: "All notes deleted successfully", deletedNotes });
});
noteRouter.delete(
  "/:noteId",
  validationMiddleware(deleteNoteSchema),
  async (req, res) => {
    const deletedNote = await noteService.deleteNote(req);
    res.json({ message: "Note deleted successfully", deletedNote });
  },
);

export default noteRouter;
