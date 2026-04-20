"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RetiradaPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/retirada/lista");
  }, [router]);

  return null;
}
