import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';

export function Screen({
  children,
  scroll = false,
  style,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const content = <View style={[styles.screen, style]}>{children}</View>;
  if (scroll) {
    return <ScrollView style={styles.scroll}>{content}</ScrollView>;
  }
  return content;
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function AppText({
  children,
  style,
  muted = false,
  mono = false,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  muted?: boolean;
  mono?: boolean;
}) {
  return (
    <Text
      style={[
        styles.text,
        muted && styles.textMuted,
        mono && styles.textMono,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'ghost' && styles.buttonGhost,
        variant === 'danger' && styles.buttonDanger,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <AppText
        style={[
          styles.buttonText,
          (variant === 'primary' || variant === 'danger') && { color: '#ffffff' },
        ]}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  multiline,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <View style={{ gap: 6 }}>
      <AppText style={styles.fieldLabel}>{label}</AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor={colors.textSoft}
        style={[styles.input, multiline && styles.inputMultiline]}
      />
    </View>
  );
}

export function Pill({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
}) {
  return (
    <View
      style={[
        styles.pill,
        tone === 'primary' && styles.pillPrimary,
        tone === 'success' && styles.pillSuccess,
        tone === 'warning' && styles.pillWarning,
        tone === 'danger' && styles.pillDanger,
      ]}
    >
      <AppText style={styles.pillText}>{label}</AppText>
    </View>
  );
}

export const uiStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  stretchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'stretch',
  },
});

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  text: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  textMuted: {
    color: colors.textMuted,
  },
  textMono: {
    fontFamily: 'Courier',
  },
  button: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  buttonDanger: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonText: {
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    minHeight: 46,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputMultiline: {
    minHeight: 112,
    textAlignVertical: 'top',
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.backgroundAlt,
  },
  pillPrimary: {
    backgroundColor: colors.primarySoft,
  },
  pillSuccess: {
    backgroundColor: '#d7f3e5',
  },
  pillWarning: {
    backgroundColor: '#f7e7cf',
  },
  pillDanger: {
    backgroundColor: '#f8dede',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
});
