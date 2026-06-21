"use client";
import React, { useState, useEffect, useRef } from "react";
import MenuBar from "../components/menubar/menubar";
import Navigation from "../components/navegation/navegation";
import RelatoriosNav from "../components/relatoriosNav/RelatoriosNav";
import { useRouter } from "next/navigation";
import styles from "./relatorios.module.css";
import apiService from "../../services/api";
import {
  mapBeneficiaryFromBackend,
  mapItemFromBackend,
  mapDonationFromBackend,
} from "../../services/dataMapper";
import {
  FaBoxes,
  FaHandHoldingHeart,
  FaArrowDown,
  FaUsers,
  FaChevronRight,
} from "react-icons/fa";


const STATUS_META = {
  APPROVED: { label: "Aprovados",  color: "#4CAF50" },
  PENDING:  { label: "Pendentes",  color: "#FFA726" },
  REJECTED: { label: "Rejeitados", color: "#EF5350" },
};

function LineChart({ data, keys, colors, height = 220 }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(500);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const PAD = { top: 16, right: 8, bottom: 36, left: 36 };
  const W = width - PAD.left - PAD.right;
  const H = height - PAD.top - PAD.bottom;

  const allValues = data.flatMap(d => keys.map(k => d[k] ?? 0));
  const maxVal = Math.max(...allValues, 1);

  const xStep = W / Math.max(data.length - 1, 1);

  const toX = (i) => PAD.left + i * xStep;
  const toY = (v) => PAD.top + H - (v / maxVal) * H;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    v: Math.round(maxVal * f),
    y: toY(maxVal * f),
  }));

  const xInterval = Math.max(1, Math.floor(data.length / 7));
  const xLabels = data
    .map((d, i) => ({ label: d.dia, x: toX(i), show: i % xInterval === 0 || i === data.length - 1 }));

  const polyline = (key) =>
    data.map((d, i) => `${toX(i)},${toY(d[key] ?? 0)}`).join(" ");

  const [tip, setTip] = useState(null);

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left - PAD.left;
    const idx = Math.round(mx / xStep);
    if (idx >= 0 && idx < data.length) {
      setTip({ idx, x: toX(idx), d: data[idx] });
    }
  };

  return (
    <div ref={containerRef} style={{ width: "100%", position: "relative" }}>
      <svg
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTip(null)}
        style={{ display: "block", cursor: "crosshair" }}
      >
        {yTicks.map(({ v, y }) => (
          <g key={v}>
            <line x1={PAD.left} x2={PAD.left + W} y1={y} y2={y} stroke="#f0f0f0" strokeWidth={1} />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#aaa">{v}</text>
          </g>
        ))}

        {keys.map((key, ki) => (
          <polyline
            key={key}
            points={polyline(key)}
            fill="none"
            stroke={colors[ki]}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        {xLabels.filter(l => l.show).map(({ label, x }) => (
          <text key={x} x={x} y={PAD.top + H + 20} textAnchor="middle" fontSize={10} fill="#aaa">
            {label}
          </text>
        ))}

        {tip && (
          <>
            <line
              x1={tip.x} x2={tip.x}
              y1={PAD.top} y2={PAD.top + H}
              stroke="#ccc" strokeWidth={1} strokeDasharray="4 2"
            />
            {keys.map((key, ki) => (
              <circle key={key} cx={tip.x} cy={toY(tip.d[key] ?? 0)} r={4} fill={colors[ki]} />
            ))}
          </>
        )}
      </svg>

      {tip && (
        <div className={styles.tooltip}>
          <div className={styles.tooltipDate}>{tip.d.dia}</div>
          {keys.map((key, ki) => (
            <div key={key} className={styles.tooltipRow}>
              <span className={styles.tooltipDot} style={{ background: colors[ki] }} />
              <span>{key}:</span>
              <strong>{tip.d[key] ?? 0}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PieChart({ data, size = 180 }) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 20;
  const r = R * 0.55; // donut

  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  let cumAngle = -Math.PI / 2;
  const slices = data.map((d) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const start = cumAngle;
    cumAngle += angle;
    const end = cumAngle;
    return { ...d, start, end, angle };
  });

  const arc = (startA, endA, outerR, innerR) => {
    const cos = Math.cos, sin = Math.sin;
    const x1 = cx + outerR * cos(startA), y1 = cy + outerR * sin(startA);
    const x2 = cx + outerR * cos(endA),   y2 = cy + outerR * sin(endA);
    const x3 = cx + innerR * cos(endA),   y3 = cy + innerR * sin(endA);
    const x4 = cx + innerR * cos(startA), y4 = cy + innerR * sin(startA);
    const large = endA - startA > Math.PI ? 1 : 0;
    return `M${x1},${y1} A${outerR},${outerR},0,${large},1,${x2},${y2} L${x3},${y3} A${innerR},${innerR},0,${large},0,${x4},${y4} Z`;
  };

  const [hovered, setHovered] = useState(null);

  return (
    <svg width={size} height={size} style={{ display: "block", margin: "0 auto" }}>
      {slices.map((s, i) => {
        const isHovered = hovered === i;
        const scale = isHovered ? 1.05 : 1;
        const midA = (s.start + s.end) / 2;
        const dx = isHovered ? Math.cos(midA) * 6 : 0;
        const dy = isHovered ? Math.sin(midA) * 6 : 0;
        return (
          <path
            key={s.name}
            d={arc(s.start, s.end, R, r)}
            fill={s.color}
            transform={`translate(${dx},${dy})`}
            style={{ cursor: "pointer", transition: "transform 0.15s" }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            opacity={hovered !== null && !isHovered ? 0.7 : 1}
          />
        );
      })}
      {/* Label central */}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={22} fontWeight={700} fill="#222">
        {total}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize={11} fill="#aaa">
        total
      </text>
    </svg>
  );
}

export default function RelatoriosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState({ retiradas: 0, doacoes: 0, estoque: 0, beneficiarios: 0 });
  const [lineData, setLineData] = useState([]);
  const [pieData, setPieData] = useState([]);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [wrRaw, dnRaw, itRaw, bnRaw] = await Promise.allSettled([
        apiService.getWithdrawals(),
        apiService.getDonations(),
        apiService.getItems(),
        apiService.getBeneficiaries(),
      ]);

      const withdrawals   = wrRaw.status === "fulfilled" && Array.isArray(wrRaw.value) ? wrRaw.value : [];
      const donations     = dnRaw.status === "fulfilled" && Array.isArray(dnRaw.value)
        ? dnRaw.value.map(mapDonationFromBackend) : [];
      const items         = itRaw.status === "fulfilled" && Array.isArray(itRaw.value)
        ? itRaw.value.map(mapItemFromBackend) : [];
      const beneficiaries = bnRaw.status === "fulfilled" && Array.isArray(bnRaw.value)
        ? bnRaw.value.map(mapBeneficiaryFromBackend) : [];

      const estoqueTotal  = items.reduce((s, i) => s + (Number(i.quantidade) || 0), 0);
      const benefAtivos   = beneficiaries.filter(b => b.status === "APPROVED").length;
      const retiradasTotal = withdrawals.reduce((s, w) =>
        s + (w.items || []).reduce((a, i) => a + (i.quantity || 0), 0), 0);
      const doacoesTotal  = donations.reduce((s, d) =>
        s + (d.items || []).reduce((a, i) => a + (i.quantity || 0), 0), 0);

      setCards({ retiradas: retiradasTotal, doacoes: doacoesTotal, estoque: estoqueTotal, beneficiarios: benefAtivos });

      const today = new Date();
      const dias = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (29 - i));
        return d.toISOString().slice(0, 10);
      });

      const retPorDia = {};
      withdrawals.forEach(w => {
        const date = w.withdrawalDate?.slice(0, 10);
        if (!date) return;
        const q = (w.items || []).reduce((a, i) => a + (i.quantity || 0), 0);
        retPorDia[date] = (retPorDia[date] || 0) + q;
      });

      const donPorDia = {};
      donations.forEach(d => {
        const date = d.donationDate?.slice(0, 10);
        if (!date) return;
        const q = (d.items || []).reduce((a, i) => a + (i.quantity || 0), 0);
        donPorDia[date] = (donPorDia[date] || 0) + q;
      });

      setLineData(dias.map(dia => {
        const [, mes, dd] = dia.split("-");
        return { dia: `${dd}/${mes}`, Retiradas: retPorDia[dia] || 0, Recebidas: donPorDia[dia] || 0 };
      }));

      const statusCount = {};
      beneficiaries.forEach(b => {
        const s = b.status || "PENDING";
        statusCount[s] = (statusCount[s] || 0) + 1;
      });
      setPieData(
        Object.entries(statusCount).map(([status, value]) => ({
          name:  STATUS_META[status]?.label || status,
          value,
          color: STATUS_META[status]?.color || "#90A4AE",
        }))
      );
    } catch (err) {
      console.error("Erro ao carregar relatórios:", err);
    } finally {
      setLoading(false);
    }
  }

  const cardList = [
    { label: "Itens Retirados",      value: cards.retiradas,     icon: <FaArrowDown />,        color: "#4CAF50", bg: "#E8F5E9" },
    { label: "Itens Recebidos",      value: cards.doacoes,       icon: <FaHandHoldingHeart />, color: "#42A5F5", bg: "#E3F2FD" },
    { label: "Itens em Estoque",     value: cards.estoque,       icon: <FaBoxes />,            color: "#FFA726", bg: "#FFF3E0" },
    { label: "Beneficiários Ativos", value: cards.beneficiarios, icon: <FaUsers />,            color: "#AB47BC", bg: "#F3E5F5" },
  ];

  return (
    <div className={styles.containerGeral}>
      <MenuBar />
      <Navigation />

      <div className={styles.pageContent}>
        <RelatoriosNav titulo="Relatório Geral" />

        {/* Cards */}
        <div className={styles.cardsRow}>
          {cardList.map(card => (
            <div key={card.label} className={styles.card} style={{ borderTop: `4px solid ${card.color}` }}>
              <div className={styles.cardIcon} style={{ background: card.bg, color: card.color }}>
                {card.icon}
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.cardValue}>
                  {loading ? <span className={styles.skeleton} /> : card.value.toLocaleString("pt-BR")}
                </span>
                <span className={styles.cardLabel}>{card.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.chartsRow}>

          {/* Linha */}
          <div className={styles.chartBox}>
            <h3 className={styles.chartTitle}>Retiradas vs Recebidas por Dia</h3>
            <p className={styles.chartSub}>Quantidade de itens — últimos 30 dias</p>
            <div className={styles.chartLegend}>
              {[{ label: "Retiradas", color: "#4CAF50" }, { label: "Recebidas", color: "#42A5F5" }].map(l => (
                <span key={l.label} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: l.color }} />
                  {l.label}
                </span>
              ))}
            </div>
            {loading ? (
              <div className={styles.chartLoading}>Carregando...</div>
            ) : (
              <LineChart
                data={lineData}
                keys={["Retiradas", "Recebidas"]}
                colors={["#4CAF50", "#42A5F5"]}
                height={240}
              />
            )}
          </div>

          {/* Pizza */}
          <div className={styles.chartBox}>
            <h3 className={styles.chartTitle}>Status dos Beneficiários</h3>
            <p className={styles.chartSub}>Distribuição por situação cadastral</p>
            {loading ? (
              <div className={styles.chartLoading}>Carregando...</div>
            ) : pieData.length === 0 ? (
              <div className={styles.chartEmpty}>Nenhum dado disponível</div>
            ) : (
              <div className={styles.pieWrapper}>
                <PieChart data={pieData} size={180} />
                <ul className={styles.pieLegend}>
                  {pieData.map(entry => (
                    <li key={entry.name} className={styles.pieLegendItem}>
                      <span className={styles.pieDot} style={{ background: entry.color }} />
                      <span className={styles.pieName}>{entry.name}</span>
                      <span className={styles.pieValue}>{entry.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
