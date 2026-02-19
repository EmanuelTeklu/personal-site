export interface Movie {
  readonly title: string;
  readonly year: string;
  readonly director: string;
  readonly note: string;
  readonly gradient: string;
  readonly accent: string;
  readonly letterboxd: string;
}

export interface OtherMovie {
  readonly title: string;
  readonly year: string;
  readonly note: string;
}

export const MOVIES: readonly Movie[] = [
  {
    title: "American Fiction",
    year: "2023",
    director: "Cord Jefferson",
    note: "Funniest movie I've seen in years.",
    gradient: "linear-gradient(145deg, #1a3a2a 0%, #2d1810 40%, #8b4513 100%)",
    accent: "#d4a574",
    letterboxd: "https://letterboxd.com/film/american-fiction/",
  },
  {
    title: "Fantastic Mr. Fox",
    year: "2009",
    director: "Wes Anderson",
    note: "The wild animal speech.",
    gradient: "linear-gradient(145deg, #c4751b 0%, #e8a833 40%, #f5d062 100%)",
    accent: "#3d2200",
    letterboxd: "https://letterboxd.com/film/fantastic-mr-fox/",
  },
  {
    title: "Barry Lyndon",
    year: "1975",
    director: "Stanley Kubrick",
    note: "Every frame, a painting.",
    gradient: "linear-gradient(145deg, #2a3040 0%, #4a5568 40%, #8b9bb5 100%)",
    accent: "#d4c5a0",
    letterboxd: "https://letterboxd.com/film/barry-lyndon/",
  },
  {
    title: "The Big Short",
    year: "2015",
    director: "Adam McKay",
    note: "Made me distrust everything and enjoy doing it.",
    gradient: "linear-gradient(145deg, #0d1117 0%, #1a1a2e 40%, #16213e 100%)",
    accent: "#e74c3c",
    letterboxd: "https://letterboxd.com/film/the-big-short-2015/",
  },
];

export const OTHER_MOVIES: readonly OtherMovie[] = [
  { title: "The Social Network", year: "2010", note: "Sorkin at his best." },
  { title: "Parasite", year: "2019", note: "The basement scene." },
];
