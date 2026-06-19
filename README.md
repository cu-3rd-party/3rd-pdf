# pdf.cu3rd.ru (CU 3rd Party PDF Editor)

A client-side web application designed to parse, modify, and reverse-engineer official educational PDFs from Central University (CU). This tool allows users to safely convert official academic materials into a beautifully integrated Dark Mode layout natively, modifying the raw PDF drawing instructions directly in the browser.

## Features

- **Zero-Backend Processing**: All PDF parsing, decompression (`pako`), and color mapping logic (`pdf-lib`) executes securely on the client side. No documents are uploaded to any server.
- **Deep Stream Modification**: The system recursively traverses and replaces colors across all CMYK, RGB, and Grayscale color spaces inside both regular `/Contents` streams and complex LaTeX `/Form XObjects`.
- **Live Palette Editor**: Upload any PDF to interactively remap color palettes. Live preview is provided by a localized `pdf.js` worker. Custom JSON palettes can be imported or exported for sharing.
- **CU Dark Theme Aesthetics**: The interface aligns with the official minimalistic CU 3rd-party design guidelines (`#212121` backgrounds, `#f2f2f4` accents, and the simplified geometric CU icon).

## Tech Stack

- **Framework**: React 18, Vite
- **PDF Parsing & Editing**: `pdf-lib` (binary manipulation), `pako` (Zlib streams)
- **PDF Rendering**: `pdf.js` (for interactive previews)
- **Styling**: Vanilla CSS, configured to match the `cu-roadmap` dark theme variables.

## Getting Started

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:8790`.

### Docker Deployment

This repository includes a multi-stage `Dockerfile` and a `docker-compose.yml` for quick, production-ready deployment via an Nginx alpine container.

1. Build and run the container in detached mode:
   ```bash
   docker-compose up -d --build
   ```
2. The application will be immediately available on your host at port `8790`.

## Architecture Details

The core processing logic is located in `src/lib/pdfDarkTheme.js`. It performs raw bytes manipulation inside PDF content streams. It is deliberately written without heavy framework dependencies to ensure it can be easily ported into a Chrome Extension (e.g., via a `content_script` or `background` worker) in future updates.
