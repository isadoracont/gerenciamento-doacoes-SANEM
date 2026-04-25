"use client";
import React, { useState, useEffect } from "react";
import MenuBar from "../../../components/menubar/menubar";
import Navigation from "../../../components/navegation/navegation";
import { useRouter, useParams } from "next/navigation";
import styles from "../../usuarios.module.css";
import apiService from "../../../../services/api";
import { mapUserFromBackend, mapUserToBackend } from "../../../../services/dataMapper";
import { useNotification } from "../../../../components/notifications/NotificationProvider";
import authService from "../../../../services/authService";

const EditarUsuario = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    login: '',
    senha: '',
    perfilId: '',
    status: 'ACTIVE'
  });
  const [formErrors, setFormErrors] = useState({});
  const [changePassword, setChangePassword] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const user = authService.getUser();
      const roleName = (user?.role || '').toLowerCase();
      const isAdminByRole = roleName.includes('admin') || roleName.includes('administrator');
      
      if (user?.id) {
        try {
          const userData = await apiService.getUser(user.id);
          const mappedUser = mapUserFromBackend(userData);
          const profileName = (mappedUser.perfil || '').toLowerCase();
          const isAdminByProfile = mappedUser.perfilId === 1 || 
                                   profileName.includes('admin') ||
                                   profileName.includes('administrator');
          setIsAdmin(isAdminByRole || isAdminByProfile);
        } catch (err) {
          console.error("Erro ao buscar dados do usuário:", err);
          setIsAdmin(isAdminByRole);
        }
      } else {
        setIsAdmin(isAdminByRole);
      }
    };

    const loadData = async () => {
      try {
        setLoading(true);
        
        // Verificar se é admin
        await checkAdmin();
        
        // Carregar perfis
        const profilesData = await apiService.getProfiles();
        setProfiles(profilesData || []);
        
        // Carregar dados do usuário
        const userData = await apiService.getUser(id);
        const mappedUser = mapUserFromBackend(userData);
        
        setFormData({
          nomeCompleto: mappedUser.nomeCompleto || '',
          email: mappedUser.email || '',
          login: mappedUser.login || '',
          senha: '', // Não carregar senha
          perfilId: mappedUser.perfilId?.toString() || '',
          status: mappedUser.status || 'ACTIVE'
        });
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        showNotification(err.message || "Erro ao carregar dados do usuário", "error");
        setTimeout(() => router.push("/usuarios"), 2000);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Limpar erro do campo quando o usuário começar a digitar
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nomeCompleto.trim()) errors.nomeCompleto = "Nome é obrigatório";
    if (!formData.email.trim()) errors.email = "Email é obrigatório";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Email inválido";
    if (!formData.login.trim()) errors.login = "Login é obrigatório";
    if (changePassword) {
      if (!formData.senha.trim()) errors.senha = "Senha é obrigatória";
      else if (formData.senha.length < 6) errors.senha = "Senha deve ter pelo menos 6 caracteres";
    }
    if (!formData.perfilId) errors.perfilId = "Perfil é obrigatório";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAdmin) {
      showNotification("Apenas administradores podem editar usuários", "error");
      return;
    }

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSaving(true);
      
      // Buscar o perfil completo pelo ID
      const selectedProfile = profiles.find(p => p.profileId === parseInt(formData.perfilId));
      if (!selectedProfile) {
        showNotification("Perfil selecionado não encontrado", "error");
        return;
      }

      // Preparar dados para o backend
      // O AppUserUpdateDTO permite senha opcional, então só enviamos se estiver mudando
      const userData = {
        name: formData.nomeCompleto,
        login: formData.login,
        email: formData.email,
        password: changePassword ? formData.senha : null, // null se não estiver mudando
        status: formData.status,
        profile: {
          profileId: selectedProfile.profileId,
          name: selectedProfile.name,
          description: selectedProfile.description || null
        }
      };

      await apiService.updateUser(id, userData);
      showNotification("Usuário atualizado com sucesso!", "success");
      setTimeout(() => router.push("/usuarios"), 1000);
    } catch (err) {
      console.error("Erro ao atualizar usuário:", err);
      showNotification(err.message || "Erro ao atualizar usuário", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.containerGeral}>
        <MenuBar />
        <Navigation />
        <div className={styles.contentWrapper}>
          <div className={styles.loadingMessage}>Carregando dados do usuário...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={styles.containerGeral}>
        <MenuBar />
        <Navigation />
        <div className={styles.contentWrapper}>
          <div className={styles.errorMessage}>
            <p>Você não tem permissão para editar usuários. Apenas administradores podem editar usuários.</p>
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
          <h1 className={styles.titulo}>Editar Usuário</h1>
          <div className={styles.decoracao}></div>

          <form onSubmit={handleSubmit} className={styles.modalContent} style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className={styles.formGroup}>
              <label htmlFor="nomeCompleto"><b>Nome completo*</b></label>
              <input
                id="nomeCompleto"
                name="nomeCompleto"
                type="text"
                value={formData.nomeCompleto}
                onChange={handleChange}
                className={formErrors.nomeCompleto ? styles.inputError : ''}
                placeholder="Nome completo do usuário"
                required
              />
              {formErrors.nomeCompleto && <span className={styles.errorText}>{formErrors.nomeCompleto}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email"><b>E-mail*</b></label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={formErrors.email ? styles.inputError : ''}
                placeholder="email@exemplo.com"
                required
              />
              {formErrors.email && <span className={styles.errorText}>{formErrors.email}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="login"><b>Login*</b></label>
              <input
                id="login"
                name="login"
                type="text"
                value={formData.login}
                onChange={handleChange}
                className={formErrors.login ? styles.inputError : ''}
                placeholder="Nome de usuário para login"
                required
              />
              {formErrors.login && <span className={styles.errorText}>{formErrors.login}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={changePassword}
                  onChange={(e) => setChangePassword(e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                <b>Alterar senha</b>
              </label>
              {changePassword && (
                <>
                  <input
                    id="senha"
                    name="senha"
                    type="password"
                    value={formData.senha}
                    onChange={handleChange}
                    className={formErrors.senha ? styles.inputError : ''}
                    placeholder="Nova senha (mínimo 6 caracteres)"
                    style={{ marginTop: '8px' }}
                  />
                  {formErrors.senha && <span className={styles.errorText}>{formErrors.senha}</span>}
                </>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="perfilId"><b>Perfil*</b></label>
              <select
                id="perfilId"
                name="perfilId"
                value={formData.perfilId}
                onChange={handleChange}
                className={formErrors.perfilId ? styles.inputError : ''}
                required
              >
                <option value="">Selecione um perfil</option>
                {profiles.map(profile => (
                  <option key={profile.profileId} value={profile.profileId}>
                    {profile.name}
                  </option>
                ))}
              </select>
              {formErrors.perfilId && <span className={styles.errorText}>{formErrors.perfilId}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="status"><b>Status*</b></label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
              </select>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => router.push("/usuarios")}
                className={styles.cancelButton}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarUsuario;

