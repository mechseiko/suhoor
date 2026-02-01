import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const runCommand = (command, cwd = rootDir) => {
    try {
        console.log(`\n> ${command}`);
        execSync(command, { stdio: 'inherit', cwd });
    } catch (error) {
        console.error(`Error executing command: ${command}`);
        process.exit(1);
    }
};

const main = () => {
    console.log('🚀 Starting APK Build Process...');

    // 1. Build the web app
    console.log('\n📦 Building Web App...');
    runCommand('npm run build');

    // 2. Sync with Capacitor
    console.log('\n🔄 Syncing with Capacitor...');
    runCommand('npx cap sync android');

    // 3. Build Android APK
    console.log('\n🤖 Building Android APK...');
    const androidDir = path.join(rootDir, 'android');
    // Use gradlew.bat for Windows
    const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
    runCommand(`${gradlew} assembleDebug`, androidDir);

    // 4. Copy APK to public folder
    console.log('\n📂 Copying APK to public directory...');
    const apkSource = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
    const apkDest = path.join(rootDir, 'public', 'Suhoor.apk');

    if (fs.existsSync(apkSource)) {
        fs.copyFileSync(apkSource, apkDest);
        console.log(`✅ APK copied successfully to: ${apkDest}`);
    } else {
        console.error('❌ APK file not found at expected location:', apkSource);
        process.exit(1);
    }

    console.log('\n✨ Build Process Completed Successfully!');
};

main();
