import { Link, usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { AppText, Button, Card } from './ui';
import { colors, radii, spacing } from '../theme/tokens';
import { useSession } from '../providers/session-provider';

const navItems = [
  { href: '/workspace/current', label: 'Workspace' },
  { href: '/admin/tools', label: 'Tools' },
  { href: '/admin/confirmations', label: 'Confirmaciones' },
  { href: '/admin/executions', label: 'Ejecuciones' },
  { href: '/settings/profile', label: 'Perfil' },
  { href: '/settings/accessibility', label: 'Accesibilidad' },
  { href: '/settings/tenant', label: 'Tenant' },
];

export function AppFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isNarrow = width < 960;
  const { session, signOut } = useSession();

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={{ gap: 4 }}>
          <AppText style={styles.headerTitle}>{title}</AppText>
          {subtitle ? <AppText muted>{subtitle}</AppText> : null}
        </View>
        <View style={styles.headerActions}>
          <Card style={styles.identityCard}>
            <AppText style={{ fontWeight: '700' }}>
              {session?.tenant.name ?? 'Sin tenant'}
            </AppText>
            <AppText muted>{session?.role ?? 'Sin sesión'}</AppText>
          </Card>
          <Button
            label="Salir"
            variant="secondary"
            onPress={() => {
              void signOut().then(() => router.replace('/auth'));
            }}
          />
        </View>
      </View>

      <View style={[styles.body, isNarrow && styles.bodyNarrow]}>
        <View style={[styles.sidebar, isNarrow && styles.sidebarNarrow]}>
          <Card style={{ gap: spacing.xs }}>
            <AppText style={styles.brand}>Opita Sync</AppText>
            <AppText muted>Chat-first orchestrator workspace</AppText>
          </Card>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href as never} asChild>
                <Pressable
                  style={[styles.navItem, isActive && styles.navItemActive]}
                >
                  <AppText style={[styles.navLabel, isActive && styles.navLabelActive]}>
                    {item.label}
                  </AppText>
                </Pressable>
              </Link>
            );
          })}
        </View>
        <View style={styles.content}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  identityCard: {
    minWidth: 180,
    paddingVertical: spacing.sm,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.lg,
  },
  bodyNarrow: {
    flexDirection: 'column',
  },
  sidebar: {
    width: 220,
    gap: spacing.sm,
  },
  sidebarNarrow: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  content: {
    flex: 1,
  },
  brand: {
    fontSize: 19,
    fontWeight: '800',
  },
  navItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  navItemActive: {
    backgroundColor: colors.primarySoft,
  },
  navLabel: {
    fontWeight: '600',
  },
  navLabelActive: {
    color: colors.primaryStrong,
  },
});
