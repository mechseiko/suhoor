import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import * as dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function uploadFile(localPath, storagePath) {
    try {
        const fileBuffer = fs.readFileSync(localPath);
        const storageRef = ref(storage, storagePath);

        await uploadBytes(storageRef, fileBuffer);
        const downloadURL = await getDownloadURL(storageRef);

        console.log(`✓ Uploaded: ${storagePath}`);
        console.log(`  URL: ${downloadURL}`);
        return downloadURL;
    } catch (error) {
        console.error(`✗ Failed to upload ${storagePath}:`, error.message);
        return null;
    }
}

async function uploadDirectory(localDir, storageDir) {
    const files = fs.readdirSync(localDir);

    for (const file of files) {
        const localPath = path.join(localDir, file);
        const storagePath = `${storageDir}/${file}`;

        if (fs.statSync(localPath).isDirectory()) {
            await uploadDirectory(localPath, storagePath);
        } else {
            await uploadFile(localPath, storagePath);
        }
    }
}

async function main() {
    console.log('Starting Firebase Storage upload...\n');

    // Upload PDFs
    console.log('Uploading PDFs...');
    const booksDir = path.join(__dirname, '..', 'public', 'books');
    if (fs.existsSync(booksDir)) {
        await uploadDirectory(booksDir, 'books');
    }

    // Upload images
    console.log('\nUploading images...');
    const imagesDir = path.join(__dirname, '..', 'public', 'images');
    if (fs.existsSync(imagesDir)) {
        await uploadDirectory(imagesDir, 'images');
    }

    console.log('\n✓ Upload complete!');
    console.log('\nNext steps:');
    console.log('1. Deploy storage rules: firebase deploy --only storage');
    console.log('2. Update your code to use Firebase Storage URLs');
}

main().catch(console.error);
