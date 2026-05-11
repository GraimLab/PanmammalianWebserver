import { useEffect, useState, useMemo } from "react";
import CorrelationListRow from "./CorrelationListRow";

type corr_type = {
    species: string,
    cancer_type: string,
    correlation: number
}

type CorrelationListProps = {
    resultsTSV: string;
    selected_cancer: string;
    primateSpecies: Set<string>;
};

export default function CorrelationList({ resultsTSV, selected_cancer, primateSpecies }: CorrelationListProps) {
    const [allData, setAllData] = useState<corr_type[]>([]);
    const [excludePrimates, setExcludePrimates] = useState(true);

    useEffect(() => {
        const results: corr_type[] = resultsTSV
            .split("\n")
            .map(line => {
                const vals = line.trim().split("\t");
                return { species: vals[0], cancer_type: vals[1], correlation: Number(vals[2]) };
            });
        setAllData(results);
    }, [resultsTSV]);

    const data = useMemo(() => {
        return allData
            .filter(d => d.cancer_type === selected_cancer)
            .filter(d => !excludePrimates || !primateSpecies.has(d.species))
            .sort((a, b) => b.correlation - a.correlation);
    }, [allData, selected_cancer, excludePrimates, primateSpecies]);

    return (
        <div>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", cursor: "pointer", userSelect: "none" }}>
                <input
                    type="checkbox"
                    checked={excludePrimates}
                    onChange={e => setExcludePrimates(e.target.checked)}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <span style={{ fontWeight: 600, color: "#172033" }}>Exclude primates</span>
            </label>

            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {resultsTSV === "" ? (
                    <div style={{ padding: "20px", textAlign: "center", color: "#4d5b77" }}>
                        Loading results...
                    </div>
                ) : data.length === 0 ? (
                    <div style={{ padding: "20px", textAlign: "center", color: "#4d5b77" }}>
                        No results for the current filters.
                    </div>
                ) : (
                    data.map((d, i) => (
                        <CorrelationListRow key={d.species + d.cancer_type} d={d} i={i} />
                    ))
                )}
            </div>
        </div>
    );
}
