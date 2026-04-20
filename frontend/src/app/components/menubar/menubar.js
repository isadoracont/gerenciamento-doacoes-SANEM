"use client";
import { useState, useEffect } from 'react';
import styles from './menuBar.module.css';
import Image from 'next/image';
import authService from '../../../services/authService';
import { useRouter } from 'next/navigation';
import { useNotification } from '../../../components/notifications/NotificationProvider';

export default function MenuBar({ hasNotification }) {
  const [userName, setUserName] = useState('Usuário');
  const [userId, setUserId] = useState(null);
  const router = useRouter();
  const { showNotification } = useNotification();

  useEffect(() => {
    const user = authService.getUser();
    if (user && user.name) {
      setUserName(user.name);
    }
    if (user && user.id) {
      setUserId(user.id);
    }
  }, []);

  const handleUserClick = () => {
    if (userId) {
      // Navegar para a página de usuários com parâmetro para editar o próprio usuário
      router.push(`/usuarios?editSelf=true`);
    } else {
      // Se não tiver ID, tentar buscar
      const user = authService.getUser();
      if (user && user.id) {
        router.push(`/usuarios?editSelf=true`);
      } else {
        showNotification("Erro ao carregar dados do usuário", "error");
      }
    }
  };

  const handleLogout = () => {
    authService.logout();
    showNotification("Logout realizado com sucesso!", "success");
    router.push('/');
  };

  return (
    <header className={styles.menuBar}>
      <div className={styles.rightSection}>
        <div className={styles.userInfo} onClick={handleUserClick}>
          <UserIcon />
          <span className={styles.userName}>{userName}</span>
          <span className={styles.arrowDown}>▼</span>
        </div>
        <div className={styles.iconWrapper} style={{ position: 'relative' }}>
        </div>
        <div className={styles.iconWrapper} onClick={handleLogout} title="Sair">
          <LogoutIcon />
        </div>
      </div>
    </header>
  );
}

function UserIcon() {
    return (
        <Image
            src="/user-icon.png"
            alt="User"
            width={24}
            height={24}
            style={{ marginRight: 12 }}
        />
    );
}

function LogoutIcon() {
    return (
        <Image
            src="/logout-icon.png"
            alt="Logout"
            width={24}
            height={24}
            style={{ marginRight: 12 }}
        />
    );
}
