import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    ensureLandscapeCoverArt,
    formatCoverArtCredit,
    pickLandscapeCoverArt,
} from "../src/cover-art.js";

describe("cover-art", () => {
    it("picks stably for the same seed", () => {
        const a = pickLandscapeCoverArt("一个人训一个小模型：实操清单");
        const b = pickLandscapeCoverArt("一个人训一个小模型：实操清单");
        assert.equal(a.id, b.id);
    });

    it("injects cover and credit when missing", () => {
        const md = `---
title: 测试文章
author: Luca
---

正文第一段。
`;
        const { markdown, art } = ensureLandscapeCoverArt(md);
        assert.ok(art);
        assert.match(markdown, /^cover: https:\/\//m);
        assert.match(markdown, /封面作品：/);
        assert.match(markdown, new RegExp(art!.titleZh));
        assert.match(markdown, /正文第一段/);
    });

    it("leaves existing cover alone", () => {
        const md = `---
title: 测试
cover: ./mine.jpg
---

body
`;
        const { markdown, art } = ensureLandscapeCoverArt(md);
        assert.equal(art, null);
        assert.match(markdown, /cover: \.\/mine\.jpg/);
        assert.doesNotMatch(markdown, /封面作品：/);
    });

    it("formats credit with artist and work", () => {
        const art = pickLandscapeCoverArt("x");
        const line = formatCoverArtCredit(art);
        assert.match(line, /封面作品：/);
        assert.match(line, /Wikimedia Commons/);
    });
});
