import axios from "axios";

export function sendWppMsg(phone: string) {
  axios.post(
    `https://graph.facebook.com/v19.0/270165959522512/messages`,
    {
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: { name: "hello_world", language: { code: "en_US" } },
    },
    {
      headers: {
        Authorization:
          "Bearer EAARKPZC5XFWcBO9XVFrRtogIt5rLsUODS5oX1xBmUZA6kHM9Qb3WDwVHbxDa4BfF6rOMp80XOYq2mEq65KZBZCfWcGK2VtPUZCxflKlUEKtzRNp1ME6ubdZC2l8K3bUhX4CGf1gEniS9LqraZBkk6Q2nlKvWtvAWEZArJ0AQX2k5ZCxLnzvxzEJqPqZCgIPOnyXtiAiiuoHLwCsL7v41ww98YZD",
        "Content-Type": "application/json",
      },
    },
  );
}
