"use client";
import MenuBar from '../components/menubar/menubar';
import Navigation from '../components/navegation/navegation';
import styles from './estoque.module.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiService from '../../services/api';
import { mapItemFromBackend, mapItemToBackend } from '../../services/dataMapper';
import { useApiList } from '../../hooks/useApi';
import { FaPlus, FaPrint, FaTag, FaEdit, FaTrash } from 'react-icons/fa';
import { useNotification } from '../../components/notifications/NotificationProvider';
import ConfirmationModal from '../../components/confirmation/ConfirmationModal';

export default function EstoquePage() {
  const { showNotification } = useNotification();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [novoProduto, setNovoProduto] = useState({ nome: '', quantidade: '' });
  const [editProduto, setEditProduto] = useState({ nome: '', quantidade: '' });
  const [editingItem, setEditingItem] = useState(null);
  const router = useRouter();

  const {
    data: itemsRaw,
    loading,
    error,
    loadData: loadDataRaw,
    addItem,
    updateItem,
    removeItem
  } = useApiList((filters) => apiService.getItems(filters));

  const mockEstoque = Array.isArray(itemsRaw) 
    ? itemsRaw.map(mapItemFromBackend)
    : [];

  useEffect(() => {
    loadDataRaw().catch(err => {
      console.error("Erro ao carregar itens:", err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executar apenas na montagem do componente

  async function handleAddProduto(e) {
    e.preventDefault();
    
    try {
      // Preparar dados diretamente no formato esperado pelo backend
      const itemData = {
        description: novoProduto.nome || '',
        stockQuantity: Number(novoProduto.quantidade) || 0,
        tagCode: null // Será gerado pelo backend se necessário
      };
      
      await apiService.createItem(itemData);
      await loadDataRaw();
      
      setNovoProduto({ nome: '', quantidade: '' });
      setShowAddModal(false);
      showNotification("Produto adicionado com sucesso!", "success");
    } catch (err) {
      showNotification(err.message || "Erro ao adicionar produto", "error");
    }
  }

  async function handleDeleteProduto() {
    if (!itemToDelete) return;
    
    try {
      await apiService.deleteItem(itemToDelete.id);
      await loadDataRaw();
      setItemToDelete(null);
      showNotification("Produto excluído com sucesso!", "success");
    } catch (err) {
      showNotification(err.message || "Erro ao excluir produto", "error");
    }
  }

  function openDeleteModal(item) {
    setItemToDelete(item);
  }

  function handleEditProduto(item) {
    setEditProduto({
      nome: item.nome || '',
      quantidade: item.quantidade || ''
    });
    setEditingItem(item);
    setShowEditModal(true);
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    
    if (!editingItem) return;

    try {
      const itemData = mapItemToBackend({
        nome: editProduto.nome || '',
        quantidade: Number(editProduto.quantidade) || 0
      });
      
      await apiService.updateItem(editingItem.id, itemData);
      await loadDataRaw();
      
      setEditProduto({ nome: '', quantidade: '' });
      setShowEditModal(false);
      setEditingItem(null);
      showNotification("Produto atualizado com sucesso!", "success");
    } catch (err) {
      showNotification(err.message || "Erro ao atualizar produto", "error");
    }
  }

  async function handleGenerateLabel(item) {
    try {
      const labelData = await apiService.generateItemLabel(item.id);
      printLabel(labelData);
      showNotification("Etiqueta gerada com sucesso!", "success");
    } catch (err) {
      showNotification(err.message || "Erro ao gerar etiqueta", "error");
    }
  }

  function printLabel(labelData) {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Etiqueta - ${labelData.description}</title>
          <style>
            @media print {
              @page { size: 4in 2in; margin: 0.2in; }
              body { margin: 0; padding: 0; }
            }
            body { 
              font-family: Arial, sans-serif; 
              padding: 10px; 
              margin: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .label-container {
              border: 2px solid #000;
              padding: 15px;
              width: 100%;
              max-width: 350px;
              text-align: center;
            }
            .label-header {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .label-description {
              font-size: 12px;
              margin: 8px 0;
              word-wrap: break-word;
            }
            .label-code {
              font-size: 16px;
              font-weight: bold;
              margin: 8px 0;
              color: #333;
            }
            .qr-code {
              margin: 10px auto;
              display: block;
            }
          </style>
        </head>
        <body>
          <div class="label-container">
            <div class="label-header">SANEM - ETIQUETA DE ITEM</div>
            <div class="label-description">${labelData.description}</div>
            <div class="label-code">Código: ${labelData.tagCode}</div>
            <img src="data:image/png;base64,${labelData.qrCodeBase64}" alt="QR Code" class="qr-code" style="width: 120px; height: 120px;" />
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }

  return (
    <div className={styles.containerGeral}>
      <MenuBar />
      <Navigation />
      <div className={styles.contentWrapper}>
        <div className={styles.listContainer}>
          <h1 className={styles.titulo}>Controle de Estoque</h1>
          <div className={styles.decoracao}></div>

          <div className={styles.actionsHeader}>
            <button
              className={styles.addButton}
              onClick={() => setShowAddModal(true)}
              title="Adicionar Novo Produto"
            >
              <FaPlus />
            </button>
          </div>
          
          <div className={styles.tableWrapper}>
            <table className={styles.beneficiariosTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Quantidade</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className={styles.loadingMessage}>Carregando...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={4} className={styles.errorMessage}>{error}</td>
                  </tr>
                ) : mockEstoque.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={styles.noDataMessage}>Nenhum produto cadastrado ainda.</td>
                  </tr>
                ) : (
                  mockEstoque.map(item => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.nome}</td>
                      <td>{item.quantidade}</td>
                      <td className={styles.actionButtons}>
                        <button
                          className={styles.editButton}
                          onClick={() => handleEditProduto(item)}
                          disabled={loading}
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className={styles.editButton}
                          onClick={() => handleGenerateLabel(item)}
                          disabled={loading}
                          title="Gerar Etiqueta"
                          style={{ background: '#2196F3', marginLeft: '5px' }}
                        >
                          <FaTag />
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => openDeleteModal(item)}
                          disabled={loading}
                          title="Excluir"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Adicionar */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Adicionar Produto</h2>
            <form onSubmit={handleAddProduto}>
              <div className={styles.formGroup}>
                <label htmlFor="nome">Nome *</label>
                <input 
                  id="nome"
                  type="text"
                  required 
                  value={novoProduto.nome} 
                  onChange={e => setNovoProduto({ ...novoProduto, nome: e.target.value })} 
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="quantidade">Quantidade *</label>
                <input 
                  id="quantidade"
                  type="number" 
                  min={1} 
                  required
                  value={novoProduto.quantidade} 
                  onChange={e => setNovoProduto({ ...novoProduto, quantidade: e.target.value })} 
                />
              </div>
              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  className={styles.cancelButton} 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? "Adicionando..." : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {showEditModal && editingItem && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Editar Produto</h2>
            <form onSubmit={handleEditSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="editNome">Nome *</label>
                <input 
                  id="editNome"
                  type="text"
                  required 
                  value={editProduto.nome} 
                  onChange={e => setEditProduto({ ...editProduto, nome: e.target.value })} 
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="editQuantidade">Quantidade *</label>
                <input 
                  id="editQuantidade"
                  type="number" 
                  min={0} 
                  required
                  value={editProduto.quantidade} 
                  onChange={e => setEditProduto({ ...editProduto, quantidade: e.target.value })} 
                />
              </div>
              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  className={styles.cancelButton} 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                  }}
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
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteProduto}
        title="Confirmar Exclusão"
        message={itemToDelete ? `Tem certeza que deseja excluir o produto "${itemToDelete.nome}"?` : ""}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
