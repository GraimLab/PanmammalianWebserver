import { useState } from "react";

import CorrelationList from "./CorrelationList";

type Result = {
  rank: number;
  species: string;
  commonName: string;
  correlation: number;
  genesMatched: number;
  taxonomicGroup: string;
  summary: string;
};

export default function App() {
  const [genes, setGenes] = useState("");
  const [selectedCancerType, setSelectedCancerType] = useState<string>("all");

  function runMockAnalysis() {
  }

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#eef2f7",
        minHeight: "100vh",
        padding: "32px",
        color: "#172033",
      }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <header
          style={{
            background: "#ffffff",
            border: "1px solid #cfd8e3",
            borderRadius: "18px",
            padding: "24px 28px",
            boxShadow: "0 8px 24px rgba(20, 30, 50, 0.08)",
            marginBottom: "24px",
          }}
        >
          <h1 style={{ margin: "0 0 8px 0", fontSize: "2rem" }}>
            Panmammalian Gene Similarity Server
          </h1>
          <p style={{ margin: 0, color: "#44506a", fontSize: "1rem" }}>
            Submit a gene list, compare it against reference species, and rank species
            by Spearman correlation similarity.
          </p>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.05fr 0.95fr",
            gap: "24px",
            alignItems: "start",
          }}
        >
          <div style={{ display: "grid", gap: "24px" }}>
            <section
              style={{
                background: "#ffffff",
                border: "1px solid #c7d2df",
                borderRadius: "18px",
                padding: "22px",
                boxShadow: "0 8px 24px rgba(20, 30, 50, 0.07)",
              }}
            >
              <h2 style={{ marginTop: 0, marginBottom: "8px" }}>Gene Input</h2>
              <p style={{ marginTop: 0, color: "#4d5b77" }}>
                Enter one gene per line or paste a gene list directly.
              </p>

              <textarea
                value={genes}
                onChange={(e) => setGenes(e.target.value)}
                placeholder={`TP53
                                BRCA1
                                EGFR
                                MYC
                                APOE
                                VEGFA`}
                style={{
                  width: "100%",
                  height: "220px",
                  padding: "14px",
                  fontFamily: "monospace",
                  fontSize: "0.95rem",
                  background: "#f7f9fc",
                  color: "#172033",
                  border: "1px solid #b8c5d6",
                  borderRadius: "12px",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />

              <div style={{ marginTop: "14px", display: "flex", gap: "12px" }}>
                <button
                  onClick={runMockAnalysis}
                  style={{
                    background: "#1f4fd1",
                    color: "white",
                    border: "none",
                    padding: "11px 18px",
                    borderRadius: "10px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Run Analysis
                </button>

                <button
                  onClick={() => {
                    setGenes("");
                  }}
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
              </div>
            </section>

            <section
              style={{
                background: "#ffffff",
                border: "1px solid #c7d2df",
                borderRadius: "18px",
                padding: "22px",
                boxShadow: "0 8px 24px rgba(20, 30, 50, 0.07)",
              }}
            >
              <h2 style={{ marginTop: 0, marginBottom: "14px" }}>Analysis Settings</h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: "16px",
                }}
              >
                <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
                  <span>Reference Database</span>
                  <select
                    style={{
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: "1px solid #b8c5d6",
                      background: "#f7f9fc",
                    }}
                  >
                    <option>All Mammals</option>
                    <option>Primates</option>
                    <option>Vertebrates</option>
                  </select>
                </label>

                <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
                  <span>Max Results</span>
                  <input
                    type="number"
                    defaultValue={25}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: "1px solid #b8c5d6",
                      background: "#f7f9fc",
                    }}
                  />
                </label>

                <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
                  <span>Minimum Overlap</span>
                  <input
                    type="number"
                    defaultValue={100}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: "1px solid #b8c5d6",
                      background: "#f7f9fc",
                    }}
                  />
                </label>
              </div>
            </section>
          </div>

          <section
            style={{
              background: "#ffffff",
              border: "1px solid #c7d2df",
              borderRadius: "18px",
              padding: "22px",
              boxShadow: "0 8px 24px rgba(20, 30, 50, 0.07)",
            }}
          >
            <div style={{ marginBottom: "14px" }}>
              <h2 style={{ marginTop: 0, marginBottom: "8px" }}>Ranked Species Results</h2>
              <p style={{ margin: 0, color: "#4d5b77" }}>
                Species are ranked by descending Spearman correlation similarity.
              </p>
            </div>

            <div style={{ marginBottom: "16px", maxWidth: "280px" }}>
              <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
                <span>Cancer type</span>
                <select
                  value={selectedCancerType}
                  onChange={(e) => setSelectedCancerType(e.target.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid #b8c5d6",
                    background: "#f7f9fc",
                    color: "#172033",
                  }}
                >
                  <option value="all">all</option>
                  <option value="bladder">bladder</option>
                  <option value="breast">breast</option>
                  <option value="central nervous system">central nervous system</option>
                  <option value="colon">colon</option>
                  <option value="colorectal">colorectal</option>
                  <option value="endometrial">endometrial</option>
                  <option value="gastric">gastric</option>
                  <option value="glioma">glioma</option>
                  <option value="head and neck">head and neck</option>
                  <option value="hepatocellular">hepatocellular</option>
                  <option value="intestine">intestine</option>
                  <option value="kidney">kidney</option>
                  <option value="leukaemia">leukaemia</option>
                  <option value="liver">liver</option>
                  <option value="lung">lung</option>
                  <option value="lymphoma">lymphoma</option>
                  <option value="melanoma">melanoma</option>
                  <option value="mesothelioma">mesothelioma</option>
                  <option value="oesophagus">oesophagus</option>
                  <option value="other tumour types">other tumour types</option>
                  <option value="ovarian">ovarian</option>
                  <option value="paediatric">paediatric</option>
                  <option value="pancreas">pancreas</option>
                  <option value="prostate">prostate</option>
                  <option value="rare other tumour types">rare other tumour types</option>
                  <option value="renal">renal</option>
                  <option value="sarcoma">sarcoma</option>
                  <option value="skin">skin</option>
                  <option value="small intestine">small intestine</option>
                  <option value="soft tissue sarcoma">soft tissue sarcoma</option>
                  <option value="testicular">testicular</option>
                  <option value="thyroid">thyroid</option>
                  <option value="urothelial">urothelial</option>
                  <option value="uterine">uterine</option>
                </select>
              </label>
            </div>
            <CorrelationList selected_cancer={selectedCancerType}/>
          </section>
        </div>
      </div>
    </div>
  );
}