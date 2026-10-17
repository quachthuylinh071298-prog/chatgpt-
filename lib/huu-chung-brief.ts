// Biên soạn từ các trang công khai đã mở ngày 17/10/2026.
// Không phải connector tự thu thập; không được thay timestamp khi build/chạy lại.
export const briefVersion = "huu-chung-public-2026-10-17-v1";
export const briefCollectedAt = "2026-10-17T09:02:44.000Z";
export const briefNotice =
  "Bản nghiên cứu biên soạn từ nguồn công khai ngày 17/10/2026. Chủ dự án đã xác nhận đúng bác sĩ trong cuộc trao đổi. Chưa xác nhận nơi/lịch khám hiện tại; không đọc được fanpage Facebook, bản biên soạn không sử dụng dữ liệu Ads, inbox hoặc doanh thu; số liệu người dùng nhập ở bảng KPI là phần riêng. Các phân khúc, định vị và kế hoạch bên dưới là giả thuyết chiến lược, không phải kết quả khảo sát. Chạy lại ứng dụng không làm mới các nguồn này.";
export function matchesHuuChung(facebook: string) {
  try {
    const u = new URL(facebook);
    return (
      ["facebook.com", "www.facebook.com"].includes(u.hostname.toLowerCase()) &&
      u.pathname.replace(/\/$/, "").toLowerCase() === "/bs.ttut.huuchung"
    );
  } catch {
    return false;
  }
}
export const briefSources = [
  {
    id: "S1",
    name: "MSC Clinic — Hồ sơ Hữu Thị Chung",
    url: "https://mscclinic.vn/doi-ngu-chuyen-gia/huu-thi-chung/",
    note: "Đọc được hồ sơ công khai. Nguồn tự giới thiệu của cơ sở, không phải xác nhận giấy phép hành nghề hay lịch khám hiện tại.",
  },
  {
    id: "S2",
    name: "BookingCare — Hồ sơ i5494",
    url: "https://bookingcare.vn/dich-vu-y-te/kham-chuyen-khoa/tien-si-bac-si-huu-thi-chung-i5494",
    note: "Hồ sơ bên thứ ba; đối chiếu nhận diện và cách trình bày thông tin. Không dùng để xác nhận lịch khám.",
  },
  {
    id: "S3",
    name: "BookingCare — Hồ sơ i2920",
    url: "https://bookingcare.vn/dich-vu-y-te/kham-chuyen-khoa/tien-si-bac-si-huu-thi-chung-i2920",
    note: "Hồ sơ khác ghi thông tin khác về kinh nghiệm/nơi làm việc. Cần chủ dự án xác nhận, không lựa chọn tùy ý một bản làm sự thật hiện tại.",
  },
  {
    id: "S4",
    name: "WHO — Musculoskeletal health",
    url: "https://www.who.int/news-room/fact-sheets/detail/musculoskeletal-conditions",
    note: "Fact sheet công bố 14/07/2022, dẫn GBD 2019. Chỉ dùng bối cảnh toàn cầu; không suy rộng thành số người bệnh Hà Nội hay thị trường trả phí.",
  },
  {
    id: "S5",
    name: "Tâm Anh — Hồ sơ Đặng Hồng Hoa",
    url: "https://tamanhhospital.vn/chuyen-gia/dang-hong-hoa/",
    note: "Quan sát hồ sơ, nội dung liên quan và CTA công khai. Chưa đo SEO, traffic, tương tác, quảng cáo hoặc chuyển đổi.",
  },
  {
    id: "S6",
    name: "MEDIPLUS — Trang chủ",
    url: "https://www.mediplus.vn/",
    note: "Quan sát thông điệp thương hiệu, điều hướng đặt lịch và kênh liên hệ công khai; chưa kiểm thử hoàn thành đặt lịch.",
  },
  {
    id: "S7",
    name: "Sun Medicare — Trang chuyên khoa khám bệnh",
    url: "https://sunmedicare.com/chuyen-khoa/kham-benh-10075",
    note: "Trang có giới thiệu bác sĩ cùng tên; không đủ để kết luận đây là nơi khám hiện tại duy nhất.",
  },
];
export const briefSections = [
  {
    title: "Khách hàng mục tiêu & Insight",
    findings: [
      "Quan sát [S1, S2]: hồ sơ công khai giới thiệu bác sĩ thuộc Nội Cơ xương khớp và từng công tác tại Bệnh viện E. Đây là nền tảng để nghiên cứu thương hiệu chuyên khoa, không phải thương hiệu y tế tổng quát.",
      "Bối cảnh [S4]: WHO ước tính khoảng 1,71 tỷ người trên toàn cầu có tình trạng cơ xương khớp, dựa trên GBD 2019. Dữ liệu này nói về gánh nặng sức khỏe; chưa có bằng chứng để tính quy mô khách hàng trả phí tại địa bàn của bác sĩ.",
      "Giả thuyết A — người có khó chịu cơ xương khớp kéo dài: muốn hiểu quy trình khám và tìm người giải thích rõ. Rào cản có thể là thông tin khó hiểu, lo chi phí, chưa biết bắt đầu ở đâu; chưa được khảo sát.",
      "Giả thuyết B — con/cháu tìm bác sĩ cho cha mẹ: vừa quyết định kênh liên hệ, vừa thu xếp đi khám. Nội dung cần trả lời việc chuẩn bị, người đi cùng, địa chỉ, lịch và chi phí đã xác nhận; không mặc định họ là người bệnh.",
      "Giả thuyết C — người đã có kết quả khám và cần trao đổi thêm: quan tâm phạm vi chuyên môn, cách chuẩn bị hồ sơ và tính liên tục của quá trình chăm sóc. Không dùng nội dung để khuyên tự đổi thuốc hoặc tự quyết định điều trị.",
      "Patient Journey đề xuất: tìm thông tin → kiểm tra hồ sơ chuyên môn → xem cách bác sĩ giải thích → hỏi quy trình/chi phí → xác nhận lịch → đến khám → theo dõi trải nghiệm. Chưa có dữ liệu chứng minh điểm rơi lớn nhất ở bước nào.",
    ],
    actions: [
      "Ưu tiên cao: phỏng vấn thử 5 người mỗi nhóm trên cơ sở đồng ý phù hợp, ghi lý do tìm bác sĩ, điều khiến do dự và thông tin cần trước khi đặt lịch. Đây là kế hoạch thu thập, không phải số người đã phỏng vấn.",
      "Dùng bộ câu hỏi: Ai chủ động tìm bác sĩ? Điều gì khiến anh/chị tin tưởng? Đã xem nguồn nào? Thông tin nào chưa rõ? Vì sao chưa đặt lịch? Không đưa thông tin định danh hoặc bệnh án vào công cụ Marketing.",
      "Mã hóa phản hồi theo nhu cầu, rào cản, câu hỏi và giai đoạn hành trình; chỉ nâng giả thuyết thành insight sau khi có bằng chứng lặp lại.",
    ],
  },
  {
    title: "Đối thủ, điểm tham chiếu & Khoảng trống",
    findings: [
      "Quan sát [S5]: trang Tâm Anh giới thiệu Đặng Hồng Hoa trong chuyên khoa Cơ xương khớp, có CTA hẹn khám và bài viết liên quan. Có thể học cách nối thông tin chuyên gia với bước tiếp theo rõ ràng; chưa biết tỷ lệ chuyển đổi thực tế.",
      "Quan sát [S6]: MEDIPLUS thể hiện thông điệp y tế số/chăm sóc chủ động và đặt đường dẫn đặt lịch, hotline, Zalo ở vị trí dễ thấy. Đây là mô hình tham chiếu cấp cơ sở; chưa chứng minh là đối thủ trực tiếp cùng tệp khách hàng.",
      "Cấu trúc so sánh hợp lý: bác sĩ chuyên khoa có hồ sơ uy tín; phòng khám có hành trình đặt lịch thuận tiện; hệ thống bệnh viện có nội dung và hạ tầng thương hiệu. Không gộp các mô hình thành bảng xếp hạng chất lượng khám.",
      "Giả thuyết khoảng trống: một thương hiệu bác sĩ có thể giảm độ khó hiểu giữa thông tin chuyên môn và quyết định đặt lịch bằng video giải thích ngắn, thông tin quy trình rõ ràng và phản hồi nhất quán. Chưa có kiểm toán fanpage để kết luận đối thủ bỏ trống chủ đề nào.",
      "SWOT sơ bộ: S — có hồ sơ chuyên khoa công khai để đối chiếu [S1,S2]; W — chưa có dữ liệu hành trình/hiệu suất và thông tin công khai chưa nhất quán [S1,S3,S7]; O — thử nghiệm nội dung hỗ trợ ra quyết định; T — thông tin y tế nhiễu và cạnh tranh từ hệ thống có nhiều kênh. O/T là nhận định chiến lược, chưa đo lường.",
      "Chưa đủ dữ liệu để công bố benchmark 5–10 đối thủ, USP độc quyền, bản đồ định vị định lượng, traffic SEO hay chi phí quảng cáo. Báo cáo này chỉ có hai mô hình tham chiếu công khai.",
    ],
    actions: [
      "Xác nhận địa bàn khám và 1–2 dịch vụ ưu tiên trước khi chọn thêm 3–8 đơn vị thực sự cùng thị trường.",
      "Mỗi đối thủ cần bảng bằng chứng: URL hồ sơ, URL đặt lịch, 10 nội dung trong cùng khoảng ngày, nhóm chủ đề, format, CTA, chỉ số công khai nếu có và thời điểm ghi nhận. Không suy đoán doanh thu hay ngân sách.",
      "Thử nghiệm thông điệp giải thích rõ/quy trình minh bạch; chỉ gọi đó là điểm khác biệt sau khi có kiểm tra cạnh tranh và phản hồi khách hàng.",
    ],
  },
  {
    title: "SMART Goals & Phễu chuyển đổi",
    findings: [
      "Mục tiêu quản trị đề xuất cho 14 ngày đầu: hoàn thành bộ thông tin bác sĩ đã duyệt và đo đủ luồng hỏi thông tin → lead đủ điều kiện → đặt lịch → đến khám. Đây là mục tiêu triển khai, không phải dự báo tăng trưởng.",
      "Định nghĩa thử nghiệm lead đủ điều kiện: yêu cầu tìm hiểu/đặt lịch phù hợp với phạm vi dịch vụ đã xác nhận và đồng ý nhận hướng dẫn liên hệ. Không thu thập chẩn đoán hoặc chi tiết bệnh án để chấm điểm Marketing.",
      "Chưa có baseline thì không cam kết tăng inbox, người bệnh hay doanh thu theo phần trăm. Hai tuần đầu dùng để đo; sau đó cùng chủ dự án chốt target tháng và quý theo năng lực tiếp nhận thực tế.",
      "Đầu vào của phễu: số nội dung được duyệt, lượt xem/tiếp cận có nguồn, lượt bấm CTA, lead, lịch hẹn xác nhận, đến khám, doanh thu tổng hợp. Thiếu bước nào phải hiển thị là chưa đo, không thay bằng 0.",
      "Nhận diện → quan tâm → tin tưởng là nhóm chỉ số nội dung; tư vấn → đặt lịch → đến khám là nhóm chuyển đổi. Chăm sóc lại và giới thiệu cần định nghĩa/nguồn dữ liệu riêng, chưa có trong dữ liệu hiện tại.",
    ],
    actions: [
      "Marketing chịu trách nhiệm nguồn traffic/CTA; vận hành chịu trách nhiệm xác nhận lịch và kết quả đến khám; tài chính nhập doanh thu tổng hợp; bác sĩ duyệt chuyên môn, không chịu trách nhiệm nhập báo cáo Marketing.",
      "Gắn mã nội dung/UTM hoặc nhãn nguồn vào kênh đặt lịch được phép; kiểm tra từng đường dẫn bằng một lượt thử nội bộ, không gửi thông tin người bệnh thử lên nguồn ngoài.",
      "Cuối tuần 2: đối chiếu định nghĩa lead, độ phủ dữ liệu và khả năng tiếp nhận, rồi phê duyệt target thay vì lấy một tỷ lệ tăng trưởng chung cho mọi dự án.",
    ],
  },
  {
    title: "Định vị & Chiến lược nội dung",
    findings: [
      "Vấn đề thương hiệu cần xử lý trước: MSC và hồ sơ BookingCare i5494 ghi 30 năm, trong khi hồ sơ i2920 ghi 35 năm [S1,S2,S3]; các nguồn cũng gắn bác sĩ với những cơ sở khác nhau [S1,S3,S7]. Chưa nên dùng con số năm kinh nghiệm, địa chỉ hoặc lịch khám trong quảng cáo nếu chủ dự án chưa xác nhận.",
      "Định vị đề xuất — giả thuyết: bác sĩ Nội Cơ xương khớp giải thích dễ hiểu, giúp người tìm hiểu chuẩn bị tốt cho buổi khám. Đây là hướng truyền thông cần bác sĩ phê duyệt; không khẳng định hiệu quả điều trị vượt trội hoặc tốt nhất.",
      "Thông điệp cốt lõi thử nghiệm: hiểu rõ thông tin, trao đổi đúng câu hỏi, chủ động chuẩn bị cho buổi tư vấn. Chuyển trọng tâm từ lời hứa hết đau sang minh bạch quá trình và chất lượng giải thích.",
      "Sáu trụ cột đề xuất: hiểu chuyên khoa; chuẩn bị đi khám; câu hỏi thường gặp; cách đọc thông tin sức khỏe; con người/chuyên môn bác sĩ; quy trình đặt lịch. Mỗi nội dung cần gắn một giai đoạn phễu và một CTA phù hợp.",
      "Reels dùng để trả lời một câu hỏi mỗi video; bài dài bổ sung bối cảnh và nguồn; trang hồ sơ/FAQ tập trung thông tin đã xác nhận. Không sao chép lời chứng thực cá nhân hoặc bệnh án khi chưa có căn cứ sử dụng.",
      "SEO xã hội thử nghiệm: tiêu đề theo ngôn ngữ câu hỏi, phụ đề rõ, mô tả chuyên khoa và địa bàn đã xác nhận; gom nội dung thành chuỗi liên quan. Chưa có dữ liệu volume từ khóa hoặc kiểm tra xếp hạng.",
    ],
    actions: [
      "Sản xuất thử 12 Reels trong 4 tuần, mỗi tuần 3 video nếu phù hợp năng lực. Đây là nhịp thử nghiệm, không phải cam kết sẽ đạt lead hoặc lượt xem.",
      "A/B test lần lượt: câu hỏi mở đầu so với checklist; bác sĩ giải thích so với sơ đồ; CTA đọc FAQ so với hỏi quy trình đặt lịch. Mỗi lần chỉ đổi một yếu tố, đánh giá cả lead/lịch hẹn theo cùng khoảng thời gian.",
      "Chuỗi nội dung 45–90 giây phải được bác sĩ duyệt phần chuyên môn; không biến kịch bản Marketing thành chỉ định cho người xem.",
    ],
  },
  {
    title: "Kế hoạch triển khai 90 ngày",
    findings: [
      "Tuần 1–2: xác minh bộ hồ sơ, lập danh sách thông tin chưa thống nhất, kiểm tra CTA/đặt lịch và từ điển KPI. Deliverable: một bộ thông tin được chủ dự án duyệt, một bản đồ hành trình và bảng baseline chưa điền giả.",
      "Tuần 3–4: phỏng vấn thử, xây 3 giả thuyết insight, quay lô video đầu và thiết lập nguồn nội dung → lead. Deliverable: nhật ký bằng chứng, 12 dàn ý có duyệt, lịch đăng theo năng lực.",
      "Tuần 5–8: chạy thử nội dung/CTA, rà soát lý do chưa đặt lịch và không đến khám ở mức tổng hợp. Deliverable: báo cáo thử nghiệm có khoảng ngày, chỉ số đầu vào và ghi chú thiếu dữ liệu.",
      "Tuần 9–12: nhân rộng chủ đề có tín hiệu chuyển đổi đủ tin cậy; sửa quy trình hoặc dừng thử nghiệm không hiệu quả sau khi kiểm tra độ phủ. Deliverable: báo cáo quý và giả thuyết vòng tiếp theo.",
      "Không tự phân bổ tiền quảng cáo khi ngân sách, năng lực tiếp nhận và tracking chưa được chủ dự án duyệt. Mặc định ưu tiên hoàn thiện thông tin và đo lường trước khi tăng chi.",
    ],
    actions: [
      "RACI đề xuất: Marketing Lead (A cho kế hoạch), Content/Video (R sản xuất), bác sĩ (C và phê duyệt chuyên môn), vận hành (R lịch hẹn), tài chính (C ngân sách/doanh thu). Cần điền người thực tế trước khi giao việc.",
      "Checklist xuất bản: thông tin nguồn đúng ngày; chuyên môn đã duyệt; không có thông tin định danh; CTA hoạt động; nhãn nguồn theo dõi đầy đủ; không cam kết kết quả điều trị.",
      "Họp ngắn hàng tuần để quyết định giữ/sửa/dừng/thử mới; lưu quyết định và bằng chứng liên quan vào phiên bản tiếp theo.",
    ],
  },
  {
    title: "Đo lường & Quyết định tối ưu",
    findings: [
      "Bảng quyết định: tiếp cận cao nhưng lead ít → kiểm tra mức liên quan của chủ đề và CTA; lead nhiều nhưng lịch hẹn ít → kiểm tra định nghĩa lead, thông tin quy trình và phản hồi vận hành; đặt lịch nhiều nhưng đến khám ít → kiểm tra nhắc lịch/lý do tổng hợp. Đây là hướng điều tra, không kết luận nguyên nhân.",
      "Không xếp nội dung tốt chỉ bằng views. Xem đồng thời đúng nhóm quan tâm, lead phù hợp, lịch xác nhận và đến khám; doanh thu chỉ sử dụng khi có nguồn và quy tắc ghi nhận rõ.",
      "Weekly review: nội dung nào có dữ liệu đầy đủ, điểm rơi nào cần kiểm tra, ai chịu trách nhiệm và hạn thử lại. Monthly review: so sánh cùng phạm vi, định nghĩa và độ phủ; tách tăng trưởng thật khỏi thay đổi cách nhập.",
      "Giữ: nội dung tạo câu hỏi phù hợp và lịch hẹn có dữ liệu. Sửa: thông tin công khai không thống nhất và CTA khó hiểu. Dừng: tuyên bố không có nguồn hoặc hứa kết quả. Thử mới: chuỗi chuẩn bị đi khám và nội dung dành cho người thân — tất cả cần được kiểm chứng bằng thử nghiệm.",
    ],
    actions: [
      "Trong 7 ngày: chốt bộ hồ sơ và quy trình liên hệ; trong 14 ngày: có baseline/độ phủ dữ liệu; trong 30 ngày: có báo cáo thử nghiệm đầu tiên. Đây là mốc triển khai đề xuất.",
      "Không tính ROAS khi thiếu doanh thu/chi phí; không tính ROI khi thiếu tổng chi phí. Chênh lệch phiên bản là mô tả dữ liệu, chưa chứng minh tác động của chiến lược.",
      "Nghiên cứu lại phải bổ sung dữ liệu hoặc nguồn mới thực sự. Bản lưu nguồn công khai ngày 17/10 không được đổi nhãn thành vừa thu thập khi bấm nút.",
    ],
  },
];
export const clinicalTopics = [
  "Khám Nội Cơ xương khớp khác gì khám chấn thương chỉnh hình?",
  "Đau gối kéo dài: nên chuẩn bị câu hỏi gì khi đi khám?",
  "Đau vai gáy: cần ghi lại những thông tin nào trước tư vấn?",
  "Đau lưng: vì sao bác sĩ cần hỏi quá trình xuất hiện khó chịu?",
  "Đã có phim chụp cũ: nên mang theo những gì?",
  "Một buổi khám chuyên khoa thường cần làm rõ những thông tin nào?",
  "Người thân nên hỗ trợ cha mẹ chuẩn bị buổi khám ra sao?",
  "Thấy khó chịu tái diễn: nên ghi nhật ký như thế nào để trao đổi với bác sĩ?",
  "Vì sao không nên tự áp dụng thuốc từ video trên mạng?",
  "Một kết quả chụp có thay thế toàn bộ cuộc khám không?",
  "Trước khi hỏi về tiêm khớp, cần làm rõ những điều gì với bác sĩ?",
  "Thảo luận về loãng xương: nên đặt câu hỏi gì trong buổi khám?",
  "Thoái hóa khớp: câu hỏi nào giúp hiểu kế hoạch theo dõi?",
  "Khớp viêm và thông tin trên mạng: vì sao cần trao đổi trực tiếp?",
  "Đau thần kinh tọa: chuẩn bị thông tin để buổi tư vấn rõ ràng hơn",
  "Đọc nội dung về gout: làm sao kiểm tra nguồn trước khi chia sẻ?",
  "Làm sao hỏi rõ phạm vi tư vấn thay vì chỉ hỏi một phương pháp điều trị?",
  "Bác sĩ muốn người đến khám hiểu gì trước khi đặt lịch?",
  "Nếu nghe nhiều lời khuyên trái chiều, nên sắp xếp câu hỏi thế nào?",
  "Chi phí khám gồm gì và cần xác nhận ở đâu?",
  "Chưa rõ dịch vụ phù hợp: nên liên hệ kênh chính thức thế nào?",
  "Ai sẽ xác nhận lịch và thông tin chuẩn bị trước buổi khám?",
  "Đi cùng cha mẹ: nên thống nhất mục tiêu trao đổi ra sao?",
  "Làm sao nhờ bác sĩ giải thích lại thuật ngữ khó hiểu?",
  "Khi có nhiều kết quả khám khác nhau, nên sắp xếp hồ sơ thế nào?",
  "Sau buổi tư vấn, cần xác nhận kênh hỏi lại thông tin nào?",
  "Một nội dung chuyên môn được bác sĩ kiểm duyệt ra sao?",
  "Hiểu thông tin chuyên khoa và tự chẩn đoán khác nhau thế nào?",
  "Cách gửi phản hồi về trải nghiệm mà không công khai bệnh án",
  "Trước khi chia sẻ câu chuyện sức khỏe, cần bảo vệ quyền riêng tư thế nào?",
];
