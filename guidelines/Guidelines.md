# KTC Energy Management System - Development Guidelines

## 🎯 Project Overview
This document outlines the development guidelines for the KTC Energy fuel station management system. These guidelines ensure consistency, maintainability, and adherence to the project's design principles.

## 🎨 Design System Guidelines

### Color System
- **Primary Brand Color**: `#030213` (Dark Navy) - Used for headers, primary actions, and branding
- **Accent Color**: `#FFD700` (Gold) - Used for highlights, energy elements, and call-to-action buttons
- **Background**: Clean whites and light grays for professional appearance
- **Text**: High contrast dark text for readability

### Typography
- **Base font-size**: 14px - Optimized for fuel station terminal displays
- **Font weights**: 
  - Normal (400) for body text
  - Medium (500) for labels and buttons
- **Line height**: 1.5 for optimal readability
- **Hierarchy**: Clear h1-h4 hierarchy with consistent sizing

### Spacing and Layout
- Use consistent spacing scale based on the design system
- Maintain proper visual hierarchy with adequate white space
- Ensure responsive design works on various screen sizes (desktop, tablet, mobile)

## 🔐 Authentication & Role-Based Access

### User Roles
1. **Station Manager**: Basic operational access
2. **Admin**: Advanced features + validation capabilities  
3. **Super Admin**: Full system access + approval workflows

### Route Protection
- Always check user authentication before rendering protected content
- Implement role-based component rendering
- Provide fallback UI for unauthorized access

### Data Access Rules
- Station Managers: Only their assigned station data
- Admins & Super Admins: Can select and view multiple stations
- Implement proper data filtering based on user permissions

## 💰 Currency and Localization

### Ghana Cedi Formatting
- Always display currency as "₵" + amount
- Use proper number formatting (e.g., ₵1,234.56)
- Implement consistent decimal places (2 for currency)

### Date Formatting
- Use consistent date formats throughout the application
- Consider local Ghana timezone for all date/time operations
- Format: "MMM DD, YYYY" for display (e.g., "Dec 15, 2024")

## 🏗️ Component Architecture

### Component Organization
- Keep components focused on single responsibility
- Use proper TypeScript typing for all props and state
- Implement consistent error boundaries and loading states

### File Naming Conventions
- Components: PascalCase (e.g., `DashboardCard.tsx`)
- Utilities: camelCase (e.g., `formatCurrency.ts`)
- Contexts: PascalCase with Context suffix (e.g., `AuthContext.tsx`)

### Import Standards
```typescript
// External libraries first
import { useState } from 'react';
import { Card } from './components/ui/card';

// Internal components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

// Contexts and types
import { useAuth } from './contexts/AuthContext';
import type { User } from './types/auth';
```

## 📊 Data Management

### Mock Data Standards
- Use realistic Ghanaian fuel station names and locations
- Implement proper data structures that match real-world scenarios
- Include appropriate fuel types (Petrol, Diesel, Gas) with Ghana market pricing

### State Management
- Use React Context for global state (auth, station selection)
- Keep component-level state minimal and focused
- Implement proper error handling for all data operations

## 🎯 UI/UX Guidelines

### Navigation
- Sidebar navigation should be role-aware
- Implement clear visual indicators for active navigation items
- Ensure navigation is accessible and keyboard-friendly

### Forms and Input
- Use consistent form validation patterns
- Provide clear error messages and success feedback
- Implement proper loading states for form submissions

### Tables and Data Display
- Use responsive table designs that work on mobile
- Implement proper sorting and filtering where appropriate
- Show loading skeletons during data fetching

### Buttons and Actions
- **Primary Button**: Main actions (Save, Submit, Approve)
- **Secondary Button**: Alternative actions (Cancel, Edit, View)
- **Destructive Button**: Delete or dangerous actions
- Always provide loading states for async actions

## 🔧 Technical Standards

### Performance
- Implement proper React optimization (useMemo, useCallback where needed)
- Lazy load heavy components and routes
- Optimize images and assets for web

### Accessibility
- Maintain proper semantic HTML structure
- Implement keyboard navigation support
- Use proper ARIA labels and descriptions
- Ensure color contrast meets WCAG guidelines

### Error Handling
- Implement comprehensive error boundaries
- Provide user-friendly error messages
- Log errors appropriately for debugging

## 📱 Responsive Design

### Breakpoints
- Mobile: 320px - 767px
- Tablet: 768px - 1023px  
- Desktop: 1024px+

### Layout Principles
- Mobile-first responsive design approach
- Ensure sidebar collapses appropriately on smaller screens
- Maintain usability across all device sizes
- Test on various screen resolutions

## 🚀 Deployment Guidelines

### Build Optimization
- Ensure all TypeScript errors are resolved
- Run linting checks before deployment
- Optimize bundle size and remove unused dependencies
- Test build locally before deployment

### Environment Configuration
- Use environment variables for configuration
- Implement proper error logging and monitoring
- Ensure proper HTTPS configuration for production

## 🧪 Testing Standards

### Component Testing
- Test role-based rendering and access control
- Verify currency formatting and calculations
- Test responsive behavior across breakpoints
- Validate form submissions and error handling

### User Experience Testing
- Test complete user workflows for each role
- Verify navigation and routing work correctly
- Test approval workflows end-to-end
- Validate data persistence and state management

---

**Remember**: These guidelines ensure the KTC Energy management system maintains high quality, consistency, and professionalism across all development efforts.