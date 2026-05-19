import { create } from "zustand";

const useActiveRowStore = create((set) => ({
  rowIndex: null,
  rowData: {},

  setRowIndex: (index) => set({ rowIndex: index }),

  setRowData: (data) => set({ rowData: data }),
}));

export default useActiveRowStore;
