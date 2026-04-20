"use client";
import React, { useState, useEffect } from "react";
import MenuBar from '../components/menubar/menubar';
import Navigation from '../components/navegation/navegation';
import { useRouter } from 'next/navigation';
import styles from './usuarios.module.css';
import apiService from '../../services/api';
import authService from '../../services/authService';
import { useNotification } from '../../components/notifications/NotificationProvider';
import { mapUserFromBackend, mapUserToBackend } from '../../services/dataMapper';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import ConfirmationModal from '../../components/confirmation/ConfirmationModal';

export default function UsuariosPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, message: "", title: "" });
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    login: '',
    senha: '',
    perfilId: ''
  });
  const [editFormData, setEditFormData] = useState({
    nomeCompleto: '',
    email: '',
    login: '',
    senha: '',
    perfilId: '',
    status: 'ACTIVE'
  });
  const [formErrors, setFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});
  const [changePassword, setChangePassword] = useState(false);
  const [allowNonAdminEdit, setAllowNonAdminEdit] = useState(false);

  useEffect(() => {
    // Verificar se deve permitir edição de não-admin (editando a si mesmo)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('editSelf') === 'true') {
      setAllowNonAdminEdit(true);
    }
    
    const initialize = async () => {
      await checkAdmin();
      await loadUsers();
      await loadProfiles();
      
      // Verificar se deve abrir o modal de edição do próprio usuário
      if (urlParams.get('editSelf') === 'true') {
        handleEditSelf();
        // Limpar o parâmetro da URL
        window.history.replaceState({}, '', '/usuarios');
      }
    };
    
    initialize();
  }, []);

  const handleEditSelf = async () => {
    try {
      const user = authService.getUser();
      if (!user || !user.id) {
        showNotification("Erro ao carregar dados do usuário", "error");
        return;
      }
      
      // Carregar dados do usuário atual
      const userData = await apiService.getUser(user.id);
      const mappedUser = mapUserFromBackend(userData);
      setEditFormData({
        nomeCompleto: mappedUser.nomeCompleto || '',
        email: mappedUser.email || '',
        login: mappedUser.login || '',
        senha: '',
        perfilId: mappedUser.perfilId?.toString() || '',
        status: mappedUser.status || 'ACTIVE'
      });
      setEditFormErrors({});
      setChangePassword(false);
      setEditingUser(mappedUser);
      setShowEditModal(true);
    } catch (err) {
      console.error("Erro ao carregar usuário:", err);
      showNotification(err.message || "Erro ao carregar dados do usuário", "error");
    }
  };

  const checkAdmin = async () => {
    const user = authService.getUser();
    console.log("Usuário atual:", user); // Debug
    
    // Verificar se é admin baseado no nome do perfil
    // O backend retorna o nome do perfil no campo 'role' (ex: "Administrator")
    const roleName = (user?.role || '').toLowerCase();
    const isAdminByRole = roleName.includes('admin') || roleName.includes('administrator');
    
    // Se já tiver verificação pelo role, usar diretamente
    if (isAdminByRole) {
      setIsAdmin(true);
      return;
    }
    
    // Se não tiver perfilId salvo, buscar o perfil completo do usuário atual
    if (user?.id) {
      try {
        const userData = await apiService.getUser(user.id);
        const mappedUser = mapUserFromBackend(userData);
        const profileName = (mappedUser.perfil || '').toLowerCase();
        const isAdminByProfile = mappedUser.perfilId === 1 || 
                                 profileName.includes('admin') ||
                                 profileName.includes('administrator');
        setIsAdmin(isAdminByProfile);
        return;
      } catch (err) {
        console.error("Erro ao buscar dados do usuário:", err);
      }
    }
    
    // Verificar pelo perfilId se disponível (perfilId 1 é Administrator)
    const isAdminById = user?.perfilId === 1;
    
    setIsAdmin(isAdminById);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUsers();
      const mapped = (data || []).map(mapUserFromBackend);
      setUsers(mapped);
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
      showNotification("Erro ao carregar usuários", "error");
    } finally {
      setLoading(false);
    }
  };

  const translateProfileName = (name) => {
    const nameLower = (name || '').toLowerCase();
    if (nameLower.includes('admin') || nameLower.includes('administrator')) {
      return 'Administrador';
    }
    if (nameLower.includes('attendant') || nameLower.includes('atendente')) {
      return 'Atendente';
    }
    return name; // Retorna o nome original se não for reconhecido
  };

  const loadProfiles = async () => {
    try {
      const data = await apiService.getProfiles();
      // Filtrar apenas Administrator e Attendant
      const filteredProfiles = (data || []).filter(profile => {
        const nameLower = (profile.name || '').toLowerCase();
        return nameLower.includes('admin') || nameLower.includes('administrator') || 
               nameLower.includes('attendant') || nameLower.includes('atendente');
      });
      setProfiles(filteredProfiles);
    } catch (err) {
      console.error("Erro ao carregar perfis:", err);
    }
  };

  const handleAdd = () => {
    if (!isAdmin) {
      showNotification("Apenas administradores podem adicionar usuários", "error");
      return;
    }
    setFormData({
      nomeCompleto: '',
      email: '',
      login: '',
      senha: '',
      perfilId: profiles.length > 0 ? profiles[0].profileId : ''
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleEdit = async (id) => {
    if (!isAdmin) {
      showNotification("Apenas administradores podem editar usuários", "error");
      return;
    }
    try {
      const userData = await apiService.getUser(id);
      const mappedUser = mapUserFromBackend(userData);
      setEditFormData({
        nomeCompleto: mappedUser.nomeCompleto || '',
        email: mappedUser.email || '',
        login: mappedUser.login || '',
        senha: '',
        perfilId: mappedUser.perfilId?.toString() || '',
        status: mappedUser.status || 'ACTIVE'
      });
      setEditFormErrors({});
      setChangePassword(false);
      setEditingUser(mappedUser);
      setShowEditModal(true);
    } catch (err) {
      console.error("Erro ao carregar usuário:", err);
      showNotification(err.message || "Erro ao carregar dados do usuário", "error");
    }
  };

  const handleDelete = (id) => {
    if (!isAdmin) {
      showNotification("Apenas administradores podem excluir usuários", "error");
      return;
    }

    const user = users.find(u => u.id === id);
    setConfirmModal({
      isOpen: true,
      action: async () => {
        try {
          await apiService.deleteUser(id);
          showNotification("Usuário excluído com sucesso!", "success");
          loadUsers();
        } catch (err) {
          console.error("Erro ao excluir usuário:", err);
          showNotification(err.message || "Erro ao excluir usuário", "error");
        } finally {
          setConfirmModal({ isOpen: false, action: null, message: "", title: "" });
        }
      },
      message: `Tem certeza que deseja excluir o usuário "${user?.nomeCompleto}"? Esta ação não pode ser desfeita.`,
      title: "Confirmar Exclusão"
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nomeCompleto.trim()) errors.nomeCompleto = "Nome é obrigatório";
    if (!formData.email.trim()) errors.email = "Email é obrigatório";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Email inválido";
    if (!formData.login.trim()) errors.login = "Login é obrigatório";
    if (!formData.senha.trim()) errors.senha = "Senha é obrigatória";
    else if (formData.senha.length < 6) errors.senha = "Senha deve ter pelo menos 6 caracteres";
    if (!formData.perfilId) errors.perfilId = "Perfil é obrigatório";
    return errors;
  };

  const validateEditForm = () => {
    const errors = {};
    if (!editFormData.nomeCompleto.trim()) errors.nomeCompleto = "Nome é obrigatório";
    if (!editFormData.email.trim()) errors.email = "Email é obrigatório";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) errors.email = "Email inválido";
    if (!editFormData.login.trim()) errors.login = "Login é obrigatório";
    if (changePassword) {
      if (!editFormData.senha.trim()) errors.senha = "Senha é obrigatória";
      else if (editFormData.senha.length < 6) errors.senha = "Senha deve ter pelo menos 6 caracteres";
    }
    if (!editFormData.perfilId) errors.perfilId = "Perfil é obrigatório";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      // Buscar o perfil completo pelo ID
      const selectedProfile = profiles.find(p => p.profileId === parseInt(formData.perfilId));
      if (!selectedProfile) {
        showNotification("Perfil selecionado não encontrado", "error");
        return;
      }

      const userData = {
        name: formData.nomeCompleto,
        login: formData.login,
        email: formData.email,
        password: formData.senha,
        status: "ACTIVE", // Status padrão
        profile: {
          profileId: selectedProfile.profileId,
          name: selectedProfile.name,
          description: selectedProfile.description || null
        }
      };

      await apiService.createUser(userData);
      showNotification("Usuário criado com sucesso!", "success");
      setShowAddModal(false);
      setFormData({
        nomeCompleto: '',
        email: '',
        login: '',
        senha: '',
        perfilId: ''
      });
      loadUsers();
    } catch (err) {
      console.error("Erro ao criar usuário:", err);
      showNotification(err.message || "Erro ao criar usuário", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // Verificar se está editando a si mesmo ou se é admin
    const currentUser = authService.getUser();
    const isEditingSelf = currentUser && editingUser && currentUser.id === editingUser.id;
    
    if (!isAdmin && !isEditingSelf) {
      showNotification("Apenas administradores podem editar outros usuários", "error");
      return;
    }

    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      
      // Buscar o perfil completo pelo ID
      const selectedProfile = profiles.find(p => p.profileId === parseInt(editFormData.perfilId));
      if (!selectedProfile) {
        showNotification("Perfil selecionado não encontrado", "error");
        return;
      }

      // Preparar dados para o backend
      const userData = {
        name: editFormData.nomeCompleto,
        login: editFormData.login,
        email: editFormData.email,
        password: changePassword ? editFormData.senha : null, // null se não estiver mudando
        status: editFormData.status,
        profile: {
          profileId: selectedProfile.profileId,
          name: selectedProfile.name,
          description: selectedProfile.description || null
        }
      };

      await apiService.updateUser(editingUser.id, userData);
      showNotification("Usuário atualizado com sucesso!", "success");
      setShowEditModal(false);
      setEditingUser(null);
      setChangePassword(false);
      loadUsers();
    } catch (err) {
      console.error("Erro ao atualizar usuário:", err);
      showNotification(err.message || "Erro ao atualizar usuário", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin && !allowNonAdminEdit) {
    return (
      <div className={styles.containerGeral}>
        <Navigation />
        <MenuBar />
        <div className={styles.contentWrapper}>
          <div className={styles.listContainer}>
            <h1 className={styles.titulo}>Acesso Negado</h1>
            <p>Você não tem permissão para acessar esta página. Apenas administradores podem gerenciar usuários.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.containerGeral}>
      <Navigation />
      <MenuBar />
      <div className={styles.contentWrapper}>
        <div className={styles.listContainer}>
          <h1 className={styles.titulo}>Usuários do Sistema</h1>
          <div className={styles.decoracao}></div>
          {isAdmin && (
            <div className={styles.actionsHeader}>
              <button
                className={styles.addButton}
                onClick={handleAdd}
                title="Adicionar Novo Usuário"
              >
                <FaPlus />
              </button>
            </div>
          )}
          {isAdmin && (
          <div className={styles.tableWrapper}>
            <table className={styles.beneficiariosTable}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Login</th>
                  <th>Perfil</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className={styles.loadingMessage}>Carregando...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.noDataMessage}>Nenhum usuário cadastrado ainda.</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.nomeCompleto}</td>
                      <td>{user.email}</td>
                      <td>{user.login || user.email || 'N/A'}</td>
                      <td>{translateProfileName(user.perfil) || 'N/A'}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            className={styles.editButton}
                            onClick={() => handleEdit(user.id)}
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className={styles.deleteButton}
                            onClick={() => handleDelete(user.id)}
                            title="Excluir"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>

      {/* Modal de Adicionar Usuário */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Criar Novo Usuário</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Nome Completo *</label>
                <input
                  type="text"
                  value={formData.nomeCompleto}
                  onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
                  className={formErrors.nomeCompleto ? styles.inputError : ''}
                />
                {formErrors.nomeCompleto && <span className={styles.errorText}>{formErrors.nomeCompleto}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={formErrors.email ? styles.inputError : ''}
                />
                {formErrors.email && <span className={styles.errorText}>{formErrors.email}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Login *</label>
                <input
                  type="text"
                  value={formData.login}
                  onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                  className={formErrors.login ? styles.inputError : ''}
                />
                {formErrors.login && <span className={styles.errorText}>{formErrors.login}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Senha *</label>
                <input
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  className={formErrors.senha ? styles.inputError : ''}
                />
                {formErrors.senha && <span className={styles.errorText}>{formErrors.senha}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Perfil *</label>
                <select
                  value={formData.perfilId}
                  onChange={(e) => setFormData({ ...formData, perfilId: e.target.value })}
                  className={formErrors.perfilId ? styles.inputError : ''}
                >
                  <option value="">Selecione um perfil</option>
                  {profiles.map((profile) => (
                    <option key={profile.profileId} value={profile.profileId}>
                      {translateProfileName(profile.name)}
                    </option>
                  ))}
                </select>
                {formErrors.perfilId && <span className={styles.errorText}>{formErrors.perfilId}</span>}
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
                  {loading ? "Criando..." : "Criar Usuário"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Editar Usuário */}
      {showEditModal && editingUser && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Editar Usuário</h2>
            <form onSubmit={handleEditSubmit}>
              <div className={styles.formGroup}>
                <label>Nome Completo *</label>
                <input
                  type="text"
                  value={editFormData.nomeCompleto}
                  onChange={(e) => setEditFormData({ ...editFormData, nomeCompleto: e.target.value })}
                  className={editFormErrors.nomeCompleto ? styles.inputError : ''}
                />
                {editFormErrors.nomeCompleto && <span className={styles.errorText}>{editFormErrors.nomeCompleto}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Email *</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className={editFormErrors.email ? styles.inputError : ''}
                />
                {editFormErrors.email && <span className={styles.errorText}>{editFormErrors.email}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Login *</label>
                <input
                  type="text"
                  value={editFormData.login}
                  onChange={(e) => setEditFormData({ ...editFormData, login: e.target.value })}
                  className={editFormErrors.login ? styles.inputError : ''}
                />
                {editFormErrors.login && <span className={styles.errorText}>{editFormErrors.login}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={changePassword}
                    onChange={(e) => setChangePassword(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Alterar senha
                </label>
                {changePassword && (
                  <>
                    <input
                      type="password"
                      value={editFormData.senha}
                      onChange={(e) => setEditFormData({ ...editFormData, senha: e.target.value })}
                      className={editFormErrors.senha ? styles.inputError : ''}
                      placeholder="Nova senha (mínimo 6 caracteres)"
                      style={{ marginTop: '8px', width: '100%', padding: '12px', border: '2px solid var(--color-border)', borderRadius: '8px', boxSizing: 'border-box' }}
                    />
                    {editFormErrors.senha && <span className={styles.errorText}>{editFormErrors.senha}</span>}
                  </>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Perfil *</label>
                <select
                  value={editFormData.perfilId}
                  onChange={(e) => setEditFormData({ ...editFormData, perfilId: e.target.value })}
                  className={editFormErrors.perfilId ? styles.inputError : ''}
                >
                  <option value="">Selecione um perfil</option>
                  {profiles.map((profile) => (
                    <option key={profile.profileId} value={profile.profileId}>
                      {translateProfileName(profile.name)}
                    </option>
                  ))}
                </select>
                {editFormErrors.perfilId && <span className={styles.errorText}>{editFormErrors.perfilId}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Status *</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                >
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                </select>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                    setChangePassword(false);
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
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, action: null, message: "", title: "" })}
        onConfirm={confirmModal.action}
        message={confirmModal.message}
        title={confirmModal.title}
      />
    </div>
  );
}
