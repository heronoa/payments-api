import axios from "axios";

export async function sendWppMsg(phone: number, msg: string) {
  console.log({ phone });

  return axios
    .post(
      `https://graph.facebook.com/v19.0/307834699088407/message`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: `+55${phone}`,
        type: "text",
        text: {
          preview_url: true,
          body: "hello", //msg,
        },
      },
      {
        headers: {
          Authorization:
            "Bearer " + process.env.META_TOKEN,
          "Content-Type": "application/json",
        },
      },
    )
    .then(res => {
      console.log({ res });
      return res.data;
    })
    .catch(err => {
      return console.log({ err });
    });
}
