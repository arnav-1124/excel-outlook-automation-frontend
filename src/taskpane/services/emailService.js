export function openOutlookWebDraft(emailData) {
  try {
    const to = encodeURIComponent(String(emailData.recipientEmail || ""));
    const subject = encodeURIComponent(String(emailData.subject || ""));
    const body = encodeURIComponent(String(emailData.body || ""));
    const cc = encodeURIComponent(String(emailData.cc || ""));
    const bcc = encodeURIComponent(String(emailData.bcc || ""));

    const outlookUrl =
      `https://outlook.office.com/mail/deeplink/compose?to=${to}` +
      `&subject=${subject}` +
      `&body=${body}` +
      `&cc=${cc}` +
      `&bcc=${bcc}`;

    console.log("Opening Outlook Web:", outlookUrl);

    window.open(outlookUrl, "_blank", "noopener,noreferrer");
  } catch (error) {
    console.error("openOutlookWebDraft failed:", error);
  }
}

export function tryOpenDesktopMailApp(emailData) {
  try {
    const to = encodeURIComponent(String(emailData.recipientEmail || ""));
    const subject = encodeURIComponent(String(emailData.subject || ""));
    const body = encodeURIComponent(String(emailData.body || ""));
    const cc = encodeURIComponent(String(emailData.cc || ""));
    const bcc = encodeURIComponent(String(emailData.bcc || ""));

    const mailtoUrl =
      `mailto:${to}?subject=${subject}` + `&body=${body}` + `&cc=${cc}` + `&bcc=${bcc}`;

    console.log("Trying desktop mail app:", mailtoUrl);

    window.open(mailtoUrl, "_blank");
  } catch (error) {
    console.error("tryOpenDesktopMailApp failed:", error);
  }
}
