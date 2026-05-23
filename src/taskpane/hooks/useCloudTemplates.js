import { useEffect, useState } from "react";

import { getCloudTemplates } from "../services/api/templatesApi";

function useCloudTemplates({ isAuthenticated, showToast, showBanner, addActivity }) {
  const [cloudTemplates, setCloudTemplates] = useState([]);
  const [selectedCloudTemplateId, setSelectedCloudTemplateId] = useState("");
  const [isCloudTemplatesLoading, setIsCloudTemplatesLoading] = useState(false);
  const [cloudTemplatesError, setCloudTemplatesError] = useState("");

  async function loadCloudTemplates({ silent = false } = {}) {
    if (!isAuthenticated) {
      setCloudTemplates([]);
      setSelectedCloudTemplateId("");
      setCloudTemplatesError("");
      setIsCloudTemplatesLoading(false);
      return [];
    }

    try {
      setIsCloudTemplatesLoading(true);
      setCloudTemplatesError("");

      const templates = await getCloudTemplates({
        scope: "all",
        status: "ACTIVE",
        limit: 80,
      });

      const safeTemplates = Array.isArray(templates) ? templates : [];

      setCloudTemplates(safeTemplates);

      if (!silent) {
        showToast?.(
          "success",
          "Cloud templates synced",
          `${safeTemplates.length} template(s) loaded from your account.`
        );
      }

      addActivity?.("success", `Cloud templates synced: ${safeTemplates.length} found.`);

      return safeTemplates;
    } catch (error) {
      console.error("Load cloud templates failed:", error);

      const message = error.message || "Could not load cloud templates.";

      setCloudTemplatesError(message);
      setCloudTemplates([]);

      if (!silent) {
        showBanner?.("warning", message);
      }

      return [];
    } finally {
      setIsCloudTemplatesLoading(false);
    }
  }

  useEffect(() => {
    loadCloudTemplates({ silent: true });
    // intentionally only tied to auth state
  }, [isAuthenticated]);

  function clearSelectedCloudTemplate() {
    setSelectedCloudTemplateId("");
  }

  return {
    cloudTemplates,
    selectedCloudTemplateId,
    setSelectedCloudTemplateId,
    isCloudTemplatesLoading,
    cloudTemplatesError,
    loadCloudTemplates,
    clearSelectedCloudTemplate,
  };
}

export default useCloudTemplates;