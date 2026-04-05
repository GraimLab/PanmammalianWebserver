import { useState } from "react";

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
  const [results, setResults] = useState<Result[]>([]);

  function runMockAnalysis() {
    setResults([
      {
        rank: 1,
        species: "Pan troglodytes",
        commonName: "Chimpanzee",
        correlation: 0.982,
        genesMatched: 1842,
        taxonomicGroup: "Primate",
        summary: "Closest match in the current reference set with very high overlap across the submitted genes.",
      },
      {
        rank: 2,
        species: "Gorilla gorilla",
        commonName: "Western Gorilla",
        correlation: 0.971,
        genesMatched: 1798,
        taxonomicGroup: "Primate",
        summary: "Strong transcriptomic similarity and high shared gene coverage.",
      },
      {
        rank: 3,
        species: "Pongo abelii",
        commonName: "Sumatran Orangutan",
        correlation: 0.948,
        genesMatched: 1713,
        taxonomicGroup: "Primate",
        summary: "High-ranking primate species with substantial overlap in matched markers.",
      },
      {
        rank: 4,
        species: "Macaca mulatta",
        commonName: "Rhesus Macaque",
        correlation: 0.903,
        genesMatched: 1625,
        taxonomicGroup: "Primate",
        summary: "Moderately strong similarity with broad comparative genomics usage.",
      },
      {
        rank: 5,
        species: "Mus musculus",
        commonName: "House Mouse",
        correlation: 0.812,
        genesMatched: 1404,
        taxonomicGroup: "Rodent",
        summary: "Lower than primates, but still a useful mammalian comparison model.",
      },
      {
        rank: 6,
        species: "Canis lupus familiaris",
        commonName: "Dog",
        correlation: 0.784,
        genesMatched: 1322,
        taxonomicGroup: "Carnivore",
        summary: "Mid-range similarity with decent overlap in conserved genes.",
      },
      {
        rank: 7,
        species: "Bos taurus",
        commonName: "Cow",
        correlation: 0.751,
        genesMatched: 1279,
        taxonomicGroup: "Ungulate",
        summary: "Useful distant mammalian reference with moderate signal retention.",
      },
    ]);
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
            by Pearson correlation similarity.
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
                    setResults([]);
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
                Species are ranked by descending Pearson correlation similarity.
              </p>
            </div>

            {results.length === 0 ? (
              <div
                style={{
                  border: "1px dashed #bcc9da",
                  borderRadius: "14px",
                  padding: "28px",
                  background: "#f7f9fc",
                  color: "#52617f",
                }}
              >
                No results yet. Run an analysis to populate the ranked list.
              </div>
            ) : (
              <div
                style={{
                  maxHeight: "640px",
                  overflowY: "auto",
                  paddingRight: "6px",
                  display: "grid",
                  gap: "14px",
                }}
              >
                {results.map((r) => (
                  <div
                    key={r.rank}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "72px 120px 1fr",
                      gap: "14px",
                      alignItems: "stretch",
                    }}
                  >
                    <div
                      style={{
                        background: "#1d2b45",
                        color: "white",
                        borderRadius: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "1.25rem",
                        boxShadow: "0 4px 14px rgba(19, 31, 53, 0.18)",
                      }}
                    >
                      #{r.rank}
                    </div>

                    <div
                      style={{
                        background: "#e9f0ff",
                        color: "#14346f",
                        border: "1px solid #c9d8fb",
                        borderRadius: "14px",
                        padding: "16px 12px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.03em" }}>
                        SIMILARITY
                      </div>
                      <div style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: "4px" }}>
                        {r.correlation.toFixed(3)}
                      </div>
                    </div>

                    <div
                      style={{
                        background: "#f8fbff",
                        border: "1px solid #cdd9e8",
                        borderRadius: "14px",
                        padding: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "16px",
                          alignItems: "start",
                          marginBottom: "10px",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "1.05rem", fontWeight: 800 }}>
                            {r.commonName}
                          </div>
                          <div style={{ color: "#4f5d79", fontStyle: "italic", marginTop: "2px" }}>
                            {r.species}
                          </div>
                        </div>

                        <div
                          style={{
                            background: "#dde8f7",
                            color: "#234067",
                            borderRadius: "999px",
                            padding: "6px 10px",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {r.taxonomicGroup}
                        </div>
                      </div>

                      <p style={{ margin: "0 0 12px 0", color: "#44506a", lineHeight: 1.45 }}>
                        {r.summary}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            background: "#ffffff",
                            border: "1px solid #d6e0ec",
                            borderRadius: "10px",
                            padding: "8px 10px",
                            fontSize: "0.9rem",
                          }}
                        >
                          <strong>Genes matched:</strong> {r.genesMatched.toLocaleString()}
                        </div>
                        <div
                          style={{
                            background: "#ffffff",
                            border: "1px solid #d6e0ec",
                            borderRadius: "10px",
                            padding: "8px 10px",
                            fontSize: "0.9rem",
                          }}
                        >
                          <strong>Rank percentile:</strong> Top {Math.max(1, r.rank * 5)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}