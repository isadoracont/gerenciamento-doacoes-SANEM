"use client"
import React, { useState, useEffect } from "react"
import MenuBar from "../../components/menubar/menubar"
import Navigation from "../../components/navegation/navegation"
import { useRouter } from "next/navigation"
import styles from "./registrar.module.css"
import apiService from "../../../services/api"
import { useNotification } from "../../../components/notifications/NotificationProvider"
import {
    mapDonorFromBackend,
    mapItemFromBackend
} from "../../../services/dataMapper"
import authService from "../../../services/authService"
import { FaPlus, FaTrash, FaMinus } from "react-icons/fa"

export default function RegistrarDoacaoPage() {
    const router = useRouter()
    const { showNotification } = useNotification()

    const [donors, setDonors] = useState([])
    const [items, setItems] = useState([])

    const [selectedDonor, setSelectedDonor] = useState(null)
    const [selectedItems, setSelectedItems] = useState([])

    const [searchDonor, setSearchDonor] = useState("")
    const [searchItem, setSearchItem] = useState("")

    const [newItemName, setNewItemName] = useState("")
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        loadDonors()
        loadItems()
    }, [])

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
            { isNew: true, tempId, nome: newItemName.trim(), quantity: 1 }
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

    const handleSubmit = async (e) => {
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
                receiverUserId: user.id,
                items: selectedItems.map((si) => {
                    if (si.isNew) {
                        return { description: si.nome, quantity: si.quantity }
                    }
                    return { itemId: si.itemId, quantity: si.quantity }
                })
            }

            await apiService.createDonation(donationData)
            showNotification("Doação registrada com sucesso!", "success")
            router.push("/doacao/lista")
        } catch (err) {
            console.error("Erro ao registrar doação:", err)
            showNotification(err.message || "Erro ao registrar doação", "error")
            setSubmitting(false)
        }
    }

    const totalItems = selectedItems.reduce((sum, si) => sum + si.quantity, 0)

    return (
        <div className={styles.containerGeral}>
            <MenuBar />
            <Navigation />
            <div className={styles.contentWrapper}>
                <div className={styles.formContainer}>
                    <h1 className={styles.titulo}>Registrar Doação</h1>
                    <div className={styles.decoracao}></div>

                    <form onSubmit={handleSubmit}>
                        <div className={styles.section}>
                            <h2>1. Selecionar Doador</h2>
                            <div className={styles.searchBox}>
                                <input
                                    type="text"
                                    placeholder="Buscar doador por nome ou CPF..."
                                    value={searchDonor}
                                    onChange={(e) =>
                                        setSearchDonor(e.target.value)
                                    }
                                    className={styles.searchInput}
                                />
                            </div>

                            {searchDonor && !selectedDonor && (
                                <div className={styles.dropdown}>
                                    {filteredDonors.length === 0 ? (
                                        <div className={styles.dropdownItem}>
                                            Nenhum doador encontrado
                                        </div>
                                    ) : (
                                        filteredDonors.map((donor) => (
                                            <div
                                                key={donor.id}
                                                className={styles.dropdownItem}
                                                onClick={() => {
                                                    setSelectedDonor(donor)
                                                    setSearchDonor("")
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
                                                    CPF: {donor.cpf || "N/A"}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {selectedDonor && (
                                <div className={styles.selectedBeneficiary}>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        }}
                                    >
                                        <div>
                                            <strong>Doador Selecionado:</strong>{" "}
                                            {selectedDonor.nomeCompleto} <br />
                                            <span
                                                style={{
                                                    fontSize: "0.9rem",
                                                    color: "#555"
                                                }}
                                            >
                                                CPF:{" "}
                                                {selectedDonor.cpf || "N/A"}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedDonor(null)
                                            }
                                            className={styles.removeButton}
                                            title="Remover Doador"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.section}>
                            <h2>2. Itens da Doação</h2>

                            <div className={styles.itemSelectionContainer}>
                                <div className={styles.searchBox}>
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
                                                filteredItems.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className={
                                                            styles.dropdownItem
                                                        }
                                                        onClick={() => {
                                                            handleAddExistingItem(
                                                                item
                                                            )
                                                            setSearchItem("")
                                                        }}
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
                                                            Estoque Atual:{" "}
                                                            {item.quantidade}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className={styles.divider}>
                                    <span>OU</span>
                                </div>

                                <div className={styles.newItemInputGroup}>
                                    <input
                                        type="text"
                                        placeholder="Nome do novo item..."
                                        value={newItemName}
                                        onChange={(e) =>
                                            setNewItemName(e.target.value)
                                        }
                                        className={styles.searchInput}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddNewItem}
                                        disabled={!newItemName.trim()}
                                        className={styles.addSecondaryButton}
                                    >
                                        Criar Novo Item
                                    </button>
                                </div>
                            </div>

                            {selectedItems.length > 0 && (
                                <div className={styles.selectedItems}>
                                    <h3>Itens Adicionados</h3>
                                    {selectedItems.map((si) => (
                                        <div
                                            key={
                                                si.isNew ? si.tempId : si.itemId
                                            }
                                            className={styles.selectedItem}
                                        >
                                            <div className={styles.itemInfo}>
                                                <strong>
                                                    {si.isNew
                                                        ? si.nome
                                                        : si.item?.nome ||
                                                          si.item?.descricao ||
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
                                                className={styles.itemControls}
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
                                                    disabled={si.quantity <= 1}
                                                    className={
                                                        styles.quantityButton
                                                    }
                                                >
                                                    <FaMinus />
                                                </button>
                                                <span
                                                    className={styles.quantity}
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

                        <div className={styles.formActions}>
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={() => router.push("/doacao/lista")}
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
                                    : "Confirmar Doação"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
