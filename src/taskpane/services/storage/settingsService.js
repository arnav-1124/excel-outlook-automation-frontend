const MAPPING_KEY = "emailAutomationMappings";

export function saveMappings(mappings) {
  try {
    const settings = Office.context.document.settings;

    settings.set(MAPPING_KEY, mappings);

    settings.saveAsync((result) => {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        console.log("Mappings saved successfully");
      } else {
        console.error("Failed to save mappings:", result.error.message);
      }
    });
  } catch (error) {
    console.error("Save error:", error);
  }
}

export function loadMappings() {
  try {
    const settings = Office.context.document.settings;

    const saved = settings.get(MAPPING_KEY);

    console.log("Loaded mappings:", saved);

    return saved || {};
  } catch (error) {
    console.error("Load error:", error);

    return {};
  }
}

const TEMPLATE_SETTINGS_KEY = "excel_email_addin_template_settings";

export function saveTemplateSettings(templateSettings) {
  try {
    localStorage.setItem(TEMPLATE_SETTINGS_KEY, JSON.stringify(templateSettings));
  } catch (error) {
    console.error("Failed to save template settings:", error);
  }
}

export function loadTemplateSettings() {
  try {
    const saved = localStorage.getItem(TEMPLATE_SETTINGS_KEY);

    if (!saved) {
      return {
        subjectTemplate: "",
        bodyTemplate: "",
      };
    }

    return JSON.parse(saved);
  } catch (error) {
    console.error("Failed to load template settings:", error);

    return {
      subjectTemplate: "",
      bodyTemplate: "",
    };
  }
}

const NAMED_TEMPLATES_KEY = "excel_email_addin_named_templates";

export function saveNamedTemplates(templates) {
  try {
    localStorage.setItem(NAMED_TEMPLATES_KEY, JSON.stringify(templates || []));
  } catch (error) {
    console.error("Failed to save named templates:", error);
  }
}

export function loadNamedTemplates() {
  try {
    const saved = localStorage.getItem(NAMED_TEMPLATES_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    console.error("Failed to load named templates:", error);
    return [];
  }
}

const ONBOARDING_KEY = "excel_email_addin_onboarding_completed";

export function saveOnboardingCompleted(isCompleted) {
  try {
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(Boolean(isCompleted)));
  } catch (error) {
    console.error("Failed to save onboarding status:", error);
  }
}

export function loadOnboardingCompleted() {
  try {
    const saved = localStorage.getItem(ONBOARDING_KEY);

    if (!saved) {
      return false;
    }

    return JSON.parse(saved) === true;
  } catch (error) {
    console.error("Failed to load onboarding status:", error);
    return false;
  }
}
