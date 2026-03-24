import type { Meta, StoryObj } from "@storybook/react";
import { DisclosureBlock, PageIntro } from "../src/app";
import { Button } from "../src/components/ui/button";
import { StateBlock } from "../src/components/ui/state-block";

function FlowPatternPreview() {
  return (
    <div className="space-y-5 bg-paper p-6">
      <PageIntro
        eyebrow="Trabajo del turno"
        title="Empieza por lo importante y entra al caso correcto mas rapido."
        description="El encabezado define accion principal, continuidad y tono general del flujo sin recargar la vista."
        actions={
          <>
            <Button>Abrir trabajo</Button>
            <Button variant="secondary">Ir a chat</Button>
          </>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <DisclosureBlock
          title="Contexto secundario"
          summary="La informacion ampliada sigue disponible, pero solo se abre cuando cambia la decision o la continuidad."
        >
          <StateBlock tone="error" title="Aprobacion pendiente" description="Una de las decisiones del turno requiere supervision antes de ejecutar la accion." />
        </DisclosureBlock>
        <DisclosureBlock
          title="Estados conectados"
          summary="Los estados de error, bloqueo o confirmacion siguen siendo visibles cuando afectan la accion principal."
          defaultOpen
        >
          <StateBlock tone="success" title="Continuidad resuelta" description="La superficie mantiene el foco y deja trazabilidad accesible sin dominar la pantalla." />
        </DisclosureBlock>
      </div>
    </div>
  );
}

const meta = {
  title: "Opita/Patterns/Flow",
  component: FlowPatternPreview,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof FlowPatternPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MinimalFlow: Story = {};
