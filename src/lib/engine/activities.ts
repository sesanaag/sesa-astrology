export const ACTIVITY_LIBRARY: Record<string, any> = {
  business: {
    description: "All business transactions, buying, and selling. Highly favorable Nakṣatras include Aśvinī, Rohiṇī, Mṛgaśīrṣa, Ārdrā, Punarvasu, Puṣya, Maghā, and Revatī. Avoid Rikta Tithis and the 6th, 8th, and 12th. Mars's Vāra is unfortunate for buying.",
    nakshatras: [0, 3, 4, 5, 6, 7, 9, 10, 11, 12, 15, 17, 18, 20, 23, 25, 26],
    tithis: [1, 2, 3, 5, 7, 10, 11, 13, 15],
    varas: [0, 1, 3, 4, 5, 6] 
  },
  travel: {
    description: "Commencing a journey. Aśvinī, Mṛgaśīrṣa, Puṣya, Hasta, Anurādhā, Śravaṇa, Dhaniṣṭhā, and Revatī are most favorable. Avoid the 1st, 4th, 6th, 8th, 9th, 12th, and 14th Tithis. Mercury, Jupiter, and Venus Vāras are best.",
    nakshatras: [0, 3, 4, 6, 7, 11, 12, 13, 16, 18, 20, 21, 22, 23, 26],
    tithis: [2, 3, 5, 7, 10, 11, 13],
    varas: [1, 3, 4, 5]
  },
  property: {
    description: "Real Estate purchasing. Aśvinī, Rohiṇī, Mṛgaśīrṣa, Punarvasu, Puṣya, Uttaraphalgunī, Hasta, Svātī, Anurādhā, Uttarāṣāḍhā, Śravaṇa, and Dhaniṣṭhā are favorable. Avoid Rikta (Empty) Tithis.",
    nakshatras: [0, 3, 4, 6, 7, 11, 12, 14, 16, 20, 21, 22, 23, 25],
    tithis: [1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 15],
    varas: [1, 2, 3, 6]
  },
  litigation: {
    description: "Setting out to overcome enemies or filing lawsuits. Favorable Nakṣatras match travel criteria. Paksha Chidra Tithis (4th, 6th, 8th, 9th, 12th, 14th) must be avoided. The Vāras of the Sun and Mars grant victory.",
    nakshatras: [0, 3, 4, 6, 7, 11, 12, 13, 16, 18, 20, 21, 22, 23, 26],
    tithis: [1, 2, 3, 5, 7, 10, 11, 13, 15],
    varas: [0, 2, 5]
  },
  hair_cutting: {
    description: "Tonsure, Hair, and Beard Cutting. Aśvinī, Mṛgaśīrṣa, Punarvasu, Puṣya, Hasta, Citrā, Śravaṇa, Dhaniṣṭhā, and Revatī are best. Avoid Rikta Tithis and the 8th/15th. Avoid the Vāras of Mars, Saturn, and the Sun.",
    nakshatras: [0, 3, 4, 6, 7, 12, 13, 14, 17, 20, 21, 22, 23, 25, 26],
    tithis: [2, 3, 5, 7, 10, 11, 13],
    varas: [1, 3, 4, 5]
  },
  nail_cutting: {
    description: "Nail Cutting. Aśvinī, Mṛgaśīrṣa, Punarvasu, Puṣya, Hasta, Citrā, Śravaṇa, Dhaniṣṭhā, and Revatī are best. Avoid the 4th, 8th, 9th, 14th, and 15th Tithis. Avoid Malefic Vāras.",
    nakshatras: [0, 3, 4, 6, 7, 11, 12, 13, 14, 16, 17, 20, 21, 22, 23, 25, 26],
    tithis: [2, 3, 5, 7, 10, 11, 12, 13],
    varas: [1, 3, 4, 5]
  },
  oil_bath: {
    description: "Oil baths for health and longevity. Avoid Ārdrā, Uttaraphalgunī, Jyeṣṭhā, and Śravaṇa. The 2nd, 3rd, 5th, 7th, 10th, and 13th Tithis grant strength. Saturn's Vāra brings happiness; avoid Sun, Mars, and Jupiter.",
    nakshatras: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 18, 19, 20, 22, 23, 24, 25, 26],
    tithis: [2, 3, 5, 7, 10, 13],
    varas: [1, 3, 5, 6]
  },
  education: {
    description: "Vidyā & Upavidyā (Study of arts, sciences, and texts). Aśvinī, Mṛgaśīrṣa, Ārdrā, Punarvasu, Puṣya, Hasta, Citrā, Svātī, Śravaṇa, Dhaniṣṭhā, and Śatabhiṣak are best. Mercury, Jupiter, and Venus Vāras favor intelligence.",
    nakshatras: [0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 18, 19, 20, 21, 22, 23, 24, 25, 26],
    tithis: [1, 2, 3, 5, 6, 10, 11, 12],
    varas: [0, 1, 3, 4, 5]
  },
  paying_debts: {
    description: "Discharging debts. Aśvinī, Punarvasu, Puṣya, Svātī, and Śatabhiṣak are best. Rikta (Empty) Tithis (4th, 9th, 14th) are highly favorable for extinguishing liabilities. Saturn's Vāra is favorable; avoid Mercury.",
    nakshatras: [0, 2, 5, 6, 7, 9, 10, 14, 15, 17, 18, 21, 22, 23],
    tithis: [4, 9, 14, 1, 2, 3, 5, 7, 10, 11, 13, 15],
    varas: [0, 1, 2, 4, 5, 6]
  }
};
