export const normalizeSkill = (value: string, aliases: Record<string, string>): string => {
  const cleaned = value.trim().toLowerCase();
  return aliases[cleaned] ?? cleaned;
};

export const uniqueSkills = (
  skills: string[],
  knownSkills: string[],
  aliases: Record<string, string>
): string[] => {
  const result = new Set<string>();

  skills
    .map((skill) => normalizeSkill(skill, aliases))
    .filter((skill) => skill.length > 0)
    .forEach((skill) => {
      if (knownSkills.includes(skill) || skill.includes(" ") || skill.length > 2) {
        result.add(skill);
      }
    });

  return [...result];
};
