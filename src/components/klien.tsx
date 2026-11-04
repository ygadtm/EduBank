"use client";
import { useEffect, useState } from "react";

export function Nama({ depan = false }: { depan?: boolean }) {
  const [n, setN] = useState("Isnaini Febriana");
  useEffect(() => {
    setN(localStorage.getItem("kapsel-name") || "Isnaini Febriana");
  }, []);
  return <>{depan ? n.split(" ")[0] : n}</>;
}

export function HapusBtn() {
  return (
    <button
      onClick={() => confirm("Hapus soal ini?")}
      className="ml-2 font-bold text-red-500"
    >
      Hapus
    </button>
  );
}
