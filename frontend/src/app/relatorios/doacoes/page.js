"use client";

import React, { useEffect, useState } from "react";
import MenuBar from "../../components/menubar/menubar";
import Navigation from "../../components/navegation/navegation";
import RelatoriosNav from "../../components/relatoriosNav/RelatoriosNav";
import styles from "../relatorios.module.css";

import apiService from "../../../services/api";
import { mapDonationFromBackend } from "../../../services/dataMapper";

export default function RelatorioDoacoes() {
  const [loading, setLoading] = useState(true);

  const [donations, setDonations] = useState([]);

  const [totalDoacoes, setTotalDoacoes] = useState(0);
  const [totalItens, setTotalItens] = useState(0);
  const [totalDoadores, setTotalDoadores] = useState(0);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);

      const response =
        await apiService.getDonations();

      const lista = (response || [])
        .map(mapDonationFromBackend);

      setDonations(lista);

      const itensRecebidos =
        lista.reduce(
          (total, doacao) =>
            total +
            (doacao.items || []).reduce(
              (soma, item) =>
                soma +
                (item.quantity || 0),
              0
            ),
          0
        );

      const doadores =
        new Set(
          lista.map(
            d =>
              d.donor?.name ||
              "Sem Nome"
          )
        ).size;

      setTotalDoacoes(lista.length);
      setTotalItens(itensRecebidos);
      setTotalDoadores(doadores);

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

  // Ranking de doadores

  const ranking = {};

  donations.forEach(doacao => {
    const nome =
      doacao.donor?.name ||
      "Doador";

    const quantidade =
      (doacao.items || []).reduce(
        (soma, item) =>
          soma +
          (item.quantity || 0),
        0
      );

    ranking[nome] =
      (ranking[nome] || 0) +
      quantidade;
  });

  const topDoadores =
    Object.entries(ranking)
      .map(([nome, total]) => ({
        nome,
        total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

  const maiorValor =
    Math.max(
      ...topDoadores.map(
        d => d.total
      ),
      1
    );

  return (
    <div className={styles.containerGeral}>
      <MenuBar />
      <Navigation />

      <div className={styles.pageContent}>
        <RelatoriosNav titulo="Relatório de Doações" />

        {/* Cards */}

        <div className={styles.cardsRow}>
          <div className={styles.card}>
            <div className={styles.cardInfo}>
              <span className={styles.cardValue}>
                {loading
                  ? "..."
                  : totalDoacoes}
              </span>

              <span className={styles.cardLabel}>
                Doações Registradas
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
                Itens Recebidos
              </span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardInfo}>
              <span className={styles.cardValue}>
                {loading
                  ? "..."
                  : totalDoadores}
              </span>

              <span className={styles.cardLabel}>
                Doadores
              </span>
            </div>
          </div>
        </div>

        {/* Gráfico */}

        <div className={styles.chartBox}>
          <h3 className={styles.chartTitle}>
            Maiores Doadores
          </h3>

          <p className={styles.chartSub}>
            Quantidade total de itens doados
          </p>

          {loading ? (
            <div className={styles.chartLoading}>
              Carregando...
            </div>
          ) : (
            <div style={{ marginTop: 20 }}>
              {topDoadores.map(
                doador => (
                  <div
                    key={doador.nome}
                    style={{
                      marginBottom: 14
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        marginBottom: 4
                      }}
                    >
                      <span>
                        {doador.nome}
                      </span>

                      <strong>
                        {doador.total}
                      </strong>
                    </div>

                    <div
                      style={{
                        height: 18,
                        background:
                          "#ECEFF1",
                        borderRadius: 8,
                        overflow:
                          "hidden"
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${
                            (doador.total /
                              maiorValor) *
                            100
                          }%`,
                          background:
                            "#42A5F5"
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
            Histórico de Doações
          </h3>

          <table
            style={{
              width: "100%",
              borderCollapse:
                "collapse",
              marginTop: 15
            }}
          >
            <thead>
              <tr>
                <th align="left">
                  Data
                </th>

                <th align="left">
                  Doador
                </th>

                <th align="left">
                  Itens
                </th>
              </tr>
            </thead>

            <tbody>
              {donations.map(
                doacao => (
                  <tr
                    key={
                      doacao.id
                    }
                  >
                    <td>
                      {formatarData(
                        doacao.donationDate
                      )}
                    </td>

                    <td>
                      {
                        doacao.donor
                          ?.name
                      }
                    </td>

                    <td>
                      {(doacao.items ||
                        [])
                        .map(
                          item =>
                            `${item.nome} (${item.quantity})`
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
