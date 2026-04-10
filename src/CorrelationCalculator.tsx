import { useRef, useState } from "react";

export default function CorrelationCalculator() {
    const [genes, setGenes] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    function calculateCorrelations() {
        window.alert("NOT IMPLEMENTED YET ERROR!");
    }

    function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            const text = reader.result as string;
            setGenes(text);
        };
        reader.onerror = () => {
            window.alert("Failed to read file.");
        };
        reader.readAsText(file);
        e.target.value = "";
    }

    return (
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
                placeholder={`Gene - lnlratio\nTP53 1.32\nBRCA1 3.3\nEGFR 0.2\nMYC 0.01\nAPOE 2.3\nVEGFA 0.2`}
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

            <input
                type="file"
                ref={fileInputRef}
                accept=".txt,.tsv,.csv"
                onChange={handleFileUpload}
                style={{ display: "none" }}
            />

            <div style={{ marginTop: "14px", display: "flex", gap: "12px" }}>
                <button
                    onClick={calculateCorrelations}
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

                <button
                    onClick={() => fileInputRef.current?.click()}
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
            </div>
        </section>
    );
}