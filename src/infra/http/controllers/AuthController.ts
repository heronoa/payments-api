import bcrypt from "bcrypt";
import { Request, Response } from "express";

import { prisma } from "../../../../prisma/prismaClient";

export class AuthController {
  static async token(req: Request, res: Response) {
    const { email, password } = req.body;
    let statusCode, resObj;

    // Retrieve the stored hash from the database or file
    // Here, we'll use a hardcoded hash for demonstration purposes
    const storedUser = await prisma.users.findFirst({
      where: { email },
    });

    if (!storedUser || !storedUser?.hash_password || !storedUser.acess_token) {
      statusCode = 401;
      resObj = { error: "Invalid username or password" };
    } else {
      bcrypt.compare(
        password,
        storedUser?.hash_password,
        (err: any, result: boolean) => {
          if (err) {
            statusCode = 500;
            resObj = { error: "Internal server error" };
          } else if (result) {
            statusCode = 200;
            resObj = { token: storedUser?.acess_token };
          } else {
            statusCode = 401;
            resObj = { error: "Invalid username or password" };
          }

          if (result) res.status(200).json({ token: storedUser?.acess_token });
        },
      );
    }
    return res
      .status(statusCode || 500)
      .json(resObj || { error: "Internal server error" });
  }

  static async ping(req: Request, res: Response) {
    res.status(200).json({ result: "pong" });
  }
}
