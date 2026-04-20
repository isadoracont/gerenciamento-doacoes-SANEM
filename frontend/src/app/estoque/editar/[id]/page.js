"use client";
import React, { useState, useEffect } from "react";
import MenuBar from "../../../components/menubar/menubar";
import Navigation from "../../../components/navegation/navegation";
import { useRouter, useParams } from "next/navigation";
import styles from "../../estoque.module.css";
import apiService from "../../../../services/api";
import { mapItemFromBackend, mapItemToBackend } from "../../../../services/dataMapper";
import { useApi } from "../../../../hooks/useApi";
import { useNotification } from "../../../../components/notifications/NotificationProvider";

const EditarItem = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const { loading, error, execute, clearError } = useApi();
  const { showNotification } = useNotification();
  const [loadingData, setLoadingData] = useState(true);
  
  const [form, setForm] = useState({
    nome: "",
    quantidade: ""
  });

  useEffect(() => {
    const loadItem = async () => {
      try {
        setLoadingData(true);
        const item = await apiService.getItem(id);
        const mappedItem = mapItemFromBackend(item);
        setForm({
          nome: mappedItem.nome || "",
          quantidade: mappedItem.quantidade || ""
        });
      } catch (err) {
        console.error("Erro ao carregar item:", err);
        showNotification(err.message || "Erro ao carregar item", "error");
        setTimeout(() => router.push("/estoque"), 2000);
      } finally {
        setLoadingData(false);
      }
    };

    if (id) {
      loadItem();
    }
  }, [id, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    clearError();

    try {
      // Prepara dados para o backend
      const itemData = mapItemToBackend({
        ...form,
        quantidade: Number(form.quantidade)
      });

      // Chama a API de atualização
      await execute(() => apiService.updateItem(id, itemData));
      
      showNotification("Item atualizado com sucesso!", "success");
      setTimeout(() => router.push("/estoque"), 1000);
    } catch (err) {
      showNotification(err.message || "Erro ao atualizar item", "error");
    }
  }

  if (loadingData) {
    return (
      <div className={styles.containerGeral}>
        <MenuBar />
        <Navigation />
        <div className={styles.contentWrapper}>
          <div className={styles.listContainer}>
            <h1 className={styles.titulo}>Carregando...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.containerGeral}>
      <MenuBar />
      <Navigation />
      <div className={styles.contentWrapper}>
        <div className={styles.listContainer}>
          <h1 className={styles.titulo}>Editar Item do Estoque</h1>
          <div className={styles.decoracao}></div>
          <form onSubmit={handleSubmit} className={styles.formulario} style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className={styles.formGroup}>
              <label htmlFor="nome"><b>Nome*</b></label>
              <input 
                id="nome" 
                name="nome" 
                className={styles.formInput}
                value={form.nome} 
                onChange={handleChange} 
                required 
                placeholder="Nome do item" 
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="quantidade"><b>Quantidade*</b></label>
              <input 
                id="quantidade" 
                name="quantidade" 
                type="number" 
                min={0}
                className={styles.formInput}
                value={form.quantidade} 
                onChange={handleChange} 
                required 
                placeholder="Quantidade" 
              />
            </div>
            
            <div className={styles.modalButtonGroup}>
              <button 
                type="button" 
                className={styles.cancelButton} 
                onClick={() => router.push("/estoque")}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
            {error && <div className={styles.errorMessage} style={{ marginTop: '16px' }}>{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarItem;

