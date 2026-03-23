import type { Meta, StoryObj } from "@storybook/react";
import { StateBlock } from "../src/components/ui/state-block";

const meta = {
  title: "Primitives/StateBlock",
  component: StateBlock,
  tags: ["autodocs"]
} satisfies Meta<typeof StateBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: {
    tone: "loading",
    title: "Cargando contexto",
    description: "Se está reuniendo información del caso."
  }
};

export const Empty: Story = {
  args: {
    tone: "empty",
    title: "Sin datos",
    description: "No hay elementos disponibles para esta vista."
  }
};

export const Error: Story = {
  args: {
    tone: "error",
    title: "Error de carga",
    description: "La solicitud no pudo completarse."
  }
};

export const Success: Story = {
  args: {
    tone: "success",
    title: "Acción completada",
    description: "La operación quedó auditada y visible para seguimiento."
  }
};
