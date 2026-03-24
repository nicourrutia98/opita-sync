import type { Meta, StoryObj } from "@storybook/react";
import { MetricCard } from "../src/components/opita/metric-card";

const meta = {
  title: "Opita/MetricCard",
  component: MetricCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded"
  },
  args: {
    label: "Casos activos",
    value: "18",
    helper: "Cola visible del turno actual con foco en continuidad y resolucion."
  }
} satisfies Meta<typeof MetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SupervisorFocus: Story = {
  args: {
    label: "Aprobaciones",
    value: "4",
    helper: "Decisiones pendientes agrupadas para triage rapido y menor ruido visual."
  }
};
