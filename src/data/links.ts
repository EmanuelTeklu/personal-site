export interface CuratedLink {
  readonly title: string;
  readonly url: string;
  readonly note: string;
}

export const LINKS: readonly CuratedLink[] = [
  {
    title: "Marginal Revolution",
    url: "https://marginalrevolution.com",
    note: "Tyler Cowen & Alex Tabarrok. I read this every day.",
  },
];
