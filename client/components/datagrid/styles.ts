import type { Theme } from '@glideapps/glide-data-grid'

// Define keys for base properties
type BaseThemeKeys =
  | 'cellHorizontalPadding'
  | 'cellVerticalPadding'
  | 'headerIconSize'
  | 'roundingRadius'
  | 'headerFontStyle'
  | 'baseFontStyle'
  | 'markerFontStyle'
  | 'fontFamily'
  | 'editorFontSize'
  | 'lineHeight'

// Create type for base theme props
type BaseThemeProps = Pick<Theme, BaseThemeKeys>

// Create type for theme colors
type ThemeColors = Omit<Theme, BaseThemeKeys>

// Base theme properties
const baseThemeProps: BaseThemeProps = {
  // Dimensions & Spacing
  cellHorizontalPadding: 8,
  cellVerticalPadding: 3,
  headerIconSize: 18,
  roundingRadius: 4,

  // Typography
  headerFontStyle: '500 13px',
  baseFontStyle: '12px',
  markerFontStyle: '11px',
  fontFamily: "'JetBrains Mono Variable', ui-monospace, Menlo, monospace",
  editorFontSize: '12px',
  lineHeight: 1.3,
}

// Light theme
export const lightTheme: ThemeColors = {
  ...baseThemeProps,
  // Accent & Selection
  accentColor: 'hsl(210 40% 48%)',
  accentFg: 'hsl(0 0% 100%)',
  accentLight: 'hsl(210 40% 48% / 0.1)',

  // Text colors
  textDark: 'hsl(225 12% 12%)',
  textMedium: 'hsl(215 16% 46.1%)',
  textLight: 'hsl(215 16% 46.1% / 0.8)',
  textBubble: 'hsl(225 12% 12%)',

  // Header colors
  bgIconHeader: 'hsl(215 16% 46.1%)',
  fgIconHeader: 'hsl(0 0% 100%)',
  textHeader: 'hsl(215 16% 46.1%)',
  textGroupHeader: 'hsl(215 16% 46.1% / 0.7)',
  textHeaderSelected: 'hsl(225 12% 12%)',

  // Cell backgrounds
  bgCell: 'hsl(0 0% 100%)',
  bgCellMedium: 'hsl(210 40% 96.1%)',
  bgHeader: 'hsl(210 40% 98%)',
  bgHeaderHasFocus: 'hsl(210 40% 94%)',
  bgHeaderHovered: 'hsl(210 40% 96.1%)',

  // Selection & Search
  bgBubble: 'hsl(210 40% 96.1%)',
  bgBubbleSelected: 'hsl(210 40% 98%)',
  bgSearchResult: 'hsl(48 100% 50% / 0.1)',

  // Borders
  borderColor: 'hsl(214.3 31.8% 91.4%)',
  drilldownBorder: 'hsl(0 0% 0% / 0)',
  horizontalBorderColor: 'hsl(214.3 31.8% 91.4%)',

  // Links
  linkColor: 'hsl(210 40% 48%)',

  // Optional properties
  resizeIndicatorColor: 'hsl(210 40% 48%)',
  headerBottomBorderColor: 'hsl(214.3 31.8% 91.4%)',
}

// Dark theme
export const darkTheme: ThemeColors = {
  ...baseThemeProps,
  // Accent & Selection
  accentColor: 'hsl(210 40% 65%)',
  accentFg: 'hsl(225 12% 12%)',
  accentLight: 'hsl(210 40% 65% / 0.1)',

  // Text colors
  textDark: 'hsl(210 6% 98%)',
  textMedium: 'hsl(215 6% 72%)',
  textLight: 'hsl(215 6% 72% / 0.8)',
  textBubble: 'hsl(210 6% 98%)',

  // Header colors
  bgIconHeader: 'hsl(215 6% 72%)',
  fgIconHeader: 'hsl(225 12% 12%)',
  textHeader: 'hsl(215 6% 72%)',
  textGroupHeader: 'hsl(215 6% 72% / 0.7)',
  textHeaderSelected: 'hsl(210 6% 98%)',

  // Cell backgrounds
  bgCell: 'hsl(225 12% 8.5%)',
  bgCellMedium: 'hsl(225 12% 16%)',
  bgHeader: 'hsl(225 12% 12%)',
  bgHeaderHasFocus: 'hsl(225 12% 20%)',
  bgHeaderHovered: 'hsl(225 12% 16%)',

  // Selection & Search
  bgBubble: 'hsl(225 12% 16%)',
  bgBubbleSelected: 'hsl(225 12% 12%)',
  bgSearchResult: 'hsl(48 100% 50% / 0.1)',

  // Borders
  borderColor: 'hsl(225 12% 18%)',
  drilldownBorder: 'hsl(0 0% 100% / 0)',
  horizontalBorderColor: 'hsl(225 12% 18%)',

  // Links
  linkColor: 'hsl(210 40% 65%)',

  // Optional properties
  resizeIndicatorColor: 'hsl(210 40% 65%)',
  headerBottomBorderColor: 'hsl(225 12% 18%)',
}
