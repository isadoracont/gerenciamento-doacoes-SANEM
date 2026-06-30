"use client"
import React, { useState, useEffect, useRef } from "react"
import MenuBar from "../../components/menubar/menubar"
import Navigation from "../../components/navegation/navegation"
import styles from "./lista.module.css"
import apiService from "../../../services/api"
import { useNotification } from "../../../components/notifications/NotificationProvider"
import { FaPlus, FaTrash, FaMinus, FaChevronDown, FaTimes } from "react-icons/fa"
import ConfirmationModal from "../../../components/confirmation/ConfirmationModal"
import {
    mapDonorFromBackend,
    mapItemFromBackend,
    mapDonationFromBackend
} from "../../../services/dataMapper"
import authService from "../../../services/authService"

export default function ListaDoacoesPage() {
    const { showNotification } = useNotification()

    const [donations, setDonations] = useState([])
    const [loading, setLoading] = useState(true)
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        action: null,
        message: "",
        title: ""
    })
    
    // Modais e estados de Adição
    const [showAddModal, setShowAddModal] = useState(false)
    const [donors, setDonors] = useState([])
    const [items, setItems] = useState([])
    const [selectedDonor, setSelectedDonor] = useState(null)
    const [selectedItems, setSelectedItems] = useState([])
    const [searchDonor, setSearchDonor] = useState("")
    const [searchItem, setSearchItem] = useState("")
    const [newItemName, setNewItemName] = useState("")
    const [submitting, setSubmitting] = useState(false)

    // ==========================================
    // LÓGICA DE FILTROS APRIMORADA
    // ==========================================
    
    // 'filters' guarda os valores que realmente vão para o backend
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        donorName: "",
        attendantName: "",
        itemName: ""
    })

    // 'inputValues' guarda o que o usuário está digitando na tela
    const [inputValues, setInputValues] = useState({
        donorName: "",
        attendantName: "",
        itemName: ""
    })

    const [activeDropdown, setActiveDropdown] = useState(null)
    const [filterOptions, setFilterOptions] = useState({
        donors: [],
        attendants: [],
        items: []
    })

    const dropdownRef = useRef(null)

    // Detecta cliques fora dos dropdowns para fechá-los de forma limpa
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdown(null)
                // Se o usuário digitou algo mas não selecionou, reverte o texto para o filtro atual
                setInputValues({
                    donorName: filters.donorName,
                    attendantName: filters.attendantName,
                    itemName: filters.itemName
                })
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [filters])

    // Carrega as opções dos selects ao montar a tela
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const [dData, uData, iData] = await Promise.all([
                    apiService.getDonors(),
                    apiService.getUsers(),
                    apiService.getItems()
                ])
                setFilterOptions({
                    donors: (dData || []).map(d => d.name || d.nomeCompleto).filter(Boolean),
                    attendants: (uData || []).map(u => u.name || u.nomeCompleto).filter(Boolean),
                    items: (iData || []).map(i => i.description || i.nome).filter(Boolean)
                })
            } catch (err) {
                console.error("Erro ao carregar opções de filtro", err)
            }
        }
        fetchFilterOptions()
    }, [])

    // Carrega os dados reais sempre que o objeto de filtros oficiais mudar
    useEffect(() => {
        loadDonations(filters)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.startDate, filters.endDate, filters.donorName, filters.attendantName, filters.itemName])

    const handleDateChange = (e) => {
        const { name, value } = e.target
        setFilters(prev => ({ ...prev, [name]: value }))
    }

    // Lida apenas com a digitação (não faz requisição)
    const handleTextTyping = (field, value) => {
        setInputValues(prev => ({ ...prev, [field]: value }))
        setActiveDropdown(field)

        // Se o usuário apagar tudo manualmente, nós limpamos o filtro oficial também
        if (value.trim() === "") {
            setFilters(prev => ({ ...prev, [field]: "" }))
        }
    }

    // Lida com a seleção de uma opção na lista (Faz a requisição)
    const handleOptionSelect = (field, value) => {
        setInputValues(prev => ({ ...prev, [field]: value })) // Preenche o input
        setFilters(prev => ({ ...prev, [field]: value })) // Atualiza o filtro oficial
        setActiveDropdown(null) // Fecha o dropdown
    }

    const clearFilters = () => {
        setFilters({ startDate: "", endDate: "", donorName: "", attendantName: "", itemName: "" })
        setInputValues({ donorName: "", attendantName: "", itemName: "" })
    }

    const loadDonations = async (activeFilters = {}) => {
        if (activeFilters.startDate && activeFilters.endDate) {
            if (new Date(activeFilters.startDate) > new Date(activeFilters.endDate)) {
                showNotification("A data inicial não pode ser maior que a data final.", "warning")
                setDonations([])
                return
            }
        }

        try {
            setLoading(true)
            const cleanFilters = Object.fromEntries(
                Object.entries(activeFilters).filter(([_, v]) => v !== "")
            )

            const data = await apiService.getDonations(cleanFilters)
            const donationsArray = Array.isArray(data) ? data : []
            const mappedDonations = donationsArray.map(mapDonationFromBackend)

            const sortedDonations = mappedDonations.sort((a, b) => {
                const dateA = a.donationDate ? new Date(a.donationDate).getTime() : 0
                const dateB = b.donationDate ? new Date(b.donationDate).getTime() : 0
                return dateB - dateA
            })

            setDonations(sortedDonations)
        } catch (err) {
            console.error("Erro ao carregar doações:", err)
            showNotification(err.message || "Erro ao carregar doações", "error")
            setDonations([])
        } finally {
            setLoading(false)
        }
    }
    // ==========================================

    useEffect(() => {
        if (showAddModal) {
            loadDonors()
            loadItems()
        }
    }, [showAddModal])

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            action: async () => {
                try {
                    await apiService.deleteDonation(id)
                    showNotification("Doação excluída com sucesso!", "success")
                    loadDonations(filters) // Atualiza respeitando filtros
                } catch (err) {
                    console.error("Erro ao excluir doação:", err)
                    showNotification(err.message || "Erro ao excluir doação", "error")
                } finally {
                    setConfirmModal({ isOpen: false, action: null, message: "", title: "" })
                }
            },
            message: "Tem certeza que deseja excluir esta doação? Esta ação não pode ser desfeita.",
            title: "Confirmar Exclusão"
        })
    }

    const loadDonors = async () => {
        try {
            const data = await apiService.getDonors()
            const mapped = (data || []).map(mapDonorFromBackend)
            setDonors(mapped)
        } catch (err) {
            showNotification("Erro ao carregar doadores", "error")
        }
    }

    const loadItems = async () => {
        try {
            const data = await apiService.getItems()
            const mapped = (data || []).map(mapItemFromBackend)
            setItems(mapped)
        } catch (err) {
            showNotification("Erro ao carregar itens", "error")
        }
    }

    const handleAdd = () => {
        setSelectedDonor(null)
        setSelectedItems([])
        setSearchDonor("")
        setSearchItem("")
        setNewItemName("")
        setShowAddModal(true)
    }

    const filteredDonors = donors.filter(
        (d) =>
            d.nomeCompleto?.toLowerCase().includes(searchDonor.toLowerCase()) ||
            d.cpf?.includes(searchDonor)
    )

    const filteredItems = items.filter(
        (item) =>
            item.nome?.toLowerCase().includes(searchItem.toLowerCase()) ||
            item.descricao?.toLowerCase().includes(searchItem.toLowerCase())
    )

    const handleAddExistingItem = (item) => {
        const existing = selectedItems.find((si) => !si.isNew && si.itemId === item.id)
        if (existing) {
            setSelectedItems(
                selectedItems.map((si) =>
                    !si.isNew && si.itemId === item.id
                        ? { ...si, quantity: si.quantity + 1 }
                        : si
                )
            )
        } else {
            setSelectedItems([
                ...selectedItems,
                { isNew: false, itemId: item.id, quantity: 1, item }
            ])
        }
    }

    const handleAddNewItem = () => {
        if (!newItemName.trim()) return
        const tempId = `new_${Date.now()}`
        setSelectedItems([
            ...selectedItems,
            { isNew: true, tempId, nome: newItemName.trim(), quantity: 1 }
        ])
        setNewItemName("")
    }

    const handleUpdateQuantity = (identifier, isNew, delta) => {
        setSelectedItems(
            selectedItems.map((si) => {
                const match = isNew ? si.isNew && si.tempId === identifier : !si.isNew && si.itemId === identifier
                if (match) {
                    const newQuantity = Math.max(1, si.quantity + delta)
                    return { ...si, quantity: newQuantity }
                }
                return si
            })
        )
    }

    const handleRemoveItem = (identifier, isNew) => {
        setSelectedItems(
            selectedItems.filter((si) => {
                if (isNew) return si.tempId !== identifier
                return si.itemId !== identifier
            })
        )
    }

    const handleSubmitDonation = async (e) => {
        e.preventDefault()

        if (!selectedDonor) {
            showNotification("Selecione um doador", "error")
            return
        }

        if (selectedItems.length === 0) {
            showNotification("Adicione pelo menos um item", "error")
            return
        }

        const user = authService.getUser()
        if (!user || !user.id) {
            showNotification("Usuário não autenticado. Por favor, faça login novamente.", "error")
            return
        }

        try {
            setSubmitting(true)
            const donationData = {
                donationDate: new Date().toISOString(),
                donorId: selectedDonor.id,
                attendantUserId: user.id,
                items: selectedItems.map((si) => {
                    if (si.isNew) return { newItemName: si.nome, quantity: si.quantity }
                    return { itemId: si.itemId, quantity: si.quantity }
                })
            }

            await apiService.createDonation(donationData)
            showNotification("Doação registrada com sucesso!", "success")
            setShowAddModal(false)
            loadDonations(filters)
        } catch (err) {
            console.error("Erro ao registrar doação:", err)
            showNotification(err.message || "Erro ao registrar doação", "error")
        } finally {
            setSubmitting(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return "N/A"
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return "N/A"
            const day = String(date.getDate()).padStart(2, "0")
            const month = String(date.getMonth() + 1).padStart(2, "0")
            const year = date.getFullYear()
            const hours = String(date.getHours()).padStart(2, "0")
            const minutes = String(date.getMinutes()).padStart(2, "0")
            return `${day}/${month}/${year}, ${hours}:${minutes}`
        } catch (e) {
            return "N/A"
        }
    }

    return (
        <div className={styles.containerGeral}>
            <MenuBar />
            <Navigation />
            <div className={styles.contentWrapper}>
                <div className={styles.listContainer}>
                    
                    <div className={styles.pageHeader}>
                        <h1 className={styles.titulo}>Doações Registradas</h1>
                        <button className={styles.addButton} onClick={handleAdd} title="Registrar Nova Doação">
                            <FaPlus />
                        </button>
                    </div>
                    <div className={styles.decoracao}></div>

                    {/* BARRA DE FILTROS ENVOLVIDA PELA REF */}
                    <div className={styles.filtersContainer} ref={dropdownRef}>
                        <div className={`${styles.formGroup} ${styles.filterGroupDate}`}>
                            <input 
                                type="date" 
                                name="startDate"
                                value={filters.startDate}
                                onChange={handleDateChange}
                                title="Data Inicial"
                            />
                        </div>
                        <span className={styles.dateSeparator}>até</span>
                        <div className={`${styles.formGroup} ${styles.filterGroupDate}`}>
                            <input 
                                type="date" 
                                name="endDate"
                                value={filters.endDate}
                                onChange={handleDateChange}
                                title="Data Final"
                            />
                        </div>

                        {/* SELECT COM PESQUISA: Doador */}
                        <div className={`${styles.formGroup} ${styles.filterGroupText}`} style={{ position: "relative" }}>
                            <input 
                                type="text"
                                placeholder="Filtrar por Doador..." 
                                value={inputValues.donorName}
                                onChange={(e) => handleTextTyping("donorName", e.target.value)}
                                onClick={() => setActiveDropdown("donorName")}
                                autoComplete="off"
                                style={{ paddingRight: "60px" }}
                            />
                            {inputValues.donorName && (
                                <FaTimes 
                                    className={styles.clearIcon}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOptionSelect("donorName", "");
                                    }}
                                    title="Limpar Doador"
                                />
                            )}
                            <FaChevronDown 
                                className={styles.selectIcon} 
                                style={{ transform: activeDropdown === "donorName" ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)" }} 
                            />
                            {activeDropdown === "donorName" && (
                                <div className={styles.filterDropdown}>
                                    {filterOptions.donors
                                        .filter(opt => opt.toLowerCase().includes(inputValues.donorName.toLowerCase()))
                                        .map((opt, idx) => (
                                            <div 
                                                key={idx} 
                                                className={styles.filterDropdownItem}
                                                onClick={() => handleOptionSelect("donorName", opt)}
                                            >
                                                {opt}
                                            </div>
                                        ))}
                                    {filterOptions.donors.filter(opt => opt.toLowerCase().includes(inputValues.donorName.toLowerCase())).length === 0 && (
                                        <div className={styles.filterDropdownItemEmpty}>Nenhum doador encontrado</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* SELECT COM PESQUISA: Atendente */}
                        <div className={`${styles.formGroup} ${styles.filterGroupText}`} style={{ position: "relative" }}>
                            <input 
                                type="text"
                                placeholder="Filtrar por Atendente..." 
                                value={inputValues.attendantName}
                                onChange={(e) => handleTextTyping("attendantName", e.target.value)}
                                onClick={() => setActiveDropdown("attendantName")}
                                autoComplete="off"
                                style={{ paddingRight: "60px" }}
                            />
                            {inputValues.attendantName && (
                                <FaTimes 
                                    className={styles.clearIcon}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOptionSelect("attendantName", "");
                                    }}
                                    title="Limpar Atendente"
                                />
                            )}
                            <FaChevronDown 
                                className={styles.selectIcon} 
                                style={{ transform: activeDropdown === "attendantName" ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)" }} 
                            />
                            {activeDropdown === "attendantName" && (
                                <div className={styles.filterDropdown}>
                                    {filterOptions.attendants
                                        .filter(opt => opt.toLowerCase().includes(inputValues.attendantName.toLowerCase()))
                                        .map((opt, idx) => (
                                            <div 
                                                key={idx} 
                                                className={styles.filterDropdownItem}
                                                onClick={() => handleOptionSelect("attendantName", opt)}
                                            >
                                                {opt}
                                            </div>
                                        ))}
                                    {filterOptions.attendants.filter(opt => opt.toLowerCase().includes(inputValues.attendantName.toLowerCase())).length === 0 && (
                                        <div className={styles.filterDropdownItemEmpty}>Nenhum atendente encontrado</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* SELECT COM PESQUISA: Item */}
                        <div className={`${styles.formGroup} ${styles.filterGroupText}`} style={{ position: "relative" }}>
                            <input 
                                type="text"
                                placeholder="Filtrar por Item..." 
                                value={inputValues.itemName}
                                onChange={(e) => handleTextTyping("itemName", e.target.value)}
                                onClick={() => setActiveDropdown("itemName")}
                                autoComplete="off"
                                style={{ paddingRight: "60px" }}
                            />
                            {inputValues.itemName && (
                                <FaTimes 
                                    className={styles.clearIcon}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOptionSelect("itemName", "");
                                    }}
                                    title="Limpar Item"
                                />
                            )}
                            <FaChevronDown 
                                className={styles.selectIcon} 
                                style={{ transform: activeDropdown === "itemName" ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)" }} 
                            />
                            {activeDropdown === "itemName" && (
                                <div className={styles.filterDropdown}>
                                    {filterOptions.items
                                        .filter(opt => opt.toLowerCase().includes(inputValues.itemName.toLowerCase()))
                                        .map((opt, idx) => (
                                            <div 
                                                key={idx} 
                                                className={styles.filterDropdownItem}
                                                onClick={() => handleOptionSelect("itemName", opt)}
                                            >
                                                {opt}
                                            </div>
                                        ))}
                                    {filterOptions.items.filter(opt => opt.toLowerCase().includes(inputValues.itemName.toLowerCase())).length === 0 && (
                                        <div className={styles.filterDropdownItemEmpty}>Nenhum item encontrado</div>
                                    )}
                                </div>
                            )}
                        </div>

                        <button 
                            className={`${styles.cancelButton} ${styles.clearFilterButton}`} 
                            onClick={clearFilters}
                            title="Limpar Filtros"
                        >
                            Limpar
                        </button>
                    </div>
                    {/* FIM BARRA DE FILTROS */}

                    <div className={styles.tableWrapper}>
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Doador</th>
                                    <th>Atendente</th>
                                    <th>Itens</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className={styles.loadingMessage}>Carregando...</td>
                                    </tr>
                                ) : donations.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className={styles.noDataMessage}>Nenhuma doação encontrada.</td>
                                    </tr>
                                ) : (
                                    donations.map((donation) => (
                                        <tr key={donation.donationId || donation.id}>
                                            <td>{formatDate(donation.donationDate)}</td>
                                            <td>{donation.donor?.name || donation.donor?.fullName || "N/A"}</td>
                                            <td>
                                                {donation.receiverUser?.name ||
                                                    donation.receiverUser?.login ||
                                                    donation.appUser?.name ||
                                                    "N/A"}
                                            </td>
                                            <td>
                                                {donation.items && donation.items.length > 0 ? (
                                                    <div>
                                                        {donation.items.map((item, idx) => (
                                                            <span
                                                                key={idx}
                                                                style={{
                                                                    display: "block",
                                                                    fontSize: "0.9rem",
                                                                    marginBottom: "4px"
                                                                }}
                                                            >
                                                                {item.nome || item.item?.description || "Item"} - Qtd: {item.quantity || 0}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    "N/A"
                                                )}
                                            </td>
                                            <td>
                                                <div className={styles.actionButtons}>
                                                    <button
                                                        className={styles.deleteButton}
                                                        onClick={() => handleDelete(donation.donationId || donation.id)}
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
                </div>
            </div>

            {/* Modal de Registrar Doação */}
            {showAddModal && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => setShowAddModal(false)}
                >
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2>Registrar Doação</h2>
                        <form onSubmit={handleSubmitDonation}>
                            <div className={styles.formSection}>
                                <label>Doador *</label>
                                <input
                                    type="text"
                                    placeholder="Buscar doador por nome ou CPF..."
                                    value={searchDonor}
                                    onChange={(e) =>
                                        setSearchDonor(e.target.value)
                                    }
                                    className={styles.searchInput}
                                />
                                {searchDonor && (
                                    <div className={styles.dropdown}>
                                        {filteredDonors.length === 0 ? (
                                            <div
                                                className={styles.dropdownItem}
                                            >
                                                Nenhum doador encontrado
                                            </div>
                                        ) : (
                                            filteredDonors.map((donor) => (
                                                <div
                                                    key={donor.id}
                                                    className={
                                                        styles.dropdownItem
                                                    }
                                                    onClick={() => {
                                                        setSelectedDonor(donor)
                                                        setSearchDonor(
                                                            donor.nomeCompleto
                                                        )
                                                    }}
                                                >
                                                    <div>
                                                        <strong>
                                                            {donor.nomeCompleto}
                                                        </strong>
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: "0.9rem",
                                                            color: "#666"
                                                        }}
                                                    >
                                                        CPF:{" "}
                                                        {donor.cpf || "N/A"}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                                {selectedDonor && (
                                    <div className={styles.selectedInfo}>
                                        <div>
                                            <strong>Doador selecionado:</strong>{" "}
                                            {selectedDonor.nomeCompleto}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={styles.formSection}>
                                <label>Itens da Doação *</label>

                                <div className={styles.itemSelectionContainer}>
                                    <div className={styles.searchExisting}>
                                        <input
                                            type="text"
                                            placeholder="Buscar item existente no estoque..."
                                            value={searchItem}
                                            onChange={(e) =>
                                                setSearchItem(e.target.value)
                                            }
                                            className={styles.searchInput}
                                        />
                                        {searchItem && (
                                            <div className={styles.dropdown}>
                                                {filteredItems.length === 0 ? (
                                                    <div
                                                        className={
                                                            styles.dropdownItem
                                                        }
                                                    >
                                                        Nenhum item encontrado
                                                    </div>
                                                ) : (
                                                    filteredItems.map(
                                                        (item) => (
                                                            <div
                                                                key={item.id}
                                                                className={
                                                                    styles.dropdownItem
                                                                }
                                                                onClick={() =>
                                                                    handleAddExistingItem(
                                                                        item
                                                                    )
                                                                }
                                                            >
                                                                <div>
                                                                    <strong>
                                                                        {item.nome ||
                                                                            item.descricao}
                                                                    </strong>
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        fontSize:
                                                                            "0.9rem",
                                                                        color: "#666"
                                                                    }}
                                                                >
                                                                    Estoque
                                                                    Atual:{" "}
                                                                    {
                                                                        item.quantidade
                                                                    }
                                                                </div>
                                                            </div>
                                                        )
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.divider}>
                                        <span>OU</span>
                                    </div>

                                    <div className={styles.createNewItem}>
                                        <div
                                            className={styles.newItemInputGroup}
                                        >
                                            <input
                                                type="text"
                                                placeholder="Nome do novo item..."
                                                value={newItemName}
                                                onChange={(e) =>
                                                    setNewItemName(
                                                        e.target.value
                                                    )
                                                }
                                                className={styles.searchInput}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddNewItem}
                                                disabled={!newItemName.trim()}
                                                className={
                                                    styles.addSecondaryButton
                                                }
                                            >
                                                Criar Novo
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {selectedItems.length > 0 && (
                                    <div
                                        className={
                                            styles.selectedItemsContainer
                                        }
                                    >
                                        <h3
                                            style={{
                                                fontSize: "1rem",
                                                marginBottom: "10px",
                                                color: "#333"
                                            }}
                                        >
                                            Itens Selecionados
                                        </h3>
                                        {selectedItems.map((si) => (
                                            <div
                                                key={
                                                    si.isNew
                                                        ? si.tempId
                                                        : si.itemId
                                                }
                                                className={styles.selectedItem}
                                            >
                                                <div
                                                    className={styles.itemInfo}
                                                >
                                                    <strong>
                                                        {si.isNew
                                                            ? si.nome
                                                            : si.item?.nome ||
                                                              si.item
                                                                  ?.descricao ||
                                                              "Item"}
                                                    </strong>
                                                    {si.isNew && (
                                                        <span
                                                            className={
                                                                styles.newItemBadge
                                                            }
                                                        >
                                                            Novo Item
                                                        </span>
                                                    )}
                                                </div>
                                                <div
                                                    className={
                                                        styles.itemControls
                                                    }
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleUpdateQuantity(
                                                                si.isNew
                                                                    ? si.tempId
                                                                    : si.itemId,
                                                                si.isNew,
                                                                -1
                                                            )
                                                        }
                                                        disabled={
                                                            si.quantity <= 1
                                                        }
                                                        className={
                                                            styles.quantityButton
                                                        }
                                                    >
                                                        <FaMinus />
                                                    </button>
                                                    <span
                                                        className={
                                                            styles.quantity
                                                        }
                                                    >
                                                        {si.quantity}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleUpdateQuantity(
                                                                si.isNew
                                                                    ? si.tempId
                                                                    : si.itemId,
                                                                si.isNew,
                                                                1
                                                            )
                                                        }
                                                        className={
                                                            styles.quantityButton
                                                        }
                                                    >
                                                        <FaPlus />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveItem(
                                                                si.isNew
                                                                    ? si.tempId
                                                                    : si.itemId,
                                                                si.isNew
                                                            )
                                                        }
                                                        className={
                                                            styles.removeButton
                                                        }
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <div className={styles.total}>
                                            <strong>
                                                Total de itens: {totalItems}
                                            </strong>
                                        </div>
                                    </div>
                                )}
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
                                    disabled={
                                        submitting ||
                                        !selectedDonor ||
                                        selectedItems.length === 0
                                    }
                                >
                                    {submitting
                                        ? "Registrando..."
                                        : "Registrar Doação"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() =>
                    setConfirmModal({
                        isOpen: false,
                        action: null,
                        message: "",
                        title: ""
                    })
                }
                onConfirm={confirmModal.action}
                message={confirmModal.message}
                title={confirmModal.title}
            />
        </div>
    )
}
