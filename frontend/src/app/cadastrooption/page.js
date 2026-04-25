"use client";

import MenuBar from '../components/menubar/menubar';
import Navigation from '../components/navegation/navegation';
import styles from './cadastrooption.module.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Cadastrooption() {
  const hasNotification = true;
  const [selected, setSelected] = useState('doador');
  const router = useRouter();

  const handleAvancar = () => {
    if (selected === 'doador') router.push('/cadastrodoador');
    else if (selected === 'beneficiario') router.push('/cadastrobeneficiario');
  };

  return (
    <div className={styles.containerGeral}>
      <Navigation />
      <div className={styles.contentWrapper}>
        <MenuBar hasNotification={hasNotification} />
        <main className={styles.main}>
          <div className={styles.boxCadastro}>
            <h1 className={styles.titulo}>Selecione o tipo de cadastro</h1>
            <div className={styles.decoracao}></div>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input type="radio" className={styles.radioInput} name="tipo" value="doador" checked={selected === 'doador'} onChange={() => setSelected('doador')} />
                <span className={styles.radioText}><b>Doador</b></span>
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" className={styles.radioInput} name="tipo" value="beneficiario" checked={selected === 'beneficiario'} onChange={() => setSelected('beneficiario')} />
                <span className={styles.radioText}><b>Beneficiário</b></span>
              </label>
            </div>
            <button className={styles.buttonAvancar} onClick={handleAvancar}>Avançar</button>
          </div>
        </main>
      </div>
    </div>
  );
} 

