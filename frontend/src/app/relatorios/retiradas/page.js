"use client";

import React, { useEffect, useState } from "react";
import MenuBar from "../../components/menubar/menubar";
import Navigation from "../../components/navegation/navegation";
import RelatoriosNav from "../../components/relatoriosNav/RelatoriosNav";
import styles from "../relatorios.module.css";

import apiService from "../../../services/api";

export default function RelatorioRetiradas() {
  const [loading, setLoading] = useState(true);

  const [withdrawals, setWithdrawals] = useState([]);

  const [totalItens, setTotalItens] = useState(0);
  const [totalRetiradas, setTotalRetiradas] = useState(0);
  const [totalBeneficiarios, setTotalBeneficiarios] = useState(0);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);

      const data = await apiService.getWithdrawals();

      const lista = Array.isArray(data)
        ? data
        : [];

      setWithdrawals(lista);

      const itensRetirados = lista.reduce(
        (total, retirada) =>
          total +
          (retirada.items || []).reduce(
            (soma, item) =>
              soma + (item.quantity || 0),
            0
          ),
        0
      );

      const beneficiariosUnicos =
        new Set(
          lista.map(
            r =>
              r.beneficiary?.beneficiaryId
          )
        ).size;

      setTotalItens(itensRetirados);
      setTotalRetiradas(lista.length);
      setTotalBeneficiarios(
        beneficiariosUnicos
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function formatarData(data) {
    if (!data) return "-";

    return new Date(data)
      .toLocaleDateString("pt-BR");
  }

  // Ranking de beneficiários

  const ranking = {};

  withdrawals.forEach(retirada => {
    const nome =
      retirada.beneficiary?.fullName ||
      "Beneficiário";

    const quantidade =
      (retirada.items || []).reduce(
        (soma, item) =>
          soma + (item.quantity || 0),
        0
      );

    ranking[nome] =
      (ranking[nome] || 0) +
      quantidade;
  });

  const topBeneficiarios =
    Object.entries(ranking)
      .map(([nome, total]) => ({
        nome,
        total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

  const maiorValor =
    Math.max(
      ...topBeneficiarios.map(
        b => b.total
      ),
      1
    );

  return (
    <div className={styles.containerGeral}>
      <MenuBar />
      <Navigation />

      <div className={styles.pageContent}>
        <RelatoriosNav titulo="Relatório de Retiradas" />

        {/* Cards */}

        <div className={styles.cardsRow}>
          <div className={styles.card}>
            <div className={styles.cardInfo}>
              <span className={styles.cardValue}>
                {loading
                  ? "..."
                  : totalRetiradas}
              </span>

              <span className={styles.cardLabel}>
                Retiradas Registradas
              </span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardInfo}>
              <span className={styles.cardValue}>
                {loading
                  ? "..."
                  : totalItens}
              </span>

              <span className={styles.cardLabel}>
                Itens Retirados
              </span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardInfo}>
              <span className={styles.cardValue}>
                {loading
                  ? "..."
                  : totalBeneficiarios}
              </span>

              <span className={styles.cardLabel}>
                Beneficiários Atendidos
              </span>
            </div>
          </div>
        </div>

        {/* Gráfico */}

        <div className={styles.chartBox}>
          <h3 className={styles.chartTitle}>
            Beneficiários com Mais Retiradas
          </h3>

          <p className={styles.chartSub}>
            Quantidade total de itens retirados
          </p>

          {loading ? (
            <div className={styles.chartLoading}>
              Carregando...
            </div>
          ) : (
            <div style={{ marginTop: 20 }}>
              {topBeneficiarios.map(
                beneficiario => (
                  <div
                    key={beneficiario.nome}
                    style={{
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span>
                        {beneficiario.nome}
                      </span>

                      <strong>
                        {
                          beneficiario.total
                        }
                      </strong>
                    </div>

                    <div
                      style={{
                        height: 18,
                        background:
                          "#ECEFF1",
                        borderRadius: 8,
                        overflow:
                          "hidden",
                      }}
                    >
                      <div
                        style={{
                          height:
                            "100%",
                          width: `${
                            (beneficiario.total /
                              maiorValor) *
                            100
                          }%`,
                          background:
                            "#4CAF50",
                        }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Histórico */}

        <div
          className={styles.chartBox}
          style={{ marginTop: 20 }}
        >
          <h3 className={styles.chartTitle}>
            Histórico de Retiradas
          </h3>

          <table
            style={{
              width: "100%",
              borderCollapse:
                "collapse",
              marginTop: 15,
            }}
          >
            <thead>
              <tr>
                <th align="left">
                  Data
                </th>
                <th align="left">
                  Beneficiário
                </th>
                <th align="left">
                  Itens
                </th>
              </tr>
            </thead>

            <tbody>
              {withdrawals.map(
                retirada => (
                  <tr
                    key={
                      retirada.withdrawalId
                    }
                  >
                    <td>
                      {formatarData(
                        retirada.withdrawalDate
                      )}
                    </td>

                    <td>
                      {
                        retirada
                          .beneficiary
                          ?.fullName
                      }
                    </td>

                    <td>
                      {(retirada.items ||
                        [])
                        .map(
                          item =>
                            `${
                              item
                                .itemDTO
                                ?.description
                            } (${item.quantity})`
                        )
                        .join(", ")}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
