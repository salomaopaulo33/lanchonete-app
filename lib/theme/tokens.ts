/**
 * Paleta de cores central do sistema (Princípio III da constituição).
 * Provisória até a lanchonete fornecer a paleta oficial — trocar os valores
 * abaixo é suficiente para atualizar as cores em todo o app, sem editar
 * nenhum componente.
 */
export const themeTokens = {
  primary: "#E4572E", // laranja: cor de destaque (botões principais, preços)
  primaryForeground: "#FFFFFF",
  secondary: "#2E4057", // azul-escuro: cabeçalhos, textos de destaque
  secondaryForeground: "#FFFFFF",
  background: "#FFFBF5",
  foreground: "#1F2933",
  muted: "#F1E9DB",
  mutedForeground: "#6B7280",
  success: "#2E7D32",
  warning: "#B45309",
  danger: "#C1121F",
  border: "#E5DED0",
} as const;

export type ThemeTokenName = keyof typeof themeTokens;
