import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

interface FraudChartProps {
  safeCount: number;
  suspiciousCount: number;
  fraudCount: number;
  dailyData: { date: string; fraud: number; safe: number }[];
}

export default function FraudChart({ safeCount, suspiciousCount, fraudCount, dailyData }: FraudChartProps) {
  const readDarkMode = () => typeof window !== "undefined" && (document.documentElement.classList.contains("theme-dark") || (!document.documentElement.classList.contains("theme-light") && window.matchMedia("(prefers-color-scheme: dark)").matches));
  const [isDarkMode, setIsDarkMode] = useState(readDarkMode);

  useEffect(() => {
    const handleThemeChange = () => setIsDarkMode(readDarkMode());
    window.addEventListener("fraudshield-theme-change", handleThemeChange);
    handleThemeChange();
    return () => window.removeEventListener("fraudshield-theme-change", handleThemeChange);
  }, []);

  const chartText = isDarkMode ? "#EDE7DE" : "#272A2E";
  const chartMutedText = isDarkMode ? "#9DA4AF" : "#666F7A";
  const chartGrid = isDarkMode ? "rgba(180, 168, 148, 0.25)" : "rgba(216, 211, 200, 0.6)";
  const chartSurface = isDarkMode ? "#1A1D23" : "#FAF9F5";

  const doughnutData = {
    labels: ["Safe", "Suspicious", "Fraud"],
    datasets: [
      {
        data: [safeCount, suspiciousCount, fraudCount],
        backgroundColor: ["#2D4A36", "#7A541E", "#7A2E2E"],
        borderColor: chartSurface,
        borderWidth: 2,
      },
    ],
  };

  const lineData = {
    labels: dailyData.map((d) => d.date),
    datasets: [
      {
        label: "Fraudulent Flags",
        data: dailyData.map((d) => d.fraud),
        borderColor: "#7A2E2E",
        backgroundColor: "rgba(122, 46, 46, 0.08)",
        fill: true,
        tension: 0.2,
        pointBackgroundColor: "#7A2E2E",
        pointRadius: 3,
      },
      {
        label: "Standard Clearance",
        data: dailyData.map((d) => d.safe),
        borderColor: "#34383D",
        backgroundColor: "rgba(52, 56, 61, 0.05)",
        fill: true,
        tension: 0.2,
        pointBackgroundColor: "#34383D",
        pointRadius: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: chartText, font: { family: "JetBrains Mono", size: 11 } } },
    },
    scales: {
      x: { ticks: { color: chartMutedText, font: { family: "JetBrains Mono", size: 10 } }, grid: { color: chartGrid } },
      y: { ticks: { color: chartMutedText, font: { family: "JetBrains Mono", size: 10 } }, grid: { color: chartGrid } },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="lg:col-span-2 editorial-card p-5"
      >
        <div className="flex items-center justify-between mb-4 border-b border-border pb-2.5">
          <h3 className="text-sm font-editorial font-bold text-foreground tracking-tight">Temporal Anomaly Trajectory (7 Days)</h3>
          <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border">Daily Run</span>
        </div>
        <div className="h-60">
          <Line data={lineData} options={chartOptions} />
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="editorial-card p-5"
      >
        <div className="flex items-center justify-between mb-4 border-b border-border pb-2.5">
          <h3 className="text-sm font-editorial font-bold text-foreground tracking-tight">Risk Distribution</h3>
          <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border">Total Ingest</span>
        </div>
        <div className="h-60 flex items-center justify-center">
          <Doughnut
            data={doughnutData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "bottom", labels: { color: chartText, boxWidth: 10, font: { family: "JetBrains Mono", size: 10 } } },
              },
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
