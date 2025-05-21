import { IconSymbolName } from "@/components/ui/IconSymbol";
import { KeyboardTypeOptions } from "react-native";

export type SettingElementType = {
  label: string;
  description: string;
  placeholderText: string;
  textColor?: string;
  entryType?: KeyboardTypeOptions;
  action?: () => void;
  onChange?: (text: string) => void;
};
