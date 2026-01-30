export interface QuickEntryFormData {
  amount: string;
  type: "cash_in" | "cash_out";
  category: string;
  selectedTags: string[];
}
