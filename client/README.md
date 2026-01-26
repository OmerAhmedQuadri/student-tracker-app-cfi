# Student Tracker Client Application

This is the frontend client for the Student Tracker application, built with [Vite](https://vitejs.dev/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), and [Tailwind CSS](https://tailwindcss.com/).

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (version 18 or higher recommended) and **npm** installed on your machine.

### Installation

1.  Navigate to the `client` directory:
    ```bash
    cd client
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    pnpm install
    ```

### Running Development Server

To start the local development server:

```bash
npm run dev
```

The application will usually be available at `http://localhost:5173`.

### Building for Production

To build the application for production deployment:

```bash
npm run build
```

The output will be generated in the `dist` folder.

### Linting

To run the linter and fix basic issues:

```bash
npm run lint
```

---

## 📂 Project Structure

The source code is located in the `src` directory. Here is an overview of the folder structure:

```
src/
├── api/             # API client functions and axios configuration
├── assets/          # Static assets (images, fonts, etc.)
├── components/      # Reusable UI components
│   ├── auth/        # Authentication related components
│   ├── dashboard/   # Dashboard widgets and charts
│   ├── layout/      # Layout components (Sidebar, Topbar)
│   ├── pages/       # Full page components (Admin, Mentor, Student views)
│   └── ui/          # Generic UI elements (Buttons, Inputs, Cards, etc.)
├── context/         # React Contexts (e.g., AuthContext)
├── hooks/           # Custom React hooks
├── layouts/         # Main layout wrappers
├── lib/             # Utility libraries and helper functions
├── App.tsx          # Main application component
├── index.css        # Global styles and Tailwind imports
├── main.tsx         # Application entry point
└── routes.tsx       # Application routing configuration
```

## 🛠️ Key Technologies

*   **Vite**: Next Generation Frontend Tooling
*   **React**: Library for building user interfaces
*   **TypeScript**: Typed superset of JavaScript
*   **Tailwind CSS**: Utility-first CSS framework
*   **Lucide React**: Icon set
*   **React Router DOM**: Routing library
*   **Axios**: Promise-based HTTP client
*   **React Hot Toast**: Toast notifications
*   **Recharts**: Charting library (if used in dashboard)

## 🎨 Styling

The application uses **Tailwind CSS** for styling.
Global styles are defined in `src/index.css`.
The font family **Inter** is applied globally, with **Poppins** available for headings.

## 🔗 Environment Variables

Create a `.env` file in the root of the `client` directory if custom environment configuration is needed.
Typical variables:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```
