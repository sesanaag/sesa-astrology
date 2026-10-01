export const ACTIVITY_LIBRARY: Record<string, any> = {
  business: {
    description: "All business transactions, buying, and selling. Favorable Nakṣatras: Aśvinī, Rohiṇī, Mṛgaśīrṣa, Ārdrā, Punarvasu, Puṣya, Maghā, Pūrva Phalgunī, Uttara Phalgunī, Hasta, Viśākhā, Jyeṣṭhā, Mūla, Uttarāṣāḍhā, Śatabhiṣak, Uttara Bhādrapadā, Revatī. Favorable Tithis: All except 4th, 6th, 8th, 9th, 12th, 14th. Favorable Vāras: All except Mars (unfortunate for buying). Lagnas: Taurus, Gemini, Leo, Libra, Scorpio.",
    nakshatras: [0, 3, 4, 5, 6, 7, 9, 10, 11, 12, 15, 17, 18, 20, 23, 25, 26],
    tithis: [1, 2, 3, 5, 7, 10, 11, 13, 15],
    varas: [0, 1, 3, 4, 5, 6] 
  },
  travel: {
    description: "Commencing a journey. Favorable Nakṣatras: Aśvinī, Mṛgaśīrṣa, Puṣya, Hasta, Anurādhā, Śravaṇa, Dhaniṣṭhā, Revatī (most favorable), and Rohiṇī, Punarvasu, Uttaraphalgunī, Citrā, Mūla, Uttarāṣāḍhā, Śatabhiṣak (middling). Favorable Tithis: 2nd, 3rd, 5th, 7th, 10th, 11th, 13th. Avoid 1st, 4th, 6th, 8th, 9th, 12th, 14th, 15th. Favorable Vāras: Mercury, Jupiter, Venus. Avoid Ghata Nakṣatras/Tithis/Vāras.",
    nakshatras: [0, 3, 4, 6, 7, 11, 12, 13, 16, 18, 20, 21, 22, 23, 26],
    tithis: [2, 3, 5, 7, 10, 11, 13],
    varas: [1, 3, 4, 5]
  },
  property: {
    description: "Real Estate purchasing. Favorable Nakṣatras: Aśvinī, Rohiṇī, Mṛgaśīrṣa, Punarvasu, Puṣya, Uttaraphalgunī, Hasta, Svātī, Anurādhā, Uttarāṣāḍhā, Śravaṇa, Dhaniṣṭhā, Śatabhiṣak, Uttarabhadrapadā. Favorable Tithis: All except Rikta (4th, 9th, 14th). Favorable Vāras: Moon, Mars, Mercury, Saturn. Lagnas: Fixed Rāśis are most favorable, Dual Rāśis middling.",
    nakshatras: [0, 3, 4, 6, 7, 11, 12, 14, 16, 20, 21, 22, 23, 25],
    tithis: [1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 15],
    varas: [1, 2, 3, 6]
  },
  litigation: {
    description: "Overcoming enemies / Lawsuits. Favorable Nakṣatras: Travel Nakṣatras (Aśvinī, Mṛgaśīrṣa, Puṣya, Hasta, Anurādhā, Śravaṇa, Dhaniṣṭhā, Revatī, etc.). Akula factors (Sun, Moon, Jupiter, Saturn) favor the plaintiff. Avoid Pakṣa Chidra Tithis (4th, 6th, 8th, 9th, 12th, 14th). Favorable Vāras: Sun, Mars. Lagnas: Aries, Taurus, Leo, Sagittarius.",
    nakshatras: [0, 3, 4, 6, 7, 11, 12, 13, 16, 18, 20, 21, 22, 23, 26],
    tithis: [1, 2, 3, 5, 7, 10, 11, 13, 15],
    varas: [0, 2, 5]
  },
  hair_cutting: {
    description: "Hair and Beard Cutting (Tonsure). Favorable Nakṣatras: Aśvinī, Mṛgaśīrṣa, Punarvasu, Puṣya, Hasta, Citrā, Śravaṇa, Dhaniṣṭhā, Revatī (best). Favorable Tithis: 2nd, 3rd, 5th, 7th, 10th, 11th, 13th. Avoid 1st, 4th, 6th, 8th, 9th, 14th, 15th. Favorable Vāras: Moon, Mercury, Jupiter, Venus. Avoid Vāras of Mars, Saturn, Sun. Avoid evening/night.",
    nakshatras: [0, 3, 4, 6, 7, 12, 13, 14, 17, 20, 21, 22, 23, 25, 26],
    tithis: [2, 3, 5, 7, 10, 11, 13],
    varas: [1, 3, 4, 5]
  },
  nail_cutting: {
    description: "Nail Cutting. Favorable Nakṣatras: Aśvinī, Mṛgaśīrṣa, Punarvasu, Puṣya, Hasta, Citrā, Śravaṇa, Dhaniṣṭhā, Revatī. Favorable Tithis: 2nd, 3rd, 5th, 7th, 10th, 11th, 13th. Avoid 4th, 8th, 9th, 14th, 15th. Avoid Vāras of malefics. Avoid evening and night.",
    nakshatras: [0, 3, 4, 6, 7, 11, 12, 13, 14, 16, 17, 20, 21, 22, 23, 25, 26],
    tithis: [2, 3, 5, 7, 10, 11, 12, 13],
    varas: [1, 3, 4, 5]
  },
  oil_bath: {
    description: "Oil baths for health and longevity. Favorable Nakṣatras: Avoid Ārdrā, Uttaraphalgunī, Jyeṣṭhā, Śravaṇa. Favorable Tithis: 2nd, 3rd, 5th, 7th, 10th, 13th. Avoid 1st, 4th, 6th, 9th, 14th. Favorable Vāras: Saturn (happiness), Mercury (wealth), Venus (longevity). Avoid Sun, Mars, Jupiter. Avoid Sankrānti.",
    nakshatras: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 18, 19, 20, 22, 23, 24, 25, 26],
    tithis: [2, 3, 5, 7, 10, 13],
    varas: [1, 3, 5, 6]
  },
  education: {
    description: "Vidyā & Upavidyā (Study of arts/sciences). Favorable Nakṣatras: Aśvinī, Mṛgaśīrṣa, Ārdrā, Punarvasu, Puṣya, Hasta, Citrā, Svātī, Śravaṇa, Dhaniṣṭhā, Śatabhiṣak. Favorable Tithis: 2nd, 3rd, 5th, 6th, 10th, 11th. Avoid 4th, 8th, 9th, 14th, 15th, and Galagraha/Anadhyāya Tithis. Favorable Vāras: Mercury, Jupiter, Venus. Lagnas: Dual Rāśis.",
    nakshatras: [0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 18, 19, 20, 21, 22, 23, 24, 25, 26],
    tithis: [1, 2, 3, 5, 6, 10, 11, 12],
    varas: [0, 1, 3, 4, 5]
  },
  paying_debts: {
    description: "Discharging debts. Favorable Nakṣatras: Aśvinī, Punarvasu, Puṣya, Svātī, Śatabhiṣak (best), and Krittika, Ardra, Magha, etc (middling). Favorable Tithis: Riktā Tithis (4th, 9th, 14th) are best for extinguishing liabilities; avoid 6th, 8th, 12th. Favorable Vāra: Saturn. Avoid Mercury's Vāra. Lagnas: Taurus, Gemini, Libra.",
    nakshatras: [0, 2, 5, 6, 7, 9, 10, 14, 15, 17, 18, 21, 22, 23],
    tithis: [4, 9, 14, 1, 2, 3, 5, 7, 10, 11, 13, 15],
    varas: [0, 1, 2, 4, 5, 6]
  }
};
