import { Resend } from "resend";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactRequest = { name: string; email: string; msg: string };
type ContactResponse = { ok: true } | { ok: false; error: string };

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<ContactRequest>;
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const msg = body.msg?.trim() ?? "";

  if (!name || !msg || !EMAIL_REGEX.test(email)) {
    return Response.json(
      { ok: false, error: "Datos inválidos." } satisfies ContactResponse,
      { status: 400 }
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: process.env.CONTACT_EMAIL as string,
    replyTo: email,
    subject: `Nuevo mensaje de contacto de ${name}`,
    text: `Nombre: ${name}\nEmail: ${email}\n\n${msg}`,
  });

  if (error) {
    return Response.json(
      { ok: false, error: "No se pudo enviar el mensaje." } satisfies ContactResponse,
      { status: 502 }
    );
  }

  return Response.json({ ok: true } satisfies ContactResponse, { status: 200 });
}
