export type CategoryKey =
  | 'all'
  | 'emergency'
  | 'neuro_headache'
  | 'msk_trauma'
  | 'urti_resp'
  | 'paeds'
  | 'git'
  | 'derma_infect'
  | 'ncd_dm'
  | 'ong'
  | 'eye_ent';

export interface CategoryInfo {
  key: CategoryKey;
  label: string;
  iconName: string;
  shortLabel: string;
}

export interface TemplateData {
  underlying: string;
  pw: string;
  vitals: string;
  oe: string;
  imp: string;
  plan: string;
  referralLetter?: string;
}

export interface ClinicalTemplate {
  id: string;
  title: string;
  category: CategoryKey;
  isEmergency: boolean;
  tags: string[];
  demographics: string;
  data: TemplateData;
  isCustom?: boolean;
  updatedAt?: number;
}

export interface ClinicProfile {
  clinicName: string;
  doctorName: string;
  mmcNumber: string;
  clinicAddress: string;
  clinicPhone: string;
  defaultHospital: string;
}

export interface QuickVitals {
  bp: string;
  hr: string;
  temp: string;
  spo2: string;
  rr: string;
  dxt: string;
  weight: string;
}
