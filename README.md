
# Videoflix Frontend

This project is the frontend for the Videoflix application, developed using [Angular CLI](https://github.com/angular/angular-cli) version 17.0.0. It provides a user interface for video playback, user authentication, and more.

## Prerequisites

*   **Backend:** This frontend requires a separate backend to function. You can find the associated backend repository here: [Videoflix Backend](https://github.com/jurin1/videoflix_backend). Follow the instructions in the backend repository to set up and start the server. Without a running backend, the frontend will not be able to load any data.
*   **Node.js and npm:** Ensure you have Node.js (LTS version recommended) and npm (Node Package Manager) installed on your system. You can download them from [https://nodejs.org/](https://nodejs.org/).
*   **Angular CLI:** Install Angular CLI globally:
```bash
 npm install -g @angular/cli
 ```

## Installation and Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/jurin1/videoflix_frontend
    cd jurin1-videoflix_frontend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure environment variables:**

    *   Navigate to the `src/environments` directory.
    *   You will find two files there: `environment.ts` (for development) and `environment.prod.ts` (for production).
    *   Adjust the `apiUrl` variable in the file you intend to use to point to the URL of your running backend server.  For example:

        ```typescript
        // src/environments/environment.ts (for development)
        export const environment = {
            production: false,
            apiUrl: 'http://localhost:8000/api' // Your local backend URL
        };

        // src/environments/environment.prod.ts (for production)
        export const environment = {
            production: true,
            apiUrl: 'https://your-domain.com/api' // Your production backend URL
        };
        ```
     *  Ensure that the backend URL has the prefix `/api` at the end, e.g., `http://localhost:8000/api`.

## Development Server

Run `ng serve` to start a development server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build (Production)

Run `ng build --configuration production` to build the project for production.

*   **Important:** Always use the `--configuration production` flag when building for production. This enables optimizations, reduces file size, and improves performance.
*   The build artifacts will be stored in the `dist/videoflix_frontend` directory. This directory contains the files you need to deploy to your web server.

## Deployment

*   **Distribution Directory:** The contents of the `dist/videoflix_frontend` directory (after building) are what need to be deployed to your web server (e.g., Apache, Nginx, Netlify, Vercel, AWS S3).
*   **Server Configuration:** Ensure your web server is configured to serve `index.html` as the default file for all routes that don't match static files (like images, CSS, JavaScript). This is necessary because Angular is a Single-Page Application (SPA) and uses client-side routing.
*   **Example Nginx Configuration (snippet):**

    ```nginx
    server {
        listen 80;
        server_name  your-domain.com;

        root /path/to/your/dist/videoflix_frontend;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }
    }
    ```

## Unit Tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Docker

A `Dockerfile` is provided to run the application in a Docker container.

1.  **Build the image:**

    ```bash
    docker build -t videoflix-frontend .
    ```

2.  **Run the container:**

    ```bash
    docker run -d -p 80:80 videoflix-frontend
    ```

    This will start the container and map port 80 of the container to port 80 of your host system.

## Important Notes and Best Practices

*   **Authentication:** The application uses JWT (JSON Web Tokens) for authentication. The token is stored in `localStorage`. Be aware of the security implications of storing tokens on the client.
*   **Error Handling:**  Review the error handling implementation in `api.service.ts` and the various components.  Use `ToastrService` for consistent error messaging.
*   **Routing:** Routing is defined in `app.routes.ts`. `AuthGuard` protects routes that require authentication.
*   **Up.js:** The `up.js` file is not part of the Angular project itself, but is used to quickly create commits with a message and push them.
*   **Code Style:** This project follows the Angular Style Guide. It is advisable to adhere to this style to maintain consistency.
*   **Large Files (e.g., Speedtest):** The frontend downloads a large file during the speed test. Pay attention to good performance and ensure that the file is delivered quickly from the server.
*   **`.dockerignore`:** Ensure that all unnecessary files and directories are listed in the `.dockerignore` file to minimize the size of the Docker image.
*   **Git Workflow:** It is recommended to use a Git workflow such as Gitflow to improve collaboration and version control.

## Further Help

To get more help with the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
