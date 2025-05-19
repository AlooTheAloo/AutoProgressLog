import { IconSymbolName } from "@/components/ui/IconSymbol";

export type SettingElementType = {
  label: string;
  description: string;
  placeholderText: string;
  action?: () => void;
  onChange?: () => void;
};
