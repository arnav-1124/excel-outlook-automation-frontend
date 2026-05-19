import { create } from "zustand";

const useTableStore = create((set) => ({
  tables: [],
  selectedTable: "",

  setTables: (tables) => set({ tables }),

  setSelectedTable: (table) => set({ selectedTable: table }),
}));

export default useTableStore;
