"use client";

import { useRouter, usePathname } from "next/navigation";
import { FaChevronRight, FaPrint } from "react-icons/fa";
import styles from "../../relatorios/relatorios.module.css";

const RELATORIO_LINKS = [
  {
    label: "Geral",
    href: "/relatorios",
    desc: "Visão consolidada do sistema",
    themeColor: "#78909C",
    themeShadow: "rgba(120, 144, 156, 0.15)",
    themeBg: "#ECEFF1",
  },
  {
    label: "Estoque",
    href: "/relatorios/estoque",
    desc: "Produtos e movimentações",
    themeColor: "#FFA726",
    themeShadow: "rgba(255, 167, 38, 0.15)",
    themeBg: "#FFF3E0",
  },
  {
    label: "Retiradas",
    href: "/relatorios/retiradas",
    desc: "Histórico de retiradas",
    themeColor: "#4CAF50",
    themeShadow: "rgba(76, 175, 80, 0.15)",
    themeBg: "#E8F5E9",
  },
  {
    label: "Doações",
    href: "/relatorios/doacoes",
    desc: "Histórico de doações",
    themeColor: "#42A5F5",
    themeShadow: "rgba(66, 165, 245, 0.15)",
    themeBg: "#E3F2FD",
  },
  {
    label: "Beneficiários",
    href: "/relatorios/beneficiarios",
    desc: "Status dos Beneficiários",
    themeColor: "#AB47BC",
    themeShadow: "rgba(171, 71, 188, 0.15)",
    themeBg: "#F3E5F5",
  },
];

export default function RelatoriosNav({ titulo }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      <div className={styles.printHeader}>
        <img src="/logo-sanem.svg" alt="Logo SANEM" className={styles.printLogo} />
        <h1 className={styles.printTitle}>{titulo || "Relatório do Sistema"}</h1>
        <div className={styles.printDate}>
          Gerado em: {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR")}
        </div>
      </div>

      <div className={`${styles.pageHeader} ${styles.hideOnPrint}`}>
        <h1 className={styles.titulo}>Relatórios</h1>
        <div className={styles.decoracao} />
      </div>

      <nav className={styles.relatoriosNav}>
        {RELATORIO_LINKS.map((link) => {
          const ativo = pathname === link.href;

          return (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className={styles.navCard}
              style={{
                "--theme-color": link.themeColor,
                "--theme-shadow": link.themeShadow,
                borderColor: ativo ? link.themeColor : "",
                boxShadow: ativo ? `0 2px 12px ${link.themeShadow}` : "",
                background: ativo ? link.themeBg : "#fff"
              }}
            >
              <span className={styles.navCardLabel}>{link.label}</span>
              <span className={styles.navCardDesc}>{link.desc}</span>
              <FaChevronRight className={styles.navCardArrow} />
            </button>
          );
        })}
      </nav>

      <hr className={styles.divider} />

      {titulo && (
        <div className={styles.subHeaderContainer}>
          <div className={styles.pageHeader} style={{ marginBottom: 0 }}>
            <h2 className={styles.titulo}>
              {titulo}
            </h2>
            <div className={styles.decoracao} />
          </div>

          <button
            className={styles.printButton}
            onClick={() => window.print()}
            title="Imprimir este relatório"
          >
            <FaPrint /> Imprimir
          </button>
        </div>
      )}
    </>
  );
}
