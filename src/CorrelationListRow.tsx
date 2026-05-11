import { useEffect, useState } from "react";

type corr_type = {
    species: string,
    correlation: number,
    cancer_type: string
}

const imageCache = new Map<string, string>();

async function getPhylopicSilhouette(species: string): Promise<string> {
    if (imageCache.has(species)) return imageCache.get(species)!;

    const fallback = "";
    const apiBase = "https://api.phylopic.org";
    const normalized = species.replace(/_/g, " ").trim().toLowerCase();

    try {
        let autoRes = await fetch(`${apiBase}/autocomplete?query=${encodeURIComponent(normalized)}`);
        let autoJson = await autoRes.json();

        let match = autoJson?.matches?.[0];
        if (!match) {
            autoRes = await fetch(`${apiBase}/autocomplete?query=${encodeURIComponent(normalized.split(" ")[0])}`);
            autoJson = await autoRes.json();
            match = autoJson?.matches?.[0];
            if (!match) {
                imageCache.set(species, fallback);
                return fallback;
            }
        }

        const nodesRes = await fetch(`${apiBase}/nodes?filter_name=${encodeURIComponent(match)}&page=0`);
        if (!nodesRes.ok) {
            imageCache.set(species, fallback);
            return fallback;
        }

        const nodesJson = await nodesRes.json();
        const nodeHref = nodesJson?._links?.items?.[0]?.href;
        if (!nodeHref) {
            imageCache.set(species, fallback);
            return fallback;
        }

        const nodeRes = await fetch(`${apiBase}${nodeHref}`);
        if (!nodeRes.ok) {
            imageCache.set(species, fallback);
            return fallback;
        }

        const nodeJson = await nodeRes.json();
        const imageHref = nodeJson?._links?.primaryImage?.href;
        if (!imageHref) {
            imageCache.set(species, fallback);
            return fallback;
        }

        const imageRes = await fetch(`${apiBase}${imageHref}`);
        if (!imageRes.ok) {
            imageCache.set(species, fallback);
            return fallback;
        }

        const imageJson = await imageRes.json();
        const src =
            imageJson?._links?.thumbnailFiles?.[1]?.href ||
            imageJson?._links?.thumbnailFiles?.[0]?.href ||
            "";

        imageCache.set(species, src);
        return src;
    } catch {
        imageCache.set(species, fallback);
        return fallback;
    }
}

export default function CorrelationListRow({ d, i }: { d: corr_type, i: number }) {
    const [src, setSrc] = useState(() => imageCache.get(d.species) ?? "");

    useEffect(() => {
        let cancelled = false;
        if (imageCache.has(d.species)) {
            setSrc(imageCache.get(d.species)!);
            return;
        }
        getPhylopicSilhouette(d.species).then(url => {
            if (!cancelled) setSrc(url);
        });
        return () => { cancelled = true; };
    }, [d.species]);

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "7px 10px",
                marginBottom: "4px",
                border: "1px solid #d0d7e2",
                borderRadius: "8px",
                background: "#f7f9fc",
            }}
        >
            <div style={{ fontWeight: "bold", fontSize: "0.95rem", width: "30px", textAlign: "center", color: "#6b7a99" }}>
                #{i + 1}
            </div>

            <div style={{ background: "#e6edff", padding: "3px 8px", borderRadius: "6px", fontWeight: 600, minWidth: "60px", textAlign: "center", fontSize: "0.88rem" }}>
                {d.correlation.toFixed(3)}
            </div>

            {src && (
                <img
                    src={src}
                    alt=""
                    width={38}
                    height={38}
                    style={{ objectFit: "contain", flexShrink: 0 }}
                />
            )}
            {!src && <div style={{ width: 38, height: 38, flexShrink: 0 }} />}

            <div style={{ flex: 1, minWidth: 0 }}>
                <a
                    href={"https://en.wikipedia.org/wiki/" + d.species}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#1f4fd1", textDecoration: "none", fontWeight: 600 }}
                >
                    <em>{d.species.replace(/_/g, " ")}</em>
                </a>
            </div>
        </div>
    );
}
