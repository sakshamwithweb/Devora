import path from 'path';
import fs from 'fs/promises';
import { NextResponse } from 'next/server';

export async function POST(params) {
    try {
        const { clonePath, ignoreThings } = await params.json()
        async function deleteUnnecessaryFiles(basePath) {
            const items = await fs.readdir(basePath, { withFileTypes: true });
            for (const item of items) {
                const itemPath = path.join(basePath, item.name);
                if (ignoreThings.some(pattern => {
                    if (!pattern.endsWith('/')) return item.name === pattern;
                    return pattern.endsWith('/') && item.isDirectory() && item.name === pattern.slice(0, -1);
                })) {
                    await fs.rm(itemPath, { recursive: true, force: true });
                } else if (item.isDirectory()) {
                    await deleteUnnecessaryFiles(itemPath);
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
        const allFilesContent = await readFilesAndGenerateContent(clonePath);
        const outputFilePath = path.join('.', 'output', 'output.txt');
        await fs.writeFile(outputFilePath, allFilesContent, 'utf-8');
        await fs.rm(clonePath, { recursive: true, force: true });
        return NextResponse.json({ success: true, message: allFilesContent });
    } catch (error) {
        console.log(error.message)
        return NextResponse.json({ success: false })
    }
}