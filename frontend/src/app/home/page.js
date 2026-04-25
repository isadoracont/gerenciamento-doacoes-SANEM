import MenuBar from '../components/menubar/menubar';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '../components/navegation/navegation';
import styles from './home.module.css';
import { FaQuestionCircle } from 'react-icons/fa';

export default function Home() {
  // Simulação: troque para true/false para testar
  const hasNotification = true;

  return (
    <div className={styles.container}>
      <Navigation />
      <MenuBar hasNotification={hasNotification} />
      <main className={styles.main}>
        <Image
          src="/doantion.jpg"
          alt="Doação"
          width={320}
          height={180}
          className={styles.donationImage}
          style={{ width: 'auto', height: 'auto' }}
          priority
        />
        <h1 className={styles.title}>Bem-vindo à Sanem!</h1>
        <p className={styles.effectPhrase}>
          "A solidariedade transforma vidas. Doe hoje e faça a diferença!"
        </p>
        <Link href="/ajuda" className={styles.helpButton}>
          <FaQuestionCircle />
          <span>Ajuda</span>
        </Link>
      </main>
    </div>
  );
} 