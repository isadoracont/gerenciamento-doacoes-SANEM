"use client";
import EmDesenvolvimento from '../components/EmDesenvolvimento';
import Navigation from '../components/navegation/navegation';
import MenuBar from '../components/menubar/menubar';

export default function RelatoriosPage() {
  return (
    <>
      <Navigation />
      <div style={{ minHeight: '100vh', background: '#fff', marginLeft: 220 }}>
        <MenuBar />
        <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <EmDesenvolvimento />
        </main>
      </div>
    </>
  );
} 