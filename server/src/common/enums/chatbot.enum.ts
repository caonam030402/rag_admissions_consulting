export enum ChatbotRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export enum PersonalityType {
  PROFESSIONAL = 'professional',
  SASSY = 'sassy',
  EMPATHETIC = 'empathetic',
  FORMAL = 'formal',
  HUMOROUS = 'humorous',
  FRIENDLY = 'friendly',
}

export enum ModelType {
  GEMINI_PRO = 'gemini-pro',
  GEMINI_FLASH = 'gemini-flash',
  GPT_4 = 'gpt-4',
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  OLLAMA = 'ollama',
}

export enum ConfigType {
  DEFAULT = 'default',
  OVERRIDE = 'override',
}
