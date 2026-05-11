import { useState, useEffect, useMemo, lazy, Suspense } from "react";

import CorrelationList from "./CorrelationList";
import CorrelationCalculator from "./CorrelationCalculator";
import Footer from "./Footer";

const GraphView = lazy(() => import("./GraphView"));

const CANCER_TYPES = [
  "all", "bladder", "breast", "central nervous system", "colon", "colorectal",
  "endometrial", "gastric", "glioma", "head and neck", "hepatocellular",
  "intestine", "kidney", "leukaemia", "liver", "lung", "lymphoma", "melanoma",
  "mesothelioma", "oesophagus", "other tumour types", "ovarian", "paediatric",
  "pancreas", "prostate", "rare other tumour types", "renal", "sarcoma", "skin",
  "small intestine", "soft tissue sarcoma", "testicular", "thyroid", "urothelial", "uterine",
];

export default function App() {
  const [selectedCancerType, setSelectedCancerType] = useState<string>("all");
  const [resultTSV, setResultTSV] = useState<string>("");
  const [primateSpecies, setPrimateSpecies] = useState<Set<string>>(new Set());

  const availableCancerTypes = useMemo(() => {
    if (!resultTSV) return ["all"];
    const types = new Set<string>();
    resultTSV.split("\n").forEach(line => {
      const parts = line.trim().split("\t");
      if (parts[1] && !isNaN(Number(parts[2]))) types.add(parts[1]);
    });
    return CANCER_TYPES.filter(ct => types.has(ct));
  }, [resultTSV]);

  useEffect(() => {
    if (!availableCancerTypes.includes(selectedCancerType)) {
      setSelectedCancerType("all");
    }
  }, [availableCancerTypes]);

  useEffect(() => {
    const loadData = async () => {
      const res = await fetch("/PanmammalianWebpage/data/correlations.tsv");
      setResultTSV(await res.text());
    };
    loadData();
  }, []);

  useEffect(() => {
    async function loadTaxonomy() {
      const res = await fetch("/PanmammalianWebpage/data/sp_genus_family_order.txt");
      const text = await res.text();
      const primates = new Set(
        text.split("\n")
          .map(line => line.trim())
          .filter(line => line.endsWith("\tPrimates"))
          .map(line => line.split("\t")[0])
      );
      setPrimateSpecies(primates);
    }
    loadTaxonomy();
  }, []);

  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid #c7d2df",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 4px 16px rgba(20, 30, 50, 0.07)",
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#eef2f7",
        minHeight: "100vh",
        padding: "32px 24px",
        color: "#172033",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>

        <header style={{ ...cardStyle, marginBottom: "24px" }}>
          <h1 style={{ margin: "0 0 6px 0", fontSize: "1.9rem", letterSpacing: "-0.5px" }}>
            Panmammalian Gene Similarity Server
          </h1>
          <p style={{ margin: 0, color: "#44506a", fontSize: "1rem" }}>
            Submit a gene list, compare it against reference species, and rank species by Spearman correlation similarity.
          </p>
        </header>

        {/* Left column: calculator  |  Right column: results */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            alignItems: "stretch",
          }}
        >
          <section style={{ ...cardStyle, display: "flex", flexDirection: "column" }}>
            <CorrelationCalculator updateResults={setResultTSV} />
          </section>

          <section style={cardStyle}>
            <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ marginTop: 0, marginBottom: "4px" }}>Ranked Species Results</h2>
                <p style={{ margin: 0, color: "#4d5b77", fontSize: "0.9rem" }}>
                  Ranked by descending Spearman correlation.
                </p>
              </div>
              <button
                onClick={() => {
                  if (!resultTSV) return;
                  const blob = new Blob([resultTSV], { type: "text/tab-separated-values" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "panmammalian_correlations.tsv";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                disabled={!resultTSV}
                style={{
                  background: "#e8eef8",
                  color: "#17305f",
                  border: "1px solid #c7d4ea",
                  padding: "7px 14px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  cursor: resultTSV ? "pointer" : "not-allowed",
                  fontSize: "0.85rem",
                  whiteSpace: "nowrap",
                  opacity: resultTSV ? 1 : 0.5,
                  flexShrink: 0,
                  marginLeft: "12px",
                }}
              >
                ↓ Download TSV
              </button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Cancer type</span>
                <select
                  value={selectedCancerType}
                  onChange={e => setSelectedCancerType(e.target.value)}
                  style={{
                    padding: "7px 10px",
                    borderRadius: "8px",
                    border: "1px solid #b8c5d6",
                    background: "#f7f9fc",
                    color: "#172033",
                    fontSize: "0.9rem",
                  }}
                >
                  {availableCancerTypes.map(ct => (
                    <option key={ct} value={ct}>{ct}</option>
                  ))}
                </select>
              </label>
            </div>

            <CorrelationList
              resultsTSV={resultTSV}
              selected_cancer={selectedCancerType}
              primateSpecies={primateSpecies}
            />
          </section>
        </div>

        {/* Graph view — full width below the two columns */}
        <div style={{ marginTop: "24px" }}>
          <Suspense fallback={
            <div style={{ ...cardStyle, padding: "40px", textAlign: "center", color: "#4d5b77" }}>
              Loading charts...
            </div>
          }>
            <GraphView
              resultsTSV={resultTSV}
              selectedCancer={selectedCancerType}
              primateSpecies={primateSpecies}
            />
          </Suspense>
        </div>

      </div>
      <Footer />
    </div>
  );
}
