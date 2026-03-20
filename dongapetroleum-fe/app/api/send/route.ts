import nodemailer from 'nodemailer';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');

    const { to, subject, customerName, messageContent } = req.body;

    const transporter = nodemailer.createTransport({
        pool: true,
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Đây là phần "Best Regards" anh cần
    const signatureHTML = `
    <div style="font-family: Arial, sans-serif; margin-top: 30px; line-height: 1.4;">
        <b style="color: #0000FF; font-size: 28px; font-family: 'Times New Roman', Times, serif;">Best Regards</b>
        <br><br>
        <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
        <tr>
            <td style="vertical-align: top; padding-right: 15px; border-right: 1.5px solid #004a99;">
            <img src="https://ci3.googleusercontent.com/mail-sig/AIorK4wSofJSGcCAK6vNrrjbK5neDUCXFVsY--jybBD0F-V5EFpuh5AF8pTt91-TLitNGkiiOXCHZhc" width="130" style="display: block; margin-top: 10px;">
            </td>
            <td style="padding-left: 15px; vertical-align: top; font-family: Arial, sans-serif;">
            <b style="color: #0000FF; font-size: 14px;">DONG A PETROLEUM CO., LTD</b><br>
            <b style="color: #0000FF; font-size: 14px;">Phuong (Mr)</b><br>
            <b style="color: #0000FF; font-size: 14px;">Sales Department</b><br>
            <br>
            <span style="color: #FF8C00; font-size: 13px;"><b>Phone/Zalo/Whatsapp/Line:</b> (+84) 962 533 335</span><br>
            <span style="color: #0000FF; font-size: 13px;"><b>Email:</b> <a href="mailto:Purchase@daukhidonga.vn" style="color: #0000FF; text-decoration: underline;">Purchase@daukhidonga.vn</a></span><br>
            <span style="color: #FF8C00; font-size: 13px;"><b>Address:</b> Km9, 10 Highway, Luu Kiem Ward, Hai Phong City.</span><br>
            <span style="color: #FF8C00; font-size: 13px;"><b>Tel:</b> 0225.664.7979 &nbsp; <b>Fax:</b> 02253.975.397</span><br>
            <span style="color: #FF8C00; font-size: 13px;"><b>Hotline:</b> +84.989.991.246 - +84.912.833.338</span><br>
            <span style="color: #0000FF; font-size: 13px;"><b>Email:</b> <a href="mailto:info@daukhidonga.vn" style="color: #0000FF; text-decoration: underline;">info@daukhidonga.vn</a></span><br>
            <span style="color: #0000FF; font-size: 13px;"><b>Website:</b> <a href="https://www.daukhidonga.vn" style="color: #0000FF; text-decoration: underline;">www.daukhidonga.vn</a></span>
            </td>
        </tr>
        </table>
    </div>
    `;

    const mailOptions = {
        from: `"Dầu Khí Đông Á" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        html: `
      <div style="font-family: sans-serif; font-size: 15px;">
        <p>Kính gửi anh/chị <b>${customerName}</b>,</p>
        <p>${messageContent}</p>
        ${signatureHTML}
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true });
    } catch (error: unknown) {
        let errorMessage = 'An unknown error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return res.status(500).json({ error: errorMessage });
    }
}