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
