import { OrderItem } from "@/types/table";
import { Dish } from "@/types/dish";
import { Check, Clock, Trash2, Plus, Minus } from "lucide-react";

interface DishCardProps {
  dish: OrderItem & Pick<Dish, "name" | "price" | "unit"> & { tableId?: string };
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onQuantityChange: (id: string, change: number) => void;
  onStatusToggle: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (dish: any) => void; // thêm prop mới
}

const DishCard: React.FC<DishCardProps> = ({
  dish,
  index,
  isSelected,
  onSelect,
  onQuantityChange,
  onStatusToggle,
  onDelete,
  onEdit,
}) => {
  return (
    <div
      className={`relative bg-orange-50 border-2 border-orange-200 rounded-lg p-4 hover:shadow-xl cursor-pointer hover:scale-105 hover:-translate-y-1 animate-fade-in-up group ${isSelected ? "ring-2 ring-orange-400 scale-105 shadow-xl" : ""}`}
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={() => onSelect(isSelected ? "" : dish.id)}
    >
      <div className="flex items-center space-x-3 mb-3">
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={`data:image/jpg;base64,${dish.image}`}
            className="w-16 h-16 rounded-lg border-2 border-orange-200 object-cover group-hover:scale-110"
          />
          {dish.status === "Completed" && (
            <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600 animate-bounce" />
            </div>
          )}
          {dish.status === "Preparing" && (
            <div className="absolute inset-0 bg-orange-500 bg-opacity-20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600 animate-spin" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-orange-600">
            {dish.name}
          </h3>
          <p className="text-orange-600 font-medium">
            {dish.price.toLocaleString()} VND
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuantityChange(dish.id, -1);
            }}
            className="p-1 rounded border hover:bg-gray-100 animate-bounce-in"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 bg-white rounded border font-medium">
            {dish.quantity}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuantityChange(dish.id, 1);
            }}
            className="p-1 rounded border hover:bg-gray-100 animate-bounce-in"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStatusToggle(dish.id);
          }}
          className={`px-4 py-2 rounded-lg font-medium hover:scale-110 hover:shadow-lg ${dish.status === "Đã gọi"
            ? "bg-gray-200 text-gray-700"
            : dish.status === "Đang chuẩn bị"
              ? "bg-orange-200 text-orange-700"
              : dish.status === "Đã hoàn thành"
                ? "bg-green-200 text-green-700"
                : dish.status === "Chưa gọi"
                  ? "bg-amber-200 text-yellow-700"
                  : "bg-red-200 text-yellow-50-700"
            } animate-bounce-in`}
        >
          {dish.status}
        </button>
      </div>
      {/* Nút cập nhật và xóa khi hover hoặc isSelected */}
      <div className={`absolute top-2 right-2 flex gap-2 transition-opacity duration-200 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>

        <button
          onClick={e => {
            e.stopPropagation();
            onDelete(dish.id);
          }}
          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 hover:scale-110 hover:rotate-12 animate-bounce-in"
          title="Xóa món"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div>{dish.note === null ? "" : dish.note}</div>
    </div>

  );
};

export default DishCard;