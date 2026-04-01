import nodemailer from 'nodemailer';

export async function sendStatusEmail(email: string, fullName: string, status: string) {
  // 1. E-posta gönderici ayarlarını tanımlıyoruz (Transporter)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true, // 465 portu için true olmalı
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // 2. Duruma (Approved / Rejected) göre e-posta içeriğini belirliyoruz
  const isApproved = status === 'Approved';
  const subject = isApproved 
    ? 'Başvurunuz Onaylandı! - Vita Cordis' 
    : 'Başvurunuz Hakkında Bilgilendirme - Vita Cordis';

  const htmlContent = isApproved
    ? `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Tebrikler ${fullName},</h2>
        <p>Vita Cordis başvurunuz başarıyla <strong>onaylanmıştır</strong>!</p>
        <p>Etkinlikte görüşmek üzere. Herhangi bir sorunuz olursa bizimle iletişime geçmekten çekinmeyin.</p>
        <br/>
        <p>Saygılarımızla,<br/>Vita Cordis Ekibi</p>
      </div>
    `
    : `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Merhaba ${fullName},</h2>
        <p>Vita Cordis başvurunuzu dikkatle inceledik, ancak maalesef şu an için başvurunuzu <strong>onaylayamıyoruz</strong>.</p>
        <p>İlginiz için teşekkür eder, kariyerinizde başarılar dileriz.</p>
        <br/>
        <p>Saygılarımızla,<br/>Vita Cordis Ekibi</p>
      </div>
    `;

  // 3. E-postayı gönderiyoruz
  try {
    await transporter.sendMail({
      from: `"Vita Cordis" <${process.env.SMTP_USER}>`, // Gönderici adı ve e-postası
      to: email, // Alıcının e-postası
      subject: subject, // Konu
      html: htmlContent, // HTML formatındaki içerik
    });
    console.log(`${email} adresine durum e-postası gönderildi.`);
  } catch (error) {
    console.error('E-posta gönderme hatası:', error);
    throw new Error('E-posta gönderilemedi.');
  }
}