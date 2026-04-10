import React from "react";
import {useEffect, useState, useMemo} from "react";

type corr_type = {
    species: string,
    cancer_type: string,
    correlation: number
}

type CorrelationListProps = {
  selected_cancer: string;
};

export default function CorrelationList({ selected_cancer } : CorrelationListProps) {
    const data_path = "/PanmammalianWebpage/data/correlations.tsv";
    const [allData, setAllData] = useState<Array<corr_type>>([]);


    useEffect(() => {
        async function loadData() {
            const res = await fetch(data_path);
            const results: Array<corr_type> = (await res.text())
                            .split("\n")
                            .map((line) => {
                                const vals: Array<string> = line.trim().split("\t");
                                
                                return {
                                    species: vals[0],
                                    cancer_type: vals[1], 
                                    correlation: Number(vals[2])
                                }
                            });
            setAllData(results);
        }

        loadData();
    }, [data_path]);
    

    const data = useMemo(() => {
      return allData
        .filter((d) => d.cancer_type === selected_cancer)
        .sort((a, b) => b.correlation - a.correlation);
    }, [allData, selected_cancer]);

    return (
        <div style={{maxHeight: "500px", overflowY: "auto", padding: "10px"}}>
          {
            data?.length === 0 ? (
              <div style={{padding: "20px", textAlign: "center"}}>
                Loading results...
              </div>
            ) : (
              data.map((d: corr_type, i: number) => {
                return (
                  <div
                    key={d.species + d.cancer_type}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px",
                      marginBottom: "10px",
                      border: "1px solid #d0d7e2",
                      borderRadius: "10px",
                      background: "#f7f9fc"
                    }}
                  >

                    {/* Rank */}
                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: "1.2rem",
                        width: "40px",
                        textAlign: "center"
                      }}
                    >
                      #{i + 1}
                    </div>
                  
                    {/* Correlation score */}
                    <div
                      style={{
                        background: "#e6edff",
                        padding: "6px 10px",
                        borderRadius: "6px",
                        fontWeight: 600,
                        minWidth: "70px",
                        textAlign: "center"
                      }}
                    >
                      {d.correlation.toFixed(3)}
                    </div>
                  
                    {/* Species info */}
                    <div style={{flex: 1}}>
                      <div style={{ fontWeight: 600 }}>
                        <a
                          href={"https://en.wikipedia.org/wiki/" + d.species.replace(/\s+/g, "_")}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#1f4fd1", textDecoration: "none" }}
                        >
                          {d.species}
                        </a>
                      </div>
                    </div>

                  </div>
                )
              })
            )
          }
        </div>
    )
}
