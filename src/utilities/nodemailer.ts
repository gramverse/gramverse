import nodemailer from "nodemailer";

export class EmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.MAILER_HOST,
            auth: {
                user: process.env.MAILER_USER,
                pass: process.env.MAILER_PASS,
            },
        });
    }

    async sendResetPasswordEmail(email: string, token: string) {
        const resetLink = `http://${process.env.APP_DOMAIN}/reset-password/${token}`;
        const mailOptions = {
            from: process.env.MAILER_USER,
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
