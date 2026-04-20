'use client';
import Navigation from '../components/navegation/navegation';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SucessoContent() {
  const router = useRouter();
  const params = useSearchParams();
  const tipo = params.get('tipo');
  let destino = '/home';
  if (tipo === 'doadores') destino = '/cadastrodoador/lista';
  if (tipo === 'beneficiarios') destino = '/cadastrobeneficiario/lista';

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      background: "#f7f7fa"
    }}>
      <Navigation />
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%"
      }}>
        <Image src="/doantion.jpg" alt="Sucesso" width={180} height={120} style={{ borderRadius: 12, marginBottom: 24, boxShadow: '0 2px 8px rgba(25,118,210,0.10)' }} />
        <div style={{
          background: "#fff",
          padding: "32px 32px",
          borderRadius: "20px",
          border: "1.5px solid #e5e7eb",
          fontSize: "2rem",
          fontWeight: "700",
          color: "#1976d2",
          textAlign: "center",
          boxShadow: "0 4px 24px rgba(25, 118, 210, 0.08)",
          marginBottom: 32
        }}>
          Cadastro feito com sucesso!
        </div>
        <button onClick={() => router.push(destino)} style={{
          display: "inline-block",
          background: "#1976d2",
          color: "#fff",
          padding: "16px 40px",
          borderRadius: "12px",
          fontWeight: 700,
          fontSize: "1.2rem",
          textDecoration: "none",
          boxShadow: "0 2px 8px rgba(25, 118, 210, 0.08)",
          transition: "background 0.2s",
          marginTop: 8,
          border: 'none',
          cursor: 'pointer'
        }}>
          Ir para a lista
        </button>
      </div>
    </div>
  );
}

export default function Sucesso() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f7fa"
      }}>
        <div style={{
          fontSize: "1.2rem",
          color: "#1976d2"
        }}>
          Carregando...
        </div>
      </div>
    }>
      <SucessoContent />
    </Suspense>
  );
} 