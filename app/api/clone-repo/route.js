import { simpleGit } from 'simple-git';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { repoLink } = await request.json();
        const repoName = `${repoLink.split('/').pop().replace('.git', '')}-${uuidv4()}`;
        const clonePath = path.join(os.tmpdir(), repoName);
        const git = simpleGit();
        await git.clone(repoLink, clonePath);

        const unnecessaryFilesAndFolders = [
            "favicon.ico",
            "node_modules/",
            ".next/",
            ".gitignore",
            "out/",
            "package-lock.json",
            "yarn.lock",
            "tsconfig.json",
            "jsconfig.json",
            "next-env.d.ts",
            "postcss.config.mjs",
            "tailwind.config.js",
            "next.config.mjs",
            ".git/",
            "public/",
            ".vscode/",
            "dist/",
            ".npm/",
            ".eslintignore",
            ".prettierrc",
            ".editorconfig",
            "logs/",
            "tests/",
            "__tests__/"
        ];

        async function deleteUnnecessaryFiles(basePath) {
            const items = await fs.readdir(basePath, { withFileTypes: true });
            for (const item of items) {
                const itemPath = path.join(basePath, item.name);
                if (unnecessaryFilesAndFolders.some(pattern => {
                    if (!pattern.endsWith('/')) return item.name === pattern;
                    return pattern.endsWith('/') && item.isDirectory() && item.name === pattern.slice(0, -1);
                })) {
                    await fs.rm(itemPath, { recursive: true, force: true });
                } else if (item.isDirectory()) {
                    await deleteUnnecessaryFiles(itemPath);
                }
            }
        }

        async function printTree(basePath, prefix = '') {
            const items = await fs.readdir(basePath, { withFileTypes: true });
            for (const item of items) {
                const itemPath = path.join(basePath, item.name);
                console.log(`${prefix}├── ${item.name}`);
                if (item.isDirectory()) {
                    await printTree(itemPath, `${prefix}│   `);
                }
            }
        }

        async function readFilesAndGenerateContent(basePath) {
            let result = '';

            const items = await fs.readdir(basePath, { withFileTypes: true });
            for (const item of items) {
                const itemPath = path.join(basePath, item.name);

                if (item.isDirectory()) {
                    result += await readFilesAndGenerateContent(itemPath);
                } else if (item.isFile()) {
                    const fileContent = await fs.readFile(itemPath, 'utf-8');
                    const relativePath = path.relative(clonePath, itemPath);
                    result += `${relativePath}\n\`\`\`\n${fileContent}\n\`\`\`\n\n`;
                }
            }

            return result;
        }

        await deleteUnnecessaryFiles(clonePath);

        console.log(`Repository structure after cleanup at ${clonePath}:`);
        await printTree(clonePath);

        const allFilesContent = await readFilesAndGenerateContent(clonePath);

        console.log(allFilesContent);
        console.log(allFilesContent.split(/\s+/).filter(Boolean).length)

        const outputFilePath = path.join('.', 'output', 'output.txt');
        await fs.writeFile(outputFilePath, allFilesContent, 'utf-8');

        await fs.rm(clonePath, { recursive: true, force: true });

        return NextResponse.json({ success: true, message:allFilesContent});
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: "Error processing repository." });
    }
}
