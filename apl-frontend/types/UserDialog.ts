export default interface UserDialog {
  header: string;
  content: string;
  footer: string | undefined;
  yes?: {
    text: string;
    on: () => void;
  };
  no?: {
    text: string;
    on: () => void;
  };
}
