"use client";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './navegation.module.css';
import { FaHome, FaUserPlus, FaBoxes, FaHandHoldingHeart, FaUsers, FaChartBar, FaCog, FaUser, FaQuestionCircle, FaShoppingCart } from 'react-icons/fa';

const menuIcons = {
    Home: <FaHome />,
    Cadastro: <FaUserPlus />,
    Estoque: <FaBoxes />,
    Doadores: <FaHandHoldingHeart />,
    Beneficiários: <FaUsers />,
    Retirada: <FaShoppingCart />,
    Relatórios: <FaChartBar />,
    Configurações: <FaCog />,
    Usuários: <FaUser />,
    Ajuda: <FaQuestionCircle />,
};

export default function Navigation() {
    const pathname = usePathname();

    const isActive = (path) => {
        if (path === '/home') {
            return pathname === '/home';
        }
        return pathname?.startsWith(path);
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoContainer}>
                <Image src="/logo-sanem.svg" alt="Sanem" width={80} height={80} />
                <div className={styles.logoText}></div>
            </div>
            <div className={styles.sectionTitle}>MENU</div>
            <nav className={styles.menuSection}>
                <Link href="/home" className={`${styles.menuItem} ${isActive('/home') ? styles.active : ''}`}>
                    {menuIcons.Home} Home
                </Link>
                <Link href="/estoque" className={`${styles.menuItem} ${isActive('/estoque') ? styles.active : ''}`}>
                    {menuIcons.Estoque} Estoque
                </Link>
                <Link href="/retirada" className={`${styles.menuItem} ${isActive('/retirada') ? styles.active : ''}`}>
                    {menuIcons.Retirada} Retirada
                </Link>
                <Link href="/cadastrodoador/lista" className={`${styles.menuItem} ${isActive('/cadastrodoador') ? styles.active : ''}`}>
                    {menuIcons.Doadores} Doadores
                </Link>
                <Link href="/cadastrobeneficiario/lista" className={`${styles.menuItem} ${isActive('/cadastrobeneficiario') ? styles.active : ''}`}>
                    {menuIcons.Beneficiários} Beneficiários
                </Link>
            </nav>
            <div className={styles.sectionTitle}>OTHERS</div>
            <nav className={styles.menuSection}>
                <Link href="/relatorios" className={`${styles.menuItem} ${isActive('/relatorios') ? styles.active : ''}`}>
                    {menuIcons.Relatórios} Relatórios
                </Link>
                <Link href="/configuracoes" className={`${styles.menuItem} ${isActive('/configuracoes') ? styles.active : ''}`}>
                    {menuIcons.Configurações} Configurações
                </Link>
                <Link href="/usuarios" className={`${styles.menuItem} ${isActive('/usuarios') ? styles.active : ''}`}>
                    {menuIcons.Usuários} Usuários
                </Link>
                <Link href="/ajuda" className={`${styles.menuItem} ${isActive('/ajuda') ? styles.active : ''}`}>
                    {menuIcons.Ajuda} Ajuda
                </Link>
            </nav>
        </aside>
    );
}
