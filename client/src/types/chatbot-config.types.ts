export enum ConfigType {
    DEFAULT = "default",
    OVERRIDE = "override",
}

export enum ModelType {
    GEMINI_PRO = "gemini-pro",
    GEMINI_FLASH = "gemini-flash",
    GPT_4 = "gpt-4",
    GPT_3_5_TURBO = "gpt-3.5-turbo",
    OLLAMA = "ollama",
}

export enum PersonalityType {
    PROFESSIONAL = "professional",
    SASSY = "sassy",
    EMPATHETIC = "empathetic",
    FORMAL = "formal",
    HUMOROUS = "humorous",
    FRIENDLY = "friendly",
}

export interface LLMConfig {
    defaultModel: ModelType;
    openaiApiKey?: string;
    geminiApiKey?: string;
    maxTokens: number;
    temperature: number;
}

export interface ChatConfig {
    maxContextLength: number;
    contextWindowMinutes: number;
    maxResponseTokens: number;
    streamDelayMs: number;
}

export interface ChatbotPersonality {
    name: string;
    persona: string;
    personality: PersonalityType;
    avatar?: string;
    creativityLevel: number;
}

export interface AppearanceConfig {
    primaryColor: string;
    secondaryColor: string;
    chatBubbleStyle: string;
    fontFamily: string;
    fontSize: number;
    darkMode: boolean;
    showAvatar: boolean;
    windowPosition: string;
}

export interface WelcomeSettings {
    welcomeMessage: string;
    showWelcomeMessage: boolean;
    autoGreet: boolean;
    greetingDelay: number;
    quickStartButtons?: string[];
    showSuggestedQuestions: boolean;
    suggestedQuestions?: string[];
}

export interface HumanHandoffConfig {
    enabled: boolean;
    triggerKeywords?: string[];
    agentAvailableMessage?: string;
    agentUnavailableMessage?: string;
    maxWaitTime: number;
    showEscalationButton: boolean;
    escalationButtonText: string;
}

export interface ContactInfo {
    hotline: string;
    email: string;
    website: string;
    address: string;
}

export interface ChatbotConfig {
    id: string;
    type: ConfigType;
    llmConfig: LLMConfig;
    chatConfig: ChatConfig;
    personality: ChatbotPersonality;
    appearance: AppearanceConfig;
    welcomeSettings: WelcomeSettings;
    humanHandoff: HumanHandoffConfig;
    contactInfo: ContactInfo;
    environment: string;
    debug: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Section update types
export interface UpdateBasicInfoData {
    personality?: Partial<ChatbotPersonality>;
    llmConfig?: Partial<LLMConfig>;
}

export interface UpdateAppearanceData {
    appearance?: Partial<AppearanceConfig>;
}

export interface UpdateWelcomeSettingsData {
    welcomeSettings?: Partial<WelcomeSettings>;
}

export interface UpdateHumanHandoffData {
    humanHandoff?: Partial<HumanHandoffConfig>;
}
