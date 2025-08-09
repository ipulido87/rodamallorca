import nodemailer from 'nodemailer';

const { MAILTRAP_USER, MAILTRAP_PASS } = process.env;

if (!MAILTRAP_USER || !MAILTRAP_PASS) {
  console.error('[MAIL] Faltan MAILTRAP_USER o MAILTRAP_PASS en .env');
}

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: MAILTRAP_USER || '',
    pass: MAILTRAP_PASS || '',
  },
});

export const sendVerificationEmail = async (email: string, code: string) => {
  const verifyUrl = `http://localhost:4000/api/auth/verify?code=${code}`;

  try {
    await transporter.verify();
    console.log('[MAIL] SMTP listo ✅');

    const info = await transporter.sendMail({
      from: 'no-reply@rodamallorca.com',
      to: email,
      subject: 'Verifica tu cuenta',
      html: `<p>Gracias por registrarte. Haz clic en el siguiente enlace para verificar tu cuenta:</p>
             <a href="${verifyUrl}">${verifyUrl}</a>
             <p>Tu código es: <b>${code}</b></p>`,
    });

    console.log('[MAIL] Enviado OK:', info.messageId);
  } catch (err) {
    console.error('[MAIL] Error enviando correo:', err);
    throw err; 
  }
};
