import { useEffect, useRef, useState } from "react";
import { loadCSV, ColumnTable } from "arquero";

type CalcProps = {
    updateResults: (tsv: string) => void
}

function rankArray(arr: number[]): number[] {
    const n = arr.length;
    const indexed = arr.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
    const ranks = new Array(n);
    let i = 0;
    while (i < n) {
        let j = i;
        while (j < n - 1 && indexed[j + 1].v === indexed[j].v) j++;
        const avgRank = (i + j) / 2 + 1;
        for (let k = i; k <= j; k++) ranks[indexed[k].i] = avgRank;
        i = j + 1;
    }
    return ranks;
}

function spearmanCorr(x: number[], y: number[]): number {
    if (x.length < 2) return 0;
    const rx = rankArray(x);
    const ry = rankArray(y);
    const n = rx.length;
    const mx = rx.reduce((a, b) => a + b, 0) / n;
    const my = ry.reduce((a, b) => a + b, 0) / n;
    let num = 0, sx2 = 0, sy2 = 0;
    for (let i = 0; i < n; i++) {
        const dx = rx[i] - mx;
        const dy = ry[i] - my;
        num += dx * dy;
        sx2 += dx * dx;
        sy2 += dy * dy;
    }
    const denom = Math.sqrt(sx2 * sy2);
    return denom === 0 ? 0 : num / denom;
}

export default function CorrelationCalculator({ updateResults }: CalcProps) {
    const [genes, setGenes] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [tablesReady, setTablesReady] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState("Loading species data (1/4)...");
    const [runInfo, setRunInfo] = useState<string | null>(null);

    const table_a = useRef<ColumnTable | null>(null);
    const table_d = useRef<ColumnTable | null>(null);
    const table_m = useRef<ColumnTable | null>(null);
    const table_p = useRef<ColumnTable | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoadingStatus("Loading species data (1/4)...");
            table_a.current = await loadCSV("/PanmammalianWebpage/data/phyloP_a-c.tsv.gz", { decompress: null, delimiter: '\t' });
            setLoadingStatus("Loading species data (2/4)...");
            table_d.current = await loadCSV("/PanmammalianWebpage/data/phyloP_d-l.tsv.gz", { decompress: null, delimiter: '\t' });
            setLoadingStatus("Loading species data (3/4)...");
            table_m.current = await loadCSV("/PanmammalianWebpage/data/phyloP_m-o.tsv.gz", { decompress: null, delimiter: '\t' });
            setLoadingStatus("Loading species data (4/4)...");
            table_p.current = await loadCSV("/PanmammalianWebpage/data/phyloP_p-z.tsv.gz", { decompress: null, delimiter: '\t' });
            setTablesReady(true);
            setLoadingStatus("");
        };
        loadData();
    }, []);

    async function calculateCorrelations() {
        setIsCalculating(true);
        setRunInfo(null);

        const geneSet = new Set(
            genes.split("\n").map(g => g.trim()).filter(g => g.length > 0)
        );
        const filterGenes = geneSet.size > 0;

        if (!filterGenes) {
            setLoadingStatus("Loading precomputed results...");
            const res = await fetch("/PanmammalianWebpage/data/correlations.tsv");
            updateResults(await res.text());
            setLoadingStatus("");
            setRunInfo("Showing precomputed correlations across all genes.");
            setIsCalculating(false);
            return;
        }

        setLoadingStatus("Computing correlations...");

        const tables = [table_a.current, table_d.current, table_m.current, table_p.current]
            .filter(Boolean) as ColumnTable[];

        const tsvRows: string[] = ["species\tcancer_type\tcorrelation"];
        let speciesCount = 0;
        const matchedGenes = new Set<string>();

        for (const table of tables) {
            const speciesCols = table.columnNames().filter(col => col.startsWith("lnlratio_"));
            speciesCount += speciesCols.length;

            const geneArr = table.array("cosmic_gene") as string[];
            const humanArr = table.array("lnlratio") as number[];
            const ctArr = table.array("cancer_type") as string[];

            const matchIdx = geneArr.reduce<number[]>((acc, gene, i) => {
                if (geneSet.has(gene)) acc.push(i);
                return acc;
            }, []);

            matchIdx.forEach(i => matchedGenes.add(geneArr[i]));

            if (matchIdx.length < 2) continue;

            const humanFiltered = matchIdx.map(i => humanArr[i]);
            const ctFiltered = matchIdx.map(i => ctArr[i]);

            const speciesFiltered: Record<string, number[]> = {};
            for (const col of speciesCols) {
                const raw = table.array(col) as number[];
                speciesFiltered[col] = matchIdx.map(i => raw[i]);
            }

            // Split comma-separated cancer type strings into individual types
            const expandedCts = new Set<string>();
            ctFiltered.forEach(ct =>
                ct.split(",").map(t => t.trim()).filter(t => t.length > 0).forEach(t => expandedCts.add(t))
            );
            const cancerTypes = ["all", ...expandedCts];

            for (const cancerType of cancerTypes) {
                let humanVals: number[];
                let ctIndices: number[] | null = null;

                if (cancerType === "all") {
                    humanVals = humanFiltered;
                } else {
                    ctIndices = ctFiltered.reduce<number[]>((acc, ct, i) => {
                        if (ct.split(",").map(t => t.trim()).includes(cancerType)) acc.push(i);
                        return acc;
                    }, []);
                    humanVals = ctIndices.map(i => humanFiltered[i]);
                }

                if (humanVals.length < 2) continue;

                for (const col of speciesCols) {
                    const speciesVals = ctIndices
                        ? ctIndices.map(i => speciesFiltered[col][i])
                        : speciesFiltered[col];

                    const corr = spearmanCorr(humanVals, speciesVals);
                    const species = col.replace(/^lnlratio_/, "");
                    tsvRows.push(`${species}\t${cancerType}\t${corr}`);
                }
            }
        }

        updateResults(tsvRows.join("\n"));
        setLoadingStatus("");
        setRunInfo(`Computed correlations for ${matchedGenes.size} gene${matchedGenes.size !== 1 ? "s" : ""} across ${speciesCount} species.`);
        setIsCalculating(false);
    }

    function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => setGenes(reader.result as string);
        reader.onerror = () => window.alert("Failed to read file.");
        reader.readAsText(file);
        e.target.value = "";
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <h2 style={{ marginTop: 0, marginBottom: "8px" }}>Gene Input</h2>
            <p style={{ marginTop: 0, color: "#4d5b77" }}>
                Enter one gene name per line. Leave blank to use all genes.
            </p>

            <textarea
                value={genes}
                onChange={(e) => setGenes(e.target.value)}
                placeholder={`TP53\nBRCA1\nEGFR\nAPOE\nVEGFA`}
                style={{
                    width: "100%",
                    flex: 1,
                    minHeight: "150px",
                    padding: "14px",
                    fontFamily: "monospace",
                    fontSize: "0.95rem",
                    background: "#f7f9fc",
                    color: "#172033",
                    border: "1px solid #b8c5d6",
                    borderRadius: "12px",
                    resize: "none",
                    boxSizing: "border-box",
                }}
            />

            <input
                type="file"
                ref={fileInputRef}
                accept=".txt,.tsv,.csv"
                onChange={handleFileUpload}
                style={{ display: "none" }}
            />

            <div style={{ marginTop: "14px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                <button
                    onClick={calculateCorrelations}
                    disabled={isCalculating || !tablesReady}
                    title={!tablesReady ? loadingStatus : undefined}
                    style={{
                        background: "#1f4fd1",
                        color: "white",
                        border: "none",
                        padding: "11px 18px",
                        borderRadius: "10px",
                        fontWeight: 700,
                        cursor: (isCalculating || !tablesReady) ? "not-allowed" : "pointer",
                        opacity: (isCalculating || !tablesReady) ? 0.7 : 1,
                    }}
                >
                    {isCalculating ? "Calculating..." : "Run Analysis"}
                </button>

                <button
                    onClick={() => setGenes("")}
                    disabled={isCalculating}
                    style={{
                        background: "#e8eef8",
                        color: "#17305f",
                        border: "1px solid #c7d4ea",
                        padding: "11px 18px",
                        borderRadius: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                    }}
                >
                    Clear
                </button>

                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCalculating}
                    style={{
                        background: "#787878",
                        color: "#000000",
                        border: "1px solid #c7d4ea",
                        padding: "11px 18px",
                        borderRadius: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                    }}
                >
                    Upload File
                </button>

                {loadingStatus && (
                    <span style={{ color: "#4d5b77", fontSize: "0.9rem" }}>{loadingStatus}</span>
                )}
            </div>

            {runInfo && (
                <p style={{ marginTop: "12px", marginBottom: 0, color: "#44705a", fontSize: "0.9rem", fontWeight: 600 }}>
                    ✓ {runInfo}
                </p>
            )}
        </div>
    );
}
