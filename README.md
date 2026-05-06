💧 JalSuraksha — Water Security & Drought Management System

Predict Drought. Secure Water.
An AI-powered platform to upload datasets, visualize water data, and predict drought conditions based on regional parameters.

🌐 Live Demo: https://jalsuraksha-1.onrender.com

📌 About the Project
JalSuraksha (meaning Water Protection in Hindi) is a web-based platform built to help researchers, policymakers, and communities monitor and predict water security and drought conditions. Users can upload regional water datasets, explore interactive visualizations, and receive AI-powered drought predictions — all in one place.


✨ Features

📤 Dataset Upload — Supports CSV, XLSX, JSON, XML, TSV, SQL, and TXT formats
📊 Interactive Dashboard — Visualize water data with dynamic charts and graphs
🤖 AI Drought Prediction — Get predictions based on regional parameters
🕓 Prediction History — Track and review all past predictions
🔗 Join Tables — Combine and explore multiple datasets
🌗 Light / Dark Mode — Toggle between themes with persistent preference
🔐 Authentication — Secure user sign-up and login via Supabase


🛠️ Tech Stack
TechnologyPurposeReact 18Frontend UITypeScriptType safetyViteBuild toolTailwind CSSStylingshadcn/uiUI ComponentsSupabaseBackend, Auth & DatabaseReact Router v6Client-side routingTanStack QueryData fetching & cachingRechartsData visualizationRenderDeployment



🚀 Getting Started
Prerequisites

Node.js v18+
npm or bun


Installation
bash# Clone the repository
git clone https://github.com/YOUR_USERNAME/dataflow-wise.git
cd dataflow-wise


# Install dependencies
npm install


# Set up environment variables
cp .env.example .env
# Fill in your Supabase credentials in .env


# Start the development server
npm run dev
The app will be available at http://localhost:8080


🔑 Environment Variables
Create a .env file in the root directory with the following:
envVITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id

Get these values from your Supabase Dashboard under Settings → API


📁 Project Structure
src/
├── components/       # Reusable UI components (Navbar, ThemeToggle, etc.)
├── pages/            # Route-level pages
│   ├── Index.tsx         # Landing page
│   ├── Dashboard.tsx     # Data visualization dashboard
│   ├── Predict.tsx       # Drought prediction page
│   ├── PredictionHistory.tsx  # History of predictions
│   ├── JoinTables.tsx    # Dataset join explorer
│   └── Auth.tsx          # Login / Sign up
├── hooks/            # Custom React hooks (useAuth, useTheme)
├── integrations/     # Supabase client setup
└── lib/              # Utility functions


📦 Available Scripts
bashnpm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
npm run test       # Run tests



☁️ Deployment
This project is deployed on Render as a Static Site.


Build Command: npm install && npm run build
Publish Directory: dist
Live URL: https://jalsuraksha-1.onrender.com


Make sure to add your environment variables in the Render dashboard under Environment settings.


🙋‍♀️ Author
Sanchi Goyal
Built with ❤️ using Lovable

📄 License
This project is private and not open for redistribution without permission.
