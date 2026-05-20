# ULL Auditorium Seating

An interactive web application for assigning seating groups in the Auditorium of the Universidad de La Laguna (Paraninfo de la ULL). Built with TypeScript and Vite, this tool uses a custom SVG-based interactive map and is deployed automatically to GitHub Pages.

No external UI frameworks or libraries are used; the application relies entirely on vanilla TypeScript and DOM/SVG API interactions.

---

## Features

- **Interactive Seating Map**: A visual SVG representation of the auditorium (including _Patio de Butacas_ and _Anfiteatro_).
- **Seat Group Management (CRUD)**: Create, select, edit, and delete groups of seats with custom labels and dynamically generated/assigned colors.
- **Advanced Selection Modes**: Supports both individual seat clicking and drag-selection (by dragging pointer across multiple seats).
- **Export and Import**: Save and load complete seating arrangements via JSON files.
- **Fully Decoupled Architecture**: View and Controller layers are completely separated through a typed Event Bus system.
- **Production-Ready CI/CD**: Automated deployment to GitHub Pages via GitHub Actions.

---

## Getting Started

### Prerequisites

You need [Node.js](https://nodejs.org/) (v24 or later recommended) and `npm` installed.

### Installation

Clone the repository and install the dependencies:

```bash
git clone git@github-personal:SamuelFriHer/ull-auditorium-seating.git
cd ull-auditorium-seating
npm install
```

### Development

Run the local development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

### Running Tests

Unit and integration tests are written using [Vitest](https://vitest.dev/).

```bash
# Run tests once
npm test

# Run tests in watch mode
npx vitest
```

### Production Build

Build the optimized assets for production:

```bash
npm run build
```

The output will be generated inside the `dist` directory. You can preview the production build locally:

```bash
npm run preview
```

---

## Deployment

The project is configured with a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys the production bundle to GitHub Pages whenever changes are pushed to the `main` branch.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
