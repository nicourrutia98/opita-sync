import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Field, Screen, AppText, Button } from '../src/components/ui';
import { colors, spacing } from '../src/theme/tokens';
import { useSession } from '../src/providers/session-provider';

export default function AuthScreen() {
  const router = useRouter();
  const { signIn } = useSession();
  const [firebaseIdToken, setFirebaseIdToken] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <Screen style={styles.screen}>
      <Card style={styles.card}>
        <View style={{ gap: 6 }}>
          <AppText style={styles.title}>Opita Sync</AppText>
          <AppText muted>
            Bootstrap actual de frontend: usa un Firebase ID token real o de entorno de prueba para abrir una sesión válida contra el backend.
          </AppText>
        </View>
        <Field
          label="Firebase ID token"
          value={firebaseIdToken}
          onChangeText={setFirebaseIdToken}
          multiline
          placeholder="Pega aquí el token emitido por Firebase Auth."
        />
        <Field
          label="Invite token opcional"
          value={inviteToken}
          onChangeText={setInviteToken}
          placeholder="Solo si vas a consumir una invitación."
        />
        {error ? <AppText style={{ color: colors.danger }}>{error}</AppText> : null}
        <Button
          label={isSubmitting ? 'Abriendo sesión…' : 'Entrar'}
          disabled={!firebaseIdToken.trim() || isSubmitting}
          onPress={() => {
            setError('');
            setIsSubmitting(true);
            void signIn(firebaseIdToken.trim(), inviteToken.trim() || undefined)
              .then(() => router.replace('/workspace/current'))
              .catch((nextError: unknown) => {
                setError(
                  nextError instanceof Error
                    ? nextError.message
                    : 'No fue posible iniciar sesión',
                );
              })
              .finally(() => setIsSubmitting(false));
          }}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 760,
    gap: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
  },
});
