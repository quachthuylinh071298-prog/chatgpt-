import { SourceLog } from "./domain";
export interface ResearchConnector {
  name: string;
  collect(url: string): Promise<SourceLog>;
}
export class UnconfiguredConnector implements ResearchConnector {
  constructor(
    public name: string,
    private reason: string,
  ) {}
  async collect(url: string): Promise<SourceLog> {
    return {
      name: this.name,
      url: url || null,
      status: "unavailable",
      collectedAt: null,
      reason: this.reason,
      freshness: "unavailable",
    };
  }
}
export const connectors = {
  web: new UnconfiguredConnector(
    "Website / Web search",
    "Chưa cấu hình dịch vụ tìm kiếm/crawler. Hãy nhập dữ liệu tổng hợp đã kiểm tra.",
  ),
  meta: new UnconfiguredConnector(
    "Facebook / Meta",
    "Không thể truy xuất: chưa triển khai OAuth và connector Meta Graph API. Nhập CSV từ Meta Business Suite; không cung cấp cookie hoặc mật khẩu.",
  ),
};
export function connectionStatus() {
  return [
    {
      name: "Dữ liệu CSV / XLSX",
      status: "Sẵn sàng",
      detail: "Số liệu do người dùng cung cấp; không xác minh độc lập.",
    },
    {
      name: "AI provider",
      status:
        process.env.AI_PROVIDER === "openai" && process.env.OPENAI_API_KEY
          ? "Đã cấu hình — chưa kiểm tra kết nối"
          : "Chưa cấu hình",
      detail:
        "OpenAI-compatible; chỉ gửi chỉ số tổng hợp. Cần worker đang chạy.",
    },
    {
      name: "Web research / Website",
      status: "Chưa triển khai",
      detail:
        "Chưa tự truy cập web. Dự án BS. Hữu Thị Chung có bản nguồn công khai biên soạn ngày 17/10/2026, không được tự làm mới.",
    },
    {
      name: "Meta Graph API",
      status: "Chưa triển khai",
      detail: "Cần OAuth và quyền hợp lệ ở giai đoạn sau.",
    },
  ];
}
