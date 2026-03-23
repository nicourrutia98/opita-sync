import type { Meta, StoryObj } from "@storybook/react";
import { BrandLockup } from "../src/components/opita/brand-lockup";

const meta = {
  title: "Opita/Brand/Lockup",
  component: BrandLockup,
  tags: ["autodocs"],
  args: {
    theme: "light"
  }
} satisfies Meta<typeof BrandLockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = {};

export const Dark: Story = {
  args: {
    theme: "dark"
  },
  decorators: [
    (Story) => (
      <div data-theme="dark" className="min-h-screen bg-paper p-6">
        <Story />
      </div>
    )
  ]
};
