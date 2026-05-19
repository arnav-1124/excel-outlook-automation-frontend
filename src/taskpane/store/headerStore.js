import { create } from "zustand";

const useHeaderStore = create((set) => ({
  headers: [],

  setHeaders: (headers) => set({ headers }),
}));

export default useHeaderStore;