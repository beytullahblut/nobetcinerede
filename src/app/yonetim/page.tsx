import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Check, X, ShieldAlert, MapPin, Phone } from "lucide-react";

// Onaylama veya Reddetme İşlemini Yürüten Server Action
async function handleRequestAction(formData: FormData) {
  "use server";
  
  const requestId = formData.get("requestId") as string;
  const action = formData.get("action") as "APPROVE" | "REJECT";

  const request = await prisma.placeRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) return;

  if (action === "REJECT") {
    await prisma.placeRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" },
    });
  } else if (action === "APPROVE") {
    if (request.type === "CREATE") {
      const slugBase = request.name.toLowerCase().replace(/[^a-z0-9-çğıöşü]/g, "-").replace(/-+/g, "-");
      const slug = `${slugBase}-${Date.now()}`;
      
      await prisma.place.create({
        data: {
          name: request.name,
          slug,
          phone: request.phone,
          address: request.address,
          city: request.city,
          district: request.district,
          categoryId: request.categoryId || "acil-veteriner",
          note: request.note,
        },
      });
    } else if (request.type === "UPDATE" && request.placeId) {
      await prisma.place.update({
        where: { id: request.placeId },
        data: {
          name: request.name,
          phone: request.phone,
          address: request.address,
          city: request.city,
          district: request.district,
          categoryId: request.categoryId || undefined,
          note: request.note,
        },
      });
    } else if (request.type === "DELETE" && request.placeId) {
      await prisma.place.delete({
        where: { id: request.placeId },
      }).catch(() => {});
    }

    await prisma.placeRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" },
    });
  }

  revalidatePath("/yonetim");
}

export default async function ModeratorPanel() {
  // category ilişkisi kaldırıldı, sadece place dahil ediliyor
  const pendingRequests = await prisma.placeRequest.findMany({
    where: { status: "PENDING" },
    include: { place: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <ShieldAlert size={28} color="#dc2626" />
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a" }}>
            Moderatör Onay Paneli ({pendingRequests.length})
          </h1>
        </div>

        {pendingRequests.length === 0 ? (
          <div style={{ backgroundColor: "#fff", padding: "3rem", borderRadius: "12px", textAlign: "center", border: "1px solid #e2e8f0" }}>
            <p style={{ color: "#64748b", fontSize: "1rem" }}>Şu an onay bekleyen herhangi bir talep bulunmuyor.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "0.25rem 0.6rem",
                      borderRadius: "6px",
                      backgroundColor: req.type === "DELETE" ? "#fee2e2" : req.type === "UPDATE" ? "#fef3c7" : "#dcfce7",
                      color: req.type === "DELETE" ? "#991b1b" : req.type === "UPDATE" ? "#92400e" : "#166534",
                    }}
                  >
                    {req.type === "CREATE" ? "YENİ İŞLETME" : req.type === "UPDATE" ? "BİLGİ GÜNCELLEME" : "KAYIT SİLME / KALDIRMA"}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    {new Date(req.createdAt).toLocaleString("tr-TR")}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a" }}>{req.name}</h3>
                  <p style={{ color: "#64748b", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.25rem" }}>
                    <MapPin size={15} /> {req.district} / {req.city} - {req.address}
                  </p>
                  <p style={{ color: "#475569", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.25rem" }}>
                    <Phone size={15} /> {req.phone}
                  </p>
                </div>

                {req.note && (
                  <div style={{ backgroundColor: "#f1f5f9", padding: "0.5rem 0.75rem", borderRadius: "6px", fontSize: "0.85rem", color: "#334155" }}>
                    <strong>Gerekçe / Not:</strong> {req.note}
                  </div>
                )}

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <form action={handleRequestAction} style={{ flex: 1 }}>
                    <input type="hidden" name="requestId" value={req.id} />
                    <input type="hidden" name="action" value="APPROVE" />
                    <button
                      type="submit"
                      style={{
                        width: "100%",
                        backgroundColor: "#16a34a",
                        color: "#fff",
                        border: "none",
                        padding: "0.6rem",
                        borderRadius: "8px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.4rem",
                      }}
                    >
                      <Check size={16} /> Onayla ve Yayınla
                    </button>
                  </form>

                  <form action={handleRequestAction} style={{ flex: 1 }}>
                    <input type="hidden" name="requestId" value={req.id} />
                    <input type="hidden" name="action" value="REJECT" />
                    <button
                      type="submit"
                      style={{
                        width: "100%",
                        backgroundColor: "#dc2626",
                        color: "#fff",
                        border: "none",
                        padding: "0.6rem",
                        borderRadius: "8px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.4rem",
                      }}
                    >
                      <X size={16} /> Reddet
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}