const FIELD_MATCH_RULES = {
  recipientEmail: [
    "recipientemail",
    "recipient_email",
    "recipient email",
    "email",
    "wh_email",
    "whemail",
    "warehouseemail",
    "warehouse_email",
    "warehouse email",
    "vendor_email",
    "vendoremail",
  ],

  recipientName: [
    "recipientname",
    "recipient_name",
    "recipient name",
    "name",
    "wh_name",
    "whname",
    "warehouse_name",
    "warehousename",
    "warehouse name",
  ],

  cc: ["cc", "email_cc", "emailcc"],

  bcc: ["bcc", "email_bcc", "emailbcc"],

  subject: ["subject", "email_subject", "emailsubject", "mail_subject", "mailsubject"],

  body: ["body", "email_body", "emailbody", "mail_body", "mailbody", "message", "email_message"],

  draftCreatedDate: [
    "draft_created_date",
    "draftcreateddate",
    "draft created date",
    "created_date",
    "createddate",
  ],

  draftModifiedDate: [
    "draft_modified_date",
    "draftmodifieddate",
    "draft modified date",
    "modified_date",
    "modifieddate",
  ],

  draftId: ["draft_id", "draftid", "outlook_id", "outlookid", "mail_id", "mailid"],

  emailStatus: [
    "email_status",
    "emailstatus",
    "email status",
    "status",
    "mail_status",
    "mailstatus",
  ],

  templateType: [
    "template_type",
    "templatetype",
    "template type",
    "comm_type",
    "commtype",
    "communication_type",
    "communicationtype",
  ],

  senderEmail: ["sender_email", "senderemail", "sender email", "from_email", "fromemail"],

  senderName: ["sender_name", "sendername", "sender name", "from_name", "fromname"],
};

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

export function suggestMappingsFromHeaders(headers, currentMappings = {}) {
  const suggestedMappings = { ...currentMappings };

  Object.entries(FIELD_MATCH_RULES).forEach(([fieldKey, possibleMatches]) => {
    // Do not overwrite already selected mapping
    if (suggestedMappings[fieldKey]) return;

    const matchedHeader = headers.find((header) => {
      const normalizedHeader = normalizeText(header);

      return possibleMatches.some((match) => {
        const normalizedMatch = normalizeText(match);

        return (
          normalizedHeader === normalizedMatch ||
          normalizedHeader.includes(normalizedMatch) ||
          normalizedMatch.includes(normalizedHeader)
        );
      });
    });

    if (matchedHeader) {
      suggestedMappings[fieldKey] = matchedHeader;
    }
  });

  return suggestedMappings;
}
