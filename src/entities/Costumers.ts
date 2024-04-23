import { Joi, Segments, celebrate } from "celebrate";

import { UnprocessableEntityError } from "../errors";

export default class Costumer {
  createdAt: Date;
  updatedAt: Date;
  constructor(
    readonly costumer_id: string,
    readonly debt_ids: string[],
    readonly name: string,
    readonly last_name: string,
    readonly phone: string,
    readonly email: string,
    readonly adress: string,
    readonly cep: string,

    createdAt?: Date,
    updatedAt?: Date,
  ) {
    this.costumer_id = costumer_id;
    this.email = email;
    this.phone = phone;
    this.name = name;
    this.last_name = last_name;
    this.cep = cep;
    this.adress = adress;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
    this.validateEmail();
  }

  private validateEmail() {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(this.email)) {
      throw new UnprocessableEntityError("Invalid email");
    }
  }

  static userSchemaValidation = celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().email().max(180).required(),
      phone: Joi.string().min(8).required(),
    }),
  });
}
