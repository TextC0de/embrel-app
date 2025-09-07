import { COLORS } from '@/constants/theme';
import { View, type ViewProps } from 'react-native';


export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = COLORS.background.primary;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
