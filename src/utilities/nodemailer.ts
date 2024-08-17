import nodemailer from "nodemailer";

export class EmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host:"smtp.gmail.com",
            auth: {
                user: "blindsidesmh@gmail.com",
                pass: "ckei cbbh hzcl fvqj",
            },
        });
    }

    async sendResetPasswordEmail(email: string, token: string) {
        const resetLink = `http://5.34.193.118/reset-password/${token}`;
        const mailOptions = {
            from: "blindsidesmh@gmail.com",
            to: email,
            subject: "Password Reset",
            text: `Click the link to reset your password: ${resetLink}`,
        };

        await this.transporter.sendMail(mailOptions);
    }
}

// verify connection configuration
// transporter.verify(function (error, success) {
//     if (error) {
//       console.log(error);
//     } else {
//       console.log("Server is ready to take our messages");
//     }
//   });
  