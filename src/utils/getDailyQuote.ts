export interface QuoteItem {
  quote: string;
  author?: string;
}

export const ROLE_QUOTES: Record<string, QuoteItem[]> = {
  MANAGER: [
    { quote: 'Mỗi cải tiến nhỏ hôm nay sẽ tạo nên một hệ thống tốt hơn ngày mai.' },
    { quote: 'Great things are built one decision at a time.' },
    { quote: 'Đừng chỉ quản lý công việc — hãy xây dựng một hệ thống có thể tự vận hành.' },
    { quote: 'Keep going. Progress is still progress.' },
    { quote: 'Build the process, then trust the process.' },
    { quote: 'Lãnh đạo xuất sắc là trao quyền và tạo dựng sự rõ ràng trong vận hành.' },
  ],
  OPERATOR: [
    { quote: 'Focus on the next task.' },
    { quote: 'Làm đúng ngay từ đầu tốt hơn sửa sai về sau.' },
    { quote: 'Mỗi sản phẩm tốt bắt đầu từ một quy trình được thực hiện cẩn thận.' },
    { quote: 'One task at a time. One great result at a time.' },
    { quote: 'Chất lượng nằm trong từng chi tiết nhỏ.' },
    { quote: 'Sự kiên nhẫn và chính xác là chìa khóa của một bản in 3D hoàn mỹ.' },
  ],
  ADMIN: [
    { quote: 'Good systems make good decisions easier.' },
    { quote: 'Visibility creates control.' },
    { quote: 'Secure. Stable. Scalable.' },
    { quote: 'Hệ thống vận hành trơn tru là nền tảng cho sự mở rộng bền vững.' },
    { quote: 'Giữ vững sự ổn định, sẵn sàng cho mọi thử thách quy mô lớn.' },
  ],
  WAREHOUSE: [
    { quote: 'Đúng vật liệu. Đúng số lượng. Đúng thời điểm.' },
    { quote: 'Inventory accuracy creates operational confidence.' },
    { quote: 'Organize today, operate better tomorrow.' },
    { quote: 'Kho vận chuẩn xác là điểm tựa của toàn bộ dây chuyền sản xuất.' },
    { quote: 'Kiểm soát chặt chẽ từng cuộn nhựa và vật tư là tiết kiệm giá trị lớn.' },
  ],
  CUSTOMER: [
    { quote: 'Some memories deserve more than a photo.' },
    { quote: 'Khoảnh khắc đáng nhớ xứng đáng được lưu giữ theo một cách đặc biệt.' },
    { quote: 'Turn memories into something you can hold.' },
    { quote: 'Biến những khoảnh khắc quý giá thành kỷ vật chạm vào được.' },
    { quote: 'Mỗi kỷ vật là một câu chuyện mang đậm dấu ấn cá nhân.' },
  ],
  PROVIDER: [
    { quote: 'Reliable service builds lasting trust.' },
    { quote: 'Mỗi đơn hàng hoàn thành tốt là một khách hàng có thể quay lại.' },
    { quote: 'Chất lượng gia công và đúng tiến độ là cam kết uy tín nhất.' },
    { quote: 'Hợp tác chặt chẽ cùng vươn tới chuẩn mực chế tác vượt trội.' },
  ],
  DRIVER: [
    { quote: 'Safety first. Every trip.' },
    { quote: 'Mỗi chuyến đi an toàn là một chuyến đi thành công.' },
    { quote: 'Drive safe. Deliver trust.' },
    { quote: 'Trao tận tay kỷ vật, gửi trọn vẹn sự tin cậy tới khách hàng.' },
  ],
};

// Aliases for roles
ROLE_QUOTES.ROLE_MANAGER = ROLE_QUOTES.MANAGER;
ROLE_QUOTES.ROLE_OPERATOR = ROLE_QUOTES.OPERATOR;
ROLE_QUOTES.ROLE_ADMIN = ROLE_QUOTES.ADMIN;
ROLE_QUOTES.ROLE_WAREHOUSE = ROLE_QUOTES.WAREHOUSE;
ROLE_QUOTES.ROLE_WAREHOUSE_STAFF = ROLE_QUOTES.WAREHOUSE;
ROLE_QUOTES.WAREHOUSE_MANAGER = ROLE_QUOTES.WAREHOUSE;
ROLE_QUOTES.ROLE_USER = ROLE_QUOTES.CUSTOMER;
ROLE_QUOTES.ROLE_CUSTOMER = ROLE_QUOTES.CUSTOMER;
ROLE_QUOTES.USER = ROLE_QUOTES.CUSTOMER;
ROLE_QUOTES.ROLE_PROVIDER = ROLE_QUOTES.PROVIDER;
ROLE_QUOTES.ROLE_DRIVER = ROLE_QUOTES.DRIVER;

/**
 * Returns a deterministic quote for the current day and actor role.
 * Does not re-randomize on React re-render.
 */
export function getDailyQuote(role?: string | null): QuoteItem {
  const cleanRole = role ? role.trim().toUpperCase() : 'CUSTOMER';
  const quotes = ROLE_QUOTES[cleanRole] || ROLE_QUOTES.CUSTOMER;

  const now = new Date();
  // Deterministic seed: year * 1000 + month * 31 + day
  const daySeed = now.getFullYear() * 1000 + (now.getMonth() + 1) * 31 + now.getDate();
  const index = Math.abs(daySeed) % quotes.length;

  return quotes[index];
}
