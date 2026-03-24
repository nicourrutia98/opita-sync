function indent(depth: number): string {
  return "  ".repeat(depth);
}

export function toYaml(value: unknown, depth = 0): string {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          return `${indent(depth)}-\n${toYaml(item, depth + 1)}`;
        }
        return `${indent(depth)}- ${formatScalar(item)}`;
      })
      .join("\n");
  }

  if (typeof value === "object" && value !== null) {
    return Object.entries(value)
      .map(([key, child]) => {
        if (typeof child === "object" && child !== null) {
          return `${indent(depth)}${key}:\n${toYaml(child, depth + 1)}`;
        }
        return `${indent(depth)}${key}: ${formatScalar(child)}`;
      })
      .join("\n");
  }

  return `${indent(depth)}${formatScalar(value)}`;
}

function formatScalar(value: unknown): string {
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value === null || value === undefined) {
    return "null";
  }
  return JSON.stringify(value);
}
