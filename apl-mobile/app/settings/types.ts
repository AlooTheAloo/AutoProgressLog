import { IconSymbolName } from "@/components/ui/IconSymbol";

export type SettingElementType = {
  label: string;
  description: string;
  placeholderText: string;
  textColor?: string;
  action?: () => void;
  onChange?: (text: string) => void;
};
