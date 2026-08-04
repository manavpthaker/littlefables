export interface TextInputProps {
  value?: string;
  placeholder?: string;
  multiline?: boolean;
  invalid?: boolean;
  type?: string;
  onChange?: (value: string) => void;
}
