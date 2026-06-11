export async function sendMagicLinkEmail(params: {
  email: string;
  magicLink: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.MAGIC_LINK_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [params.email],
      subject: "Connexion securisee a SYNORA",
      html: `
        <div style="font-family:Arial,sans-serif;background:#050a14;color:#e2e8f0;padding:32px">
          <h1 style="color:#ffffff">Connexion SYNORA</h1>
          <p>Utilise ce lien unique pour ouvrir ta session. Il expire dans 15 minutes.</p>
          <p style="margin:28px 0">
            <a href="${params.magicLink}" style="background:#67e8f9;color:#03101b;padding:14px 20px;border-radius:12px;text-decoration:none;font-weight:700">
              Se connecter a SYNORA
            </a>
          </p>
          <p style="font-size:12px;color:#94a3b8">Si tu n'as pas demande ce lien, ignore simplement cet email.</p>
        </div>
      `,
    }),
  });

  return response.ok;
}
