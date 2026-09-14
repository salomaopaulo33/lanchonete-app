/**
 * Paleta de cores central do sistema (Princípio III da constituição).
 * Paleta oficial da Nina Burguer — trocar os valores abaixo é suficiente
 * para atualizar as cores em todo o app, sem editar nenhum componente.
 */
export const themeTokens = {
  primary: "#F5821F", // laranja: cor de destaque (botões principais, preços)
  primaryForeground: "#FFFFFF",
  secondary: "#C9962C", // dourado: cabeçalhos, textos de destaque
  secondaryForeground: "#1A1A1A",
  background: "#0D0D0D",
  foreground: "#FFFFFF",
  muted: "#262626",
  mutedForeground: "#A3A3A3",
  success: "#2E7D32",
  warning: "#B45309",
  danger: "#E5484D",
  border: "#2E2E2E",
} as const;

export type ThemeTokenName = keyof typeof themeTokens;
