import { useEffect, useMemo, useState } from "react";
import Plot from "react-plotly.js";

type corrType = {
  cancer_type: string,
  species: string, 
  correlation: number
};

export default function CancerPlot() {
  const [rows, setRows] = useState([]);
  const [selectedCancer, setSelectedCancer] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${import.meta.env.BASE_URL}data/correlations.json`);
        if (!response.ok) {
          throw new Error(`Failed to load data: ${response.status}`);
        }

        console.log(response);
        const json = await response.json();
        setRows(json.data);

        const uniqueCancers = [...new Set<string>(json.map((d: corrType ) => d.cancer_type))].sort();
        if (uniqueCancers.length > 0) {
          setSelectedCancer(uniqueCancers[0]);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unkonwn");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const cancerOptions = useMemo(() => {
    return [...new Set<string>(rows.map((d: corrType) => d.cancer_type))].sort();
  }, [rows]);

  const filteredData = useMemo(() => {
    return rows
      .filter((d: corrType) => d.cancer_type === selectedCancer)
      .sort((a: corrType, b: corrType) => Number(b.correlation) - Number(a.correlation));
  }, [rows, selectedCancer]);

  const plotData = useMemo<Plotly.Data[]>(() => {
    return [
      {
        x: filteredData.map((d: corrType) => d.species),
        y: filteredData.map((d: corrType) => Number(d.correlation)),
        text: filteredData.map(
          (d: corrType) =>
            `${d.species}<br>Correlation: ${Number(d.correlation).toFixed(4)}`
        ),
        hoverinfo: "text" as const,
        mode: "markers" as const,
        type: "scatter" as const,
        marker: {
          size: 10,
        },
      },
    ];
  }, [filteredData]);

  if (loading) {
    return <p>Loading correlation data...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <section style={{ width: "100%" }}>
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="cancer-select" style={{ marginRight: "0.5rem" }}>
          Cancer type:
        </label>
        <select
          id="cancer-select"
          value={selectedCancer}
          onChange={(e) => setSelectedCancer(e.target.value)}
        >
          {cancerOptions.map((cancer) => (
            <option key={cancer} value={cancer}>
              {cancer}
            </option>
          ))}
        </select>
      </div>

      <Plot
        data={plotData}
        layout={{
          title: {text: `Spearman Correlation for ${selectedCancer}`},
          xaxis: {
            title: {text: "Species (Ordered by Correlation)"},
            tickangle: 90,
            automargin: true,
          },
          yaxis: {
            title: {text: "Spearman Correlation"},
          },
          margin: {
            l: 70,
            r: 20,
            t: 60,
            b: 180,
          },
          paper_bgcolor: "white",
          plot_bgcolor: "white",
          showlegend: false,
        }}
        style={{ width: "100%", height: "700px" }}
        config={{ responsive: true }}
        useResizeHandler
      />
    </section>
  );
}