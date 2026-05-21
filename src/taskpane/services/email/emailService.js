function cleanEmailList(value) {
  return String(value || "")
    .split(/[;,]/)
    .map((email) => email.trim())
    .filter(Boolean)
    .join(";");
}

function buildOutlookWebComposeUrl(emailData) {
  const params = new URLSearchParams();

  const to = cleanEmailList(emailData.recipientEmail);
  const cc = cleanEmailList(emailData.cc);
  const bcc = cleanEmailList(emailData.bcc);
  const subject = String(emailData.subject || "");
  const body = String(emailData.body || "");

  if (to) params.set("to", to);
  if (cc) params.set("cc", cc);
  if (bcc) params.set("bcc", bcc);
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);

  return `https://outlook.office.com/mail/deeplink/compose?${params.toString()}`;
}

export function openOutlookWebDraft(emailData) {
  try {
    const outlookUrl = buildOutlookWebComposeUrl(emailData);

    console.log("Email data:", emailData);
    console.log("Opening Outlook Web:", outlookUrl);

    window.open(outlookUrl, "_blank", "noopener,noreferrer");
  } catch (error) {
    console.error("openOutlookWebDraft failed:", error);
  }
}
