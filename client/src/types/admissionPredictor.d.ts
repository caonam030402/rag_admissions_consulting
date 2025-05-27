import type {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

import type { AdmissionFormData } from "./index";

export interface PredictionResult {
  major: string;
  probability: number;
  recentThreshold: number;
  suggestion: string;
}

export interface FormControlProps {
  register: UseFormRegister<AdmissionFormData>;
  errors?: any;
}

export interface BlockSelectProps extends FormControlProps {
  setValue: UseFormSetValue<AdmissionFormData>;
  currentBlock: string;
  filteredMajors: string[];
}

export interface ScoreInputsProps extends FormControlProps {
  activeSubjects: string[];
}

export interface MajorSelectionProps extends FormControlProps {
  currentBlock: string;
  filteredMajors: string[];
  selectedPreferences: string[];
  onCheckboxChange: (major: string, checked: boolean) => void;
}

export interface PredictionResultsProps {
  results: PredictionResult[];
  currentBlock: string;
  onBack: () => void;
  onSendToChat: () => void;
}

export interface PriorityZoneProps {
  register: UseFormRegister<AdmissionFormData>;
  setValue: UseFormSetValue<AdmissionFormData>;
  watch: UseFormWatch<AdmissionFormData>;
}
