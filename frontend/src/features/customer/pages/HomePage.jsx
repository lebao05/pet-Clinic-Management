// src/features/customer/pages/HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { Card } from "../../../shared/components/ui/Card";
import { Calendar, Heart, CreditCard, Stethoscope, ShoppingBag } from "lucide-react";

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-8 mb-8 text-white">
        <h1 className="text-4xl font-bold mb-4">
          Chào mừng trở lại, {user?.firstName || user?.name || 'Khách hàng'}!
        </h1>
        <p className="text-xl mb-6 max-w-2xl text-white/90">
          Đối tác tin cậy của bạn trong chăm sóc thú cưng. Chúng tôi ở đây để giúp đảm bảo thú cưng của bạn luôn vui vẻ và khỏe mạnh.
        </p>
        <Link
          to="/customer/booking"
          className="inline-flex items-center px-6 py-3 bg-white text-teal-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Calendar className="h-5 w-5 mr-2" />
          Đặt lịch hẹn mới
        </Link>
      </div>

      {/* Quick Access */}
      <h2 className="text-2xl font-bold mb-6 text-neutral-900">Truy cập nhanh</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <Calendar className="h-8 w-8 text-teal-600 mr-3" />
            <h3 className="font-bold text-lg">Cuộc hẹn</h3>
          </div>
          <p className="text-neutral-600 text-sm mb-4">Xem và quản lý các cuộc hẹn của bạn.</p>
          <Link to="/customer/appointments" className="text-teal-600 font-medium hover:text-teal-700">
            Xem tất cả →
          </Link>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <Heart className="h-8 w-8 text-rose-600 mr-3" />
            <h3 className="font-bold text-lg">Thú cưng của tôi</h3>
          </div>
          <p className="text-neutral-600 text-sm mb-4">Quản lý hồ sơ sức khỏe thú cưng.</p>
          <Link to="/customer/pets" className="text-teal-600 font-medium hover:text-teal-700">
            Quản lý thú cưng →
          </Link>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <CreditCard className="h-8 w-8 text-amber-600 mr-3" />
            <h3 className="font-bold text-lg">Lịch sử thanh toán</h3>
          </div>
          <p className="text-neutral-600 text-sm mb-4">Xem hóa đơn và lịch sử thanh toán.</p>
          <Link to="/customer/billing" className="text-teal-600 font-medium hover:text-teal-700">
            Xem lịch sử →
          </Link>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <Stethoscope className="h-8 w-8 text-blue-600 mr-3" />
            <h3 className="font-bold text-lg">Tìm bác sĩ</h3>
          </div>
          <p className="text-neutral-600 text-sm mb-4">Tìm và đặt lịch với bác sĩ chuyên khoa.</p>
          <Link to="/customer/doctors" className="text-teal-600 font-medium hover:text-teal-700">
            Tìm bác sĩ →
          </Link>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <ShoppingBag className="h-8 w-8 text-green-600 mr-3" />
            <h3 className="font-bold text-lg">Sản phẩm</h3>
          </div>
          <p className="text-neutral-600 text-sm mb-4">Mua sắm sản phẩm chăm sóc thú cưng.</p>
          <Link to="/customer/products" className="text-teal-600 font-medium hover:text-teal-700">
            Xem sản phẩm →
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
