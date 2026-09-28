export type ActivityRule = {
  name: string;
  varas: number[];
  tithis: number[];
  nakshatras: number[];
};

export const ACTIVITY_LIBRARY: Record<string, ActivityRule> = {
  business: {
    name: "Business",
    varas: [0, 1, 3, 4],
    tithis: [1, 2, 3, 5, 7, 10, 11, 13, 15],
    nakshatras: [0, 1, 4, 7, 9, 10, 13, 16, 19, 22, 24]
  },
  travel: {
    name: "Travel",
    varas: [0, 2, 4],
    tithis: [1, 2, 3, 5, 7, 10, 11, 13, 15],
    nakshatras: [0, 4, 7, 9, 10, 13, 16, 19, 22, 24]
  },
  property: {
    name: "Property",
    varas: [1, 3, 5],
    tithis: [2, 3, 5, 7, 10, 11, 13, 15],
    nakshatras: [1, 4, 7, 9, 10, 13, 16, 19, 22, 24]
  },
  litigation: {
    name: "Litigation",
    varas: [2, 4, 6],
    tithis: [3, 5, 7, 10, 11, 13],
    nakshatras: [0, 4, 7, 9, 13, 16, 19, 22]
  }
};
