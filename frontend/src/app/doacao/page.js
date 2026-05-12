"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DoacaoPage() {
    const router = useRouter()

    useEffect(() => {
        router.push("/doacao/lista")
    }, [router])

    return null
}
