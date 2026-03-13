# HamaraLabs 

A centralized digital workspace for managing Atal Tinkering Labs (ATLs) across multiple schools. It handles role-based access, task assignments, AI project generation, and inter-school competitions.

## Tech Stack
* **Frontend:** Vanilla JavaScript (ES6 Modules), HTML5, CSS3 
* **Backend:** Firebase (Auth, Firestore, Cloud Storage)
* **AI API:** Custom Vercel/Node endpoint for AI project generation

## Key Features
* **Role-Based Access (RBAC):** Distinct dashboards for Admins, School Incharges, Mentors, and Students.
* **AI Tinker Lab:** Mentors can generate custom, step-by-step engineering projects based on student interests.
* **Tournament Engine:** Create global competitions, deploy them to specific schools/students, and track participation.
* **Task Management:** Real-time task tracking, file uploads for evidence, and an inline "Ask Doubt" chat system.

## Folder Structure
```text
/HamaraLabs
├── /Main
│   ├── /jsCodes             # Core logic (dashboard, components, admin, AI)
│   ├── /css                 # Stylesheets
│   └── index.html           # Main app shell
├── /forms                   # HTML partials
└── index.html               # Login page
