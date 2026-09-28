export type ActivityRule = {
  name: string;
  varas: number[];
  tithis: number[];
  nakshatras: number[];
};

export const ACTIVITY_LIBRARY: Record<string, ActivityRule> = {
  "business": {
    name: "Business / Commerce",
    varas: [0, 1, 3, 4, 5, 6],
    tithis: [1, 2, 3, 5, 7, 10, 11, 13, 15], 
    nakshatras: [0, 3, 4, 5, 6, 7, 9, 10, 11, 12, 15, 17, 18, 20, 23, 25, 26] 
  },
  "travel": {
    name: "Travel / Yatra",
    varas: [3, 4, 5],
    tithis: [2, 3, 5, 7, 10, 11, 13],
    nakshatras: [0, 3, 4, 6, 7, 11, 12, 13, 16, 18, 20, 21, 22, 23, 26] 
  },
  "property": {
    name: "Property Purchasing",
    varas: [1, 2, 3, 6],
    tithis: [1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 15], 
    nakshatras: [0, 3, 4, 6, 7, 11, 12, 14, 16, 20, 21, 22, 23, 25] 
  },
  "litigation": {
    name: "Litigation (Plaintiff)",
    varas: [0, 1, 4, 6],
    tithis: [1, 3, 5, 7, 9, 11, 13, 15],
    nakshatras: [1, 3, 6, 8, 11, 12, 14, 16, 20, 22, 25, 26]
  },
  "hair_cutting": {
    name: "Hair & Beard Cutting",
    varas: [1, 3, 4, 5],
    tithis: [2, 3, 5, 7, 10, 11, 13],
    nakshatras: [0, 3, 4, 6, 7, 12, 13, 14, 17, 20, 21, 22, 23, 25, 26]
  },
  "nail_cutting": {
    name: "Nail Cutting",
    varas: [1, 3, 4, 5],
    tithis: [2, 3, 5, 7, 10, 11, 13],
    nakshatras: [0, 3, 4, 6, 7, 11, 12, 13, 14, 16, 17, 20, 21, 22, 23, 25, 26]
  },
  "oil_bath": {
    name: "Oil Bath",
    varas: [1, 3, 5, 6],
    tithis: [2, 3, 5, 7, 10, 13],
    nakshatras: [0, 3, 4, 6, 7, 12, 13, 14, 16, 18, 20, 22, 23, 25, 26]
  },
  "education": {
    name: "Education / Learning",
    varas: [0, 1, 3, 4, 5],
    tithis: [2, 3, 5, 6, 7, 10, 11, 12, 13],
    nakshatras: [0, 4, 5, 6, 7, 12, 13, 14, 21, 22, 23, 26]
  }
};
