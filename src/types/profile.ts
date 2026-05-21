import { Ionicons } from '@expo/vector-icons';

export interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  iconColor: string;
  iconBg: string;
}

export interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  iconColor: string;
  iconBg: string;
  onPress?: () => void;
  showBorder?: boolean;
}
