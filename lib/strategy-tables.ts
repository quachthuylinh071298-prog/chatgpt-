// Generic research/reporting structure. All content is authored for Huu Thi Chung;
// no client-specific data or medical copy from private references is included.
import type { Project } from "./domain";
import {
  briefSources,
  briefCollectedAt,
  briefNotice,
  clinicalTopics,
} from "./huu-chung-brief";
export type StrategyTable = {
  id: string;
  title: string;
  note: string;
  headers: string[];
  rows: (string | number | null)[][];
};
const assumption = "Giả thuyết — chưa khảo sát";
export function strategyTables(project: Project): StrategyTable[] {
  const profiles: StrategyTable = {
    id: "profile",
    title: "01. Hồ sơ thương hiệu",
    note: "Nguồn công khai là quan sát nội dung trang, không xác nhận giấy phép hay thông tin hoạt động hiện tại.",
    headers: [
      "Hạng mục",
      "Thông tin / đề xuất",
      "Trạng thái",
      "Nguồn / cách xác minh",
    ],
    rows: [
      ["Tên thương hiệu", project.name, "Người dùng cung cấp", "Hồ sơ dự án"],
      [
        "Chuyên khoa",
        "Nội Cơ xương khớp",
        "Nguồn công khai đã đọc",
        "S1, S2; chủ dự án xác nhận đúng bác sĩ",
      ],
      [
        "Nền tảng chuyên môn",
        "Hồ sơ công khai ghi từng công tác tại Bệnh viện E",
        "Nguồn công khai đã đọc",
        "S1, S2",
      ],
      [
        "Kinh nghiệm",
        "Có cách ghi khác nhau: 30 năm và 35 năm",
        "Chưa thống nhất",
        "S1/S2 so với S3 — cần chủ dự án duyệt",
      ],
      [
        "Địa điểm / lịch khám",
        project.location || "Chưa xác nhận",
        "Cần xác nhận hiện tại",
        "Không lấy thông tin cũ làm lịch hiện tại",
      ],
      [
        "Dịch vụ ưu tiên",
        project.services || "Chưa chốt dịch vụ triển khai",
        "Người dùng nhập / cần duyệt",
        "Chốt 1–2 dịch vụ trước khi phân bổ ngân sách",
      ],
      [
        "Fanpage",
        project.facebook,
        "Người dùng cung cấp; chưa đọc được nội dung",
        "Không có kiểm toán bài viết, lượt xem hay tương tác",
      ],
      [
        "Định vị thử nghiệm",
        "Giải thích dễ hiểu, giúp người tìm hiểu chuẩn bị tốt cho buổi khám",
        "Đề xuất chiến lược",
        "Chờ bác sĩ/chủ dự án duyệt",
      ],
      [
        "Ngân sách 90 ngày",
        project.budget,
        "Mục tiêu đầu vào, không phải chi phí đã phát sinh",
        "Hồ sơ dự án; trống nếu chưa có ngân sách",
      ],
      [
        "Giới hạn dữ liệu",
        briefNotice,
        "Giới hạn nghiên cứu",
        "Ngày nguồn: " + briefCollectedAt.slice(0, 10),
      ],
    ],
  };
  const ta: StrategyTable = {
    id: "audience",
    title: "02. Chân dung khách hàng",
    note: "Ba nhóm dưới đây là giả thuyết phục vụ nghiên cứu. Chưa có khảo sát, cơ cấu tuổi/thu nhập, search volume hoặc tỷ lệ phân bổ thực tế.",
    headers: [
      "Chiều phân tích",
      "A — Người trực tiếp tìm hiểu",
      "B — Người thân hỗ trợ",
      "C — Người đã có hồ sơ khám",
    ],
    rows: [
      [
        "Bối cảnh",
        "Đang tìm hiểu về khó chịu cơ xương khớp",
        "Tìm thông tin và thu xếp buổi khám cho người thân",
        "Có kết quả khám trước, muốn làm rõ thông tin",
      ],
      [
        "Vai trò quyết định",
        "Có thể trực tiếp chọn bác sĩ và kênh liên hệ",
        "Có thể tìm nguồn, đặt lịch, đưa đón; chưa chắc là người bệnh",
        "Có thể chủ động tìm thêm thông tin chuyên môn",
      ],
      [
        "Tuổi / giới / thu nhập",
        "Chưa có dữ liệu",
        "Chưa có dữ liệu",
        "Chưa có dữ liệu",
      ],
      [
        "Địa bàn",
        "Chờ xác nhận nơi khám và phạm vi phục vụ",
        "Chờ xác nhận địa bàn / khả năng đi lại",
        "Chờ xác nhận địa bàn / kênh phù hợp",
      ],
      [
        "Hành vi tìm kiếm giả định",
        "Đọc nguồn, xem cách giải thích, hỏi quy trình",
        "Kiểm tra uy tín, lịch, địa chỉ, việc chuẩn bị",
        "So sánh thông tin, hỏi cách sắp xếp hồ sơ",
      ],
      [
        "Jobs To Be Done",
        "Biết bước tiếp theo để trao đổi với bác sĩ",
        "Giúp người thân tiếp cận buổi tư vấn thuận tiện",
        "Chuẩn bị câu hỏi và hồ sơ cho cuộc trao đổi rõ ràng",
      ],
      [
        "Pain Point giả định",
        "Thông tin khó hiểu; chưa biết bắt đầu từ đâu",
        "Nhiều việc cần thu xếp; thông tin chưa nhất quán",
        "Nhiều kết quả/thuật ngữ, chưa biết hỏi gì",
      ],
      [
        "Nhu cầu lý tính",
        "Chuyên khoa, phạm vi tư vấn, quy trình và chi phí đã xác nhận",
        "Thông tin liên hệ, lịch, người đi cùng và chuẩn bị",
        "Hướng dẫn chuẩn bị thông tin; kênh trao đổi phù hợp",
      ],
      [
        "Nhu cầu cảm tính",
        "Được giải thích và tôn trọng quyền lựa chọn",
        "An tâm vì chuẩn bị có cơ sở cho người thân",
        "Được lắng nghe điều chưa rõ",
      ],
      [
        "Rào cản cần phỏng vấn",
        "Lo chi phí, thời gian, khó đánh giá thông tin",
        "Lịch gia đình, di chuyển, thông tin giữa các kênh",
        "Ngại lặp lại thông tin, chưa rõ kỳ vọng",
      ],
      ["Bằng chứng hiện có", assumption, assumption, assumption],
      [
        "Cách kiểm chứng",
        "Phỏng vấn tự nguyện + phân loại câu hỏi tổng hợp",
        "Phỏng vấn người hỗ trợ + kiểm tra hành trình đặt lịch",
        "Phỏng vấn về nhu cầu thông tin, không tải bệnh án vào AI",
      ],
    ],
  };
  const insight: StrategyTable = {
    id: "insight",
    title: "03. Insight & Định vị",
    note: "Truth–Tension–Motivation là khung phân tích đề xuất; “Truth” ở đây là tiền đề cần kiểm chứng, không phải sự thật khảo sát đã được xác nhận.",
    headers: [
      "Nhóm",
      "Tiền đề cần kiểm chứng",
      "Tension / mâu thuẫn giả định",
      "Động lực giả định",
      "Insight giả thuyết",
      "Thông điệp thử nghiệm",
      "Kiểm chứng",
    ],
    rows: [
      [
        "A",
        "Muốn hiểu thông tin trước khi quyết định",
        "Nhiều nội dung nhưng khó biết câu hỏi nào phù hợp",
        "Muốn trao đổi rõ ràng với bác sĩ",
        "Tôi muốn biết mình nên chuẩn bị và hỏi gì trước khi đặt lịch",
        "Hiểu rõ câu hỏi, chủ động chuẩn bị",
        "Phỏng vấn và kiểm tra FAQ được quan tâm",
      ],
      [
        "B",
        "Người hỗ trợ có vai trò thu xếp hành trình",
        "Muốn giúp người thân nhưng thiếu thông tin quy trình",
        "Muốn chuẩn bị chu đáo, giảm lúng túng",
        "Tôi cần thông tin đáng tin và các bước rõ ràng để hỗ trợ người thân",
        "Chuẩn bị cùng người thân, liên hệ qua kênh chính thức",
        "Phỏng vấn người hỗ trợ; đo câu hỏi/lịch hẹn",
      ],
      [
        "C",
        "Muốn hiểu thêm các thông tin đã nhận",
        "Nhiều kết quả và thuật ngữ chưa được giải thích đủ",
        "Muốn cuộc trao đổi tiếp theo có trọng tâm",
        "Tôi cần sắp xếp hồ sơ và câu hỏi để trao đổi rõ điều còn băn khoăn",
        "Mang thông tin đã có, trao đổi điều chưa rõ",
        "Phỏng vấn nhu cầu thông tin; bác sĩ duyệt nội dung",
      ],
    ],
  };
  const benchmark: StrategyTable = {
    id: "benchmark",
    title: "04. Đối thủ & Điểm tham chiếu",
    note: "Chỉ có hai mô hình quan sát từ website; chưa đủ benchmark 5–10 đơn vị, chưa kiểm toán mạng xã hội. Không xếp hạng chất lượng chuyên môn hoặc suy đoán số liệu nội bộ.",
    headers: [
      "Đơn vị tham chiếu",
      "Nội dung công khai đã quan sát",
      "Cách tiếp cận",
      "Câu hỏi người dùng cần kiểm tra",
      "Bài học có thể thử",
      "Dữ liệu còn thiếu",
      "Nguồn",
    ],
    rows: [
      [
        "Tâm Anh — hồ sơ Đặng Hồng Hoa",
        "Hồ sơ chuyên gia, CTA hẹn khám, bài viết liên quan",
        "Nối thông tin chuyên gia với bước liên hệ",
        "Chưa đọc được bình luận/khảo sát; không suy diễn",
        "Liên kết hồ sơ, FAQ và CTA phù hợp",
        "Traffic, reach, views, lead, lịch hẹn, chi phí quảng cáo",
        "S5",
      ],
      [
        "MEDIPLUS — website cơ sở",
        "Thông điệp y tế số/chăm sóc chủ động, đặt lịch, hotline, Zalo",
        "Điều hướng nhiều kênh liên hệ trên website",
        "Chưa có dữ liệu câu hỏi thực tế",
        "Làm rõ quy trình và kênh chính thức",
        "Chưa xác nhận cùng tệp, chưa kiểm tra hoàn tất đặt lịch hoặc hiệu suất",
        "S6",
      ],
    ],
  };
  const stages = [
    "Awareness",
    "Interest",
    "Trust",
    "Consultation",
    "Booking",
    "Show-up",
    "Retention",
    "Referral",
  ];
  const angles = [
    "Câu hỏi thường gặp và cách kiểm tra nguồn",
    "Giải thích phạm vi chuyên khoa ở mức thông tin",
    "Hồ sơ đã đối chiếu và phong cách giải thích",
    "Chuẩn bị câu hỏi, thông tin trước tư vấn",
    "Địa chỉ, lịch và quy trình đã xác nhận",
    "Xác nhận lịch, thông tin chuẩn bị được duyệt",
    "Kênh phản hồi và hướng dẫn liên hệ sau buổi khám",
    "Chia sẻ kênh chính thức, tôn trọng quyền riêng tư",
  ];
  const ctas = [
    "Lưu câu hỏi hoặc xem nguồn",
    "Xem FAQ phù hợp",
    "Đọc hồ sơ đã xác nhận",
    "Liên hệ hỏi quy trình",
    "Xác nhận lịch qua kênh chính thức",
    "Kiểm tra thông tin lịch đã nhận",
    "Gửi phản hồi trải nghiệm qua kênh riêng",
    "Chia sẻ đường dẫn thông tin chính thức",
  ];
  const funnel: StrategyTable = {
    id: "funnel",
    title: "05. Chiến lược theo phễu",
    note: "CTA là đề xuất. Chưa xác nhận mọi kênh/dịch vụ đang vận hành; chỉ kích hoạt sau khi kiểm tra. Không xin bệnh án, đơn thuốc hoặc triệu chứng định danh trong bình luận công khai.",
    headers: [
      "Giai đoạn",
      "Nhóm ưu tiên",
      "Rào cản giả định",
      "Thông điệp",
      "Tuyến nội dung",
      "Format / kênh thử nghiệm",
      "CTA",
      "KPI / nguồn",
    ],
    rows: stages.map((s, i) => [
      s,
      i < 3 ? "A/B/C" : "Theo nhu cầu thực tế",
      "Chưa biết bước tiếp theo / thông tin cần làm rõ",
      "Thông tin rõ ràng, quyết định có cơ sở",
      angles[i],
      i < 3
        ? "Reels + bài FAQ / Facebook, website"
        : "Thông tin quy trình / kênh đã xác nhận",
      ctas[i],
      [
        "Tiếp cận, lượt xem — nguồn nền tảng",
        "Lượt bấm FAQ — tracking cần cấu hình",
        "Câu hỏi phù hợp — tổng hợp nội bộ",
        "Lead phù hợp — định nghĩa cần chốt",
        "Lịch xác nhận — vận hành",
        "Đến khám — tổng hợp vận hành",
        "Phản hồi/tái hẹn — chưa có dữ liệu",
        "Lượt giới thiệu — chưa có dữ liệu",
      ][i],
    ]),
  };
  const pillarDefs = [
    [
      "Hồ sơ & con người bác sĩ",
      20,
      "Hiểu nền tảng chuyên môn",
      "Hồ sơ đã đối chiếu, cách giải thích và phỏng vấn bác sĩ",
      "Chân dung + phỏng vấn / Fanpage, website",
    ],
    [
      "Hiểu chuyên khoa",
      20,
      "Tìm hiểu thông tin có nguồn",
      "Phạm vi tư vấn, câu hỏi chuyên khoa cần bác sĩ giải đáp",
      "Reels + FAQ / Fanpage, website",
    ],
    [
      "Chuẩn bị trước buổi khám",
      20,
      "Giảm lúng túng trước liên hệ",
      "Câu hỏi, cách ghi lại thông tin, chuẩn bị hồ sơ",
      "Checklist + Reels / Fanpage",
    ],
    [
      "Đồng hành cùng người thân",
      15,
      "Hỗ trợ người thu xếp hành trình",
      "Người đi cùng, câu hỏi của gia đình, quy trình liên hệ",
      "Video tình huống / Reels",
    ],
    [
      "Quy trình & đặt lịch",
      15,
      "Làm rõ bước tiếp theo",
      "Địa chỉ/lịch/chi phí sau khi xác nhận; đổi lịch",
      "FAQ + bài thông tin / kênh chính thức",
    ],
    [
      "Hỏi đáp & phản hồi",
      10,
      "Lắng nghe nhu cầu thông tin",
      "Q&A tổng hợp, phản hồi trải nghiệm không định danh",
      "Q&A / Fanpage, website",
    ],
  ];
  const pillars: StrategyTable = {
    id: "pillars",
    title: "06. Content Direction",
    note: "Tỷ trọng 20/20/20/15/15/10 là phương án biên tập thử nghiệm cho dự án này, không phải tỷ lệ đã đo hoặc sao chép từ mẫu.",
    headers: [
      "Pillar",
      "Tỷ trọng đề xuất (%)",
      "Mục tiêu",
      "Angle / tuyến nội dung",
      "Format / kênh",
      "Trạng thái",
    ],
    rows: pillarDefs.map((row) => [...row, "Đề xuất — cần duyệt"]),
  };
  const calendar: StrategyTable = {
    id: "calendar",
    title: "07. Lịch biên tập 30 nội dung",
    note: "Lịch tương đối, chưa chốt ngày đăng. Không tự đánh dấu “Đã duyệt” hoặc “Đã đăng”. Có thể trải 30 nội dung trong 60/90 ngày theo nguồn lực, không mặc định đăng hằng ngày.",
    headers: [
      "Mã",
      "Slot dự kiến",
      "Chủ đề / Hook",
      "Nhóm TA",
      "Pillar",
      "Giai đoạn",
      "Key Message",
      "Format / kênh",
      "CTA",
      "Duyệt chuyên môn",
      "Sản xuất",
      "Phụ trách",
      "Nguồn / cần bổ sung",
    ],
    rows: clinicalTopics.map((topic, i) => {
      const group = /cha mẹ|người thân|gia đình/.test(topic)
        ? "B"
        : /hồ sơ|kết quả|phim chụp/.test(topic)
          ? "C"
          : "A/B/C";
      const stage = /chi phí|đặt lịch|xác nhận lịch|kênh chính thức/.test(topic)
        ? 4
        : /bác sĩ|chuyên khoa|kiểm duyệt/.test(topic)
          ? 2
          : 0;
      const pillar = /cha mẹ|người thân|gia đình/.test(topic)
        ? 3
        : /chi phí|đặt lịch|xác nhận lịch|kênh chính thức/.test(topic)
          ? 4
          : /hồ sơ|kết quả|phim chụp|chuẩn bị/.test(topic)
            ? 2
            : /kiểm duyệt|bác sĩ muốn/.test(topic)
              ? 0
              : 1;
      return [
        "HC-" + String(i + 1).padStart(2, "0"),
        "Slot " + (i + 1) + " — chốt ngày sau",
        topic,
        group,
        pillarDefs[pillar][0],
        stages[stage],
        "Thông tin rõ ràng; chuẩn bị câu hỏi phù hợp",
        "Reels 45–90s + FAQ / Fanpage",
        ctas[stage],
        "Chưa duyệt",
        "Dự thảo",
        "Chưa phân công",
        "Ý tưởng biên tập; nội dung chuyên môn cần nguồn và bác sĩ duyệt",
      ];
    }),
  };
  const scripts: StrategyTable = {
    id: "scripts",
    title: "08. Kịch bản video mẫu",
    note: "Lời thoại mới viết cho dự án; chưa quay, chưa được bác sĩ duyệt. Các nội dung là thông tin chuẩn bị/giao tiếp, không chẩn đoán hoặc chỉ định điều trị.",
    headers: [
      "Mã",
      "Chủ đề",
      "TA",
      "Thời lượng dự kiến",
      "0–3s Hook",
      "4–20s Bối cảnh",
      "21–45s Nội dung chính",
      "46–60s CTA",
      "Visual / B-roll",
      "Trạng thái",
    ],
    rows: [
      [
        "HC-V01",
        "Chuẩn bị câu hỏi trước buổi khám",
        "A/B/C",
        "60 giây",
        "Đi khám xong mới nhớ ra điều muốn hỏi?",
        "Trước buổi khám, bạn có thể viết ra những điều mình chưa hiểu để cuộc trao đổi có trọng tâm hơn.",
        "Hãy ghi câu hỏi quan trọng nhất, điều bạn mong được giải thích và các thông tin đã có muốn trao đổi. Không cần tự kết luận tên bệnh trước khi gặp bác sĩ.",
        "Lưu lại danh sách câu hỏi. Nếu cần tìm hiểu quy trình liên hệ, hãy xem kênh chính thức đã được xác nhận.",
        "Bác sĩ nói trực diện; minh họa tờ câu hỏi trống, không dùng bệnh án thật",
        "Dự thảo — chưa duyệt",
      ],
      [
        "HC-V02",
        "Người thân hỗ trợ chuẩn bị buổi khám",
        "B",
        "60 giây",
        "Đưa người thân đi khám, nên chuẩn bị cùng nhau điều gì?",
        "Người thu xếp lịch và người đến khám có thể có những câu hỏi khác nhau. Hãy trao đổi trước để không bỏ sót điều quan trọng.",
        "Thống nhất điều người thân muốn hỏi; xác nhận thông tin lịch đã nhận; chuẩn bị những tài liệu được cơ sở hướng dẫn. Tôn trọng quyền riêng tư và mong muốn của người đến khám.",
        "Lưu checklist và hỏi lại cơ sở qua kênh chính thức nếu thông tin chưa rõ. Không đăng bệnh án trong bình luận.",
        "Checklist ba mục; diễn viên/tình huống minh họa, không giả làm ca bệnh thực tế",
        "Dự thảo — chưa duyệt",
      ],
      [
        "HC-V03",
        "Kiểm tra thông tin trước khi đặt lịch",
        "A/B/C",
        "60 giây",
        "Trước khi đặt lịch, có ba thông tin nên làm rõ.",
        "Một bài viết trên mạng có thể chưa cập nhật đủ mọi thông tin hoạt động. Đừng mặc định lịch hoặc chi phí cũ vẫn đúng.",
        "Hãy xác nhận bác sĩ/chuyên khoa phù hợp, địa điểm và thời gian hiện tại, cùng cách nhận xác nhận lịch. Nếu cần hỏi chi phí, yêu cầu cơ sở giải thích phần đã biết và phần phụ thuộc buổi khám.",
        "Liên hệ kênh chính thức để hỏi quy trình; chỉ coi lịch đã chốt khi có xác nhận từ cơ sở.",
        "Giao diện lịch giả lập có nhãn minh họa; không ghi giá hoặc địa chỉ chưa xác nhận",
        "Dự thảo — chưa duyệt",
      ],
    ],
  };
  const care: StrategyTable = {
    id: "care",
    title: "09. Kịch bản phản hồi & CSKH",
    note: "Mẫu phản hồi hành chính cho ekip, cần bác sĩ/vận hành duyệt. Không tự phân loại bệnh, đọc phim, kê đơn hay yêu cầu đăng hồ sơ cá nhân công khai.",
    headers: [
      "Tình huống",
      "Mục tiêu",
      "Lời thoại đề xuất",
      "Bước tiếp theo",
      "Cần xác nhận / giới hạn",
      "Trạng thái",
    ],
    rows: [
      [
        "Hỏi địa chỉ / lịch",
        "Cung cấp thông tin đã xác nhận",
        "Dạ, em hỗ trợ thông tin đặt lịch. Ekip sẽ xác nhận địa điểm và thời gian hiện tại trước khi gửi chị; mình chưa cần gửi bệnh án ở đây ạ.",
        "Kiểm tra thông tin đã được chủ dự án duyệt rồi trả lời",
        "Không điền địa chỉ/lịch khi chưa được xác nhận",
        "Dự thảo",
      ],
      [
        "Hỏi chi phí",
        "Làm rõ thông tin hành chính",
        "Dạ, ekip sẽ kiểm tra bảng thông tin chi phí hiện tại và giải thích các hạng mục đã xác nhận. Phần nào phụ thuộc thăm khám sẽ được thông báo rõ, mình không tự dự đoán chi phí điều trị ạ.",
        "Chuyển vận hành kiểm tra",
        "Chưa có bảng giá được duyệt trong hệ thống",
        "Dự thảo",
      ],
      [
        "Gửi câu hỏi chuyên môn / đơn thuốc",
        "Chuyển đúng người phụ trách",
        "Dạ, ekip Marketing không thể kết luận bệnh hoặc hướng dẫn đổi thuốc qua tin nhắn. Em có thể hỗ trợ kênh liên hệ/quy trình để anh chị trao đổi với nhân sự y tế phù hợp. Vui lòng không đăng bệnh án trong bình luận công khai.",
        "Chuyển đầu mối y tế theo quy trình được duyệt",
        "Không tự giải thích kết quả, hứa phản hồi bác sĩ hoặc xác nhận chẩn đoán",
        "Dự thảo",
      ],
      [
        "Đổi lịch",
        "Xác nhận quy trình, không hứa slot",
        "Dạ, em đã nhận nhu cầu đổi lịch. Ekip sẽ kiểm tra lịch hiện tại và phản hồi phương án được xác nhận; thời gian mới chỉ được chốt sau khi cơ sở xác nhận ạ.",
        "Theo quy trình vận hành được duyệt",
        "Không thu thập thông tin vượt nhu cầu; không hứa ưu tiên khi chưa có chính sách",
        "Dự thảo",
      ],
      [
        "Thông tin có tính khẩn cấp",
        "Không trì hoãn tiếp cận hỗ trợ khẩn cấp",
        "Kênh này không theo dõi hoặc xử trí cấp cứu. Nếu đang có tình trạng khẩn cấp, anh chị hãy gọi 115 hoặc cơ sở cấp cứu gần nhất để được hỗ trợ; không chờ phản hồi đặt lịch tại đây.",
        "Chuyển nhân sự y tế theo quy trình cơ sở",
        "Không chẩn đoán hoặc dùng kịch bản Marketing để phân tầng nguy cơ",
        "Cần bác sĩ duyệt quy trình",
      ],
    ],
  };
  const evidence: StrategyTable = {
    id: "sources",
    title: "10. Nguồn & Khoảng trống",
    note: "Chỉ gồm nguồn công khai đã đọc cho dự án. Không nhập dữ liệu/thông tin bệnh học của tài liệu tham khảo thành bằng chứng của bác sĩ Chung.",
    headers: ["Mã", "Nguồn", "URL", "Thời điểm đã đọc", "Giới hạn"],
    rows: briefSources.map((s) => [
      s.id,
      s.name,
      s.url,
      briefCollectedAt,
      s.note,
    ]),
  };
  return [
    profiles,
    ta,
    insight,
    benchmark,
    funnel,
    pillars,
    calendar,
    scripts,
    care,
    evidence,
  ];
}
