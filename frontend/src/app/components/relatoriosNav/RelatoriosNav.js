"use client";

import { useRouter, usePathname } from "next/navigation";
import { FaChevronRight } from "react-icons/fa";
import styles from "../../relatorios/relatorios.module.css";

const RELATORIO_LINKS = [
  {
    label: "Geral",
    href: "/relatorios",
    desc: "Visão consolidada do sistema",
  },
  {
    label: "Estoque",
    href: "/relatorios/estoque",
    desc: "Produtos e movimentações",
  },
  {
    label: "Retiradas",
    href: "/relatorios/retiradas",
    desc: "Histórico de retiradas",
  },
  {
    label: "Doações",
    href: "/relatorios/doacoes",
    desc: "Histórico de doações",
  },
  {
    label: "Beneficiários",
    href: "/relatorios/beneficiarios",
    desc: "Status dos Beneficiários",
  },
];

export default function RelatoriosNav({ titulo }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      <div className={styles.pageHeader}>
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
                borderColor: ativo ? "#4CAF50" : "",
                boxShadow: ativo
                  ? "0 2px 12px rgba(76,175,80,.15)"
                  : "",
              }}
            >
              <span className={styles.navCardLabel}>
                {link.label}
              </span>

              <span className={styles.navCardDesc}>
                {link.desc}
              </span>

              <FaChevronRight
                className={styles.navCardArrow}
              />
            </button>
          );
        })}
      </nav>

      <hr className={styles.divider} />

      {titulo && (
        <div className={styles.pageHeader}>
          <h2 className={styles.titulo}>
            {titulo}
          </h2>

          <div className={styles.decoracao} />
        </div>
      )}
    </>
  );
}
