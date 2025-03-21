```markdown
# Videoflix Frontend

Dieses Projekt ist das Frontend für die Videoflix-Anwendung, entwickelt mit [Angular CLI](https://github.com/angular/angular-cli) Version 17.0.0.  Es bietet eine Benutzeroberfläche für die Wiedergabe von Videos, Benutzerauthentifizierung und mehr.

## Voraussetzungen

*   **Backend:** Dieses Frontend benötigt ein separates Backend, um zu funktionieren.  Sie finden das zugehörige Backend-Repository hier: [LINK ZUM BACKEND-REPO HIER EINFÜGEN].  Befolgen Sie die Anweisungen im Backend-Repository, um den Server einzurichten und zu starten.  Ohne ein laufendes Backend wird das Frontend keine Daten laden können.
*   **Node.js und npm:** Stellen Sie sicher, dass Sie Node.js (LTS-Version empfohlen) und npm (Node Package Manager) auf Ihrem System installiert haben.  Sie können diese von [https://nodejs.org/](https://nodejs.org/) herunterladen.
* **Angular CLI:** Install Angular CLI globally
```bash
 npm install -g @angular/cli
 ```

## Installation und Einrichtung

1.  **Repository klonen:**

    ```bash
    git clone [URL ZUM FRONTEND-REPOSITORY]
    cd jurin1-videoflix_frontend
    ```

2.  **Abhängigkeiten installieren:**

    ```bash
    npm install
    ```

3.  **Umgebungsvariablen konfigurieren:**

    *   Navigieren Sie zum Verzeichnis `src/environments`.
    *   Sie finden dort zwei Dateien: `environment.ts` (für die Entwicklung) und `environment.prod.ts` (für die Produktion).
    *   Passen Sie die `apiUrl`-Variable in der Datei an, die Sie verwenden möchten, um auf die URL Ihres laufenden Backend-Servers zu verweisen.  Beispiel:

        ```typescript
        // src/environments/environment.ts (für Entwicklung)
        export const environment = {
            production: false,
            apiUrl: 'http://localhost:8000/api' // Ihre lokale Backend-URL
        };

        // src/environments/environment.prod.ts (für Produktion)
        export const environment = {
            production: true,
            apiUrl: 'https://ihre-domain.de/api' // Ihre Produktions-Backend-URL
        };
        ```
     * Stelle sicher, dass die Backend URL das Prefix `/api` am Ende besitzt, z.B. `http://localhost:8000/api`

## Entwicklungsserver

Führen Sie `ng serve` aus, um einen Entwicklungsserver zu starten. Navigieren Sie zu `http://localhost:4200/`. Die Anwendung wird automatisch neu geladen, wenn Sie Änderungen an den Quelldateien vornehmen.

## Build (Produktion)

Führen Sie `ng build --configuration production` aus, um das Projekt für die Produktion zu erstellen.

*   **Wichtig:**  Verwenden Sie immer den `--configuration production` Flag, wenn Sie für die Produktion bauen.  Dadurch werden Optimierungen aktiviert, die Dateigröße reduziert und die Leistung verbessert.
*   Die Build-Artefakte werden im Verzeichnis `dist/videoflix_frontend` gespeichert.  Dieses Verzeichnis enthält die Dateien, die Sie auf Ihrem Webserver bereitstellen müssen.

## Deployment

*   **Distributionsverzeichnis:**  Der Inhalt des Verzeichnisses `dist/videoflix_frontend` (nach dem Build) ist das, was auf Ihrem Webserver (z. B. Apache, Nginx, Netlify, Vercel, AWS S3) bereitgestellt werden muss.
*   **Server-Konfiguration:** Stellen Sie sicher, dass Ihr Webserver so konfiguriert ist, dass er `index.html` als Standarddatei für alle Routen bedient, die nicht mit statischen Dateien (wie Bildern, CSS, JavaScript) übereinstimmen. Dies ist notwendig, da Angular eine Single-Page-Anwendung (SPA) ist und das clientseitige Routing verwendet.
*   **Beispiel Nginx-Konfiguration (Ausschnitt):**

    ```nginx
    server {
        listen 80;
        server_name  ihre-domain.de;

        root /pfad/zu/ihrem/dist/videoflix_frontend;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }
    }
    ```

## Unit-Tests

Führen Sie `ng test` aus, um die Unit-Tests über [Karma](https://karma-runner.github.io) auszuführen.

## Docker

Ein `Dockerfile` wird bereitgestellt, um die Anwendung in einem Docker-Container auszuführen.

1.  **Image bauen:**

    ```bash
    docker build -t videoflix-frontend .
    ```

2.  **Container starten:**

    ```bash
    docker run -d -p 80:80 videoflix-frontend
    ```
    Dadurch wird der Container gestartet und Port 80 des Containers auf Port 80 Ihres Host-Systems gemappt.

## Wichtige Hinweise und bewährte Verfahren

*   **Authentifizierung:** Die Anwendung verwendet JWT (JSON Web Tokens) für die Authentifizierung.  Das Token wird im `localStorage` gespeichert.  Beachten Sie die Sicherheitsimplikationen der Speicherung von Tokens im Client.
*   **Fehlerbehandlung:** Überprüfen Sie die Implementierung der Fehlerbehandlung in `api.service.ts` und den verschiedenen Komponenten. Verwenden Sie `ToastrService` für konsistente Fehlermeldungen.
*   **Routing:** Das Routing wird in `app.routes.ts` definiert.  `AuthGuard` schützt Routen, die eine Authentifizierung erfordern.
* **Up.js:** Die `up.js` Datei ist nicht Bestandteil des Angular Projekts, dient aber dazu, Commits schnell mit einer Nachricht zu erstellen und zu pushen.
*   **Code-Stil:** Dieses Projekt folgt dem Angular Style Guide.  Es ist ratsam, sich an diesen Stil zu halten, um die Konsistenz zu wahren.
*   **Große Dateien (z.B. Speedtest):** Das Frontend lädt beim Speedtest eine große Datei herunter. Achten Sie auf eine gute Performance und darauf, dass die Datei vom Server schnell ausgeliefert wird.
* **`.dockerignore`:** Stellen Sie sicher, dass alle nicht benötigten Dateien und Verzeichnisse in der `.dockerignore`-Datei aufgeführt sind, um die Größe des Docker-Images zu minimieren.
*   **Git-Workflow:** Es wird empfohlen, einen Git-Workflow wie Gitflow zu verwenden, um die Zusammenarbeit und Versionskontrolle zu verbessern.

## Weitere Hilfe

Um weitere Hilfe zur Angular CLI zu erhalten, verwenden Sie `ng help` oder besuchen Sie die [Angular CLI Overview and Command Reference](https://angular.io/cli) Seite.
```

Wesentliche Verbesserungen und Ergänzungen:

*   **Voraussetzungen:**  Klare Anweisungen zu Backend, Node.js/npm und Angular CLI.
*   **Backend-Link:** Platzhalter für den Link zum Backend-Repository.  *Unbedingt ausfüllen!*
*   **Installationsschritte:** Detaillierte Schritte zum Klonen, Installieren von Abhängigkeiten und Konfigurieren der Umgebungsvariablen.
*   **Build-Prozess (Produktion):**  Betonung des `--configuration production` Flags und Erklärung des `dist`-Verzeichnisses.
*   **Deployment:**  Erläuterung des Deployment-Prozesses, Server-Konfigurationshinweise (mit Nginx-Beispiel) und die Notwendigkeit der SPA-Konfiguration.
*   **Docker:** Anleitung zum Bauen und Ausführen des Docker-Images.
*   **Wichtige Hinweise:**  Abschnitt mit wichtigen Hinweisen zu Authentifizierung, Fehlerbehandlung, Routing, Code-Stil und bewährten Verfahren (Best Practices).  Sehr wichtig für neue Entwickler im Team.
*   **Up.js:** Erklärung zur `up.js`.
* **Große Dateien:** Hinweis zur großen Speedtest Datei

Diese verbesserte README macht das Projekt viel zugänglicher und verständlicher, insbesondere für Personen, die neu im Projekt sind oder das Frontend in ihre eigene Umgebung integrieren möchten.  Es deckt alle wichtigen Aspekte von der Einrichtung über die Entwicklung bis hin zur Produktion und zum Deployment ab.
