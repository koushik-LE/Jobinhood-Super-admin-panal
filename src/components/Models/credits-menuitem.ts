export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  hoverClass?: string;
  textColor?: string;
}
