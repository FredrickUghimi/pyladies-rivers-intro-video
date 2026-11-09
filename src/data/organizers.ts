// Organizers shown in S3. Add a person ONLY when confirmed.
// `portrait` is optional: an approved portrait image (Fredrick's is an AI-stylised avatar).
export type Organizer = { name: string; role: string; portrait?: string };
export const ORGANIZERS: Organizer[] = [{ name: "Fredrick Ughimi", role: "Lead Organizer & Mentor", portrait: "img/fredrick.png" }];
