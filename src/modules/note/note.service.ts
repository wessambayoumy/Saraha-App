import { RequestHandler } from "express";
import * as dbService from "./../../db/db.services.js";
import noteModel from "../../db/models/note.model.js";
import {
  BadRequestError,
  NotFoundError,
} from "../../common/middlewares/error.middleware.js";
import { Types } from "mongoose";

//1
export const createNote: RequestHandler = async (req, res) => {
  const { title, content } = req.body;
  const userId = req.userId as Types.ObjectId;

  const note = await dbService.create({
    model: noteModel,
    data: { title, content, userId },
  });

  res.json({ note });
};

//2
export const updateNote: RequestHandler = async (req, res) => {
  const { noteId } = req.params;
  const { title, content } = req.body;

  const note = await dbService.findOne({
    model: noteModel,
    filter: {
      _id: new Types.ObjectId(noteId.toString()),
      userId: req.userId!,
    },
  });

  if (!note) {
    throw new NotFoundError("Note not found or you are not the owner");
  }

  const updateData: Partial<{
    title: string;
    content: string;
  }> = {};

  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;

  if (!title && !content)
    throw new BadRequestError("Please enter a field to update");

  await dbService.updateOne({
    model: noteModel,
    filter: { _id: note._id },
    update: { $set: updateData },
  });

  const updatedNote = await dbService.findById({
    model: noteModel,
    id: { _id: note._id },
  });

  res.json({
    message: "Note updated successfully",
    note: updatedNote,
  });
};

//3
export const replaceNote: RequestHandler = async (req, res) => {
  const { noteId } = req.params as { noteId: any };
  const { title, content } = req.body;

  const note = await dbService.findOne({
    model: noteModel,
    filter: {
      _id: new Types.ObjectId(noteId),
      userId: req.userId!,
    },
  });

  if (!note) {
    throw new NotFoundError("Note not found or you are not the owner");
  }
  if (!title && !content)
    throw new BadRequestError("Please enter a field to update");

  await dbService.updateOne({
    model: noteModel,
    filter: { _id: note._id },
    update: {
      $set: {
        title,
        content,
        updatedAt: new Date(),
      },
    },
  });

  res.json({
    message: "Note replaced successfully",
  });
};

//4
export const updateAllNotesTitle: RequestHandler = async (req, res) => {
  const { title } = req.body;

  if (!title) {
    throw new BadRequestError("New title is required");
  }

  const result = await dbService.updateMany({
    model: noteModel,
    filter: { userId: req.userId },
    update: {
      $set: {
        title,
        updatedAt: new Date(),
      },
    },
  });

  res.json({
    message: "All notes updated successfully",
    result,
  });
};

//5
export const deleteNote: RequestHandler = async (req, res) => {
  const { noteId } = req.params as { noteId: any };

  const note = await dbService.findOne({
    model: noteModel,
    filter: { _id: new Types.ObjectId(noteId), userId: req.userId! },
  });

  if (!note) {
    throw new NotFoundError("Note not found or you are not the owner");
  }
  const note_Id = note._id;
  await dbService.deleteOne({ model: noteModel, filter: { note_Id } });

  res.json({
    message: "Note deleted successfully",
  });
};

//6
export const getUserNotes: RequestHandler = async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 10, 1);

  const skip = (page - 1) * limit;

  const totalNotes = await dbService.countDocuments({
    model: noteModel,
    filter: {
      userId: req.userId!,
    },
  });

  const notes = await dbService
    .find({ model: noteModel, filter: { userId: req.userId! } })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    page,
    limit,
    totalNotes,
    totalPages: Math.ceil(totalNotes / limit),
    notes,
  });
};
//7
export const getNoteById: RequestHandler = async (req, res) => {
  const { noteId } = req.params as { noteId: any };

  const note = await dbService.findOne({
    model: noteModel,
    filter: {
      _id: new Types.ObjectId(noteId),
      userId: req.userId,
    },
  });

  if (!note) {
    throw new NotFoundError("Note not found or you are not the owner");
  }

  res.json({
    message: "Note updated successfully",
    note,
  });
};

//8
export const getNoteByContent: RequestHandler = async (req, res) => {
  const { noteContent } = req.query as { noteContent: string };

  const note = await dbService.findOne({
    model: noteModel,
    filter: {
      content: noteContent,
      userId: req.userId!,
    },
  });
  if (!note) {
    throw new NotFoundError("Note not found or you are not the owner");
  }

  res.json({ note });
};

//9
export const getUserNotesWithUserInfo: RequestHandler = async (req, res) => {
  const notes = await dbService
    .find({
      model: noteModel,
      filter: { user: req.userId },
    })
    .select("title userId createdAt")
    .populate({
      path: "userId",
      select: "email",
    })
    .lean();

  res.json({ notes });
};

//10
export const getNotesAggregate: RequestHandler = async (req, res) => {
  const { search } = req.query;

  const matchStage: any = {
    userId: req.userId,
  };

  if (search) {
    matchStage.title = {
      $regex: search,
    };
  }

  const notes = await dbService.aggregate({
    model: noteModel,
    pipeline: [
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          title: 1,
          content: 1,
          createdAt: 1,
          "user.email": 1,
          userName: {
            $concat: ["$user.fName", " ", "$user.lName"],
          },
        },
      },
    ],
  });

  res.json({
    message: "Notes retrieved successfully",
    count: notes.length,
    notes,
  });
};

//11
export const deleteAllNotes: RequestHandler = async (req, res) => {
  const result = await dbService.deleteMany({
    model: noteModel,
    filter: {
      userId: req.userId,
    },
  });

  res.json({
    message: "All notes deleted successfully",
    deletedCount: result.deletedCount,
  });
};
