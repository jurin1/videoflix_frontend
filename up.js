const { execSync } = require('child_process');

/**
 * Automatisiert Git-Befehle zum Stagen, Committen und Pushen von Änderungen
 * Verwendung: node up.js "Dein Commit-Kommentar"
 */
function gitUpdate() {
    try {
        // Hole den Commit-Kommentar aus den Kommandozeilenargumenten
        const commitMessage = process.argv[2] || 'update';

        console.log('\x1b[36m%s\x1b[0m', '🔍 Prüfe auf Änderungen...');

        // Git-Status überprüfen
        const status = execSync('git status --porcelain').toString();

        if (!status) {
            console.log('\x1b[33m%s\x1b[0m', '✓ Keine Änderungen gefunden.');
            return;
        }

        // Führe Git-Befehle aus
        console.log('\x1b[36m%s\x1b[0m', '📦 Änderungen werden gestaged...');
        execSync('git add .');

        console.log('\x1b[36m%s\x1b[0m', `💾 Committing mit Nachricht: "${commitMessage}"...`);
        execSync(`git commit -m "${commitMessage}"`);

        console.log('\x1b[36m%s\x1b[0m', '🚀 Änderungen werden gepusht...');
        execSync('git push');

        console.log('\x1b[32m%s\x1b[0m', '✅ Update erfolgreich abgeschlossen!');
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', '❌ Fehler beim Git-Update:');
        console.error(error.message);
        process.exit(1);
    }
}

gitUpdate();