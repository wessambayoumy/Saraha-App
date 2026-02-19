import { Router } from "express";
import * as noteService from "./note.service.js";
import { authenticationMiddleware } from "../../common/middlewares/auth/authentication.middleware.js";
import { authorizationMiddleware } from "../../common/middlewares/auth/authorization.middleware.js";
import { roleEnum } from "../../common/enums/role.enum.js";
const noteRouter = Router();

noteRouter.post("/", noteService.createNote);

noteRouter.patch("/:noteId", authenticationMiddleware, noteService.updateNote);

noteRouter.delete("/", authenticationMiddleware,authorizationMiddleware([roleEnum.admin]), noteService.deleteAllNotes);
noteRouter.delete("/:noteId", authenticationMiddleware,authorizationMiddleware([roleEnum.admin]),  noteService.deleteNote);

noteRouter.get("/paginate-sort", authenticationMiddleware, noteService.getUserNotes);
noteRouter.get(
  "/note-by-content",
  authenticationMiddleware,
  authorizationMiddleware([roleEnum.admin]), 
  noteService.getNoteByContent,
);
noteRouter.get(
  "/note-with-user",
  authenticationMiddleware,
  authorizationMiddleware([roleEnum.admin]), 
  noteService.getUserNotesWithUserInfo,
);
noteRouter.get("/aggregate", authenticationMiddleware, noteService.getNotesAggregate); 
noteRouter.get("/:noteId", authenticationMiddleware, noteService.getNoteById);

export default noteRouter;
