import { Router } from "express";
import * as noteService from "./note.service.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";

const noteRouter = Router();

noteRouter.post("/", async (req, res) => {
  const note = await noteService.createNote(req);
  res.status(201).json({ message: "Note created successfully", note });
});

noteRouter.get("/", authMiddleware, async (req, res) => {
  const notes = await noteService.getUserNotes(req);
  res.json(notes);
});
noteRouter.get("/:noteId", authMiddleware, async (req, res) => {
  const note = await noteService.getNoteById(req);
  res.json(note);
});

noteRouter.delete("/", authMiddleware, async (req, res) => {
  const deletedNotes = await noteService.deleteAllNotes(req);
  res.json({ message: "All notes deleted successfully", deletedNotes });
});
noteRouter.delete("/:noteId", authMiddleware, async (req, res) => {
  const deletedNote = await noteService.deleteNote(req);
  res.json({ message: "Note deleted successfully", deletedNote });
});

export default noteRouter;
