import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: Number(process.env.SMTP_PORT) === 465, // 465 portu için true
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendNewRequestEmail(requestData: {
  name: string;
  type: string;
  city?: string;
  district?: string;
  phone?: string;
  note?: string;
}) {
  try {
    const typeText = 
      requestData.type === "CREATE" ? "Yeni İşletme Ekleme Talebi" : 
      requestData.type === "UPDATE" ? "Bilgi Güncelleme Talebi" : "Kayıt Silme Talebi";

    await transporter.sendMail({
      from: `"Nöbetçi Nerede" <${process.env.SMTP_USER}>`,
      to: "iletisim@nobetcinerede.com",
      subject: `📢 Yeni Talep Var: ${typeText} (${requestData.name})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #dc2626; border-bottom: 2px solid #fee2e2; padding-bottom: 10px;">Yeni Bir İşletme Talebi Alındı</h2>
          <p>Yönetim panelinde onayınızı bekleyen yeni bir talep sisteme eklendi.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; width: 130px;">Talep Türü:</td>
              <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #2563eb;">${typeText}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">İşletme / Ad:</td>
              <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${requestData.name}</td>
            </tr>
            ${requestData.city ? `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Konum:</td>
              <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${requestData.district || ""} / ${requestData.city}</td>
            </tr>` : ""}
            ${requestData.phone ? `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Telefon:</td>
              <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${requestData.phone}</td>
            </tr>` : ""}
            ${requestData.note ? `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Not / Gerekçe:</td>
              <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; background: #f8fafc;">${requestData.note}</td>
            </tr>` : ""}
          </table>

          <div style="margin-top: 25px; text-align: center;">
            <a href="https://nobetcinerede.com/yonetim" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Yönetim Paneline Git</a>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("E-posta gönderilirken hata oluştu:", error);
  }
}