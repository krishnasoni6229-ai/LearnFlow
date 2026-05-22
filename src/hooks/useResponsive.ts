import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Screen device breakpoints
  const isSmallScreen = screenHeight < 720; // Height-based check for vertically-constrained screens (e.g. auth layout)
  const isSmallWidth = screenWidth < 375;   // Width-based check for small devices (e.g. iPhone SE / mini layouts)
  const isTablet = screenWidth >= 768;      // Standard tablet threshold

  // Layout spacing class names for NativeWind
  const containerPadding = screenWidth > 480 ? 'px-16' : 'px-6';

  // Shared assets sizing
  const logoSize = isSmallScreen ? 72 : 90;
  const logoBorderRadius = isSmallScreen ? 20 : 24;
  const logoIconSize = isSmallScreen ? 28 : 36;

  return {
    screenWidth,
    screenHeight,
    isSmallScreen,
    isSmallWidth,
    isTablet,
    containerPadding,
    logoSize,
    logoBorderRadius,
    logoIconSize,
  };
}
