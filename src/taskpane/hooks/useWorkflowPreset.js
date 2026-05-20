import { useMemo } from "react";

function useWorkflowPreset({ workflowPresets, selectedWorkflowPreset, mappings, mappingFields }) {
  const activeWorkflowPreset = useMemo(() => {
    return (
      workflowPresets.find((preset) => preset.id === selectedWorkflowPreset) || workflowPresets[0]
    );
  }, [workflowPresets, selectedWorkflowPreset]);

  const presetCompletedFields = useMemo(() => {
    return activeWorkflowPreset.recommendedFields.filter((fieldKey) => Boolean(mappings[fieldKey]));
  }, [activeWorkflowPreset, mappings]);

  const presetMissingFields = useMemo(() => {
    return activeWorkflowPreset.recommendedFields.filter((fieldKey) => !mappings[fieldKey]);
  }, [activeWorkflowPreset, mappings]);

  const presetProgressPercent = useMemo(() => {
    if (!activeWorkflowPreset.recommendedFields.length) return 0;

    return Math.round(
      (presetCompletedFields.length / activeWorkflowPreset.recommendedFields.length) * 100
    );
  }, [activeWorkflowPreset, presetCompletedFields]);

  const recommendedMappingFields = useMemo(() => {
    return mappingFields.filter((field) =>
      activeWorkflowPreset.recommendedFields.includes(field.key)
    );
  }, [mappingFields, activeWorkflowPreset]);

  const optionalMappingFields = useMemo(() => {
    return mappingFields.filter(
      (field) => !activeWorkflowPreset.recommendedFields.includes(field.key)
    );
  }, [mappingFields, activeWorkflowPreset]);

  return {
    activeWorkflowPreset,
    presetCompletedFields,
    presetMissingFields,
    presetProgressPercent,
    recommendedMappingFields,
    optionalMappingFields,
  };
}

export default useWorkflowPreset;
