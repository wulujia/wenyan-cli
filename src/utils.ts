import path from "node:path";
import fs from "node:fs/promises";
import { getNormalizeFilePath } from "@wenyan-md/core/wrapper";
import { ensureLandscapeCoverArt } from "./cover-art.js";

export function readStdin(): Promise<string> {
    process.stdin.setEncoding("utf8"); // windows中文版可能有问题
    return readStream(process.stdin);
}

async function readStream(stream: NodeJS.ReadableStream): Promise<string> {
    const chunks: string[] = [];
    for await (const chunk of stream) {
        chunks.push(typeof chunk === "string" ? chunk : chunk.toString());
    }
    return chunks.join("");
}

export async function getInputContent(
    inputContent?: string,
    file?: string,
): Promise<{ content: string; absoluteDirPath: string | undefined }> {
    // 优先级 1：直接传入的内存数据（最高优先级，直接返回）
    if (inputContent) {
        return { content: inputContent, absoluteDirPath: undefined };
    }

    // 优先级 2：用户指定了文件
    if (file) {
        const normalizePath = getNormalizeFilePath(file);
        const content = await fs.readFile(normalizePath, "utf-8");
        return { content, absoluteDirPath: path.dirname(normalizePath) };
    }

    // 优先级 3：管道方式，尝试读取标准输入流
    if (!process.stdin.isTTY) {
        // 注意，如果 stdin 没有数据，可能会导致程序挂起，不做处理，参考 cat 命令不带任何参数时的行为
        const content = await readStdin();
        if (content) {
            return { content, absoluteDirPath: undefined };
        }
    }

    throw new Error("missing input-content (no argument, no stdin, and no file).");
}


/**
 * WeChat already shows frontmatter `title` above the article.
 * Strip a leading ATX H1 from the body when it duplicates that title
 * (or when there is no frontmatter title — first H1 after frontmatter).
 */
export function stripDuplicateTitleHeading(markdown: string): string {
    const normalized = (s: string) => s.trim().replace(/^["']|["']$/g, "").replace(/\s+/g, " ");

    const fmMatch = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    let title: string | undefined;
    let bodyStart = 0;
    let fmBlock = "";

    if (fmMatch) {
        fmBlock = fmMatch[0];
        bodyStart = fmMatch[0].length;
        const titleLine = fmMatch[1].match(/^title:\s*(.+)$/m);
        if (titleLine) {
            title = normalized(titleLine[1]);
        }
    }

    const body = markdown.slice(bodyStart);
    const h1Match = body.match(/^\s*#\s+(.+?)\s*(?:\r?\n|$)/);
    if (!h1Match) {
        return markdown;
    }

    const h1Text = normalized(h1Match[1]);
    if (title && h1Text !== title) {
        return markdown;
    }

    let rest = body.slice(h1Match[0].length);
    rest = rest.replace(/^\s*\r?\n/, "");
    return fmBlock ? `${fmBlock.replace(/\s*$/, "")}\n\n${rest}` : rest;
}

export async function getPublishInputContent(
    inputContent?: string,
    file?: string,
    options: { autoCoverArt?: boolean } = {},
): Promise<{ content: string; absoluteDirPath: string | undefined; coverArtId?: string }> {
    const result = await getInputContent(inputContent, file);
    let content = stripDuplicateTitleHeading(result.content);
    const autoCoverArt = options.autoCoverArt !== false && process.env.WENYAN_NO_AUTO_COVER !== "1";
    const { markdown, art } = ensureLandscapeCoverArt(content, { enabled: autoCoverArt });
    if (art) {
        console.error(`[cover-art] ${art.artistZh}《${art.titleZh}》 (${art.id})`);
    }
    return {
        ...result,
        content: markdown,
        coverArtId: art?.id,
    };
}
