import bcrypt from "bcrypt";

import { UnprocessableEntityError } from "../errors";

export default class Bcrypt {
  static async hash(hashPassword: string, saltRounds: number) {
    let result = "";

    await bcrypt.genSalt(saltRounds, async function (saltErr, salt) {
      console.log({ saltErr });
      if (saltErr) {
        throw new UnprocessableEntityError("Salt Error");
      }
      await bcrypt.hash(hashPassword, salt, function (err, hash) {
        if (err) {
          throw new UnprocessableEntityError("Hash Error");
        }
        result = hash;
      });
    });

    console.log({ result });
    return result;
  }

  static async compare(inputPassword: string, hash: string) {
    let res = false;
    bcrypt.compare(inputPassword, hash, function (err, result) {
      if (err) {
        throw new Error("Error 403: Unathorized");
      }
      res = result;
    });
    return res;
  }
}
