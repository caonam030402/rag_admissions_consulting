/**
 * Theme configuration types
 */

export interface Theme {
  id: string;
  name: string;
  colors: ColorScheme;
}

export interface ColorScheme {
  layoutBackground: string;
  minimizedBackground: string;
  inputBackground: string;
  inputFontColor: string;
  primaryButton: string;
  borderColor: string;
  copilotReplyBackground: string;
  copilotFontColor: string;
  userReplyBackground: string;
  userFontColor: string;
}
