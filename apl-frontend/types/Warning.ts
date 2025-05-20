export interface WarningProps {
  title: string;
  content: string;
  yesText: string;
  noText: string;
  onYes: () => void;
  onNo: () => void;
}
