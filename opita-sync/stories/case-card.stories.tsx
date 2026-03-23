import type { Meta, StoryObj } from "@storybook/react";
import { CaseCard } from "../src/components/opita/case-card";
import { cases } from "../src/data/opita";

const meta = {
  title: "Opita/CaseCard",
  component: CaseCard,
  tags: ["autodocs"],
  args: {
    item: cases[0],
    onOpen: () => undefined
  },
  parameters: {
    layout: "padded"
  }
} satisfies Meta<typeof CaseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
