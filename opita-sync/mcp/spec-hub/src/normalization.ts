import type { NormalizedRequirements, Profile, RequirementItem } from "./types.js";

function splitSegments(text: string): string[] {
  return text
    .split(/\r?\n|[.;]+/g)
    .map((part) => part.trim().replace(/^[-*]\s*/, ""))
    .filter(Boolean);
}

function classifySegment(segment: string): "question" | "non_goal" | "constraint" | "assumption" | "requirement" {
  if (segment.includes("?")) {
    return "question";
  }
  if (/\b(out of scope|non-goal|no objetivo|fuera de alcance|no incluye|no debe)\b/i.test(segment)) {
    return "non_goal";
  }
  if (/\b(assume|assuming|supuesto|asumimos)\b/i.test(segment)) {
    return "assumption";
  }
  if (/\b(only|solo|sin |without|constraint|restriccion|limit|limite)\b/i.test(segment)) {
    return "constraint";
  }
  return "requirement";
}

export function normalizeRequirements(sourceText: string, profile: Profile = "skill"): NormalizedRequirements {
  const segments = splitSegments(sourceText);
  const requirements: RequirementItem[] = [];
  const constraints: string[] = [];
  const nonGoals: string[] = [];
  const assumptions: NormalizedRequirements["assumptions"] = [];
  const openQuestions: NormalizedRequirements["open_questions"] = [];

  segments.forEach((segment, index) => {
    const bucket = classifySegment(segment);
    if (bucket === "requirement") {
      requirements.push({
        id: `RQ-${index + 1}`,
        statement: segment,
        priority: "must"
      });
      return;
    }
    if (bucket === "constraint") {
      constraints.push(segment);
      return;
    }
    if (bucket === "non_goal") {
      nonGoals.push(segment);
      return;
    }
    if (bucket === "assumption") {
      assumptions.push({ text: segment, impact: "medium" });
      return;
    }
    openQuestions.push({ question: segment, impact: "important" });
  });

  return {
    profile,
    source_text: sourceText,
    requirements,
    constraints,
    non_goals: nonGoals,
    assumptions,
    open_questions: openQuestions
  };
}
