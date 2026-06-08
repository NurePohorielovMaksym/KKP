import nodemailer from 'nodemailer';
import axios from 'axios';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,     
    pass: process.env.GMAIL_APP_PASS, 
  },
});

export async function sendResetCode(toEmail, code) {
  await transporter.sendMail({
    from: `"Kinetra" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Код відновлення пароля',
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: auto;">
        <h2 style="color: #186b1c;">Kinetra</h2>
        <p>Ваш код для відновлення пароля:</p>
        <div style="
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 12px;
          color: #344054;
          background: #f5f5f5;
          padding: 16px 24px;
          border-radius: 8px;
          display: inline-block;
          margin: 16px 0;
        ">${code}</div>
        <p style="color: #888; font-size: 13px;">Код дійсний 5 хвилин.</p>
        <p style="color: #888; font-size: 13px;">Якщо ви не робили цей запит — просто проігноруйте лист.</p>
      </div>
    `,
  });
}

export async function sendAppointmentEmail(data) {
  await transporter.sendMail({
    from: `"Kinetra" <${process.env.GMAIL_USER}>`,
    to: 'asassindark57@gmail.com',
    subject: `Новий запис на прийом — ${data.name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px;">
        <h2 style="color: #186b1c; font-weight:700;">Kinetra — Новий запис на прийом</h2>
        <table style="width:100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; color: #555;">Ім'я:</td>
              <td style="padding: 8px; font-weight: bold;">${data.name}</td></tr>
          <tr style="background:#f9f9f9">
              <td style="padding: 8px; color: #555;">Email:</td>
              <td style="padding: 8px;">${data.email}</td></tr>
          <tr><td style="padding: 8px; color: #555;">Телефон:</td>
              <td style="padding: 8px;">${data.phone}</td></tr>
          <tr style="background:#f9f9f9">
              <td style="padding: 8px; color: #555;">Послуга:</td>
              <td style="padding: 8px;">${data.service}</td></tr>
          <tr><td style="padding: 8px; color: #555;">Повідомлення:</td>
              <td style="padding: 8px;">${data.message || '—'}</td></tr>
        </table>
      </div>
    `,
  });
}

export async function sendConfirmationCode(toEmail, code) {
    await transporter.sendMail({
        from: `"Kinetra" <${process.env.GMAIL_USER}>`,
        to: toEmail,
        subject: 'Підтвердження запису на прийом',
        html: `
            <div style="font-family: sans-serif; max-width: 400px; margin: auto;">
                <h2 style="color: #186b1c;">Kinetra</h2>
                <p>Ваш код для підтвердження запису:</p>
                <div style="font-size: 36px; font-weight: bold; letter-spacing: 12px;
                    background: #f5f5f5; padding: 16px 24px; border-radius: 8px;
                    display: inline-block; margin: 16px 0; color: #344054;">
                    ${code}
                </div>
                <p style="color: #888; font-size: 13px;">Код дійсний 10 хвилин.</p>
            </div>
        `,
    });
}

export async function sendAppointmentConfirmedEmail(data) {
  await transporter.sendMail({
    from: `"Kinetra" <${process.env.GMAIL_USER}>`,
    to: data.email,
    subject: 'Ваш запис підтверджено ✅',
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 560px;
        margin: auto;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        overflow: hidden;
      ">
        
        <div style="
          background: #186b1c;
          padding: 24px;
          color: white;
        ">
          <h1 style="margin:0; font-size: 24px;">
            Kinetra
          </h1>

          <p style="
            margin-top: 8px;
            opacity: 0.9;
            font-size: 14px;
          ">
            Підтвердження запису
          </p>
        </div>

        <div style="padding: 32px;">
          <h2 style="
            margin-top: 0;
            color: #111827;
          ">
            Ваш запис успішно підтверджено ✅
          </h2>

          <p style="
            color: #4b5563;
            line-height: 1.6;
          ">
            Доброго дня, <strong>${data.name}</strong>.
          </p>

          <p style="
            color: #4b5563;
            line-height: 1.6;
          ">
            Ваш запис успішно підтверджено адміністратором клініки.
          </p>

          <div style="
            margin-top: 24px;
            background: #f9fafb;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #e5e7eb;
          ">

            <h3 style="
              margin-top:0;
              margin-bottom:16px;
              color:#111827;
            ">
              Деталі запису
            </h3>

            <table style="
              width:100%;
              border-collapse: collapse;
            ">
              <tr>
                <td style="padding:10px 0; color:#6b7280;">
                  Лікар
                </td>

                <td style="
                  padding:10px 0;
                  text-align:right;
                  font-weight:600;
                  color:#111827;
                ">
                  ${data.doctor}
                </td>
              </tr>

              <tr>
                <td style="padding:10px 0; color:#6b7280;">
                  Спеціалізація
                </td>

                <td style="
                  padding:10px 0;
                  text-align:right;
                  font-weight:600;
                  color:#111827;
                ">
                  ${data.specialization}
                </td>
              </tr>

              <tr>
                <td style="padding:10px 0; color:#6b7280;">
                  Дата
                </td>

                <td style="
                  padding:10px 0;
                  text-align:right;
                  font-weight:600;
                  color:#111827;
                ">
                  ${data.date}
                </td>
              </tr>

              <tr>
                <td style="padding:10px 0; color:#6b7280;">
                  Час
                </td>

                <td style="
                  padding:10px 0;
                  text-align:right;
                  font-weight:600;
                  color:#111827;
                ">
                  ${data.time}
                </td>
              </tr>

              <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color:#6b7280; font-size:14px;">Послуга</td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align:right; font-weight:500; color:#111827;">
        ${data.service}
      </td>
    </tr>
    
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color:#6b7280; font-size:14px;">Тривалість</td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align:right; font-weight:500; color:#111827;">
        ${data.duration} хв
      </td>
    </tr>

    <tr>
      <td style="padding: 12px 0; color:#6b7280; font-size:14px;">До сплати</td>
      <td style="padding: 12px 0; text-align:right; font-weight:600; color:#186b1c; font-size: 16px;">
        ${data.price} ₴
      </td>
    </tr>
            </table>
          </div>

          <div style="
            margin-top: 24px;
            padding: 16px;
            background: #ecfdf3;
            border-radius: 10px;
            color: #166534;
            font-size: 14px;
            line-height: 1.6;
          ">
            Будь ласка, приходьте за 10–15 хвилин до початку прийому.
          </div>

          <p style="
            margin-top: 32px;
            color: #6b7280;
            font-size: 14px;
            line-height: 1.6;
          ">
            Дякуємо, що обрали Kinetra 💚
          </p>          
        </div>
      </div>
      <p style="
            margin-top: 32px;
            color: #6b7280;
            font-size: 16px;
            font-weight:700;
            line-height: 1.6;
          ">
            Якщо хочете відмінити запис, то зателефонуйте за цим номером телефона <a href="tel:+38011111111">+11 (000) 111-1-111</a>, та повідомте адімністратора.
        </p>
    `,
  });
}


export async function sendSmsOtp(phone, code) {
    const message = `Ваш код підтвердження запису: ${code}`;
    
    try {
        await axios.post('https://api.turbosms.ua/message/send.json', {
            recipients: [phone],
            sms: {
                sender: 'Kinetra', 
                text: message
            }
        }, {
            headers: {
                'Authorization': `Bearer ТВІЙ_АПІ_КЛЮЧ_ВІД_ПРОВАЙДЕРА`
            }
        });
        return true;
    } catch (error) {
        console.error('Помилка відправки SMS:', error);
        throw new Error('Не вдалося відправити SMS');
    }
}