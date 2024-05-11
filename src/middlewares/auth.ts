import { NextFunction, Request, Response } from "express";

import { prisma } from "../../prisma/prismaClient";
import { UserModel } from "../mongoose/mongodb";

export const authMiddleware = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  const bearerHeader = req.headers.authorization;
  if (typeof bearerHeader === "string") {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];
    const user = await UserModel.find({
      acess_token: token,
    });

    console.log({ user });

    if (user) {
      // console.log("user:", user);
      req = { ...req, user: { email: user?.[0].email, uid: user?.[0].id } };
      return next();
    } else {
      const statusCode = 401;
      return res.status(statusCode).json({ error: "Can't find user" });
    }
  } else {
    const statusCode = 500;

    return res.status(statusCode).json({ error: "Missing Token" });
  }
};
