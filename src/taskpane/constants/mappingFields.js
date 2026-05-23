export const MAPPING_FIELDS = [
  {
    key: "recipientEmail",
    label: "Recipient Email",
    required: true,
    autoDetect: ["email", "mail", "recipient", "to", "wh email", "vendor email", "customer email"],
  },
  {
    key: "recipientName",
    label: "Recipient Name",
    autoDetect: ["name", "recipient name", "customer", "vendor", "warehouse", "party"],
  },
  {
    key: "recipientPhone",
    label: "WhatsApp / Phone Number",
    autoDetect: ["phone", "mobile", "whatsapp", "contact", "number"],
  },
  {
    key: "cc",
    label: "CC",
    autoDetect: ["cc"],
  },
  {
    key: "bcc",
    label: "BCC",
    autoDetect: ["bcc"],
  },
  {
    key: "subject",
    label: "Subject",
    autoDetect: ["subject", "email subject", "mail subject"],
  },
  {
    key: "body",
    label: "Body",
    required: true,
    autoDetect: ["body", "message", "email body", "mail body"],
  },

  // Follow-up specific fields
  {
    key: "referenceType",
    label: "Follow-up Reference Type",
    autoDetect: ["reference type", "ref type", "type"],
  },
  {
    key: "referenceValue",
    label: "Follow-up Reference Value",
    autoDetect: [
      "reference",
      "ref",
      "po",
      "po number",
      "po_number",
      "invoice",
      "invoice number",
      "deduction",
      "deduction id",
      "claim",
      "ticket",
    ],
  },
  {
    key: "sentDate",
    label: "Sent Date",
    autoDetect: ["sent date", "email sent date", "last email date", "mail date"],
  },
  {
    key: "followUpAfterDays",
    label: "Follow-up After Days",
    autoDetect: ["follow up days", "follow-up days", "followup days", "days", "reminder days"],
  },
  {
    key: "followUpPriority",
    label: "Follow-up Priority",
    autoDetect: ["priority", "urgency"],
  },
  {
    key: "followUpNote",
    label: "Follow-up Note",
    autoDetect: ["note", "remark", "remarks", "comment", "latest response"],
  },

  // Existing tracking fields
  {
    key: "draftCreatedDate",
    label: "Draft Created Date",
    autoDetect: ["draft created", "draft created date"],
  },
  {
    key: "draftModifiedDate",
    label: "Draft Modified Date",
    autoDetect: ["draft modified", "draft modified date"],
  },
  {
    key: "draftId",
    label: "Draft ID",
    autoDetect: ["draft id", "outlook id", "message id"],
  },
  {
    key: "emailStatus",
    label: "Email Status",
    autoDetect: ["status", "email status", "mail status"],
  },
  {
    key: "templateType",
    label: "Template Type",
    autoDetect: ["template", "template type", "email template"],
  },
  {
    key: "senderEmail",
    label: "Sender Email",
    autoDetect: ["sender email", "from email"],
  },
  {
    key: "senderName",
    label: "Sender Name",
    autoDetect: ["sender name", "from name"],
  },
];
