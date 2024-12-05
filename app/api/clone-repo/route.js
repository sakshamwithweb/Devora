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

        async function generateStructure(basePath) {
            const items = await fs.readdir(basePath, { withFileTypes: true });
            const structure = [];

            for (const item of items) {
                const itemPath = path.join(basePath, item.name);
                if (item.isDirectory()) {
                    structure.push({
                        name: item.name,
                        type: 'directory',
                        children: await generateStructure(itemPath)
                    });
                } else {
                    structure.push({
                        name: item.name,
                        type: 'file'
                    });
                }
            }

            return structure;
        }
        const structure = await generateStructure(clonePath);
        return NextResponse.json({ success: true, structure: structure, clonePath: clonePath });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: "Error processing repository." });
    }
}
