import bcrypt from "bcrypt";
import { Request, Response } from "express";

import { prisma } from "../../../../prisma/prismaClient";
import { UserModel } from "../../../mongoose/mongodb";

export class AuthController {
  static async token(req: Request, res: Response) {
    const { email, password } = req.body;
    let statusCode, resObj;

    // Retrieve the stored hash from the database or file
    // Here, we'll use a hardcoded hash for demonstration purposes
    const findedUser = await UserModel.find({
      email,
    });

    const storedUser = findedUser?.[0];
    const hash_pass = storedUser?.hash_password;
    const token = storedUser?.acess_token;

    if (!storedUser || !hash_pass || !token) {
      statusCode = 401;
      resObj = { error: "Invalid username or password" };
    } else {
      return bcrypt.compare(
        password,
        hash_pass,
        (err: any, result: boolean) => {
          if (err) {
            return res.status(500).json({ error: err });
          } else if (result) {
            return res.status(200).json({
              token,
              email: storedUser.email,
              uid: storedUser.id,
            });
          } else {
            return res
              .status(401)
              .json({ error: "Invalid username or password" });
          }
        },
      );
    }

    return res.status(500).json({ error: "Internal server error" });
  }

  static async ping(req: Request, res: Response) {
    res.status(200).json({ result: "pong", user: req.user });
  }
}
