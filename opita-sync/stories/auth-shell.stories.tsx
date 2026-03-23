import type { Meta, StoryObj } from "@storybook/react";
import { AuthShell } from "../src/components/opita/auth-shell";
import { Button } from "../src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../src/components/ui/card";
import { Input } from "../src/components/ui/input";
import { StateBlock } from "../src/components/ui/state-block";

const meta = {
  title: "Opita/AuthShell",
  component: AuthShell,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen"
  },
  args: {
    theme: "light",
    title: "Accede a Opita Sync",
    description: "Inicia sesion para cargar tenant, rol efectivo y vistas habilitadas desde backend.",
    children: null
  }
} satisfies Meta<typeof AuthShell>;

export default meta;
type Story = StoryObj<typeof meta>;

function SignInCard({ loading = false }: { loading?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-subtle">Acceso</p>
          <CardTitle className="mt-2">Iniciar sesion</CardTitle>
          <p className="mt-2 text-sm text-muted">Correo y contrasena con tenant y rol resueltos server-side.</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input type="email" placeholder="correo@tenant.com" />
        <Input type="password" placeholder="Contrasena" />
        <Button className="w-full">{loading ? "Ingresando..." : "Entrar"}</Button>
      </CardContent>
    </Card>
  );
}

export const LoginIdle: Story = {
  args: {},
  render: (args) => (
    <AuthShell {...args}>
      <SignInCard />
    </AuthShell>
  )
};

export const LoginLoading: Story = {
  args: {},
  render: (args) => (
    <AuthShell {...args}>
      <SignInCard loading />
    </AuthShell>
  )
};

export const LoginError: Story = {
  args: {
    status: {
      tone: "danger",
      label: "No pudimos iniciar sesion",
      detail: "Credenciales invalidas. Revisa correo y contrasena."
    }
  },
  render: (args) => (
    <AuthShell {...args}>
      <SignInCard />
    </AuthShell>
  )
};

export const ResetRequested: Story = {
  args: {
    status: {
      tone: "brand",
      label: "Reset solicitado",
      detail: "Se envio un enlace de recuperacion al correo registrado."
    }
  },
  render: (args) => (
    <AuthShell {...args}>
      <StateBlock tone="success" title="Solicitud registrada" description="El usuario puede volver a login o completar el reset cuando reciba el token." />
    </AuthShell>
  )
};

export const ResetError: Story = {
  args: {
    status: {
      tone: "danger",
      label: "No pudimos restablecer la contrasena",
      detail: "El enlace de restablecimiento no es valido o ya expiro."
    }
  },
  render: (args) => (
    <AuthShell {...args}>
      <StateBlock tone="error" title="Reset fallido" description="Solicita un nuevo enlace o vuelve a iniciar sesion." />
    </AuthShell>
  )
};

export const SessionExpired: Story = {
  args: {
    status: {
      tone: "warning",
      label: "Sesion expirada",
      detail: "Tu sesion caduco o fue invalidada. Inicia sesion nuevamente."
    }
  },
  render: (args) => (
    <AuthShell {...args}>
      <SignInCard />
    </AuthShell>
  )
};

export const AccessDenied: Story = {
  args: {
    status: {
      tone: "danger",
      label: "Acceso denegado",
      detail: "Tu rol esta autenticado, pero esta superficie no esta habilitada para este tenant."
    }
  },
  render: (args) => (
    <AuthShell {...args}>
      <StateBlock tone="error" title="Vista bloqueada" description="Mantuvimos la sesion activa. Solicita permisos o vuelve a una vista habilitada." />
    </AuthShell>
  )
};
