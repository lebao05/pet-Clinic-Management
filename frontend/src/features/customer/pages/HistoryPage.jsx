import React, { useState, useEffect } from "react";
import { Calendar, FileText } from "lucide-react";
import userApi from "../../../api/userApi";

const HistoryPage = () => {
  const [userId] = useState(1);
  const [invoices, setInvoices] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("invoices");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await userApi.getHistory(userId);
      if (response.data.success) {
        setInvoices(response.data.invoices || []);
        setMedicalRecords(response.data.medical || []);
        setError("");
      }
    } catch (err) {
      setError("Lỗi khi tải lịch sử");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px" }}>
      <h1 style={{ fontSize: "30px", fontWeight: "bold", marginBottom: "32px" }}>
        Lịch sử mua hàng & khám chữa bệnh
      </h1>

      {error && (
        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "32px",
            color: "#b91c1c",
          }}
        >
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "32px", borderBottom: "1px solid #e5e7eb" }}>
        <button
          onClick={() => setActiveTab("invoices")}
          style={{
            padding: "12px 24px",
            fontWeight: "500",
            borderBottom: activeTab === "invoices" ? "2px solid #16a34a" : "transparent",
            color: activeTab === "invoices" ? "#16a34a" : "#6b7280",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FileText size={16} />
          Hóa đơn ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab("medical")}
          style={{
            padding: "12px 24px",
            fontWeight: "500",
            borderBottom: activeTab === "medical" ? "2px solid #16a34a" : "transparent",
            color: activeTab === "medical" ? "#16a34a" : "#6b7280",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Calendar size={16} />
          Khám chữa bệnh ({medicalRecords.length})
        </button>
      </div>

      {loading && <div style={{ textAlign: "center", padding: "32px", color: "#6b7280" }}>Đang tải...</div>}

      {/* Invoices Tab */}
      {activeTab === "invoices" && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {invoices.length === 0 ? (
            <div
              style={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "32px",
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              Không có hóa đơn nào
            </div>
          ) : (
            invoices.map((invoice, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "12px", color: "#6b7280" }}>Mã hóa đơn</p>
                    <p style={{ fontWeight: "bold", fontSize: "18px" }}>#{invoice.InvoiceID}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#6b7280" }}>Ngày mua</p>
                    <p style={{ fontWeight: "500" }}>{formatDate(invoice.InvoiceDate)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#6b7280" }}>Tổng tiền</p>
                    <p style={{ fontWeight: "bold", color: "#16a34a" }}>
                      {invoice.FinalAmount?.toLocaleString("vi-VN")} ₫
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#6b7280" }}>Trạng thái</p>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        borderRadius: "9999px",
                        fontSize: "12px",
                        fontWeight: "500",
                        backgroundColor:
                          invoice.PaymentStatus === "Paid" ? "#dcfce7" : "#fef3c7",
                        color:
                          invoice.PaymentStatus === "Paid" ? "#166534" : "#92400e",
                      }}
                    >
                      {invoice.PaymentStatus === "Paid"
                        ? "Đã thanh toán"
                        : "Chờ thanh toán"}
                    </span>
                  </div>
                </div>
                <div style={{ paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
                  <button
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "transparent",
                      border: "1px solid #16a34a",
                      borderRadius: "6px",
                      color: "#16a34a",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                    }}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Medical Records Tab */}
      {activeTab === "medical" && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {medicalRecords.length === 0 ? (
            <div
              style={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "32px",
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              Không có hồ sơ khám chữa bệnh nào
            </div>
          ) : (
            medicalRecords.map((record, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "12px", color: "#6b7280" }}>Thú cưng</p>
                    <p style={{ fontWeight: "bold" }}>{record.PetName}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#6b7280" }}>Dịch vụ</p>
                    <p style={{ fontWeight: "bold" }}>{record.ServiceName}</p>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "12px", color: "#6b7280" }}>Ngày khám</p>
                    <p style={{ fontWeight: "500" }}>{formatDate(record.ScheduleTime)}</p>
                    <p style={{ fontSize: "12px", color: "#6b7280" }}>
                      {formatTime(record.ScheduleTime)}
                    </p>
                  </div>
                </div>

                {record.Diagnosis && (
                  <div
                    style={{
                      marginBottom: "16px",
                      paddingBottom: "16px",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <p style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#111827" }}>
                      Chẩn đoán
                    </p>
                    <p
                      style={{
                        color: "#374151",
                        backgroundColor: "#f3f4f6",
                        padding: "12px",
                        borderRadius: "4px",
                      }}
                    >
                      {record.Diagnosis}
                    </p>
                  </div>
                )}

                {record.Prescription && (
                  <div style={{ marginBottom: "16px" }}>
                    <p style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#111827" }}>
                      Hướng dẫn điều trị
                    </p>
                    <p
                      style={{
                        color: "#374151",
                        backgroundColor: "#f3f4f6",
                        padding: "12px",
                        borderRadius: "4px",
                      }}
                    >
                      {record.Prescription}
                    </p>
                  </div>
                )}

                <div style={{ paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
                  <button
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "transparent",
                      border: "1px solid #16a34a",
                      borderRadius: "6px",
                      color: "#16a34a",
                      fontSize: "14px",
                      fontWeight: "5",
                      cursor: "pointer",
                    }}
                  >
                    Tải hồ sơ
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
