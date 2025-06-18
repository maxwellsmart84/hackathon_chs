# Hackathon Innovation Engine MVP

A web-based platform designed to connect MedTech startups with internal resources, facilitating commercialization and collaboration opportunities.

## 🎯 Overview

The Hackathon Innovation Engine bridges the gap between innovative startups and world-class medical resources at the Medical University of South Carolina. Our platform enables meaningful collaborations that accelerate healthcare innovation through strategic connections.

## ✨ Key Features

### 🔐 Authentication & User Management

- **Clerk.js Integration**: Secure authentication with role-based access
- **Multi-User Types**: Support for startups stakeholders, and administrators
- **Profile System**: Detailed profiles for each user type with validation

### 🎯 Smart Matching System

- **AI-Driven Recommendations**: Algorithm matches startups with relevant experts
- **Profile Compatibility**: Matching based on goals, needs, and expertise alignment
- **Match Scoring**: Quantified compatibility scores for each connection

### 🔍 Bidirectional Search & Filtering

- **Advanced Filtering**: Filter by specialty, department, stage, funding status
- **Real-time Search**: Dynamic search across all user profiles
- **Categorized Browsing**: Organized by focus areas and expertise domains

### 📊 Admin Dashboard & Analytics

- **Engagement Metrics**: Track user activity and connection success rates
- **Platform Insights**: Monitor startup needs and resource saturation
- **Performance Analytics**: Visual dashboards for leadership decision-making

## 🛠 Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Authentication**: Clerk.js for secure user management
- **Database**: PlanetScale (MySQL-compatible) with Drizzle ORM
- **Validation**: Zod for comprehensive schema validation
- **Deployment**: Vercel (recommended)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PlanetScale account (or MySQL database)
- Clerk.js account

### 1. Clone & Install

```bash
git clone <repository-url>
cd hackathon-innovation-engine
npm install
```

### 2. Environment Setup

Create a `.env.local` file with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Database
DATABASE_URL=mysql://username:password@host/database?ssl={"rejectUnauthorized":true}

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Generate and run migrations
npx drizzle-kit generate:mysql
npx drizzle-kit push:mysql
```

### 4. Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 User Flows

### Startup Journey

1. **Registration**: Sign up and select "Startup" user type
2. **Onboarding**: Complete company profile with goals and needs
3. **Discovery**: Browse recommended medical experts and resources
4. **Connection**: Send connection requests with personalized messages
5. **Collaboration**: Track progress and manage ongoing relationships

### User Stakeholder Journey

1. **Registration**: Join with user credentials as "Stakeholder"
2. **Profile Setup**: Define expertise areas and available resources
3. **Matching**: Review startup requests and recommendations
4. **Engagement**: Accept connections and provide guidance
5. **Impact Tracking**: Monitor collaboration outcomes

### Admin Experience

1. **Dashboard**: Real-time platform analytics and metrics
2. **User Management**: Oversee user registrations and profiles
3. **Insights**: Track connection success rates and popular focus areas
4. **Optimization**: Identify platform improvements and resource gaps

## 🏗 Architecture

### Database Schema

#### Core Tables

- **users**: Base user information and Clerk integration
- **startups**: Startup-specific profile data and goals
- **stakeholders**: User internal user profiles and expertise
- **connections**: Connection requests and relationship tracking
- **analytics**: Platform metrics and usage insights
- **resource_tags**: Categorization system for expertise/resources

#### Key Relationships

- Users → Startups/Stakeholders (1:1)
- Startups ↔ Stakeholders (Many:Many via Connections)
- All tables include audit trails and timestamps

### API Structure

```
/api/
├── auth/           # Clerk webhooks and authentication
├── users/          # User profile management
├── startups/       # Startup-specific endpoints
├── stakeholders/   # User stakeholder endpoints
├── connections/    # Connection request handling
├── search/         # Search and filtering
├── analytics/      # Admin dashboard data
└── matching/       # AI matching algorithm
```

### Component Architecture

```
src/
├── app/                    # Next.js app router
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Main user dashboard
│   ├── onboarding/        # User setup flows
│   └── admin/             # Admin interface
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── forms/             # Reusable form components
│   └── dashboard/         # Dashboard-specific components
├── lib/
│   ├── db/                # Database schema and connection
│   ├── validations/       # Zod schemas
│   ├── utils/             # Utility functions
│   └── matching/          # AI matching logic
└── types/                 # TypeScript type definitions
```

## 🔧 Configuration

### Validation Schemas

The platform uses comprehensive Zod schemas for:

- User registration and profile validation
- Form submissions and data integrity
- API request/response validation
- Search and filter parameters

### Matching Algorithm

The AI-driven matching system considers:

- **Expertise Alignment**: Stakeholder skills vs. startup needs
- **Focus Area Compatibility**: Medical specialties and startup domains
- **Resource Availability**: Lab access, funding, regulatory support
- **Geographic Proximity**: Location-based matching preferences
- **Collaboration History**: Past successful connections

## 📊 Analytics & Metrics

### Startup Metrics

- Profile completion rates
- Connection request success rates
- Time to first meaningful connection
- Goal achievement tracking

### Stakeholder Metrics

- Response rates to connection requests
- Collaboration frequency
- Expertise utilization
- Mentorship impact

### Platform Metrics

- User growth and retention
- Connection success rates
- Popular focus areas and expertise
- Resource saturation analysis

## 🛡 Security & Privacy

- **Authentication**: Clerk.js handles secure user authentication
- **Data Protection**: All sensitive data encrypted at rest and in transit
- **Privacy Controls**: Users control profile visibility and connection preferences

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on each push to main branch

### Manual Deployment

```bash
npm run build
npm start
```

## 🔮 Future Enhancements

### Phase 2 Features

- **Advanced AI Matching**: Machine learning-based recommendation improvements
- **Video Integration**: Virtual meeting scheduling and hosting
- **Document Sharing**: Secure file sharing and collaboration tools
- **Event Management**: Innovation events and networking opportunities

### Phase 3 Features

- **Mobile App**: Native iOS and Android applications
- **Integration Hub**: Connect with external tools (CRM, calendars, etc.)
- **Outcome Tracking**: Detailed collaboration outcome measurement
- **Global Expansion**: Multi-institution platform scaling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For questions, issues, or feature requests:

- **Email**: max@maxwellk.dev
- **Documentation**: [Internal Wiki](wiki-link)
- **Issue Tracker**: GitHub Issues

---

**Built with ❤️ for Charleston Hacks Innovation Engine**

## Database Development (Code-First Approach)

### Making Schema Changes

**ALWAYS follow this order:**

1. **Edit the schema** in `src/lib/db/schema.ts`
2. **Generate migration**: `npm run db:generate`
3. **Apply changes**: `npm run db:migrate` (production) or `npm run db:push` (development)

### Development Commands

```bash
npm run db:generate    # Generate migration from schema changes
npm run db:migrate     # Apply migrations to database
npm run db:push        # Apply schema directly (development only)
npm run db:studio      # Open database GUI
npm run db:check       # Validate migrations
```

### ⚠️ Important Rules

- **NEVER** manually edit the database structure
- **NEVER** write SQL migrations by hand
- **ALWAYS** start with schema changes in code
- **COMMIT** both schema changes and generated migrations together
