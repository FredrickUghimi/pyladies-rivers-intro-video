// S4 code demos: copied verbatim from assets/curriculum/PyLadies_Rivers_Curriculum.md (verified by scripts/verify.py).
export type Snippet = { week: string; topic: string; lines: string[] };
export const SNIPPETS: Snippet[] = [
  { week: "Week 2", topic: "Variables", lines: ['name = "Amaka"', "age = 22", "print(name)", "print(age)"] },
  {
    week: "Week 2",
    topic: "Data types",
    lines: [
      'name = "Amaka"        # string (str) — text, always in quotes',
      "age = 22               # integer (int) — whole number",
      "height = 1.65          # float — number with a decimal point",
      "is_student = True      # boolean (bool) — True or False only",
    ],
  },
  {
    week: "Week 3",
    topic: "if / elif / else",
    lines: [
      "age = 16",
      "",
      "if age >= 18:",
      '    print("You are eligible to vote.")',
      "elif age >= 16:",
      '    print("You can register but must wait to vote.")',
      "else:",
      '    print("You are not yet eligible.")',
    ],
  },
  { week: "Week 4", topic: "for loops", lines: ["for i in range(1, 6):", "    print(i)"] },
];
