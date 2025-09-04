// Harley Davidson inspired theme with 3D effects
export const colors = {
  // Primary Harley Davidson Orange
  primary: '#FF6B00',
  primaryLight: '#FF8533',
  primaryDark: '#E55A00',
  
  // Secondary colors
  secondary: '#1A1A1A',
  accent: '#FF4500',
  
  // Background colors
  background: '#0A0A0A',
  surface: '#121212',
  surfaceLight: '#1E1E1E',
  surfaceDark: '#080808',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',
  textInverse: '#000000',
  
  // Status colors
  success: '#00D4AA',
  warning: '#FFB800',
  error: '#FF4757',
  info: '#3742FA',
  
  // Gradients
  gradients: {
    primary: ['#FF6B00', '#FF4500'],
    secondary: ['#1A1A1A', '#2A2A2A'],
    surface: ['#121212', '#1E1E1E'],
    glass: ['rgba(255, 107, 0, 0.1)', 'rgba(26, 26, 26, 0.8)'],
    darkGlass: ['rgba(0, 0, 0, 0.3)', 'rgba(26, 26, 26, 0.9)'],
  },
  
  // Shadows and effects
  shadows: {
    light: 'rgba(255, 107, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.3)',
    dark: 'rgba(0, 0, 0, 0.5)',
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 50,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  captionBold: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  smallBold: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
};

export const shadows = {
  // 3D shadow effects
  small: {
    shadowColor: colors.shadows.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  medium: {
    shadowColor: colors.shadows.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6.27,
    elevation: 8,
  },
  large: {
    shadowColor: colors.shadows.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12.35,
    elevation: 12,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  inner: {
    shadowColor: colors.shadows.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
};

export const animations = {
  // Framer Motion variants
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  },
  slideDown: {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
  },
  scale: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
  },
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
};

export const layout = {
  // Screen dimensions and responsive breakpoints
  screenPadding: spacing.lg,
  cardPadding: spacing.md,
  sectionSpacing: spacing.xl,
  maxWidth: 400,
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  animations,
  layout,
};
