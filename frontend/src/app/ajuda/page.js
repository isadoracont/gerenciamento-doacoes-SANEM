"use client";
import React, { useState } from "react";
import MenuBar from '../components/menubar/menubar';
import Navigation from '../components/navegation/navegation';
import styles from './ajuda.module.css';
import { FaQuestionCircle, FaChevronDown, FaChevronUp, FaHome, FaBoxes, FaShoppingCart, FaHandHoldingHeart, FaUsers, FaChartBar, FaCog, FaUser } from 'react-icons/fa';

export default function AjudaPage() {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const tutorials = [
    {
      id: 'inicio',
      title: 'Como começar',
      icon: <FaHome />,
      content: (
        <div>
          <h3>Bem-vindo ao Sanem!</h3>
          <p>O Sanem é um sistema de gestão para organizações de assistência social. Aqui você pode:</p>
          <ul>
            <li>Gerenciar doações e estoque</li>
            <li>Cadastrar beneficiários e doadores</li>
            <li>Registrar retiradas de itens</li>
            <li>Gerar relatórios</li>
          </ul>
          <p><strong>Dica:</strong> Use o menu lateral para navegar entre as diferentes seções do sistema.</p>
        </div>
      )
    },
    {
      id: 'estoque',
      title: 'Gerenciar Estoque',
      icon: <FaBoxes />,
      content: (
        <div>
          <h3>Como gerenciar o estoque</h3>
          <ol>
            <li><strong>Visualizar itens:</strong> Acesse "Estoque" no menu lateral para ver todos os itens cadastrados.</li>
            <li><strong>Adicionar item:</strong> Clique no botão "+" no canto superior direito para cadastrar um novo item.</li>
            <li><strong>Editar item:</strong> Clique em "Editar" na linha do item desejado para modificar suas informações.</li>
            <li><strong>Gerar etiqueta:</strong> Use o botão "Etiqueta" para imprimir etiquetas com QR Code dos itens.</li>
            <li><strong>Excluir item:</strong> Clique em "Excluir" para remover um item do estoque (tenha cuidado com esta ação).</li>
          </ol>
          <p><strong>Importante:</strong> A quantidade de itens é atualizada automaticamente quando há doações ou retiradas.</p>
        </div>
      )
    },
    {
      id: 'retirada',
      title: 'Registrar Retiradas',
      icon: <FaShoppingCart />,
      content: (
        <div>
          <h3>Como registrar uma retirada</h3>
          <ol>
            <li><strong>Acessar:</strong> Clique em "Retirada" no menu lateral.</li>
            <li><strong>Ver retiradas:</strong> Na lista, você verá todas as retiradas já registradas.</li>
            <li><strong>Nova retirada:</strong> Clique no botão "+" para registrar uma nova retirada.</li>
            <li><strong>Selecionar beneficiário:</strong> Digite o nome ou CPF do beneficiário no campo de busca e selecione.</li>
            <li><strong>Verificar limite:</strong> O sistema mostrará o limite mensal do beneficiário e quantos itens já foram retirados.</li>
            <li><strong>Adicionar itens:</strong> Busque os itens desejados e clique para adicioná-los à retirada.</li>
            <li><strong>Ajustar quantidade:</strong> Use os botões "+" e "-" para ajustar a quantidade de cada item.</li>
            <li><strong>Confirmar:</strong> Clique em "Registrar Retirada" para finalizar.</li>
          </ol>
          <p><strong>Nota:</strong> O estoque é atualizado automaticamente após o registro da retirada.</p>
        </div>
      )
    },
    {
      id: 'doadores',
      title: 'Gerenciar Doadores',
      icon: <FaHandHoldingHeart />,
      content: (
        <div>
          <h3>Como gerenciar doadores</h3>
          <ol>
            <li><strong>Lista de doadores:</strong> Acesse "Doadores" no menu para ver todos os doadores cadastrados.</li>
            <li><strong>Cadastrar:</strong> Clique no botão "+" para adicionar um novo doador.</li>
            <li><strong>Editar:</strong> Use o botão "Editar" para modificar informações de um doador existente.</li>
            <li><strong>Excluir:</strong> O botão "Excluir" remove um doador do sistema.</li>
          </ol>
          <p><strong>Dados necessários:</strong> Nome completo, CPF/CNPJ e contato (telefone ou email).</p>
        </div>
      )
    },
    {
      id: 'beneficiarios',
      title: 'Gerenciar Beneficiários',
      icon: <FaUsers />,
      content: (
        <div>
          <h3>Como gerenciar beneficiários</h3>
          <ol>
            <li><strong>Lista de beneficiários:</strong> Acesse "Beneficiários" no menu.</li>
            <li><strong>Cadastrar:</strong> Clique no botão "+" para cadastrar um novo beneficiário.</li>
            <li><strong>Aprovar/Rejeitar:</strong> Administradores podem aprovar ou rejeitar beneficiários pendentes usando os botões correspondentes.</li>
            <li><strong>Editar:</strong> Modifique informações usando o botão "Editar".</li>
            <li><strong>Status:</strong> Os beneficiários podem ter status: Pendente, Aprovado ou Rejeitado.</li>
            <li><strong>Limite de retirada:</strong> Você pode definir um limite mensal de itens para cada beneficiário.</li>
          </ol>
          <p><strong>Importante:</strong> Apenas beneficiários aprovados podem fazer retiradas.</p>
        </div>
      )
    },
    {
      id: 'relatorios',
      title: 'Relatórios',
      icon: <FaChartBar />,
      content: (
        <div>
          <h3>Como gerar relatórios</h3>
          <ol>
            <li><strong>Acessar:</strong> Clique em "Relatórios" no menu lateral.</li>
            <li><strong>Selecionar tipo:</strong> Escolha o tipo de relatório desejado (doações, retiradas, estoque, etc.).</li>
            <li><strong>Filtrar dados:</strong> Use os filtros para selecionar o período e outros critérios.</li>
            <li><strong>Visualizar:</strong> O relatório será exibido na tela.</li>
            <li><strong>Exportar:</strong> Use o botão de exportar para salvar o relatório em PDF ou Excel.</li>
          </ol>
          <p><strong>Dica:</strong> Os relatórios ajudam a acompanhar o fluxo de doações e distribuições.</p>
        </div>
      )
    },
    {
      id: 'configuracoes',
      title: 'Configurações',
      icon: <FaCog />,
      content: (
        <div>
          <h3>Configurações do sistema</h3>
          <ol>
            <li><strong>Acessar:</strong> Clique em "Configurações" no menu.</li>
            <li><strong>Limite de retirada:</strong> Configure o limite padrão de itens que podem ser retirados por mês.</li>
            <li><strong>Atualizar:</strong> Modifique os valores e clique em "Salvar" para aplicar as mudanças.</li>
          </ol>
          <p><strong>Nota:</strong> Apenas administradores podem alterar as configurações do sistema.</p>
        </div>
      )
    },
    {
      id: 'usuarios',
      title: 'Gerenciar Usuários',
      icon: <FaUser />,
      content: (
        <div>
          <h3>Como gerenciar usuários (Apenas Administradores)</h3>
          <ol>
            <li><strong>Acessar:</strong> Clique em "Usuários" no menu lateral.</li>
            <li><strong>Lista de usuários:</strong> Veja todos os usuários cadastrados no sistema.</li>
            <li><strong>Adicionar:</strong> Use o botão "+" para criar um novo usuário.</li>
            <li><strong>Editar:</strong> Modifique informações de usuários existentes.</li>
            <li><strong>Excluir:</strong> Remova usuários do sistema (use com cuidado).</li>
            <li><strong>Perfis:</strong> Atribua perfis diferentes (Administrador, Atendente) aos usuários.</li>
          </ol>
          <p><strong>Segurança:</strong> Apenas administradores têm acesso a esta funcionalidade.</p>
        </div>
      )
    }
  ];

  return (
    <div className={styles.containerGeral}>
      <Navigation />
      <MenuBar />
      <div className={styles.contentWrapper}>
        <div className={styles.listContainer}>
          <h1 className={styles.titulo}>
            <FaQuestionCircle className={styles.titleIcon} />
            Central de Ajuda
          </h1>
          <div className={styles.decoracao}></div>
          
          <p className={styles.intro}>
            Bem-vindo à central de ajuda do Sanem! Aqui você encontrará tutoriais e informações sobre como usar o sistema.
            Clique em cada seção para expandir e ver os detalhes.
          </p>

          <div className={styles.tutorialsList}>
            {tutorials.map((tutorial) => (
              <div key={tutorial.id} className={styles.tutorialCard}>
                <button
                  className={styles.tutorialHeader}
                  onClick={() => toggleSection(tutorial.id)}
                >
                  <div className={styles.tutorialHeaderContent}>
                    <span className={styles.tutorialIcon}>{tutorial.icon}</span>
                    <span className={styles.tutorialTitle}>{tutorial.title}</span>
                  </div>
                  {openSection === tutorial.id ? (
                    <FaChevronUp className={styles.chevronIcon} />
                  ) : (
                    <FaChevronDown className={styles.chevronIcon} />
                  )}
                </button>
                {openSection === tutorial.id && (
                  <div className={styles.tutorialContent}>
                    {tutorial.content}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className={styles.contactSection}>
            <h2>Precisa de mais ajuda?</h2>
            <p>Se você não encontrou a resposta que procurava, entre em contato com o suporte técnico.</p>
            <p className={styles.contactInfo}>
              <strong>Email:</strong> suporte@sanem.com.br<br />
              <strong>Telefone:</strong> (45) 99999-9999
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
