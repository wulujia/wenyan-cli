/**
 * Auto cover art for WeChat drafts: public-domain landscape oil paintings.
 * Wenyan itself does not generate images — it only uploads paths/URLs from
 * frontmatter `cover` or the first body image. This module fills a missing
 * cover with a curated landscape painting and appends a credit line.
 */

export type CoverArt = {
    id: string;
    titleEn: string;
    titleZh: string;
    artistEn: string;
    artistZh: string;
    year: string;
    /** HTTPS image URL (Wikimedia Commons). */
    url: string;
};

/** Curated public-domain landscape oils (Wikimedia Commons FilePath). */
export const LANDSCAPE_OIL_COVERS: CoverArt[] = [
    {
        id: "monet-wheatstacks-morning",
        titleEn: "Wheatstacks, Snow Effect, Morning",
        titleZh: "干草堆，雪景，早晨",
        artistEn: "Claude Monet",
        artistZh: "克劳德·莫奈",
        year: "1891",
        url: "https://commons.wikimedia.org/wiki/Special:FilePath/Claude_Monet_-_Wheatstacks%2C_Snow_Effect%2C_Morning.jpg?width=1600",
    },
    {
        id: "monet-poppy-field",
        titleEn: "Poppy Field",
        titleZh: "罂粟花田",
        artistEn: "Claude Monet",
        artistZh: "克劳德·莫奈",
        year: "1873",
        url: "https://commons.wikimedia.org/wiki/Special:FilePath/Claude_Monet_-_Poppy_Field_-_Google_Art_Project.jpg?width=1600",
    },
    {
        id: "vangogh-wheat-cypresses",
        titleEn: "Wheat Field with Cypresses",
        titleZh: "有丝柏的麦田",
        artistEn: "Vincent van Gogh",
        artistZh: "文森特·梵高",
        year: "1889",
        url: "https://commons.wikimedia.org/wiki/Special:FilePath/Vincent_van_Gogh_-_Wheat_Field_with_Cypresses_-_Google_Art_Project.jpg?width=1600",
    },
    {
        id: "vangogh-olive-trees",
        titleEn: "Olive Trees",
        titleZh: "橄榄树",
        artistEn: "Vincent van Gogh",
        artistZh: "文森特·梵高",
        year: "1889",
        url: "https://commons.wikimedia.org/wiki/Special:FilePath/Vincent_van_Gogh_-_Olive_Trees_-_Google_Art_Project.jpg?width=1600",
    },
    {
        id: "constable-hay-wain",
        titleEn: "The Hay Wain",
        titleZh: "干草车",
        artistEn: "John Constable",
        artistZh: "约翰·康斯太勃尔",
        year: "1821",
        url: "https://commons.wikimedia.org/wiki/Special:FilePath/John_Constable_The_Hay_Wain.jpg?width=1600",
    },
    {
        id: "friedrich-wanderer",
        titleEn: "Wanderer above the Sea of Fog",
        titleZh: "雾海上的旅人",
        artistEn: "Caspar David Friedrich",
        artistZh: "卡斯帕·大卫·弗里德里希",
        year: "1818",
        url: "https://commons.wikimedia.org/wiki/Special:FilePath/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg?width=1600",
    },
    {
        id: "turner-temeraire",
        titleEn: "The Fighting Temeraire",
        titleZh: "战舰无畏号",
        artistEn: "J. M. W. Turner",
        artistZh: "约瑟夫·玛罗德·威廉·透纳",
        year: "1839",
        url: "https://commons.wikimedia.org/wiki/Special:FilePath/The_Fighting_Temeraire%2C_JMW_Turner%2C_National_Gallery.jpg?width=1600",
    },
    {
        id: "cezanne-sainte-victoire",
        titleEn: "Mont Sainte-Victoire",
        titleZh: "圣维克多山",
        artistEn: "Paul Cézanne",
        artistZh: "保罗·塞尚",
        year: "1904",
        url: "https://commons.wikimedia.org/wiki/Special:FilePath/Paul_C%C3%A9zanne_109.jpg?width=1600",
    },
    {
        id: "sisley-louveciennes",
        titleEn: "Early Snow at Louveciennes",
        titleZh: "卢韦西耶纳的初雪",
        artistEn: "Alfred Sisley",
        artistZh: "阿尔弗雷德·西斯莱",
        year: "1870",
        url: "https://commons.wikimedia.org/wiki/Special:FilePath/Alfred_Sisley_-_Early_Snow_at_Louveciennes_-_Google_Art_Project.jpg?width=1600",
    },
    {
        id: "corot-ville-davray",
        titleEn: "Ville-d'Avray",
        titleZh: "达夫雷镇",
        artistEn: "Jean-Baptiste-Camille Corot",
        artistZh: "卡米耶·柯罗",
        year: "1865",
        url: "https://commons.wikimedia.org/wiki/Special:FilePath/Jean-Baptiste-Camille_Corot_-_Ville-d%27Avray_-_Google_Art_Project.jpg?width=1600",
    },
];

export function formatCoverArtCredit(art: CoverArt): string {
    return (
        `> 封面作品：${art.artistZh}《${art.titleZh}》（${art.artistEn}, ${art.titleEn}, ${art.year}）。` +
        `公有领域／Wikimedia Commons。`
    );
}

/** Stable pick from title (or random if no seed). */
export function pickLandscapeCoverArt(seed?: string): CoverArt {
    const list = LANDSCAPE_OIL_COVERS;
    if (!seed) {
        return list[Math.floor(Math.random() * list.length)]!;
    }
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    return list[hash % list.length]!;
}

function parseFrontMatter(markdown: string): {
    hasFrontMatter: boolean;
    yaml: string;
    body: string;
    cover?: string;
    title?: string;
} {
    const fmMatch = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (!fmMatch) {
        return { hasFrontMatter: false, yaml: "", body: markdown };
    }
    const yaml = fmMatch[1];
    const body = markdown.slice(fmMatch[0].length);
    const coverLine = yaml.match(/^cover:\s*(.+)$/m);
    const titleLine = yaml.match(/^title:\s*(.+)$/m);
    const stripQ = (s: string) => s.trim().replace(/^["']|["']$/g, "");
    return {
        hasFrontMatter: true,
        yaml,
        body,
        cover: coverLine ? stripQ(coverLine[1]) : undefined,
        title: titleLine ? stripQ(titleLine[1]) : undefined,
    };
}

/**
 * If markdown has no `cover:`, inject a landscape oil painting URL and append
 * a credit line at the end of the body. Returns { markdown, art } when applied.
 */
export function ensureLandscapeCoverArt(
    markdown: string,
    options: { enabled?: boolean; seed?: string } = {},
): { markdown: string; art: CoverArt | null } {
    if (options.enabled === false) {
        return { markdown, art: null };
    }

    const parsed = parseFrontMatter(markdown);
    if (parsed.cover) {
        return { markdown, art: null };
    }

    const art = pickLandscapeCoverArt(options.seed ?? parsed.title);
    const credit = formatCoverArtCredit(art);
    const creditMarker = "封面作品：";

    let body = parsed.body.replace(/\s*$/, "");
    if (!body.includes(creditMarker)) {
        body = `${body}\n\n${credit}\n`;
    }

    let yaml: string;
    if (parsed.hasFrontMatter) {
        yaml = parsed.yaml.replace(/\s*$/, "") + `\ncover: ${art.url}\n`;
    } else {
        yaml = `cover: ${art.url}\n`;
    }

    const next = `---\n${yaml.trim()}\n---\n\n${body.replace(/^\s+/, "")}`;
    return { markdown: next, art };
}
