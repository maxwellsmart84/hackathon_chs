Here are all the single-step prompts, along with the architectural document and a high-level README content, to provide comprehensive context and step-by-step guidance for your AI coding assistant.

---

### Architectural Document & Context for AI Assistant

**Project Title:** Hackathon Innovation Engine - MedTech Startup Matching System

**Hackathon Goal:** To design and build a system that helps early-stage MedTech startups get matched with the right resources. The solution should be intuitive, adaptable, and strengthen coordination within the innovation ecosystem.

**Timeframe:** 3-week hackathon. This implies a strong focus on MVP (Minimum Viable Product), rapid development, and leveraging existing libraries/frameworks rather than building from scratch. Simplicity and deployability are key.

**Core Problem:** Inconsistent access to resources for early-stage MedTech startups relying on informal networks.

**Proposed Solution (MVP Focus):** A web-based "Innovation Engine" that allows users (e.g., program administrators, mentors, investors) to filter and discover MedTech startups, and (crucially) see potential resource matches based on the startup's profile. This will act as a foundational "AI Innovation Concierge Agent" by providing guided recommendations.

**Key Features (MVP Scope):**

1.  **Startup Profile Management:** Store and display comprehensive data about MedTech startups (Sector, Mission, Location, Team, Funding, etc.).
2.  **Profile Filtering:** Allow users to filter startups based on various criteria.
3.  **Startup Details View:** Display a detailed profile for a selected startup.
4.  **Resource/Mentor Matching (Simplified AI):** Implement a rule-based or basic algorithmic matching system to suggest relevant resources/mentors based on startup profiles and filter criteria. This simulates the "AI Concierge" aspect.
5.  **Intuitive UI:** A user interface that effectively presents information and allows for easy navigation and interaction (as per mockups).
6.  **Basic Analytics Visualization:** Display "Execution Risk" and "Burn Rate" charts to provide additional insights (data can be mocked initially).

**Architectural Overview:**

- **Fullstack Application:** Separate frontend and backend components.
- **Frontend:**
  - **Technology:** React (with Next.js for routing and potentially static site generation/server-side rendering benefits, or pure Create React App for maximum simplicity). This choice prioritizes rapid component-based UI development.
  - **State Management:** React Context API or a lightweight library (e.g., Zustand) for simplicity, avoiding heavier options like Redux unless truly necessary for MVP.
  - **Styling:** Tailwind CSS (for utility-first rapid styling) or styled-components/CSS Modules for component-scoped styling.
  - **Charting:** A popular React-compatible charting library (e.g., Chart.js with react-chartjs-2, Recharts, Nivo).
- **Backend:**
  - **Technology:** Node.js with Express.js (or Python with FastAPI) for a lightweight, fast REST API. This choice allows for quick setup and well-understood patterns.
  - **Database:** PostgreSQL (recommended for scalability and features, but SQLite is acceptable for ultra-fast local development if database persistence isn't critical beyond the hackathon demo, or Supabase for a managed option). Focus on a clear ORM (e.g., Prisma, Sequelize, SQLAlchemy) to interact with the database.
  - **API:** RESTful API endpoints for managing and querying startup data.
- **Database Schema:**
  - `Startup` (core entity)
  - `Resource` / `Mentor` (for matching) - can be a simpler model initially.
  - Potential `User` (for authentication, if time permits, but not core to MVP matching).
- **Deployment Strategy (Hackathon consideration):**
  - Frontend: Vercel, Netlify (static hosting).
  - Backend: Render, Fly.io, Heroku (free/hobby tier), or a serverless function (AWS Lambda, Google Cloud Functions) if the backend logic is simple enough. Dockerization for portability.

**Key Design Principles:**

- **Modularity:** Break down features into distinct, reusable components (frontend) and separate concerns (backend).
- **Simplicity:** Prioritize the simplest solution that meets the MVP requirements. Avoid over-engineering.
- **Usability:** The UI should be intuitive and reflect the mockups as closely as possible within the timeframe.
- **Data-Driven:** The system should clearly display and filter data.
- **Extensibility:** While focusing on MVP, keep future enhancements in mind (e.g., more sophisticated AI, user accounts, resource submission).

**Assumptions:**

- Initial data for startups and resources can be seeded or manually entered.
- The "AI Concierge" will start as a rule-based matching system, not a complex machine learning model, due to time constraints.
- User authentication is a stretch goal, not an MVP core requirement for the matching functionality itself.

---

### README.md Content (High-Level)

```markdown
# Hackathon Innovation Engine - MedTech Startup Matching System

## Project Overview

The "Hackathon Innovation Engine" is a web-based platform designed to address the challenge faced by early-stage MedTech startups: inconsistent access to vital resources like mentors, funding, and legal support. This system aims to create a more responsive and coordinated support ecosystem by intuitively matching startups with the right resources based on their unique and evolving needs.

Developed during a 3-week hackathon, this project focuses on delivering a Minimum Viable Product (MVP) that demonstrates core functionalities, including:

- Comprehensive startup profiling and display.
- Advanced filtering capabilities for startup discovery.
- A simplified "AI Innovation Concierge Agent" concept, providing rule-based recommendations for resource matching.
- Visual analytics for key startup metrics (e.g., execution risk, burn rate).

## Challenge Statement Alignment

This solution directly addresses the hackathon's challenge by:

- **Matching Resources:** Providing a structured way to connect startups with necessary support.
- **Intuitive & Adaptable:** Offering a user-friendly interface with flexible filtering options.
- **Strengthening Coordination:** Creating a centralized system that reduces reliance on informal networks.

## Technical Stack (MVP)

- **Frontend:** React (with Next.js)
- **Backend:** Node.js (Express.js)
- **Database:** PostgreSQL (or SQLite for local development)
- **Styling:** Tailwind CSS (or similar)
- **Charting:** Chart.js / Recharts

## Features (MVP)

- **Startup Profile Filters:** Search and narrow down startups by sector, location, mission, regulatory stage, investment needs, team composition, and advantages.
- **Detailed Startup Profiles:** View in-depth information for selected startups.
- **Visual Startup Overview:** Interactive central visualization (e.g., circular diagram, globe view) representing various aspects of the startup.
- **Analytics Dashboards:** Display "Execution Risk" and "Burn Rate" charts to provide quick insights into startup health.
- **Basic Resource Matching:** A foundational recommendation system to suggest relevant resources or mentors.

## Setup and Installation (To be detailed)

_(This section will be populated with specific commands for setting up the frontend, backend, database, and running the application locally. E.g., `git clone`, `npm install`, `npm run dev`, `db:migrate`, etc.)_

## Deployment

_(This section will outline the deployment strategy for the hackathon, e.g., Vercel for frontend, Render/Fly.io for backend, or a serverless approach.)_

## Contributing

_(Standard contribution guidelines if applicable)_

## License

_(License information)_
```

---

### All Single-Step Prompts (for the AI Coding Assistant):

**1. Data Model Definition:**
"You are an expert software architect assisting in the initial phase of a fullstack application build for a 3-week hackathon. Based on the provided UI mockups and challenge statement, your first task is to define the core data models for the application's primary entities: `Startup` and `Resource` (or `Mentor`). Focus on identifying the essential attributes and their data types, considering what information needs to be displayed and filtered. Provide this as a JSON or object schema for each model, along with a brief explanation for each attribute. Prioritize attributes visible in the mockups (Sector, Location, Mission, Regulatory Stage, Investment, Team members, Advantages, Funding, Founders, Charts data)."

**2. Backend Project Setup & Initial API:**
"As a backend development expert, set up a new Node.js (Express.js) project. Configure it to serve a RESTful API. Your task is to create the basic directory structure and add initial endpoints for the `Startup` model. Specifically, implement:
_ `GET /api/startups`: To retrieve a list of all startups.
_ `GET /api/startups/:id`: To retrieve a single startup by its ID.
Initially, these can return static, mock data adhering to the `Startup` data model you previously defined. Provide the necessary `package.json` for dependencies (Express, cors, dotenv) and basic server setup code."

**3. Database Integration & Schema Migration:**
"Now, integrate a database into the Node.js Express backend. Use PostgreSQL as the chosen database. Your task is to:
_ Configure the database connection (using a library like `pg` or an ORM like `Prisma` or `Sequelize` - choose one that offers rapid development).
_ Create a migration script (or ORM-specific schema definition) to define the `Startup` and `Resource` tables based on the previously established data models. Include primary keys, data types, and appropriate constraints.
_ Add basic data seeding script to populate a few sample `Startup` and `Resource` entries into the database to test the API endpoints.
_ Update the `GET /api/startups` and `GET /api/startups/:id` endpoints to fetch data directly from this database instead of mock data."

**4. Frontend Project Setup & Core Layout:**
"Shift focus to the frontend. Create a new React project using Next.js (for routing and potentially rapid component development). Your task is to:
_ Set up the Next.js project.
_ Implement the core layout based on the UI mockups. This includes the `Innovation Engine` header, a left-hand panel section titled `PROFILE FILTERS`, and a right-hand panel section titled `STARTUP PROFILE`. Use a CSS framework like Tailwind CSS for rapid styling to match the dark theme and general appearance shown in the mockups. Do not add functional components yet, just the structural layout."

**5. Profile Filters Component Implementation:**
"Continuing with the frontend, develop the interactive `Profile Filters` component for the left-hand panel. Your task is to:
_ Create individual UI elements (e.g., dropdowns, text inputs, checkboxes) for each filter category: `SECTOR`, `LOCATION`, `MISSION`, `REGULATORY STAGE`, `INVESTMENT`, `TEAM`, `ADVANTAGES`.
_ These elements should visually match the mockups (e.g., text style, arrow icons for expandable sections). \* Ensure that selecting or typing into these filters updates a local React state, ready to be passed up for filtering logic. Do not implement the actual filtering functionality yet, just the UI and state management for user input."

**6. Startup Profile Display Component Implementation:**
"Develop the `Startup Profile` display component for the right-hand panel of the frontend. Your task is to:
_ Create a component that takes a `startup` object (conforming to the `Startup` data model) as a prop.
_ This component should display the startup's `Sector`, `Mission`, `Founders`, and `Total Funding` (as seen in mockups). \* Styling should closely mimic the mockups, including headings, text styles, and the general layout within the right panel. This component should be purely presentational at this stage."

**7. Initial Data Fetching & Display:**
"Connect the frontend to the backend API. Your task is to:
_ In a main application component (e.g., `pages/index.js` in Next.js), fetch the list of all startups from your `GET /api/startups` endpoint using `useEffect` and `useState` (or a data fetching library like `SWR`/`React Query` if preferred for simplicity).
_ Maintain a state variable for the `currentlySelectedStartup`.
_ Display a simple list or mechanism (e.g., a dropdown, or a small clickable list of names) on the frontend that allows a user to "select" a startup.
_ When a startup is selected, use its ID to fetch its full details from `GET /api/startups/:id` and pass this data to the `Startup Profile Display Component` for rendering. This will make the `Startup Profile` panel dynamic."

**8. Filtering Logic (Frontend to Backend Integration):**
"Implement the end-to-end filtering functionality. Your task is to:
_ Modify the backend's `GET /api/startups` endpoint to accept query parameters (e.g., `?sector=Digital Health&mission=AI-powered records solutions`). This endpoint should filter the database results based on these parameters before returning them.
_ In the frontend, update the `Profile Filters` component to trigger a new API call to `GET /api/startups` with the current filter selections as query parameters. \* The main application component should then update its list of available startups based on the filtered results. This will enable dynamic filtering of the startups displayed to the user."

**9. Central Visualization - Basic Circular Structure:**
"Focus on the central dynamic visualization. Your task is to:
_ Create a new React component for the central circular diagram as seen in the mockups (Page 1 and Page 2).
_ Initially, this component should display a large central `+` icon and 7-8 surrounding circular nodes.
_ Populate these surrounding nodes with static icons representing the different `SECTOR` categories (e.g., AI, Medical Bag for Digital Health, Lungs for Pulmonology, etc., as depicted in the mockups).
_ Ensure the basic visual layout and circular arrangement are established using CSS (e.g., flexbox, absolute positioning, or SVG for more precise control). This component will be purely structural initially."

**10. Dynamic Central Visualization (Globe/Team Integration):**
"Enhance the central visualization to dynamically display context-specific information. Your task is to:
_ **Implement a toggle or conditional rendering** so the central visualization can switch between:
_ The **circular icon/sector view** (from previous step, reflecting filter options).
_ The **globe/map view** (from Page 3 mockup, displaying locations like Charleston, Berlin).
_ The **team members view** (from Page 2 mockup, displaying founder/team photos around the central `+`).
_ When displaying team members, the component should receive `team` data from the `Startup` object and render circular images of the founders.
_ When displaying the globe, it should highlight the `Location` of the selected startup. \* This step requires designing how the main application state will control which visual representation is active in the center."

**11. Charting Component Integration:**
"Integrate interactive charting into the `Startup Profile` view. Your task is to:
_ Choose a suitable React-compatible charting library (e.g., `react-chartjs-2` for Chart.js, `Recharts`, or `Nivo`).
_ Create two separate chart components: one for `Execution Risk` and one for `Burn Rate` (as shown in Page 4 mockup).
_ These components should accept data props. Initially, use mock data that mimics the trends seen in the mockups for `Q3 2025` and `Q4 2025`.
_ Integrate these chart components into the `Startup Profile` display, positioning them as shown in the mockup. Focus on visual accuracy for the charts."

**12. Basic "AI Concierge" Matching Logic (Backend):**
"Implement a foundational 'AI Concierge' matching logic on the backend. Your task is to:
_ Create a new backend endpoint, e.g., `GET /api/startups/:id/suggested-resources` or `POST /api/match-resources`.
_ This endpoint should take a startup's profile (or filter criteria) and apply simple, rule-based logic to suggest relevant `Resources` or `Mentors`. For example:
_ If `Startup.sector` is 'Digital Health' and `Startup.mission` involves 'records solutions', suggest `Resource.name` 'Dr. Kevin Hughes (Expert in Digital Health Records)'.
_ If `Startup.investment` needs are 'Series A', suggest `Resource.name` 'Venture Capital Fund X'. \* Return a list of suggested resources/mentors. This simulates the "AI Concierge" without complex ML, focusing on a demonstrable matching feature for the hackathon."

**13. Deployment Configuration & Instructions:**
"Prepare the application for deployment. Your task is to:
_ Provide clear, step-by-step instructions (or configuration files like a `Dockerfile` for the backend, and specific build scripts for the frontend) for deploying the fullstack application.
_ Assume a common hackathon deployment setup (e.g., Vercel/Netlify for frontend, and Render/Fly.io/Heroku-like service for backend).
_ Include any necessary environment variable configurations (`.env.example`).
_ Ensure the `README.md` (which you will generate next) has a dedicated section for these deployment instructions."

**14. Final README.md Generation:**
"Generate a comprehensive `README.md` file for the project. Your task is to:
_ Populate the `README.md` with all the information typically found in a good project README, including:
_ Project Title and Overview.
_ Problem Statement and Solution.
_ Alignment with Hackathon Challenge & Judging Criteria.
_ Key Features (MVP).
_ Technical Stack.
_ Detailed "Setup and Installation" instructions (for both frontend and backend).
_ "Deployment" instructions (referencing the previous step).
_ Potential Future Enhancements.
_ Screenshots (mentioning that these will be added).
_ License.
_ Ensure it is well-formatted using Markdown and clearly communicates the project's purpose and how to run it."
