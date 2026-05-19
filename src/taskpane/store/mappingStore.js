import { create } from "zustand";

const defaultMappings = {
  recipientEmail: "",

  subject: "",
  body: "",
  cc: "",
  bcc: "",

  draftCreatedDate: "",
  draftModifiedDate: "",
  draftId: "",

  emailStatus: "",
  templateType: "",

  recipientName: "",

  senderEmail: "",
  senderName: "",

  lastError: "",
};

const useMappingStore = create((set) => ({
  mappings: defaultMappings,

  setMapping: (key, value) =>
    set((state) => ({
      mappings: {
        ...state.mappings,
        [key]: value,
      },
    })),

  loadSavedMappings: (savedMappings) =>
    set({
      mappings: {
        ...defaultMappings,
        ...savedMappings,
      },
    }),
}));

export default useMappingStore;
