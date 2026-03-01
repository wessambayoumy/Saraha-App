import { Request } from "express";
import * as dbService from "../../db/db.service.js";
import noteModel from "../../db/models/note/note.model.js";

import { Types } from "mongoose";
import { NotFoundError } from "../../common/middlewares/index.js";

//post

export const createNote = async (req: Request) => {
  const { title, content } = req.body;
  const userId = req.user._id;

  return await dbService.create({
    model: noteModel,
    data: { title, content, userId },
  });
};

//delete

export const deleteNote = async (req: Request) => {
  const { noteId } = req.params as { noteId: string };

  const note = await dbService.findOne({
    model: noteModel,
    filter: { _id: new Types.ObjectId(noteId), userId: req.user._id },
  });

  if (!note) {
    throw new NotFoundError("Note not found or you are not the owner");
  }
  const note_Id = note._id;
  return await dbService.deleteOne({
    model: noteModel,
    filter: { _id: note_Id },
  });
};

export const deleteAllNotes = async (req: Request) => {
  const deletedNotes = await dbService.deleteMany({
    model: noteModel,
    filter: {
      userId: req.user._id,
    },
  });
  if (deletedNotes.deletedCount === 0) {
    throw new NotFoundError("No notes found to delete for this user");
  }
  return deletedNotes;
};

//get

export const getUserNotes = async (req: Request) => {
  const userId = req.user._id;

  const notes = await dbService.find({
    model: noteModel,
    filter: { userId: new Types.ObjectId(userId) },
  });
  if (notes.length === 0)
    throw new NotFoundError("No notes found for this user");

  return notes;
};

export const getNoteById = async (req: Request) => {
  const { noteId } = req.params as { noteId: string };

  const note = await dbService.findOne({
    model: noteModel,
    filter: {
      _id: new Types.ObjectId(noteId),
      userId: req.user._id,
    },
  });

  if (!note) {
    throw new NotFoundError("Note not found or you are not the owner");
  }

  return note;
};

