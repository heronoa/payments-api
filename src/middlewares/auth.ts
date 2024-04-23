import { NextFunction, Request, Response } from "express";

import { prisma } from "../../prisma/prismaClient";

export const authMiddleware = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  const bearerHeader = req.headers.authorization;
  if (typeof bearerHeader === "string") {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];
    const user = await prisma.users.findFirst({
      where: { acess_token: token },
    });

    if (user) {
      // console.log("user:", user);
      req = { ...req, user };
      return next();
    } else {
      const statusCode = 500;
      return res.status(statusCode).json({ error: "Can't find user" });
    }
  } else {
    const statusCode = 500;

    return res.status(statusCode).json({ error: "Missing Token" });
  }
};
