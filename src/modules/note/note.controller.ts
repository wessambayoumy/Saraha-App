import { Router } from "express";
import * as noteService from "./note.service.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const noteRouter = Router();

noteRouter.post("/", authMiddleware, noteService.createNote);

noteRouter.patch("/all", authMiddleware, noteService.updateAllNotesTitle);
noteRouter.patch("/:noteId", authMiddleware, noteService.updateNote);

noteRouter.put("/replace/:noteId", authMiddleware, noteService.replaceNote);

noteRouter.delete("/", authMiddleware, noteService.deleteAllNotes);
noteRouter.delete("/:noteId", authMiddleware, noteService.deleteNote);

noteRouter.get("/paginate-sort", authMiddleware, noteService.getUserNotes);
noteRouter.get(
  "/note-by-content",
  authMiddleware,
  noteService.getNoteByContent,
);
noteRouter.get(
  "/note-with-user",
  authMiddleware,
  noteService.getUserNotesWithUserInfo,
);
noteRouter.get("/aggregate", authMiddleware, noteService.getNotesAggregate);
noteRouter.get("/:noteId", authMiddleware, noteService.getNoteById);

export default noteRouter;
