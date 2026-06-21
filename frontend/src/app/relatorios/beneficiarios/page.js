"use client";

import React, { useEffect, useState } from "react";
import MenuBar from "../../components/menubar/menubar";
import Navigation from "../../components/navegation/navegation";
import RelatoriosNav from "../../components/relatoriosNav/RelatoriosNav";
import styles from "../relatorios.module.css";

import apiService from "../../../services/api";
import { mapBeneficiaryFromBackend } from "../../../services/dataMapper";

export default function RelatorioBeneficiarios() {
  const [loading, setLoading] = useState(true);

  const [beneficiarios, setBeneficiarios] = useState([]);

  const [aprovados, setAprovados] = useState(0);
  const [pendentes, setPendentes] = useState(0);
  const [rejeitados, setRejeitados] = useState(0);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);

      const response =
        await apiService.getBeneficiaries();

      const lista = (response || [])
        .map(mapBeneficiaryFromBackend);

      setBeneficiarios(lista);

      setAprovados(
        lista.filter(
          b => b.status === "APPROVED"
        ).length
      );

      setPendentes(
        lista.filter(
          b => b.status === "PENDING"
        ).length
      );

      setRejeitados(
        lista.filter(
          b => b.status === "REJECTED"
        ).length
      );

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const ranking =
    [...beneficiarios]
      .sort(
        (a, b) =>
          (b.currentWithdrawalsThisMonth || 0) -
          (a.currentWithdrawalsThisMonth || 0)
      )
      .slice(0, 10);

  const maiorValor =
    Math.max(
      ...ranking.map(
        b =>
          b.currentWithdrawalsThisMonth || 0
      ),
      1
    );

  function traduzirStatus(status) {
    switch (status) {
      case "APPROVED":
        return "Aprovado";

      case "PENDING":
        return "Pendente";

      case "REJECTED":
        return "Rejeitado";

      default:
        return status;
    }
  }

  function corStatus(status) {
    switch (status) {
      case "APPROVED":
        return "#4CAF50";

      case "PENDING":
        return "#FFA726";

      case "REJECTED":
        return "#EF5350";

      default:
        return "#90A4AE";
    }
  }

  return (
    <div className={styles.containerGeral}>
      <MenuBar />
      <Navigation />

      <div className={styles.pageContent}>
        <RelatoriosNav titulo="Relatório de Beneficiários" />

        {/* Cards */}

        <div className={styles.cardsRow}>
          <div className={styles.card}>
            <div className={styles.cardInfo}>
              <span className={styles.cardValue}>
                {loading
                  ? "..."
                  : beneficiarios.length}
              </span>

              <span className={styles.cardLabel}>
                Total de Beneficiários
              </span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardInfo}>
              <span className={styles.cardValue}>
                {loading
                  ? "..."
                  : aprovados}
              </span>

              <span className={styles.cardLabel}>
                Aprovados
              </span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardInfo}>
              <span className={styles.cardValue}>
                {loading
                  ? "..."
                  : pendentes}
              </span>

              <span className={styles.cardLabel}>
                Pendentes
              </span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardInfo}>
              <span className={styles.cardValue}>
                {loading
                  ? "..."
                  : rejeitados}
              </span>

              <span className={styles.cardLabel}>
                Rejeitados
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
            Retiradas realizadas no mês atual
          </p>

          {loading ? (
            <div className={styles.chartLoading}>
              Carregando...
            </div>
          ) : (
            <div style={{ marginTop: 20 }}>
              {ranking.map(
                beneficiario => (
                  <div
                    key={
                      beneficiario.id
                    }
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
                        {
                          beneficiario.nomeCompleto
                        }
                      </span>

                      <strong>
                        {
                          beneficiario.currentWithdrawalsThisMonth
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
                          "hidden"
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${
                            ((beneficiario.currentWithdrawalsThisMonth || 0) /
                              maiorValor) *
                            100
                          }%`,
                          background:
                            "#AB47BC"
                        }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Tabela */}

        <div
          className={styles.chartBox}
          style={{ marginTop: 20 }}
        >
          <h3 className={styles.chartTitle}>
            Situação dos Beneficiários
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
                  Nome
                </th>

                <th align="left">
                  Status
                </th>

                <th align="left">
                  Limite
                </th>

                <th align="left">
                  Utilizado
                </th>

                <th align="left">
                  Restante
                </th>
              </tr>
            </thead>

            <tbody>
              {beneficiarios.map(
                beneficiario => (
                  <tr
                    key={
                      beneficiario.id
                    }
                  >
                    <td>
                      {
                        beneficiario.nomeCompleto
                      }
                    </td>

                    <td>
                      <span
                        style={{
                          color: corStatus(
                            beneficiario.status
                          ),
                          fontWeight:
                            600
                        }}
                      >
                        {traduzirStatus(
                          beneficiario.status
                        )}
                      </span>
                    </td>

                    <td>
                      {beneficiario.withdrawalLimit ??
                        "-"}
                    </td>

                    <td>
                      {beneficiario.currentWithdrawalsThisMonth ??
                        0}
                    </td>

                    <td>
                      {beneficiario.remainingWithdrawals ??
                        0}
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
