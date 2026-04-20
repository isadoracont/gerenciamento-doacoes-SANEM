import Image from 'next/image';

export default function EmDesenvolvimento() {
  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: 32,
      marginTop: 32,
      marginBottom: 32
    }}>
      <div style={{ marginBottom: 24 }}>
        <Image src="/window.svg" alt="Em desenvolvimento" width={80} height={80} />
      </div>
      <h2 style={{ color: '#0a3977', fontSize: '2rem', fontWeight: 700, marginBottom: 12 }}>Tela em Desenvolvimento</h2>
      <p style={{ color: '#222', fontSize: '1.2rem', marginBottom: 16, textAlign: 'center', maxWidth: 400 }}>
        Esta funcionalidade ainda está sendo construída.<br />
        Em breve você poderá acessar todos os recursos desta página!
      </p>
      <p style={{ color: '#444', fontSize: '1rem', textAlign: 'center', maxWidth: 400 }}>
        Enquanto isso, utilize o menu lateral para navegar pelas outras áreas do sistema.
      </p>
    </div>
  );
} 