# 🏍️ Harley Davidson Inspired Mobile App

A stunning inventory management mobile application featuring Harley Davidson orange and dark gray/black color scheme with advanced 3D effects, smooth animations, and modern UI/UX design.

## ✨ Features

### 🎨 Stunning Visual Design
- **Harley Davidson Orange** (#FF6B00) primary color scheme
- **Dark Gray/Black** background for premium look
- **3D Shadow Effects** with dynamic depth
- **Glass Morphism** cards with blur effects
- **Gradient Backgrounds** with smooth transitions
- **Glow Effects** for interactive elements

### 🎭 Advanced Animations
- **Framer Motion** inspired animations
- **Staggered Entrance** effects
- **Smooth Transitions** between screens
- **Interactive Feedback** on touch
- **Loading States** with animated indicators
- **Progress Animations** for data visualization

### 📱 Modern Components

#### 🃏 GlassCard
A versatile card component with glass morphism effects:
```javascript
import { GlassCard } from '../components';

<GlassCard
  onPress={() => console.log('Card pressed')}
  animated={true}
  glow={true}
  shadowLevel="medium"
>
  <Text>Your content here</Text>
</GlassCard>
```

#### 📊 GradientStatCard
Beautiful stat cards with gradient backgrounds and trend indicators:
```javascript
import { GradientStatCard } from '../components';

<GradientStatCard
  title="Total Sales"
  value="12,847"
  icon="trending-up"
  color={colors.success}
  subtitle="This month"
  trend={12.5}
  glow={true}
  size="medium"
/>
```

#### 🔄 RingWidget
Circular progress indicators with animated gradients:
```javascript
import { RingWidget } from '../components';

<RingWidget
  value={75}
  total={100}
  title="Sales Goal"
  subtitle="Monthly target"
  color={colors.primary}
  glow={true}
  size={140}
/>
```

#### 🔘 ActionButton
Interactive buttons with multiple variants and animations:
```javascript
import { ActionButton } from '../components';

<ActionButton
  title="Add Product"
  icon="add-circle"
  onPress={() => navigation.navigate('ProductCreate')}
  variant="primary"
  size="medium"
  glow={true}
  fullWidth={false}
/>
```

#### 📦 ProductCard
Stunning product display cards with stock status and actions:
```javascript
import { ProductCard } from '../components';

<ProductCard
  product={productData}
  onPress={() => navigation.navigate('ProductDetails', { product })}
  onEdit={(product) => handleEdit(product)}
  onDelete={(product) => handleDelete(product)}
  glow={true}
  showActions={true}
/>
```

## 🎨 Theme System

### Colors
```javascript
import { colors } from '../utils/theme';

// Primary Harley Davidson Orange
colors.primary = '#FF6B00'
colors.primaryLight = '#FF8533'
colors.primaryDark = '#E55A00'

// Background colors
colors.background = '#0A0A0A'
colors.surface = '#121212'
colors.surfaceLight = '#1E1E1E'

// Text colors
colors.text = '#FFFFFF'
colors.textSecondary = '#B0B0B0'
colors.textTertiary = '#808080'
```

### Shadows
```javascript
import { shadows } from '../utils/theme';

// 3D shadow effects
shadows.small   // Subtle elevation
shadows.medium  // Standard depth
shadows.large   // Prominent depth
shadows.glow    // Glowing effect
shadows.inner   // Inset shadow
```

### Typography
```javascript
import { typography } from '../utils/theme';

typography.h1        // Large headings
typography.h2        // Medium headings
typography.h3        // Small headings
typography.body      // Body text
typography.caption   // Caption text
typography.small     // Small text
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- Expo CLI
- React Native development environment

### Installation
```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Dependencies
```json
{
  "expo-blur": "^14.1.5",
  "expo-linear-gradient": "^14.1.5",
  "react-native-reanimated": "^4.0.2",
  "react-native-svg": "^15.12.1",
  "react-native-worklets": "^0.3.0"
}
```

## 🎯 Usage Examples

### Dashboard Screen
The dashboard showcases all components working together:
- **Stats Section**: Business overview with animated cards
- **Progress Section**: Performance metrics with ring widgets
- **Quick Actions**: Interactive buttons with glow effects
- **Recent Activity**: Glass cards with activity feed

### Custom Styling
```javascript
import { colors, spacing, typography, shadows } from '../utils/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  card: {
    ...shadows.medium,
    borderRadius: borderRadius.xl,
  },
});
```

## 🎨 Design Principles

### 1. **Depth & Dimension**
- Use shadows to create visual hierarchy
- Implement 3D effects for interactive elements
- Layer components with proper z-index

### 2. **Smooth Animations**
- All interactions have smooth transitions
- Entrance animations create engaging experiences
- Loading states provide visual feedback

### 3. **Consistent Theming**
- Harley Davidson orange as primary accent
- Dark backgrounds for premium feel
- Consistent spacing and typography

### 4. **Accessibility**
- High contrast ratios for readability
- Touch targets meet minimum size requirements
- Screen reader friendly component structure

## 🔧 Customization

### Adding New Components
1. Create component in `src/components/`
2. Import theme utilities
3. Add to `src/components/index.js`
4. Use consistent styling patterns

### Modifying Colors
Edit `src/utils/theme.js` to customize:
- Primary colors
- Background colors
- Text colors
- Status colors
- Gradients

### Animation Configuration
```javascript
import { animations } from '../utils/theme';

// Use predefined animation variants
const fadeIn = animations.fadeIn;
const slideUp = animations.slideUp;
const scale = animations.scale;
```

## 📱 Screenshots

The app features:
- **Stunning Dashboard** with animated stats and progress rings
- **Product Management** with beautiful cards and 3D effects
- **Sales Tracking** with interactive charts and metrics
- **User Management** with modern list designs
- **Reports** with data visualization components

## 🎉 Performance

- **Optimized Animations** using native drivers
- **Efficient Rendering** with proper component structure
- **Smooth Scrolling** with optimized list components
- **Fast Loading** with lazy loading and caching

## 🤝 Contributing

1. Follow the established design patterns
2. Use the theme system for consistency
3. Add animations to new interactive elements
4. Test on both iOS and Android
5. Maintain accessibility standards

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ and Harley Davidson spirit** 🏍️
