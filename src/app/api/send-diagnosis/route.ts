import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, quizAnswers, photo } = await request.json();

    // Formata as respostas do quiz
    const respostasFormatadas = `
      <h2>Respostas do Quiz:</h2>
      <ul>
        <li><strong>Oleosidade do couro cabeludo:</strong> ${quizAnswers.oleosidade}</li>
        <li><strong>Frequência de químicas:</strong> ${quizAnswers.quimica}</li>
        <li><strong>Estado dos fios:</strong> ${quizAnswers.estadoFios}</li>
        <li><strong>Dificuldades:</strong> ${quizAnswers.dificuldades.join(", ")}</li>
      </ul>
    `;

    // Email para vendascapilize@gmail.com com todos os dados
    await resend.emails.send({
      from: "CapilizeIA <onboarding@resend.dev>",
      to: "vendascapilize@gmail.com",
      subject: `Novo Diagnóstico Capilar - ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0f766e;">Novo Diagnóstico CapilizeIA</h1>
          
          <div style="background: #f0fdfa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #0f766e;">E-mail do cliente:</h3>
            <p style="font-size: 18px;"><strong>${email}</strong></p>
          </div>

          ${respostasFormatadas}

          ${photo ? `
            <div style="margin: 20px 0;">
              <h3>Foto do cabelo:</h3>
              <img src="${photo}" alt="Foto do cabelo" style="max-width: 100%; border-radius: 10px;" />
            </div>
          ` : ""}

          <hr style="margin: 30px 0;" />
          
          <p style="color: #64748b; font-size: 14px;">
            Este e-mail foi gerado automaticamente pelo sistema CapilizeIA.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return NextResponse.json(
      { error: "Erro ao enviar email" },
      { status: 500 }
    );
  }
}
