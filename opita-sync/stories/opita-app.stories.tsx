import type { Meta, StoryObj } from "@storybook/react";
import { App } from "../src/app";
import { createStubOpitaAppServices } from "../src/services/stub/stub-adapter";

const meta = {
  title: "Opita/Views/App",
  component: App,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    initialTheme: "light"
  }
};

export const SupervisorDark: Story = {
  args: {
    services: createStubOpitaAppServices({ seedSession: "supervisor" }),
    initialView: "inicio",
    initialTheme: "dark"
  }
};

export const CasesFailOnce: Story = {
  args: {
    services: createStubOpitaAppServices({ seedSession: "tecnico", failOnce: ["cases"] }),
    initialView: "casos",
    initialTheme: "light"
  }
};

export const SessionExpiredOnCases: Story = {
  args: {
    services: createStubOpitaAppServices({ seedSession: "tecnico", authFailOnce: ["cases:unauthorized"] }),
    initialView: "casos"
  }
};

export const AccessDeniedOnConfig: Story = {
  args: {
    services: createStubOpitaAppServices({ seedSession: "admin", authFailOnce: ["tenant:forbidden"] }),
    initialView: "configuracion"
  }
};

export const Release2DetailGovernedLog: Story = {
  args: {
    services: createStubOpitaAppServices({ seedSession: "tecnico" }),
    initialView: "detalle",
    initialTheme: "light"
  }
};

export const Release2ConfigGovernance: Story = {
  args: {
    services: createStubOpitaAppServices({ seedSession: "admin" }),
    initialView: "configuracion",
    initialTheme: "dark"
  }
};

export const Release3ChatDrafting: Story = {
  args: {
    services: createStubOpitaAppServices({ seedSession: "tecnico" }),
    initialView: "chat",
    initialTheme: "light"
  }
};

export const Release3ValueAndUsage: Story = {
  args: {
    services: createStubOpitaAppServices({ seedSession: "admin" }),
    initialView: "configuracion",
    initialTheme: "light"
  }
};

export const Release4GovernanceAndCompliance: Story = {
  args: {
    services: createStubOpitaAppServices({ seedSession: "admin" }),
    initialView: "configuracion",
    initialTheme: "dark"
  }
};
