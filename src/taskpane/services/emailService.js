export function openDraft(emailData) {
  try {
    const recipient = encodeURIComponent(String(emailData.recipientEmail || ""));

    const subject = encodeURIComponent(String(emailData.subject || ""));

    const body = encodeURIComponent(String(emailData.body || ""));

    const cc = encodeURIComponent(String(emailData.cc || ""));

    const bcc = encodeURIComponent(String(emailData.bcc || ""));

    const outlookUrl =
      `outlook://compose` +
      `?to=${recipient}` +
      `&subject=${subject}` +
      `&body=${body}` +
      `&cc=${cc}` +
      `&bcc=${bcc}`;

    console.log("Opening:", outlookUrl);

    window.location.href = outlookUrl;
  } catch (error) {
    console.error("openDraft failed:", error);
  }
}
