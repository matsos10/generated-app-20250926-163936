# NexusDesk: AI-Powered Customer Support SaaS
NexusDesk is a minimalist, visually stunning SaaS platform designed to revolutionize customer support using Artificial Intelligence. It addresses key industry pain points like slow response times and inconsistent quality by providing a suite of intelligent tools. The entire application is built on a serverless Cloudflare architecture, ensuring scalability, speed, and security, with a meticulously crafted user interface that prioritizes clarity, ease of use, and aesthetic excellence.
## ✨ Key Features
| Feature                       | Description                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| **AI-Powered Chatbots**       | Provide instant, 24/7 support for FAQs and initial ticket management.                                   |
| **Intelligent Ticket Analysis** | Automatically prioritize tickets and suggest resolutions to human agents.                               |
| **Predictive Analytics**      | Identify at-risk customers by analyzing communication sentiment and interaction history.                |
| **Automated Reporting**       | Generate easy-to-understand customer satisfaction reports with actionable insights.                     |
| **Subscription Management**   | Mock Stripe integration for handling trial periods and subscription plans.                              |
| **Internationalization**      | Landing page available in English, French, Spanish, and Portuguese.                                     |
| **Visually Stunning UI**      | A modern, minimalist interface with light/dark modes, built for an exceptional user experience.         |
| **Serverless Architecture**   | Built entirely on the Cloudflare stack for unparalleled performance, scalability, and security.         |
## 🎨 Design System
### Color Palette
| Name Color | Code HEX    | Usage (ex: Primary, Accent, etc.) |
| ---------- | ----------- | ----------------------------------- |
| Primary    | `#4f46e5`   | Buttons, links, and key highlights  |
| Background | `#f3f4f6`   | Light mode background               |
| Foreground | `#111827`   | Light mode text                     |
| Dark BG    | `#111827`   | Dark mode background                |
| Dark FG    | `#f3f4f6`   | Dark mode text                      |
### Typography
| Typographie | Poids     | Usage           |
| ----------- | --------- | --------------- |
| Cal Sans    | 700       | Display Headings|
| Inter       | 400/500/700 | Body Text/UI    |
## 🚀 Technology Stack
- **Frontend**: React, Vite, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Framer Motion, Lucide React
- **Backend**: Cloudflare Workers, Hono
- **State Management**: Zustand
- **AI & Agents**: Cloudflare Agents SDK, Cloudflare AI Gateway
- **Routing**: React Router DOM
## 🏛️ Architecture Note (re: SQL & Docker)
This project is built on a **serverless, Cloudflare-native architecture**. This modern approach offers significant advantages in scalability, performance, and security.
- **Data Persistence**: Instead of a traditional SQL database, we use **Cloudflare Durable Objects**. These provide strongly consistent, stateful storage directly on Cloudflare's edge network, ensuring low latency and data locality for users worldwide. This means a `sql.md` file is not applicable to this project's architecture.
- **Deployment**: The application is deployed directly to **Cloudflare Pages and Workers**. This eliminates the need for managing servers, containers, or virtual machines. As a result, `Dockerfile` and `docker-compose.yml` files are not required for deployment. The entire deployment process is streamlined and managed through the Wrangler CLI.
This architecture was chosen to align with best practices for building highly performant and scalable web applications.
## 🏁 Getting Started
Follow these instructions to get a local copy up and running for development and testing purposes.
### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18 or newer)
- [Bun](https://bun.sh/) package manager
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
### Installation
1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/nexusdesk_ai_support.git
    cd nexusdesk_ai_support
    ```
2.  **Install dependencies:**
    ```sh
    bun install
    ```
3.  **Configure Environment Variables:**
    Create a `.dev.vars` file in the root directory and copy the contents of `.env.example`. Fill in your Cloudflare secrets.
    ```sh
    cp .env.example .dev.vars
    ```
    You will also need to update the `name` and `vars` in `wrangler.jsonc` to match your Cloudflare account details.
## 💻 Development
To start the local development server, which includes both the Vite frontend and the Cloudflare Worker backend, run:
```sh
bun run dev
```
This command will start the application, typically on `http://localhost:3000`. The frontend will hot-reload on changes, and the worker will restart automatically.
### Available Scripts
- `bun run dev`: Starts the development server.
- `bun run build`: Builds the frontend application for production.
- `bun run deploy`: Builds and deploys the application to Cloudflare Workers.
- `bun run lint`: Lints the codebase using ESLint.
## 🚀 Deployment
This project is designed for seamless deployment to the Cloudflare network.
1.  **Build the application:**
    ```sh
    bun run build
    ```
2.  **Deploy to Cloudflare:**
    ```sh
    bun run deploy
    ```
Wrangler will handle the process of uploading your static assets to Cloudflare Pages and deploying your worker function. After deployment, it will provide you with the public URL for your application.
## 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.
1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
## 📄 License
Distributed under the MIT License.