# 💧 JalSuraksha — Water Security & Drought Management System

### Predict Drought. Secure Water.

JalSuraksha is an AI-powered web platform designed to monitor water security, analyze regional water datasets, and predict drought conditions using intelligent data-driven insights. The platform enables users to upload datasets, visualize trends through interactive dashboards, and generate drought predictions based on environmental and regional parameters.

🌐 **Live Demo:** [https://jalsuraksha-1.onrender.com](https://jalsuraksha-1.onrender.com)

---

# 📌 About the Project

JalSuraksha (meaning *Water Protection* in Hindi) is built to support researchers, policymakers, environmental organizations, and local communities in addressing water scarcity and drought challenges. By combining AI-based prediction models with modern data visualization tools, the platform simplifies water resource monitoring and decision-making.

The system allows users to:

* Upload and manage regional water datasets
* Explore data through dynamic visualizations
* Predict drought risks using AI models
* Track historical predictions and trends
* Analyze combined datasets for deeper insights

---

# ✨ Features

### 📤 Dataset Upload

Supports multiple file formats including:

* CSV
* XLSX
* JSON
* XML
* TSV
* SQL
* TXT

### 📊 Interactive Dashboard

Visualize uploaded datasets with:

* Dynamic charts
* Graphs
* Regional insights
* Trend analysis

### 🤖 AI Drought Prediction

Generate drought predictions using regional environmental and water-related parameters powered by AI models.

### 🕓 Prediction History

Store and review previous predictions for comparison and monitoring over time.

### 🔗 Join Tables

Combine multiple datasets and analyze relationships between different water-related data sources.

### 🌗 Light / Dark Mode

Switch between light and dark themes with persistent user preferences.

### 🔐 Authentication

Secure sign-up and login functionality powered by Supabase Authentication.

---

# 🛠️ Tech Stack

| Technology      | Purpose                            |
| --------------- | ---------------------------------- |
| React 18        | Frontend UI                        |
| TypeScript      | Type safety                        |
| Vite            | Build tool                         |
| Tailwind CSS    | Styling                            |
| shadcn/ui       | UI Components                      |
| Supabase        | Backend, Authentication & Database |
| React Router v6 | Client-side routing                |
| TanStack Query  | Data fetching & caching            |
| Recharts        | Data visualization                 |
| Render          | Deployment                         |

---

# 🚀 Getting Started

## Prerequisites

* Node.js v18+
* npm or bun

---

## Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/jalsuraksha.git

# Navigate into the project directory
cd jalsuraksha

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Add your Supabase credentials inside .env

# Start the development server
npm run dev
```

The application will run at:

```bash
http://localhost:8080
```

---

# 🔑 Environment Variables

Create a `.env` file in the root directory and add:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
```

You can find these values in your **Supabase Dashboard → Settings → API**

---

# 📁 Project Structure

```bash
src/
├── components/              # Reusable UI components
├── pages/                   # Route pages
│   ├── Index.tsx            # Landing page
│   ├── Dashboard.tsx        # Data visualization dashboard
│   ├── Predict.tsx          # AI drought prediction
│   ├── PredictionHistory.tsx # Prediction history
│   ├── JoinTables.tsx       # Dataset joining & analysis
│   └── Auth.tsx             # Login / Signup
├── hooks/                   # Custom hooks
├── integrations/            # Supabase configuration
└── lib/                     # Utility functions
```

---

# 📦 Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
npm run test      # Run tests
```

---

# ☁️ Deployment

JalSuraksha is deployed on **Render** as a Static Site.

### Deployment Settings

```bash
Build Command: npm install && npm run build
Publish Directory: dist
```

🌐 **Live URL:** [https://jalsuraksha-1.onrender.com](https://jalsuraksha-1.onrender.com)

Make sure to configure environment variables in the Render Dashboard under **Environment Settings**.

---

# 🙋‍♀️ Author

**Sanchi Goyal**
Built with ❤️ using React, TypeScript, Supabase, and Lovable.

---

# 📄 License

This project is private and not open for redistribution without permission.
