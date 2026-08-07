"use client";
import { useState } from "react";
import { Check, X, ShieldAlert, MapPin, Phone, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ModeratorPanelClient({ requests, handleRequestAction }: any) {
  const [filter, setFilter] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");

  const filtered = requests.filter((r: any) => r.status === filter);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "1.5rem" }}>Moderatör Paneli</h1>
      
      {/* Sekmeler */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { id: "PENDING", label: "Onay Bekleyenler", icon: Clock },
          { id: "APPROVED", label: "Onaylananlar", icon: CheckCircle2 },
          { id: "REJECTED", label: "Reddedilenler", icon: AlertCircle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            style={{
              padding: "0.6rem 1rem",
              borderRadius: "8px",
              border: filter === tab.id ? "2px solid #3b82f6" : "1px solid #e2e8f0",
              backgroundColor: filter === tab.id ? "#eff6ff" : "#fff",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p style={{ textAlign: "center", color: "#64748b" }}>Bu kategoride kayıt bulunmuyor.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filtered.map((req: any) => (
            <div key={req.id} style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              {/* Talep Kartı İçeriği (Buraya önceki kodunuzdaki kart yapısını ekleyin) */}
              <h3>{req.name}</h3>
              <p>{req.type} - {req.status}</p>
              
              {/* Sadece Bekleyenlerde Butonları Göster */}
              {req.status === "PENDING" && (
                <form action={handleRequestAction} style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
                  <input type="hidden" name="requestId" value={req.id} />
                  <button name="action" value="APPROVE" style={{ background: "#16a34a", color: "#fff", border: "none", padding: "0.5rem", borderRadius: "5px" }}>Onayla</button>
                  <button name="action" value="REJECT" style={{ background: "#dc2626", color: "#fff", border: "none", padding: "0.5rem", borderRadius: "5px" }}>Reddet</button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}