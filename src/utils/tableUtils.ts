import { OrderItem } from "@/types/table";

export const getTableStatus = (status: string, time?: string) => {
  return status === "Trống"
    ? { text: "Trống", color: "bg-green-100 text-green-600" }
    : status === "Đang sử dụng"
      ? { text: "Sử dụng", color: "bg-red-100 text-red-600" }
      : { text: time || "Đã đặt", color: "bg-blue-100 text-blue-600" };
};

export const getDishStatus = (status: string, qty: number) => {
  return status === "Đã gọi"
    ? { text: `Đã gọi (${qty})`, color: "bg-gray-400 text-white" }
    : status === "Đang chuẩn bị"
      ? { text: `Đang (${qty})`, color: "bg-orange-400 text-white" }
      : status === "Đã hoàn thành"
        ? { text: "", color: "bg-green-500 text-white", icon: true }
        : { text: "Từ chối", color: "bg-gray-400 text-white" };
};

export const calculateTableTotal = (dishes?: OrderItem[]) => {
  if (!dishes) return 0;
  return dishes.reduce((total, dish) => total + dish.price * dish.quantity, 0);
};