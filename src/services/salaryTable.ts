// Parser and lookup for PPPK / PNS Salary Scale from attachment /public/assets/aistudio/KGB_2026_1626e2f2

export interface SalaryMatrix {
  [mkg: number]: {
    [golongan: string]: number;
  };
}

// Embedded matrix parsed from /public/assets/aistudio/KGB_2026_1626e2f2
export const SALARY_DATA: SalaryMatrix = {
  0: { I: 1938500, V: 2511500, IX: 3203600, X: 3339100, XI: 3480300, XII: 3627500, XIII: 3781000, XIV: 3940900, XV: 4107600, XVI: 4281400, XVII: 4462500 },
  1: { V: 2551100 },
  2: { I: 1999500, IX: 3304400, X: 3444200, XI: 3589900, XII: 3741800, XIII: 3900000, XIV: 4065000, XV: 4237000, XVI: 4416200, XVII: 4603000 },
  3: { II: 2116900, III: 2206500, IV: 2299800, V: 2631400, VI: 2742800, VII: 2858800, VIII: 2979700 },
  4: { I: 2062500, IX: 3408500, X: 3552700, XI: 3703000, XII: 3859600, XIII: 4022900, XIV: 4193000, XV: 4370400, XVI: 4555300, XVII: 4748000 },
  5: { II: 2183600, III: 2276000, IV: 2372300, V: 2714300, VI: 2829100, VII: 2948800, VIII: 3073500 },
  6: { I: 2127500, IX: 3515900, X: 3664600, XI: 3819600, XII: 3981200, XIII: 4149600, XIV: 4325100, XV: 4508100, XVI: 4698700, XVII: 4897500 },
  7: { II: 2252400, III: 2347700, IV: 2447000, V: 2799800, VI: 2918200, VII: 3041700, VIII: 3170300 },
  8: { I: 2194500, IX: 3626600, X: 3780000, XI: 3939900, XII: 4106600, XIII: 4280300, XIV: 4461300, XV: 4650000, XVI: 4846700, XVII: 5051800 },
  9: { II: 2323300, III: 2421600, IV: 2524000, V: 2888000, VI: 3010100, VII: 3137500, VIII: 3270200 },
  10: { I: 2263600, IX: 3740800, X: 3899100, XI: 4064000, XII: 4235900, XIII: 4415100, XIV: 4601800, XV: 4796500, XVI: 4999400, XVII: 5210900 },
  11: { II: 2396500, III: 2497900, IV: 2603500, V: 2978900, VI: 3105000, VII: 3236300, VIII: 3373200 },
  12: { I: 2334900, IX: 3858600, X: 4021900, XI: 4192000, XII: 4369300, XIII: 4554100, XIV: 4746800, XV: 4947600, XVI: 5156800, XVII: 5375000 },
  13: { II: 2472000, III: 2576500, IV: 2685500, V: 3072800, VI: 3202700, VII: 3338200, VIII: 3479400 },
  14: { I: 2408400, IX: 3980200, X: 4148500, XI: 4324000, XII: 4506900, XIII: 4697600, XIV: 4896300, XV: 5103400, XVI: 5319300, XVII: 5544300 },
  15: { II: 2549800, III: 2657700, IV: 2770100, V: 3169500, VI: 3303600, VII: 3443400, VIII: 3589000 },
  16: { I: 2484300, IX: 4105500, X: 4279200, XI: 4460200, XII: 4648900, XIII: 4845500, XIV: 5050500, XV: 5264100, XVI: 5486800, XVII: 5718900 },
  17: { II: 2630100, III: 2741400, IV: 2857400, V: 3269400, VI: 3407700, VII: 3551800, VIII: 3702000 },
  18: { I: 2562500, IX: 4234800, X: 4414000, XI: 4600700, XII: 4795300, XIII: 4998100, XIV: 5209500, XV: 5429900, XVI: 5659600, XVII: 5899000 },
  19: { II: 2713000, III: 2827700, IV: 2947400, V: 3372300, VI: 3515000, VII: 3663700, VIII: 3818600 },
  20: { I: 2643200, IX: 4368200, X: 4553000, XI: 4745600, XII: 4946300, XIII: 5155500, XIV: 5373600, XV: 5600900, XVI: 5837800, XVII: 6084800 },
  21: { II: 2798400, III: 2916800, IV: 3040200, V: 3478500, VI: 3625700, VII: 3779100, VIII: 3938900 },
  22: { I: 2726500, IX: 4505800, X: 4696400, XI: 4895000, XII: 5102100, XIII: 5317900, XIV: 5542900, XV: 5777300, XVI: 6021700, XVII: 6276400 },
  23: { II: 2886600, III: 3008700, IV: 3135900, V: 3588100, VI: 3739900, VII: 3898100, VIII: 4063000 },
  24: { I: 2812400, IX: 4647700, X: 4844300, XI: 5049200, XII: 5262800, XIII: 5485400, XIV: 5717400, XV: 5959300, XVI: 6211400, XVII: 6474100 },
  25: { II: 2977500, III: 3103400, IV: 3234700, V: 3701100, VI: 3857700, VII: 4020800, VIII: 4190900 },
  26: { I: 2900900, IX: 4794100, X: 4996900, XI: 5208200, XII: 5428500, XIII: 5658200, XIV: 5897500, XV: 6147000, XVI: 6407000, XVII: 6678000 },
  27: { II: 3071200, III: 3201200, IV: 3336600, V: 3817700, VI: 3979200, VII: 4147500, VIII: 4322900 },
  28: { IX: 4945100, X: 5154200, XI: 5372300, XII: 5599500, XIII: 5836400, XIV: 6083200, XV: 6340600, XVI: 6608800, XVII: 6888300 },
  29: { V: 3937900, VI: 4104500, VII: 4278100, VIII: 4459100 },
  30: { IX: 5100800, X: 5316500, XI: 5541500, XII: 5775900, XIII: 6020200, XIV: 6274800, XV: 6540300, XVI: 6816900, XVII: 7105300 },
  31: { V: 4061900, VI: 4233800, VII: 4412800, VIII: 4599500 },
  32: { IX: 5261500, X: 5484000, XI: 5716000, XII: 5957800, XIII: 6209800, XIV: 6472500, XV: 6746200, XVI: 7031600, XVII: 7329000 },
  33: { V: 4189900, VI: 4367100, VII: 4551800, VIII: 4744400 },
};

/**
 * Format number to Indonesian Rupiah representation: "Rp 3.203.600"
 */
export function formatRupiah(amount?: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rp 0';
  return 'Rp ' + amount.toLocaleString('id-ID');
}

/**
 * Normalize Golongan string (e.g. "Golongan IX", "IX", "III/a" -> "IX" or mapped)
 */
export function normalizeGolongan(golRaw?: string): string {
  if (!golRaw) return 'IX';
  const clean = golRaw.toUpperCase().trim().replace(/^GOLONGAN\s*/i, '').replace(/^GOL\s*/i, '');
  if (SALARY_DATA[0][clean]) return clean;
  // If PNS format like III/a, map to approx PPPK equivalent or fallback
  const mapPns: Record<string, string> = {
    'I/A': 'I', 'I/B': 'II', 'I/C': 'III', 'I/D': 'IV',
    'II/A': 'V', 'II/B': 'VI', 'II/C': 'VII', 'II/D': 'VIII',
    'III/A': 'IX', 'III/B': 'X', 'III/C': 'XI', 'III/D': 'XII',
    'IV/A': 'XIII', 'IV/B': 'XIV', 'IV/C': 'XV', 'IV/D': 'XVI', 'IV/E': 'XVII'
  };
  return mapPns[clean] || clean;
}

/**
 * Extract years number from MK string (e.g. "03 tahun 00 bulan" -> 3)
 */
export function parseMkYears(mkStr?: string): number {
  if (!mkStr) return 0;
  const match = mkStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Formatter for Masa Kerja as specified in prompt:
 * "untuk MK Sebelum, MK Sesudah jika masa kerja diisi angka 3 maka otomatis akan tampil value 03 tahun 00 bulan."
 */
export function formatMasaKerja(input: string | number): string {
  if (input === null || input === undefined) return '00 tahun 00 bulan';
  const str = String(input).trim();
  if (!str) return '00 tahun 00 bulan';

  // Check if user already provided complete "03 tahun 00 bulan" format
  const complexMatch = str.match(/(\d+)\s*(?:thn|tahun|th)?\s*(\d+)?\s*(?:bln|bulan)?/i);
  if (complexMatch && (str.includes('tahun') || str.includes('th') || str.includes('bulan'))) {
    const years = parseInt(complexMatch[1] || '0', 10);
    const months = parseInt(complexMatch[2] || '0', 10);
    const padY = String(years).padStart(2, '0');
    const padM = String(months).padStart(2, '0');
    return `${padY} tahun ${padM} bulan`;
  }

  // Pure integer or decimal number e.g. "3", 3, "03"
  const pureNum = parseInt(str.replace(/\D/g, ''), 10);
  if (!isNaN(pureNum)) {
    const padY = String(pureNum).padStart(2, '0');
    return `${padY} tahun 00 bulan`;
  }

  return str;
}

/**
 * Get Gaji Pokok by Golongan and Masa Kerja Golongan (Years)
 */
export function getGajiPokok(golonganRaw?: string, mkgYears: number = 0): number {
  const gol = normalizeGolongan(golonganRaw);
  // Find matching or nearest lower even/odd MKG in salary scale
  const targetMkg = Math.max(0, Math.min(33, mkgYears));
  
  if (SALARY_DATA[targetMkg] && SALARY_DATA[targetMkg][gol]) {
    return SALARY_DATA[targetMkg][gol];
  }

  // Scan downward for closest valid mkg step
  for (let m = targetMkg; m >= 0; m--) {
    if (SALARY_DATA[m] && SALARY_DATA[m][gol]) {
      return SALARY_DATA[m][gol];
    }
  }

  // Scan upward if not found
  for (let m = targetMkg; m <= 33; m++) {
    if (SALARY_DATA[m] && SALARY_DATA[m][gol]) {
      return SALARY_DATA[m][gol];
    }
  }

  return 3203600; // Default baseline (Gol IX mkg 0)
}
