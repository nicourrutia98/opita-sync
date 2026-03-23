import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../src/components/ui/button";

const meta = {
  title: "Primitives/Button",
  component: Button,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"],
  args: {
    children: "Acción principal"
  }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Acción secundaria"
  }
};
export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Acción contextual"
  }
};
