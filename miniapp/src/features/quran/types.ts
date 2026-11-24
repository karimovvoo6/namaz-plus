export interface Surah {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
}

export interface Ayah {
    number: number;
    audio: string;
    audioSecondary: string[];
    text: string;
    numberInSurah: number;
    juz: number;
    manzil: number;
    page: number;
    ruibu: number;
    hizbQuarter: number;
    sajda: boolean;
    transcription?: string; // Added manually
    translation?: string; // Added manually
}

export interface SurahDetail {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    numberOfAyahs: number;
    ayahs: Ayah[];
}
