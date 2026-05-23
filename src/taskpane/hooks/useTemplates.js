import { useEffect, useState } from "react";

import {
  loadTemplateSettings,
  saveTemplateSettings,
  loadNamedTemplates,
  saveNamedTemplates,
} from "../services/storage/settingsService";

import {
  replaceTemplatePlaceholders,
  findMissingPlaceholders,
} from "../services/template/templateService";

import { updateMappedRowValues, getMappedRowData } from "../services/excel/rowService";

import { normalizeTemplateName } from "../utils/textUtils";

function useTemplates({
  rowData,
  setRowData,
  selectedTable,
  rowIndex,
  mappings,
  cloudTemplates = [],
  selectedCloudTemplateId = "",
  setSelectedCloudTemplateId,
  showBanner,
  showToast,
  addActivity,
}) {
  const [subjectTemplate, setSubjectTemplate] = useState("");
  const [bodyTemplate, setBodyTemplate] = useState("");
  const [templateMissingFields, setTemplateMissingFields] = useState([]);

  const [templateName, setTemplateName] = useState("");
  const [namedTemplates, setNamedTemplates] = useState([]);
  const [selectedNamedTemplateId, setSelectedNamedTemplateId] = useState("");

  useEffect(() => {
    const savedTemplateSettings = loadTemplateSettings();

    setSubjectTemplate(savedTemplateSettings.subjectTemplate || "");
    setBodyTemplate(savedTemplateSettings.bodyTemplate || "");

    const savedNamedTemplates = loadNamedTemplates();
    setNamedTemplates(savedNamedTemplates);
  }, []);

  useEffect(() => {
    saveTemplateSettings({
      subjectTemplate,
      bodyTemplate,
    });
  }, [subjectTemplate, bodyTemplate]);

  function findMatchingNamedTemplate(templateTypeValue) {
    if (!templateTypeValue) return null;

    const normalizedTemplateType = normalizeTemplateName(templateTypeValue);

    return namedTemplates.find(
      (template) => normalizeTemplateName(template.name) === normalizedTemplateType
    );
  }

  function autoLoadTemplateFromRow(rowDataFromExcel) {
    const templateTypeValue = rowDataFromExcel?.templateType;

    if (!templateTypeValue) {
      return;
    }

    const matchedTemplate = findMatchingNamedTemplate(templateTypeValue);

    if (!matchedTemplate) {
      showBanner("warning", `No saved template found for Template Type: ${templateTypeValue}`);

      addActivity("warning", `No saved template matched Template Type: ${templateTypeValue}`);

      return;
    }

    setSelectedNamedTemplateId(matchedTemplate.id);
    setTemplateName(matchedTemplate.name);
    setSubjectTemplate(matchedTemplate.subjectTemplate || "");
    setBodyTemplate(matchedTemplate.bodyTemplate || "");
    setTemplateMissingFields([]);

    showToast("success", "Template matched", `${matchedTemplate.name} loaded from Template Type.`);

    addActivity("success", `Template auto-loaded from row: ${matchedTemplate.name}`);
  }

  function handleSaveNamedTemplate() {
    const cleanName = templateName.trim();
    setSelectedCloudTemplateId?.("");

    if (!cleanName) {
      showBanner("error", "Please enter a template name before saving.");
      return;
    }

    if (!subjectTemplate.trim() && !bodyTemplate.trim()) {
      showBanner("error", "Please enter a subject or body template before saving.");
      return;
    }

    const existingTemplate = namedTemplates.find(
      (template) => template.name.toLowerCase() === cleanName.toLowerCase()
    );

    let updatedTemplates;

    if (existingTemplate) {
      updatedTemplates = namedTemplates.map((template) =>
        template.id === existingTemplate.id
          ? {
              ...template,
              name: cleanName,
              subjectTemplate,
              bodyTemplate,
              updatedAt: new Date().toISOString(),
            }
          : template
      );

      setSelectedNamedTemplateId(existingTemplate.id);

      showToast("success", "Template updated", `${cleanName} was updated.`);
      addActivity("success", `Template updated: ${cleanName}`);
    } else {
      const newTemplate = {
        id: `tpl_${Date.now()}`,
        name: cleanName,
        subjectTemplate,
        bodyTemplate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      updatedTemplates = [newTemplate, ...namedTemplates];

      setSelectedNamedTemplateId(newTemplate.id);

      showToast("success", "Template saved", `${cleanName} was saved.`);
      addActivity("success", `Template saved: ${cleanName}`);
    }

    setNamedTemplates(updatedTemplates);
    saveNamedTemplates(updatedTemplates);
  }

  function handleLoadCloudTemplate(templateId) {
    const cleanTemplateId = String(templateId || "");

    console.log("[useTemplates] handleLoadCloudTemplate called:", {
      cleanTemplateId,
      cloudTemplates,
    });

    setSelectedCloudTemplateId?.(cleanTemplateId);
    setSelectedNamedTemplateId("");

    if (!cleanTemplateId) return;

    const selectedTemplate = cloudTemplates.find(
      (template) => String(template.id) === cleanTemplateId
    );

    console.log("[useTemplates] selected cloud template:", selectedTemplate);

    if (!selectedTemplate) {
      showBanner("error", "Selected cloud template was not found.");
      return;
    }

    setTemplateName(selectedTemplate.name || "");
    setSubjectTemplate(selectedTemplate.subjectTemplate || "");
    setBodyTemplate(selectedTemplate.bodyTemplate || "");
    setTemplateMissingFields([]);

    showToast("success", "Cloud template loaded", `${selectedTemplate.name} loaded into editor.`);
    addActivity("success", `Cloud template loaded: ${selectedTemplate.name}`);
  }

  function handleLoadNamedTemplate(templateId) {
    setSelectedNamedTemplateId(templateId);
    setSelectedCloudTemplateId?.("");

    if (!templateId) return;

    const selectedTemplate = namedTemplates.find((template) => template.id === templateId);

    if (!selectedTemplate) {
      showBanner("error", "Selected template was not found.");
      return;
    }

    setTemplateName(selectedTemplate.name);
    setSubjectTemplate(selectedTemplate.subjectTemplate || "");
    setBodyTemplate(selectedTemplate.bodyTemplate || "");
    setTemplateMissingFields([]);

    showToast("success", "Template loaded", `${selectedTemplate.name} loaded into editor.`);
    addActivity("success", `Template loaded: ${selectedTemplate.name}`);
  }

  function handleDeleteNamedTemplate() {
    if (!selectedNamedTemplateId) {
      showBanner("error", "Please select a template to delete.");
      return;
    }

    const selectedTemplate = namedTemplates.find(
      (template) => template.id === selectedNamedTemplateId
    );

    const updatedTemplates = namedTemplates.filter(
      (template) => template.id !== selectedNamedTemplateId
    );

    setNamedTemplates(updatedTemplates);
    saveNamedTemplates(updatedTemplates);

    setSelectedNamedTemplateId("");
    setSelectedCloudTemplateId?.("");
    setTemplateName("");
    setSubjectTemplate("");
    setBodyTemplate("");
    setTemplateMissingFields([]);

    showToast(
      "success",
      "Template deleted",
      selectedTemplate ? `${selectedTemplate.name} was deleted.` : "Template was deleted."
    );

    addActivity(
      "success",
      selectedTemplate ? `Template deleted: ${selectedTemplate.name}` : "Template deleted."
    );
  }

  function handleGenerateFromTemplate() {
    try {
      if (!rowData?.__allFields) {
        showBanner("error", "Please detect a selected row before generating from template.");
        return;
      }

      if (!subjectTemplate.trim() && !bodyTemplate.trim()) {
        showBanner("error", "Please enter a subject template or body template first.");
        return;
      }

      const allFields = {
        ...rowData.__allFields,
        Recipient_Email: rowData.recipientEmail || "",
        Recipient_Name: rowData.recipientName || "",
        Sender_Email: rowData.senderEmail || "",
        Sender_Name: rowData.senderName || "",
      };

      const combinedTemplateText = `${subjectTemplate}\n${bodyTemplate}`;
      const missingFields = findMissingPlaceholders(combinedTemplateText, allFields);

      setTemplateMissingFields(missingFields);

      if (missingFields.length > 0) {
        showBanner(
          "warning",
          `Some placeholders were not found: ${missingFields
            .map((field) => `{{${field}}}`)
            .join(", ")}`
        );
      }

      const generatedSubject = subjectTemplate.trim()
        ? replaceTemplatePlaceholders(subjectTemplate, allFields)
        : rowData.subject || "";

      const generatedBody = bodyTemplate.trim()
        ? replaceTemplatePlaceholders(bodyTemplate, allFields)
        : rowData.body || "";

      const generatedRowData = {
        ...rowData,
        subject: generatedSubject,
        body: generatedBody,
        __templateApplied: true,
      };

      setRowData(generatedRowData);

      showToast(
        "success",
        "Template applied",
        "Subject and body preview were generated from your template."
      );

      addActivity("success", "Template applied to selected row.");
    } catch (error) {
      console.error("Template generation error:", error);
      showBanner("error", "Could not generate email from template.");
    }
  }

  async function handleWriteGeneratedEmailToRow() {
    try {
      if (!rowData) {
        showBanner("error", "Please detect a selected row first.");
        return;
      }

      if (!rowData.__templateApplied) {
        showBanner("error", "Please generate preview from template before writing to Excel.");
        return;
      }

      if (!rowData.subject && !rowData.body) {
        showBanner("error", "Generated subject/body is empty.");
        return;
      }

      if (!mappings.subject && !mappings.body) {
        showBanner("error", "Please map Subject or Body column before writing generated email.");
        return;
      }

      const valuesToUpdate = {};

      if (mappings.subject) {
        valuesToUpdate.subject = rowData.subject || "";
      }

      if (mappings.body) {
        valuesToUpdate.body = rowData.body || "";
      }

      const updated = await updateMappedRowValues(
        selectedTable,
        rowIndex,
        mappings,
        valuesToUpdate
      );

      if (!updated) {
        showBanner("error", "Could not write generated email to Excel row.");
        return;
      }

      const refreshedData = await getMappedRowData(selectedTable, rowIndex, mappings);

      setRowData({
        ...refreshedData,
        subject: rowData.subject,
        body: rowData.body,
        __templateApplied: true,
      });

      showToast(
        "success",
        "Generated email saved",
        "Subject and Body were written back to the selected Excel row."
      );

      showBanner("success", "Generated email written back to Excel row.");

      addActivity("success", "Generated subject/body written back to Excel row.");
    } catch (error) {
      console.error("Write generated email to row error:", error);
      showBanner("error", "Could not write generated email to Excel.");
    }
  }

  function handleClearTemplate() {
    setSelectedNamedTemplateId("");
    setSelectedCloudTemplateId?.("");
    setTemplateName("");
    setSubjectTemplate("");
    setBodyTemplate("");
    setTemplateMissingFields([]);

    saveTemplateSettings({
      subjectTemplate: "",
      bodyTemplate: "",
    });

    showToast("success", "Template cleared", "Template editor has been reset.");
    addActivity("success", "Template editor cleared.");
  }

  return {
    subjectTemplate,
    setSubjectTemplate,
    bodyTemplate,
    setBodyTemplate,
    templateMissingFields,

    templateName,
    setTemplateName,
    namedTemplates,
    selectedNamedTemplateId,

    handleSaveNamedTemplate,
    handleLoadNamedTemplate,
    handleLoadCloudTemplate,
    handleDeleteNamedTemplate,
    handleGenerateFromTemplate,
    handleWriteGeneratedEmailToRow,
    handleClearTemplate,
    autoLoadTemplateFromRow,
  };
}

export default useTemplates;
