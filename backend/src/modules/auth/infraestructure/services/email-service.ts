import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER || '',
    pass: process.env.MAILTRAP_PASS || '',
  },
});

export const sendVerificationEmail = async (email: string, code: string) => {
  const verifyUrl = `http://localhost:4000/api/auth/verify?code=${code}`;

  await transporter.sendMail({
    from: 'no-reply@rodamallorca.com',
    to: email,
    subject: 'Verifica tu cuenta',
    html: `<p>Gracias por registrarte. Haz clic en el siguiente enlace para verificar tu cuenta:</p>
           <a href="${verifyUrl}">${verifyUrl}</a>`
  });
};
