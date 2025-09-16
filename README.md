# KTC Energy - Fuel Station Management System

A comprehensive role-based fuel station management system built with React, TypeScript, and Tailwind CSS for KTC Energy Ghana.

## 🏗️ System Overview

This application provides a complete management solution for fuel stations with three distinct user roles:

### User Roles
- **Station Manager**: Access to station operations, supply management, daily sales entry, and reporting
- **Admin**: All station manager features plus product sharing and daily sales validation
- **Super Admin**: All admin features plus daily sales approval and product sharing approval

### Key Features
- 🔐 **Authentication System** - Role-based access control
- 📊 **Dashboard Analytics** - Real-time station performance metrics  
- ⛽ **Supply Management** - Track fuel inventory and deliveries
- 💰 **Daily Sales Entry** - Record and manage daily transactions
- ✅ **Approval Workflow** - Hierarchical validation system
- 📈 **Reporting** - Comprehensive business intelligence
- 🏪 **Multi-Station Support** - Manage multiple fuel stations
- 💵 **Ghana Cedi Integration** - Local currency formatting

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ktc-energy-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Demo Credentials

Use these credentials to test different user roles:

**Station Manager:**
- Username: `manager`
- Password: `password`

**Admin:**
- Username: `admin` 
- Password: `password`

**Super Admin:**
- Username: `superadmin`
- Password: `password`

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── figma/           # Figma integration components
│   ├── Dashboard.tsx    # Station manager dashboard
│   ├── AdminDashboard.tsx # Admin/super admin dashboard
│   ├── Header.tsx       # App header with branding
│   ├── Sidebar.tsx      # Navigation sidebar
│   └── ...              # Feature-specific components
├── contexts/            # React contexts
│   ├── AuthContext.tsx  # Authentication state
│   └── StationContext.tsx # Station selection state
├── types/               # TypeScript type definitions
├── styles/              # Global styles
└── App.tsx             # Main application component
```

## 🎨 Design System

The application uses a custom design system with:
- **Typography**: 14px base font size with consistent hierarchy
- **Colors**: Professional color palette with light/dark mode support
- **Spacing**: Consistent spacing scale using CSS custom properties
- **Components**: Reusable UI components based on shadcn/ui

## 📱 Responsive Design

The application is fully responsive and works across:
- Desktop (1024px+)
- Tablet (768px - 1023px)  
- Mobile (320px - 767px)

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🛠️ Built With

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling framework
- **Vite** - Build tool
- **Lucide React** - Icon library
- **Recharts** - Data visualization
- **ESLint** - Code linting

## 🏪 Station Management Features

### For Station Managers:
- View dashboard with key metrics
- Manage fuel supply and inventory
- Enter daily sales transactions
- Track utility and statutory expenses
- Generate operational reports

### For Admins:
- All station manager features
- Validate daily sales entries
- Manage product sharing between stations
- Access multi-station overview
- Monitor station performance

### For Super Admins:
- All admin features  
- Final approval for sales entries
- Approve product sharing requests
- System-wide analytics and reporting
- User management capabilities

## 💰 Currency & Localization

- Uses Ghana Cedi (₵) currency formatting
- Includes realistic Ghanaian fuel station data
- Prices formatted according to local standards
- Station names and locations based on Ghana

## 🔐 Security Features

- Role-based access control (RBAC)
- Protected routes based on user permissions
- Secure authentication flow
- Data validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software developed for KTC Energy Ghana.

## 📞 Support

For technical support or questions, please contact the development team.

---

**KTC Energy - Powering Ghana's Future** ⛽🇬🇭