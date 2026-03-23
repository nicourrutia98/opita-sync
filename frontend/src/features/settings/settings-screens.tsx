import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { api } from '../../lib/api';
import { useSession } from '../../providers/session-provider';
import { spacing } from '../../theme/tokens';
import { AppText, Button, Card, Field, uiStyles } from '../../components/ui';

export function ProfileSettingsScreen() {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['ui-profile', session?.accessToken],
    queryFn: () => api.getUiProfile(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });
  const [locale, setLocale] = useState('es-CO');
  const [timezone, setTimezone] = useState('America/Bogota');

  const mutation = useMutation({
    mutationFn: () =>
      api.updateUiProfile(session!.accessToken, {
        locale,
        timezone,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['ui-profile'] });
    },
  });

  return (
    <Card style={{ gap: spacing.sm }}>
      <AppText style={styles.title}>Perfil UI</AppText>
      <AppText muted>{query.data?.displayName}</AppText>
      <Field label="Locale" value={locale} onChangeText={setLocale} />
      <Field label="Timezone" value={timezone} onChangeText={setTimezone} />
      <Button label="Guardar" onPress={() => mutation.mutate()} />
    </Card>
  );
}

export function AccessibilitySettingsScreen() {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['ui-profile', session?.accessToken],
    queryFn: () => api.getUiProfile(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });
  const [fontScale, setFontScale] = useState('normal');
  const [contrastMode, setContrastMode] = useState('standard');
  const [reducedMotion, setReducedMotion] = useState('system');

  const mutation = useMutation({
    mutationFn: () =>
      api.updateUiProfile(session!.accessToken, {
        accessibilityOverrides: {
          fontScale,
          contrastMode,
          reducedMotion,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['ui-profile'] });
    },
  });

  return (
    <Card style={{ gap: spacing.sm }}>
      <AppText style={styles.title}>Accesibilidad</AppText>
      <AppText muted>
        Baseline activo: {JSON.stringify(query.data?.accessibilityOverrides ?? {}, null, 2)}
      </AppText>
      <Field label="Font scale" value={fontScale} onChangeText={setFontScale} />
      <Field label="Contrast mode" value={contrastMode} onChangeText={setContrastMode} />
      <Field label="Reduced motion" value={reducedMotion} onChangeText={setReducedMotion} />
      <Button label="Guardar preferencias" onPress={() => mutation.mutate()} />
    </Card>
  );
}

export function TenantSettingsScreen() {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['tenant-ui-baseline', session?.accessToken],
    queryFn: () => api.getTenantUiBaseline(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });

  const [appName, setAppName] = useState('Opita Sync');
  const [supportContact, setSupportContact] = useState('support@opitacoders.com');

  const mutation = useMutation({
    mutationFn: () =>
      api.updateTenantUiBaseline(session!.accessToken, {
        branding: {
          appName,
          brandOwner: query.data?.branding.brandOwner ?? 'Opita Coders',
          logoUrl: query.data?.branding.logoUrl ?? null,
          shortMark: query.data?.branding.shortMark ?? 'OS',
          supportContact,
          legalFooterText:
            query.data?.branding.legalFooterText ??
            'Opita Sync by Opita Coders. Pilot environment.',
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tenant-ui-baseline'] });
    },
  });

  return (
    <Card style={{ gap: spacing.sm }}>
      <AppText style={styles.title}>Tenant baseline</AppText>
      <Field label="App name" value={appName} onChangeText={setAppName} />
      <Field
        label="Support contact"
        value={supportContact}
        onChangeText={setSupportContact}
      />
      <Button label="Guardar baseline" onPress={() => mutation.mutate()} />
    </Card>
  );
}

export function TenantMembersScreen() {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['tenant-members', session?.accessToken],
    queryFn: () => api.listTenantMembers(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });

  const [email, setEmail] = useState('');
  const [roleCode, setRoleCode] = useState('REQUESTER');
  const inviteMutation = useMutation({
    mutationFn: () => api.inviteMember(session!.accessToken, email, roleCode),
    onSuccess: async () => {
      setEmail('');
      await queryClient.invalidateQueries({ queryKey: ['tenant-members'] });
    },
  });

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ gap: spacing.lg }}>
        <Card style={{ gap: spacing.sm }}>
          <AppText style={styles.title}>Invitar miembro</AppText>
          <Field label="Email" value={email} onChangeText={setEmail} />
          <Field label="Role code" value={roleCode} onChangeText={setRoleCode} />
          <Button label="Enviar invitación" onPress={() => inviteMutation.mutate()} />
        </Card>
        <Card style={{ gap: spacing.sm }}>
          <AppText style={styles.title}>Miembros</AppText>
          {query.data?.map((member) => (
            <View key={member.id} style={uiStyles.row}>
              <AppText style={{ fontWeight: '700' }}>{member.user.displayName}</AppText>
              <AppText muted>{member.user.email ?? member.userId}</AppText>
              <AppText muted>{member.status}</AppText>
            </View>
          ))}
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
});
