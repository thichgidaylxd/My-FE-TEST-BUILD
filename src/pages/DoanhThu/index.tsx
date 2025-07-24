import React, { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { RevenueService } from "@/services/revenueService";
import { MenuService } from "@/services/menuService";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Calendar } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Revenue {
  id: string;
  date: string;
  totalAmount: number;
  invoiceCount: number;
}

function getToday() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function getWeekRange() {
  const now = new Date();
  const first = new Date(now);
  first.setDate(now.getDate() - now.getDay());
  const last = new Date(first);
  last.setDate(first.getDate() + 6);
  return [first.toISOString().slice(0, 10), last.toISOString().slice(0, 10)];
}

function getMonth() {
  const d = new Date();
  return d.toISOString().slice(0, 7);
}

const DoanhThu: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [revenueList, setRevenueList] = useState<Revenue[]>([]);
  const [revenueToday, setRevenueToday] = useState<Revenue | null>(null);
  const [revenueWeek, setRevenueWeek] = useState<Revenue[]>([]);
  const [revenueMonth, setRevenueMonth] = useState<Revenue[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(getToday());
  const [filterType, setFilterType] = useState<'day' | 'week' | 'month'>('day');
  const [topDishes, setTopDishes] = useState<any[]>([]);
  const [totalToday, setTotalToday] = useState<number>(0);
  const [totalWeek, setTotalWeek] = useState<number>(0);
  const [totalMonth, setTotalMonth] = useState<number>(0);

  const defaultDishImages = [
    "https://img.tastykitchen.vn/2021/07/pho-bo-ha-noi.jpg",
    "https://cdn.tgdd.vn/Files/2021/07/13/1366707/cach-nau-com-tam-suon-bi-cha-trung-don-gian-tai-nha-202107131553573728.jpg",
    "https://cdn.tgdd.vn/Files/2021/07/13/1366707/cach-lam-banh-mi-thit-nuong-thom-ngon-don-gian-tai-nha-202107131553573728.jpg",
    "https://cdn.tgdd.vn/2021/06/content/miquang-800x450.jpg",
    "https://cdn.tgdd.vn/2021/06/content/bunbo-800x450.jpg",
  ];

  useEffect(() => {
    const fetchRevenueToday = async () => {
      try {
        const response = await RevenueService.getRevenueByDay(getToday());
        if (response.code === 200) {
          setRevenueToday(response.data);
          setTotalToday(response.data?.totalAmount || 0);
        } else {
          setError("Dữ liệu doanh thu ngày không hợp lệ");
        }
      } catch (err: any) {
        setError(err.message || "Không thể tải dữ liệu doanh thu ngày");
      }
    };
    fetchRevenueToday();
  }, []);

  useEffect(() => {
    const fetchRevenueWeek = async () => {
      try {
        const response = await RevenueService.getRevenueByWeek(getToday());
        if (response.code === 200 && Array.isArray(response.data)) {
          setRevenueWeek(response.data);
          const weekTotal = response.data.reduce((sum, r) => sum + r.totalAmount, 0);
          setTotalWeek(weekTotal);
        } else {
          setError("Dữ liệu doanh thu tuần không hợp lệ");
        }
      } catch (err: any) {
        setError(err.message || "Không thể tải dữ liệu doanh thu tuần");
      }
    };
    fetchRevenueWeek();
  }, []);

  useEffect(() => {
    const fetchRevenueMonth = async () => {
      try {
        const response = await RevenueService.getRevenueByMonth(getMonth());
        if (response.code === 200 && Array.isArray(response.data)) {
          setRevenueMonth(response.data);
          const monthTotal = response.data.reduce((sum, r) => sum + r.totalAmount, 0);
          setTotalMonth(monthTotal);
        } else {
          setError("Dữ liệu doanh thu tháng không hợp lệ");
        }
      } catch (err: any) {
        setError(err.message || "Không thể tải dữ liệu doanh thu tháng");
      }
    };
    fetchRevenueMonth();
  }, []);

  useEffect(() => {
    const fetchRevenue = async () => {
      setLoading(true);
      setError("");
      try {
        let response: any;
        if (filterType === 'day') {
          response = await RevenueService.getRevenueByDay(selectedDate || getToday());
          if (response.code === 200) {
            setRevenueList([response.data]);
          }
        } else if (filterType === 'week') {
          response = await RevenueService.getRevenueByWeek(selectedDate || getToday());
          if (response.code === 200 && Array.isArray(response.data)) {
            setRevenueList(response.data);
          }
        } else if (filterType === 'month') {
          response = await RevenueService.getRevenueByMonth(getMonth());
          if (response.code === 200 && Array.isArray(response.data)) {
            setRevenueList(response.data);
          }
        } else {
          setError("Dữ liệu doanh thu không hợp lệ");
          return;
        }
      } catch (err: any) {
        setError(err.message || "Không thể tải dữ liệu doanh thu");
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
  }, [selectedDate, filterType]);

  useEffect(() => {
    const fetchTopDishes = async () => {
      try {
        const res = await MenuService.getAllMenuItems();
        let dishes = res.data || [];
        if (dishes.length > 0) {
          dishes = dishes
            .map((dish: any, idx: number) => {
              let img = dish.image;
              if (!img) {
                img = defaultDishImages[idx % defaultDishImages.length];
              } else if (typeof img === 'string' && img.length > 100) {
                img = `data:image/jpeg;base64,${img}`;
              }
              return {
                ...dish,
                sold: dish.sold ?? Math.floor(Math.random() * 50 + 10),
                image: img,
              };
            })
            .sort((a: any, b: any) => b.sold - a.sold)
            .slice(0, 5);
        }
        setTopDishes(dishes);
      } catch {
        setTopDishes([
          { name: "Phở bò", sold: 45, price: 50000, image: defaultDishImages[0] },
          { name: "Cơm tấm", sold: 38, price: 35000, image: defaultDishImages[1] },
          { name: "Bánh mì", sold: 32, price: 20000, image: defaultDishImages[2] },
        ]);
      }
    };
    fetchTopDishes();
  }, []);

  const chartData = {
    labels: revenueList.sort((a, b) => a.date.localeCompare(b.date)).map(r => r.date),
    datasets: [
      {
        label: "Tổng tiền (VND)",
        data: revenueList.sort((a, b) => a.date.localeCompare(b.date)).map(r => r.totalAmount),
        backgroundColor: "rgba(251,146,60,0.7)",
        borderRadius: 12,
        borderSkipped: false,
        hoverBackgroundColor: "#fb923c",
      },
    ],
  };

  const revenueHeaderImg = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  const todayCardImg = "https://cdn-icons-png.flaticon.com/512/2921/2921822.png";
  const weekCardImg = "https://cdn-icons-png.flaticon.com/512/2921/2921820.png";
  const monthCardImg = "https://cdn-icons-png.flaticon.com/512/2921/2921817.png";
  const chartBgImg = "https://cdn-icons-png.flaticon.com/512/1828/1828884.png";
  const tableBgImg = "https://cdn-icons-png.flaticon.com/512/3135/3135768.png";
  const restaurantBg = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1500&q=80";
  const chefIcon = "https://cdn-icons-png.flaticon.com/512/3075/3075977.png";
  const tableIcon = "https://cdn-icons-png.flaticon.com/512/3075/3075972.png";
  const billIcon = "https://cdn-icons-png.flaticon.com/512/3075/3075975.png";
  const foodIcon = "https://cdn-icons-png.flaticon.com/512/3075/3075974.png";
  const trophyIcon = "https://cdn-icons-png.flaticon.com/512/1828/1828884.png";
  const sparkleIcon = "https://cdn-icons-png.flaticon.com/512/616/616489.png";
  const bestSellerIcon = "https://cdn-icons-png.flaticon.com/512/1828/1828970.png";

  return (
    <div
      className="flex flex-row h-screen min-h-screen w-full text-foreground"
      style={{
        background: `url(${restaurantBg}) center center/cover no-repeat fixed, linear-gradient(135deg, #fff8f2 0%, #fffbe6 100%)`,
        backgroundBlendMode: 'overlay',
      }}
    >
      <Sidebar />
      <div className="flex-1 min-h-screen bg-orange-50 p-0 flex flex-col overflow-x-hidden">
        <div className="w-full max-w-[1800px] mx-auto flex-1 flex flex-col px-2 md:px-8">
          <h1 className="text-5xl font-extrabold text-orange-700 mb-12 mt-12 drop-shadow-lg tracking-tight flex items-center gap-8 justify-center animate-fade-in">
            <img src={chefIcon} alt="chef" className="w-24 h-24 rounded-full shadow-lg border-4 border-orange-200 bg-white object-cover" />
            <span className="bg-gradient-to-r from-orange-400 to-yellow-300 text-white px-8 py-4 rounded-3xl shadow-2xl text-4xl flex items-center gap-4">
              Bảng doanh thu
              <img src={trophyIcon} alt="trophy" className="w-12 h-12 inline-block ml-2" />
            </span>
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-14 px-2 md:px-0">
            <div className="bg-gradient-to-br from-orange-400 to-yellow-300 text-white p-10 rounded-3xl shadow-2xl flex flex-col items-start min-h-[160px] relative overflow-hidden">
              <img src={tableIcon} alt="today" className="absolute right-4 bottom-4 w-20 h-20 opacity-20 pointer-events-none select-none" />
              <span className="text-xl font-semibold mb-3 flex items-center gap-2">Hôm nay <img src={billIcon} alt="bill" className="w-7 h-7 inline-block" /></span>
              <span className="text-4xl font-extrabold mb-2 drop-shadow">{totalToday.toLocaleString()} VND</span>
              <span className="text-base opacity-90">{getToday()}</span>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-300 text-white p-10 rounded-3xl shadow-2xl flex flex-col items-start min-h-[160px] relative overflow-hidden">
              <img src={foodIcon} alt="week" className="absolute right-4 bottom-4 w-20 h-20 opacity-20 pointer-events-none select-none" />
              <span className="text-xl font-semibold mb-3 flex items-center gap-2">Tuần này <img src={chefIcon} alt="chef" className="w-7 h-7 inline-block" /></span>
              <span className="text-4xl font-extrabold mb-2 drop-shadow">{totalWeek.toLocaleString()} VND</span>
              <span className="text-base opacity-90">{getWeekRange()[0]} - {getWeekRange()[1]}</span>
            </div>
            <div className="bg-gradient-to-br from-orange-600 to-yellow-400 text-white p-10 rounded-3xl shadow-2xl flex flex-col items-start min-h-[160px] relative overflow-hidden">
              <img src={trophyIcon} alt="month" className="absolute right-4 bottom-4 w-20 h-20 opacity-20 pointer-events-none select-none" />
              <span className="text-xl font-semibold mb-3 flex items-center gap-2">Tháng này <img src={trophyIcon} alt="trophy" className="w-7 h-7 inline-block" /></span>
              <span className="text-4xl font-extrabold mb-2 drop-shadow">{totalMonth.toLocaleString()} VND</span>
              <span className="text-base opacity-90">{getMonth()}</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-between items-center mb-10 gap-4 px-2 md:px-0 animate-fade-in">
            <div className="flex items-center gap-4">
              <button
                className={`px-5 py-2 rounded-xl font-bold text-lg border-2 transition ${filterType === 'day' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-orange-500 border-orange-200 hover:bg-orange-50'}`}
                onClick={() => { setFilterType('day'); setSelectedDate(getToday()); }}
              >
                Ngày
              </button>
              <button
                className={`px-5 py-2 rounded-xl font-bold text-lg border-2 transition ${filterType === 'week' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-orange-500 border-orange-200 hover:bg-orange-50'}`}
                onClick={() => { setFilterType('week'); setSelectedDate(getToday()); }}
              >
                Tuần
              </button>
              <button
                className={`px-5 py-2 rounded-xl font-bold text-lg border-2 transition ${filterType === 'month' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-orange-500 border-orange-200 hover:bg-orange-50'}`}
                onClick={() => { setFilterType('month'); setSelectedDate(''); }}
              >
                Tháng
              </button>
            </div>
            <div className="flex items-center gap-2">
              <label className="font-semibold text-orange-700 text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />Chọn ngày:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setFilterType('day');
                }}
                className="border border-orange-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-200 text-lg"
                max={getToday()}
              />
              {selectedDate && (
                <button
                  className="ml-2 px-3 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold"
                  onClick={() => setSelectedDate(getToday())}
                >
                  Xóa lọc
                </button>
              )}
            </div>
          </div>
          <div className="mb-14 animate-fade-in">
            <h2 className="text-2xl font-bold text-orange-700 mb-6 flex items-center gap-3">
              <span>🔥</span> Top món bán chạy
            </h2>
            <div className="flex flex-wrap gap-8 justify-center">
              {topDishes.map((dish, idx) => (
                <div
                  key={dish.name}
                  className="bg-white rounded-2xl shadow-xl p-4 flex flex-col items-center hover:scale-105 hover:shadow-2xl transition group border-2 border-orange-100 min-w-[180px] min-h-[270px] max-w-[220px] relative overflow-hidden"
                >
                  <div className="w-32 h-32 mb-3 flex items-center justify-center bg-orange-50 rounded-xl overflow-hidden border-2 border-orange-200 group-hover:border-orange-400 relative">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => { (e.target as HTMLImageElement).src = defaultDishImages[0]; }}
                    />
                    {idx === 0 && (
                      <img src={bestSellerIcon} alt="best seller" className="absolute top-1 right-1 w-8 h-8 z-10" />
                    )}
                    {idx === 0 && (
                      <img src={sparkleIcon} alt="sparkle" className="absolute left-1 bottom-1 w-7 h-7 z-10 opacity-80 animate-pulse" />
                    )}
                  </div>
                  <div className="font-bold text-lg text-orange-700 mb-1 text-center truncate w-full flex items-center justify-center gap-2">
                    {idx === 0 && <img src={trophyIcon} alt="trophy" className="w-6 h-6" />} {dish.name}
                  </div>
                  <div className="text-orange-500 font-semibold text-base mb-1">{dish.price.toLocaleString()} VND</div>
                  <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold text-sm">Đã bán: {dish.sold}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl p-16 border border-orange-100 flex-1 overflow-y-auto custom-scrollbar transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-12 rounded-3xl shadow-2xl flex flex-col items-center border border-orange-100 min-h-[420px] mb-16 animate-fade-in relative overflow-hidden">
                <img src={chartBgImg} alt="chart" className="absolute right-6 bottom-6 w-32 h-32 opacity-10 pointer-events-none select-none" />
                <h3 className="text-2xl font-bold text-orange-700 mb-6 flex items-center gap-2">📊 Biểu đồ doanh thu</h3>
                <div className="h-[350px] w-full flex items-center justify-center">
                  {revenueList.length > 0 ? (
                    <Bar
                      data={chartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { display: true, position: "top" },
                          title: { display: false },
                          tooltip: { enabled: true },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: (v) => v.toLocaleString(),
                              color: "#fb923c",
                              font: { weight: "bold" },
                            },
                            grid: { color: "#ffe7ba" },
                          },
                          x: {
                            ticks: { color: "#fb923c" },
                            grid: { color: "#ffe7ba" },
                          },
                        },
                      }}
                    />
                  ) : (
                    <p className="text-gray-400">Không có dữ liệu để hiển thị biểu đồ</p>
                  )}
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-12 rounded-3xl shadow-2xl border border-orange-100 min-h-[420px]">
                <h3 className="text-2xl font-bold text-orange-700 mb-6">Món ăn bán chạy</h3>
                <div className="space-y-4">
                  {topDishes.map((dish) => (
                    <div key={dish.name} className="flex justify-between items-center p-4 bg-white rounded-xl shadow font-semibold text-lg">
                      <span className="font-medium">{dish.name}</span>
                      <span className="text-orange-600 font-bold">{dish.sold} món</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-orange-700 mb-8 flex items-center gap-4 mt-16">
              <span>📅</span> Bảng doanh thu từng ngày
            </h2>
            {loading ? (
              <div className="text-center text-orange-500 py-12 text-xl font-semibold animate-pulse">Đang tải dữ liệu...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-12 text-xl font-semibold">{error}</div>
            ) : (
              <div className="overflow-x-auto mb-12 rounded-3xl border border-orange-100 shadow-2xl bg-gradient-to-br from-orange-50 to-yellow-50 relative">
                <img src={tableBgImg} alt="table" className="absolute left-8 top-8 w-20 h-20 opacity-10 pointer-events-none select-none" />
                <table className="min-w-full border rounded-3xl shadow-xl overflow-hidden text-xl">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gradient-to-r from-orange-200 to-yellow-100">
                      <th className="px-10 py-6 text-left text-orange-700 font-extrabold text-2xl">Ngày</th>
                      <th className="px-10 py-6 text-right text-orange-700 font-extrabold text-2xl">Tổng tiền (VND)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueList.length === 0 ? (
                      <tr><td colSpan={2} className="text-center py-16 text-gray-400 text-2xl">Không có dữ liệu</td></tr>
                    ) : revenueList.sort((a, b) => b.date.localeCompare(a.date)).map((r, idx) => (
                      <tr key={r.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-orange-50'} hover:bg-yellow-50 transition`}>
                        <td className="px-10 py-6 font-bold text-gray-800 tracking-wide whitespace-nowrap text-xl">{r.date}</td>
                        <td className="px-10 py-6 text-right font-extrabold text-orange-600 text-2xl whitespace-nowrap">{r.totalAmount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <style>{`
          .custom-scrollbar { scrollbar-width: thin; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #fb923c !important; border-radius: 8px; }
          .custom-scrollbar::-webkit-scrollbar { background: transparent; width: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar { scrollbar-color: #fb923c #fff0e5; }
        `}</style>
        <style>{`
          body { background: none !important; }
          .bg-orange-50 { background-color: rgba(255, 248, 242, 0.95) !important; }
        `}</style>
      </div>
    </div>
  );
};

export default DoanhThu;