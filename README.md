# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/ac1a7a4f-752a-4dfc-9fa1-64da04236630

## Docker Deployment

This application includes Docker support for easy deployment. To run it using Docker:

```sh
# Build and start the Docker container
docker-compose up -d

# The application will be available at http://localhost:8080
```

For deployment on EasyPanel:
1. Make sure Docker and Docker Compose are installed on your server
2. Clone this repository
3. Run `docker-compose up -d` to start the application
4. Configure EasyPanel to point to the container

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ac1a7a4f-752a-4dfc-9fa1-64da04236630) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

You can deploy this project in several ways:

1. **Using Docker (recommended for EasyPanel)**:
   - Follow the Docker deployment instructions above

2. **Using Lovable**:
   - Simply open [Lovable](https://lovable.dev/projects/ac1a7a4f-752a-4dfc-9fa1-64da04236630) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
