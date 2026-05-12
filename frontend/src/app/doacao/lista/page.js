"use client"
import React, { useState, useEffect } from "react"
import MenuBar from "../../components/menubar/menubar"
import Navigation from "../../components/navegation/navegation"
import styles from "./lista.module.css"
import apiService from "../../../services/api"
import { useNotification } from "../../../components/notifications/NotificationProvider"
import { FaPlus, FaTrash, FaMinus } from "react-icons/fa"
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
    const [showAddModal, setShowAddModal] = useState(false)

    const [donors, setDonors] = useState([])
    const [items, setItems] = useState([])

    const [selectedDonor, setSelectedDonor] = useState(null)
    const [selectedItems, setSelectedItems] = useState([])

    const [searchDonor, setSearchDonor] = useState("")
    const [searchItem, setSearchItem] = useState("")

    const [newItemName, setNewItemName] = useState("")
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        loadDonations()
    }, [])

    useEffect(() => {
        if (showAddModal) {
            loadDonors()
            loadItems()
        }
    }, [showAddModal])

    const loadDonations = async () => {
        try {
            setLoading(true)
            const data = await apiService.getDonations()
            const donationsArray = Array.isArray(data) ? data : []

            const mappedDonations = donationsArray.map(mapDonationFromBackend)

            const sortedDonations = mappedDonations.sort((a, b) => {
                const dateA = a.donationDate
                    ? new Date(a.donationDate).getTime()
                    : 0
                const dateB = b.donationDate
                    ? new Date(b.donationDate).getTime()
                    : 0
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

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            action: async () => {
                try {
                    await apiService.deleteDonation(id)
                    showNotification("Doação excluída com sucesso!", "success")
                    loadDonations()
                } catch (err) {
                    console.error("Erro ao excluir doação:", err)
                    showNotification(
                        err.message || "Erro ao excluir doação",
                        "error"
                    )
                } finally {
                    setConfirmModal({
                        isOpen: false,
                        action: null,
                        message: "",
                        title: ""
                    })
                }
            },
            message:
                "Tem certeza que deseja excluir esta doação? Esta ação não pode ser desfeita.",
            title: "Confirmar Exclusão"
        })
    }

    const loadDonors = async () => {
        try {
            const data = await apiService.getDonors()
            const mapped = (data || []).map(mapDonorFromBackend)
            setDonors(mapped)
        } catch (err) {
            console.error("Erro ao carregar doadores:", err)
            showNotification("Erro ao carregar doadores", "error")
        }
    }

    const loadItems = async () => {
        try {
            const data = await apiService.getItems()
            const mapped = (data || []).map(mapItemFromBackend)
            setItems(mapped)
        } catch (err) {
            console.error("Erro ao carregar itens:", err)
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
        const existing = selectedItems.find(
            (si) => !si.isNew && si.itemId === item.id
        )
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
            {
                isNew: true,
                tempId,
                nome: newItemName.trim(),
                quantity: 1
            }
        ])
        setNewItemName("")
    }

    const handleUpdateQuantity = (identifier, isNew, delta) => {
        setSelectedItems(
            selectedItems.map((si) => {
                const match = isNew
                    ? si.isNew && si.tempId === identifier
                    : !si.isNew && si.itemId === identifier
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
            showNotification(
                "Usuário não autenticado. Por favor, faça login novamente.",
                "error"
            )
            return
        }

        try {
            setSubmitting(true)

            const donationData = {
                donationDate: new Date().toISOString(),
                donorId: selectedDonor.id,
                attendantUserId: user.id,
                items: selectedItems.map((si) => {
                    if (si.isNew) {
                        return {
                            newItemName: si.nome,
                            quantity: si.quantity
                        }
                    }
                    return {
                        itemId: si.itemId,
                        quantity: si.quantity
                    }
                })
            }

            await apiService.createDonation(donationData)
            showNotification("Doação registrada com sucesso!", "success")
            setShowAddModal(false)
            setSelectedDonor(null)
            setSelectedItems([])
            setSearchDonor("")
            setSearchItem("")
            setNewItemName("")
            loadDonations()
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
            console.error("Erro ao formatar data:", e)
            return "N/A"
        }
    }

    const totalItems = selectedItems.reduce((sum, si) => sum + si.quantity, 0)

    return (
        <div className={styles.containerGeral}>
            <MenuBar />
            <Navigation />
            <div className={styles.contentWrapper}>
                <div className={styles.listContainer}>
                    <h1 className={styles.titulo}>Doações Registradas</h1>
                    <div className={styles.decoracao}></div>
                    <div className={styles.actionsHeader}>
                        <button
                            className={styles.addButton}
                            onClick={handleAdd}
                            title="Registrar Nova Doação"
                        >
                            <FaPlus />
                        </button>
                    </div>
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
                                        <td
                                            colSpan={5}
                                            className={styles.loadingMessage}
                                        >
                                            Carregando...
                                        </td>
                                    </tr>
                                ) : donations.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className={styles.noDataMessage}
                                        >
                                            Nenhuma doação registrada ainda.
                                        </td>
                                    </tr>
                                ) : (
                                    donations.map((donation) => (
                                        <tr
                                            key={
                                                donation.donationId ||
                                                donation.id
                                            }
                                        >
                                            <td>
                                                {formatDate(
                                                    donation.donationDate
                                                )}
                                            </td>
                                            <td>
                                                {donation.donor?.name ||
                                                    donation.donor?.fullName ||
                                                    "N/A"}
                                            </td>
                                            <td>
                                                {donation.receiverUser?.name ||
                                                    donation.receiverUser
                                                        ?.login ||
                                                    donation.appUser?.name ||
                                                    "N/A"}
                                            </td>
                                            <td>
                                                {donation.items &&
                                                donation.items.length > 0 ? (
                                                    <div>
                                                        {donation.items.map(
                                                            (item, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    style={{
                                                                        display:
                                                                            "block",
                                                                        fontSize:
                                                                            "0.9rem",
                                                                        marginBottom:
                                                                            "4px"
                                                                    }}
                                                                >
                                                                    {item.nome ||
                                                                        item
                                                                            .item
                                                                            ?.description ||
                                                                        "Item"}{" "}
                                                                    - Qtd:{" "}
                                                                    {item.quantity ||
                                                                        0}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                ) : (
                                                    "N/A"
                                                )}
                                            </td>
                                            <td>
                                                <div
                                                    className={
                                                        styles.actionButtons
                                                    }
                                                >
                                                    <button
                                                        className={
                                                            styles.deleteButton
                                                        }
                                                        onClick={() =>
                                                            handleDelete(
                                                                donation.donationId ||
                                                                    donation.id
                                                            )
                                                        }
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
