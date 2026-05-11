import Plot from "react-plotly.js";
import { useMemo, useState, useEffect } from "react";

type CorrRow = {
    species: string;
    cancer_type: string;
    correlation: number;
}

type GraphViewProps = {
    resultsTSV: string;
    selectedCancer: string;
    primateSpecies: Set<string>;
}

export default function GraphView({ resultsTSV, selectedCancer, primateSpecies }: GraphViewProps) {
    const [chartType, setChartType] = useState<"dotplot" | "heatmap">("dotplot");
    const [excludePrimates, setExcludePrimates] = useState(true);
    const [dotCancerType, setDotCancerType] = useState(selectedCancer);

    const allData = useMemo<CorrRow[]>(() => {
        if (!resultsTSV) return [];
        return resultsTSV
            .split("\n")
            .map(line => {
                const parts = line.trim().split("\t");
                return { species: parts[0], cancer_type: parts[1], correlation: Number(parts[2]) };
            })
            .filter(d => d.species && d.cancer_type && !isNaN(d.correlation));
    }, [resultsTSV]);

    const availableCancerTypes = useMemo(
        () => [...new Set(allData.map(d => d.cancer_type))].sort(),
        [allData]
    );

    // Keep dotCancerType valid when data changes
    useEffect(() => {
        if (availableCancerTypes.length > 0 && !availableCancerTypes.includes(dotCancerType)) {
            setDotCancerType(availableCancerTypes.includes("all") ? "all" : availableCancerTypes[0]);
        }
    }, [availableCancerTypes, dotCancerType]);

const filteredData = useMemo(() =>
        excludePrimates ? allData.filter(d => !primateSpecies.has(d.species)) : allData,
        [allData, excludePrimates, primateSpecies]
    );

    const dotPlotData = useMemo(() => {
        const rows = filteredData
            .filter(d => d.cancer_type === dotCancerType)
            .sort((a, b) => a.correlation - b.correlation);
        return {
            x: rows.map(d => d.correlation),
            y: rows.map(d => d.species.replace(/_/g, " ")),
            colors: rows.map(d => d.correlation),
        };
    }, [filteredData, dotCancerType]);

    const heatmapData = useMemo(() => {
        // Sort species by "all" correlation descending; fall back to mean across types
        const allCorrRows = filteredData.filter(d => d.cancer_type === "all");
        let sortedSpecies: string[];
        if (allCorrRows.length > 0) {
            sortedSpecies = [...allCorrRows]
                .sort((a, b) => b.correlation - a.correlation)
                .map(d => d.species);
        } else {
            const sums = new Map<string, { sum: number; count: number }>();
            filteredData.forEach(d => {
                const curr = sums.get(d.species) ?? { sum: 0, count: 0 };
                sums.set(d.species, { sum: curr.sum + d.correlation, count: curr.count + 1 });
            });
            sortedSpecies = [...sums.entries()]
                .map(([sp, { sum, count }]) => ({ sp, mean: sum / count }))
                .sort((a, b) => b.mean - a.mean)
                .map(d => d.sp);
        }

        // Columns: all cancer types except "all"; fall back to ["all"] if none exist
        const cols = availableCancerTypes.filter(ct => ct !== "all");
        const activeCols = cols.length > 0 ? cols : ["all"];

        const lookup = new Map<string, number>();
        filteredData.forEach(d => lookup.set(`${d.species}|${d.cancer_type}`, d.correlation));

        const z = sortedSpecies.map(sp =>
            activeCols.map(ct => lookup.get(`${sp}|${ct}`) ?? null)
        );

        return { x: activeCols, y: sortedSpecies.map(s => s.replace(/_/g, " ")), z };
    }, [filteredData, availableCancerTypes]);

    const noData = allData.length === 0;
    const noDotData = dotPlotData.x.length === 0;

    const toggleBtn = (label: string, type: "dotplot" | "heatmap") => (
        <button
            onClick={() => setChartType(type)}
            style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: "none",
                fontWeight: 700,
                cursor: "pointer",
                background: chartType === type ? "#1f4fd1" : "#e8eef8",
                color: chartType === type ? "white" : "#17305f",
            }}
        >
            {label}
        </button>
    );

    return (
        <section
            style={{
                background: "#ffffff",
                border: "1px solid #c7d2df",
                borderRadius: "18px",
                padding: "24px",
                boxShadow: "0 4px 16px rgba(20, 30, 50, 0.07)",
            }}
        >
            <h2 style={{ marginTop: 0, marginBottom: "12px" }}>Graph Results</h2>

            {noData ? (
                <p style={{ color: "#4d5b77" }}>Run an analysis to see charts here.</p>
            ) : (
                <>
                    {/* Controls */}
                    <div style={{ display: "flex", gap: "10px", marginBottom: "14px", alignItems: "center", flexWrap: "wrap" }}>
                        {toggleBtn("Dot Plot", "dotplot")}
                        {toggleBtn("Heatmap", "heatmap")}
                        <label style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "8px", fontSize: "0.9rem", cursor: "pointer", userSelect: "none" }}>
                            <input
                                type="checkbox"
                                checked={excludePrimates}
                                onChange={e => setExcludePrimates(e.target.checked)}
                                style={{ width: "15px", height: "15px", cursor: "pointer" }}
                            />
                            <span style={{ color: "#172033", fontWeight: 600 }}>Exclude primates</span>
                        </label>
                    </div>

                    {/* Dot plot */}
                    {chartType === "dotplot" && (
                        <>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#4d5b77" }}>Cancer type:</span>
                                <select
                                    value={dotCancerType}
                                    onChange={e => setDotCancerType(e.target.value)}
                                    style={{
                                        padding: "5px 10px",
                                        borderRadius: "8px",
                                        border: "1px solid #b8c5d6",
                                        background: "#f7f9fc",
                                        color: "#172033",
                                        fontSize: "0.9rem",
                                    }}
                                >
                                    {availableCancerTypes.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                                </select>
                            </div>
                            {noDotData ? (
                                <p style={{ color: "#4d5b77" }}>No data for cancer type "{dotCancerType}".</p>
                            ) : (
                                <Plot
                                    data={[{
                                        type: "scatter",
                                        mode: "markers",
                                        x: dotPlotData.x,
                                        y: dotPlotData.y,
                                        marker: {
                                            size: 8,
                                            color: dotPlotData.colors,
                                            colorscale: "RdBu",
                                            reversescale: true,
                                            showscale: true,
                                            colorbar: { title: { text: "ρ" }, thickness: 14 },
                                        },
                                        hovertemplate: "<b>%{y}</b><br>ρ = %{x:.4f}<extra></extra>",
                                    }]}
                                    layout={{
                                        title: { text: `All species — ${dotCancerType}`, font: { size: 14 } },
                                        xaxis: { title: { text: "Spearman correlation (ρ)" }, zeroline: true, autorange: "reversed" },
                                        yaxis: { showticklabels: false, showgrid: false, ticks: "" },
                                        margin: { l: 10, r: 80, t: 40, b: 50 },
                                        height: 500,
                                        paper_bgcolor: "transparent",
                                        plot_bgcolor: "#f7f9fc",
                                    }}
                                    style={{ width: "100%" }}
                                    config={{ responsive: true, displayModeBar: false }}
                                    useResizeHandler
                                />
                            )}
                        </>
                    )}

                    {/* Heatmap */}
                    {chartType === "heatmap" && (
                        <Plot
                            data={[{
                                type: "heatmap",
                                x: heatmapData.x,
                                y: heatmapData.y,
                                z: heatmapData.z,
                                colorscale: "RdBu",
                                reversescale: true,
                                colorbar: { title: { text: "ρ" }, thickness: 14 },
                                hovertemplate: "<b>%{y}</b><br>%{x}<br>ρ = %{z:.4f}<extra></extra>",
                            }]}
                            layout={{
                                xaxis: { tickangle: -45, tickfont: { size: 11 } },
                                yaxis: { showticklabels: false, ticks: "", showgrid: false },
                                margin: { l: 10, r: 80, t: 20, b: 140 },
                                height: 550,
                                paper_bgcolor: "transparent",
                                plot_bgcolor: "#f7f9fc",
                            }}
                            style={{ width: "100%" }}
                            config={{ responsive: true, displayModeBar: false }}
                            useResizeHandler
                        />
                    )}
                </>
            )}
        </section>
    );
}
