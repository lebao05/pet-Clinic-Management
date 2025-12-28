import React, { useState, useEffect } from "react";
import { Search, ShoppingCart, Trash2, CheckCircle, MapPin } from "lucide-react";
import userApi from "../../../api/userApi";

const ProductSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cart, setCart] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [userId] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await userApi.getBranches();
      if (response.data.success) {
        setBranches(response.data.data || []);
      }
    } catch (err) {
      setError("Lỗi khi tải danh sách chi nhánh");
      console.error(err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!branchId) {
      setError("Vui lòng chọn chi nhánh");
      return;
    }
    if (!searchTerm.trim()) {
      setError("Vui lòng nhập tên sản phẩm");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setCurrentPage(1); // Reset to first page on new search
      const response = await userApi.searchProducts(parseInt(branchId), searchTerm);
      if (response.data.success) {
        setProducts(response.data.data);
      } else {
        setError(response.data.message || "Không tìm thấy sản phẩm");
      }
    } catch (err) {
      setError("Lỗi khi tìm kiếm sản phẩm");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    const existingItem = cart.find(
      (item) => item.ProductID === product.ProductID
    );
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.ProductID === product.ProductID
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter((item) => item.ProductID !== productId));
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCart(
        cart.map((item) =>
          item.ProductID === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError("Giỏ hàng trống");
      return;
    }

    try {
      setCheckoutLoading(true);
      setError("");
      const items = cart.map((item) => ({
        productId: item.ProductID,
        quantity: item.quantity,
      }));

      const response = await userApi.checkout({
        branchId: parseInt(branchId),
        userId,
        items,
        paymentMethod: "Card",
      });

      if (response.data.success) {
        setSuccess(
          "✓ Mua hàng thành công! Hóa đơn: #" + response.data.invoiceId
        );
        setCart([]);
        setShowCheckout(false);
        setTimeout(() => setSuccess(""), 5000);
      }
    } catch (err) {
      setError("Lỗi khi thanh toán: " + err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.SellingPrice * item.quantity,
    0
  );

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const productsToShow = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px" }}>
      <h1
        style={{
          fontSize: "30px",
          fontWeight: "bold",
          marginBottom: "32px",
        }}
      >
        Cửa hàng sản phẩm
      </h1>

      {success && (
        <div
          style={{
            backgroundColor: "#f0fdf4",
            border: "1px solid #86efac",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "32px",
            color: "#166534",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <CheckCircle size={20} />
          {success}
        </div>
      )}

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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "32px" }}>
        {/* Search Section */}
        <div style={{ gridColumn: "1 / 4" }}>
          <div
            style={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "24px",
              marginBottom: "32px",
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "8px",
                }}
              >
                <MapPin size={16} />
                Chi nhánh
              </label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                style={{
                  width: "100%",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  padding: "8px 12px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  backgroundColor: branchId ? "white" : "#f9fafb",
                }}
              >
                <option value="">-- Chọn chi nhánh --</option>
                {branches.map((branch) => (
                  <option key={branch.BranchID} value={branch.BranchID}>
                    {branch.BranchName} ({branch.City})
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleSearch}>
              <div style={{ position: "relative", marginBottom: "16px" }}>
                <Search
                  size={20}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "12px",
                    color: "#9ca3af",
                  }}
                />
                <input
                  type="text"
                  placeholder="Nhập tên sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    paddingLeft: "40px",
                    width: "100%",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    padding: "8px 12px 8px 40px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  width: "100%",
                  backgroundColor: "#16a34a",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                Tìm kiếm
              </button>
            </form>
          </div>

          {loading && (
            <div
              style={{
                textAlign: "center",
                padding: "32px",
                color: "#6b7280",
              }}
            >
              Đang tải...
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {productsToShow.map((product) => (
              <div
                key={product.ProductID}
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontWeight: "bold",
                      fontSize: "18px",
                      marginBottom: "8px",
                    }}
                  >
                    {product.ProductName}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      fontSize: "14px",
                      color: "#6b7280",
                      marginBottom: "8px",
                    }}
                  >
                    <p
                      style={{
                        backgroundColor: "#f3f4f6",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      {product.ProductType}
                    </p>
                    <p>
                      Đơn vị:{" "}
                      <span style={{ fontWeight: "bold" }}>{product.Unit}</span>
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "24px",
                      fontSize: "14px",
                    }}
                  >
                    <p>
                      Giá:{" "}
                      <span
                        style={{
                          fontWeight: "bold",
                          color: "#16a34a",
                        }}
                      >
                        {product.SellingPrice?.toLocaleString("vi-VN")} ₫
                      </span>
                    </p>
                    <p>
                      Tồn kho:{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {product.StockQty}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.StockQty === 0}
                  style={{
                    marginLeft: "16px",
                    padding: "8px 16px",
                    backgroundColor: "#f59e0b",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor:
                      product.StockQty === 0 ? "not-allowed" : "pointer",
                    opacity: product.StockQty === 0 ? 0.5 : 1,
                    fontSize: "14px",
                  }}
                >
                  + Thêm
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {products.length > itemsPerPage && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "16px",
                marginTop: "32px",
                padding: "16px",
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            >
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: "8px 16px",
                  backgroundColor: currentPage === 1 ? "#f3f4f6" : "#16a34a",
                  color: currentPage === 1 ? "#9ca3af" : "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontSize: "14px",
                }}
              >
                ‹ Trước
              </button>

              <span style={{ fontSize: "14px", color: "#6b7280" }}>
                Trang {currentPage} / {totalPages} ({products.length} sản phẩm)
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: "8px 16px",
                  backgroundColor: currentPage === totalPages ? "#f3f4f6" : "#16a34a",
                  color: currentPage === totalPages ? "#9ca3af" : "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  fontSize: "14px",
                }}
              >
                Sau ›
              </button>
            </div>
          )}

          {!loading && products.length === 0 && searchTerm && (
            <div
              style={{
                textAlign: "center",
                padding: "32px",
                color: "#6b7280",
              }}
            >
              Không tìm thấy sản phẩm nào
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        <div style={{ gridColumn: "4 / 5", position: "sticky", top: "16px" }}>
          <div
            style={{
              backgroundColor: "#fef3c7",
              border: "2px solid #fcd34d",
              borderRadius: "8px",
              padding: "24px",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#92400e",
              }}
            >
              <ShoppingCart size={20} />
              Giỏ hàng ({cart.length})
            </h2>

            {cart.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  padding: "24px",
                  color: "#6b7280",
                }}
              >
                Chưa có sản phẩm
              </p>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    marginBottom: "24px",
                    maxHeight: "384px",
                    overflowY: "auto",
                    backgroundColor: "white",
                    padding: "16px",
                    borderRadius: "8px",
                  }}
                >
                  {cart.map((item) => (
                    <div
                      key={item.ProductID}
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                        paddingBottom: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "8px",
                        }}
                      >
                        <p
                          style={{
                            fontWeight: "500",
                            fontSize: "14px",
                            flex: 1,
                          }}
                        >
                          {item.ProductName}
                        </p>
                        <button
                          onClick={() =>
                            handleRemoveFromCart(item.ProductID)
                          }
                          style={{
                            color: "#ef4444",
                            cursor: "pointer",
                            border: "none",
                            backgroundColor: "transparent",
                            marginLeft: "8px",
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "12px",
                          color: "#6b7280",
                          marginBottom: "8px",
                        }}
                      >
                        <span>
                          {item.SellingPrice?.toLocaleString("vi-VN")} ₫/cái
                        </span>
                        <span style={{ fontWeight: "bold" }}>
                          {(
                            item.SellingPrice * item.quantity
                          ).toLocaleString("vi-VN")}{" "}
                          ₫
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.ProductID,
                              item.quantity - 1
                            )
                          }
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#d1d5db",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(
                              item.ProductID,
                              parseInt(e.target.value) || 1
                            )
                          }
                          style={{
                            width: "40px",
                            textAlign: "center",
                            border: "1px solid #d1d5db",
                            borderRadius: "4px",
                            fontSize: "12px",
                            padding: "4px",
                            boxSizing: "border-box",
                          }}
                          min="1"
                        />
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.ProductID,
                              item.quantity + 1
                            )
                          }
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#d1d5db",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    backgroundColor: "white",
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid #fcd34d",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                      paddingBottom: "12px",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <span style={{ color: "#6b7280" }}>Tổng cộng:</span>
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#16a34a",
                        fontSize: "18px",
                      }}
                    >
                      {totalPrice.toLocaleString("vi-VN")} ₫
                    </span>
                  </div>

                  {!showCheckout ? (
                    <button
                      onClick={() => setShowCheckout(true)}
                      style={{
                        width: "100%",
                        backgroundColor: "#22c55e",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        padding: "10px 16px",
                        cursor: "pointer",
                        fontWeight: "500",
                      }}
                    >
                      📦 Đặt mua
                    </button>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          backgroundColor: "#fffbeb",
                          padding: "8px",
                          borderRadius: "4px",
                        }}
                      >
                        Nhấn "Thanh toán" để hoàn tất đơn hàng
                      </p>
                      <button
                        onClick={handleCheckout}
                        disabled={checkoutLoading}
                        style={{
                          width: "100%",
                          backgroundColor: "#22c55e",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          padding: "10px 16px",
                          cursor: checkoutLoading
                            ? "not-allowed"
                            : "pointer",
                          fontWeight: "500",
                          opacity: checkoutLoading ? 0.7 : 1,
                        }}
                      >
                        {checkoutLoading ? "Đang xử lý..." : "✓ Thanh toán"}
                      </button>
                      <button
                        onClick={() => setShowCheckout(false)}
                        style={{
                          width: "100%",
                          backgroundColor: "transparent",
                          color: "#16a34a",
                          border: "1px solid #16a34a",
                          borderRadius: "6px",
                          padding: "10px 16px",
                          cursor: "pointer",
                          fontWeight: "500",
                        }}
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSearchPage;
