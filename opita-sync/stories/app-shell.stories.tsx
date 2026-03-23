import type { Meta, StoryObj } from "@storybook/react";
import { AppShell } from "../src/components/opita/app-shell";
import { roles } from "../src/domain/opita";

const meta = {
  title: "Opita/AppShell",
  component: AppShell,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen"
  },
  args: {
    role: "tecnico",
    view: "inicio",
    theme: "light",
    availableViews: ["inicio", "chat", "casos", "detalle"],
    roles,
    userName: "Laura Rojas",
    tenantName: "Acme Industrial",
    onSignOut: () => undefined,
    onRoleChange: () => undefined,
    onViewChange: () => undefined,
    onThemeChange: () => undefined,
    children: <div className="rounded-panel border border-line bg-panel p-6 text-ink">Contenido principal de la vista</div>
  }
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {}
};

export const DarkSupervisor: Story = {
  args: {
    role: "supervisor",
    theme: "dark",
    availableViews: ["inicio", "chat", "casos", "detalle"],
    userName: "Diego Gil",
    tenantName: "Acme Industrial"
  }
};
