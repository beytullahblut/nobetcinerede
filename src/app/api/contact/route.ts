import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    const data = await resend.emails.send({
      from: 'iletisim@nobetcinerede.com', // Kendi domain'inizi ekleyene kadar bu şekilde kalabilir
      to: ['iletisim@nobetcinerede.com'],
      subject: `Yeni İletişim Formu: ${subject}`,
      text: `Gönderen: ${name} (${email})\n\nMesaj:\n${message}`,
    });

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ error: 'Mail gönderilemedi' }, { status: 500 });
  }
}