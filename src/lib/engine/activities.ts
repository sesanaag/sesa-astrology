export type MicroCombination = {
  name: string;
  check: (lagnaSign: number, moonSign: number, nakshatraIndex: number, dayIndex: number, tithiIndex: number) => boolean;
};

export type ActivityRule = {
  name: string;
  varas: number[]; 
  tithis: number[]; 
  nakshatras: number[]; 
  favorable_lagnas?: number[];
  micro_combinations?: MicroCombination[];
  description: string;
};

export const ACTIVITY_LIBRARY: Record<string, ActivityRule> = {
  "business": {
    name: "Business / Commerce",
    varas: [0, 1, 3, 4, 5, 6],
    tithis: [1, 2, 3, 5, 7, 10, 11, 13, 15], 
    nakshatras: [0, 3, 4, 5, 6, 7, 9, 10, 11, 12, 15, 17, 18, 20, 23, 25, 26],
    favorable_lagnas: [1, 2, 5, 6, 8, 10, 11],
    description: "Favorable Varas: Mon, Wed, Thu, Fri, Sat, Sun. Favorable Tithis: 1, 2, 3, 5, 7, 10, 11, 13, 15. Lagnas: Fixed & Dual signs with benefic lords. Favors commercial and financial initiation."
  },
  "travel": {
    name: "Travel / Yatra",
    varas: [3, 4, 5],
    tithis: [2, 3, 5, 7, 10, 11, 13],
    nakshatras: [0, 3, 4, 6, 7, 11, 12, 13, 16, 18, 20, 21, 22, 23, 26],
    favorable_lagnas: [0, 2, 3, 6, 8, 9, 11],
    micro_combinations: [
      {
        name: "Yatra Siddhi (Moveable Lagna on Thursday/Friday)",
        check: (lagna, moon, nak, day) => (day === 4 || day === 5) && [0, 3, 6, 9].includes(lagna)
      }
    ],
    description: "Favorable Varas: Wed, Thu, Fri. Favorable Tithis: 2, 3, 5, 7, 10, 11, 13. Lagnas: Moveable (Chara) signs are strongly favored. Special Yatra Siddhi Yoga forms on Thu/Fri with a Moveable Lagna."
  },
  "property": {
    name: "Property Purchasing",
    varas: [1, 2, 3, 6],
    tithis: [1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 15], 
    nakshatras: [0, 3, 4, 6, 7, 11, 12, 14, 16, 20, 21, 22, 23, 25],
    favorable_lagnas: [1, 4, 7, 10],
    description: "Favorable Varas: Mon, Tue, Wed, Sat. Favorable Tithis: 1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 15. Lagnas: Sthira (Fixed) signs (Taurus, Leo, Scorpio, Aquarius). Requires Dhruva (Fixed) stars."
  },
  "litigation": {
    name: "Litigation (Plaintiff)",
    varas: [0, 1, 4, 6],
    tithis: [1, 3, 5, 7, 9, 11, 13, 15],
    nakshatras: [1, 3, 6, 8, 11, 12, 14, 16, 20, 22, 25, 26],
    favorable_lagnas: [0, 7],
    description: "Favorable Varas: Sun, Mon, Thu, Sat. Favorable Tithis: 1, 3, 5, 7, 9, 11, 13, 15. Lagnas: Martial signs (Aries, Scorpio). Favors aggressive and definitive legal action."
  },
  "hair_cutting": {
    name: "Hair & Beard Cutting",
    varas: [1, 3, 4, 5],
    tithis: [2, 3, 5, 7, 10, 11, 13],
    nakshatras: [0, 3, 4, 6, 7, 12, 13, 14, 17, 20, 21, 22, 23, 25, 26],
    favorable_lagnas: [1, 2, 5, 6, 10, 11],
    description: "Favorable Varas: Mon, Wed, Thu, Fri. Favorable Tithis: 2, 3, 5, 7, 10, 11, 13. Avoid Rikta Tithis and malefic days."
  },
  "nail_cutting": {
    name: "Nail Cutting",
    varas: [1, 3, 4, 5],
    tithis: [2, 3, 5, 7, 10, 11, 13],
    nakshatras: [0, 3, 4, 6, 7, 11, 12, 13, 14, 16, 17, 20, 21, 22, 23, 25, 26],
    favorable_lagnas: [1, 2, 5, 6, 10, 11],
    description: "Favorable Varas: Mon, Wed, Thu, Fri. Favorable Tithis: 2, 3, 5, 7, 10, 11, 13. Avoid malefic days."
  },
  "oil_bath": {
    name: "Oil Bath (Abhyanga)",
    varas: [1, 3, 5, 6],
    tithis: [2, 3, 5, 7, 10, 13],
    nakshatras: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 18, 19, 20, 22, 23, 24, 25, 26],
    description: "Favorable Varas: Mon, Wed, Fri, Sat. Favorable Tithis: 2, 3, 5, 7, 10, 13. Highly sensitive to Nakshatra and lunar phases."
  },
  "education": {
    name: "Education / Vidya",
    varas: [3, 4, 5],
    tithis: [2, 3, 5, 6, 7, 10, 11, 13],
    nakshatras: [0, 3, 4, 5, 6, 7, 11, 12, 13, 14, 20, 21, 22, 23, 25, 26],
    favorable_lagnas: [2, 5, 8, 11],
    description: "Favorable Varas: Wed, Thu, Fri. Favorable Tithis: 2, 3, 5, 6, 7, 10, 11, 13. Lagnas: Dual signs (Gemini, Virgo, Sagittarius, Pisces) favor learning and adaptability."
  },
  "paying_debts": {
    name: "Paying Debts",
    varas: [0, 1, 2, 4, 5, 6],
    tithis: [4, 9, 14],
    nakshatras: [0, 7, 8, 15, 24], 
    favorable_lagnas: [1, 2, 6],
    micro_combinations: [
      {
        name: "Maitra Muhurta (Moon in Lagna in Asvini/Anuradha)",
        check: (lagna, moon, nak) => lagna === moon && (nak === 0 || nak === 16)
      },
      {
        name: "Moveable Lagna on Saturn's Vara",
        check: (lagna, moon, nak, day) => day === 6 && [0, 3, 6, 9].includes(lagna)
      }
    ],
    description: "The first payment on a debt is the most critical. Strictly avoid Mercury's Vara. Rikta Tithis (4, 9, 14) are most favorable. Lagnas: Taurus, Gemini, Libra. Maitra Muhurta forms when Moon is in Lagna in Asvini or Anuradha."
  }
};
