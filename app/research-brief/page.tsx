import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { validSession } from "@/lib/auth";
import {
  briefNotice,
  briefSources,
  briefSections,
  clinicalTopics,
} from "@/lib/huu-chung-brief";
export const dynamic = "force-dynamic";
export default async function ResearchBrief() {
  if (!validSession((await cookies()).get("mmi_session")?.value)) redirect("/");
  return (
    <main className="main" style={{ maxWidth: 1150, paddingBottom: 40 }}>
      <Link className="btn" href="/">
        ← Về không gian làm việc
      </Link>
      <div className="page-heading" style={{ marginTop: 25 }}>
        <div>
          <div className="eyebrow">NGHIÊN CỨU BIÊN SOẠN · 17/10/2026</div>
          <h1>BS.TTƯT. Hữu Thị Chung</h1>
          <p>Đối chiếu nguồn công khai và chiến lược Marketing thử nghiệm</p>
        </div>
      </div>
      <div className="notice">
        <p>{briefNotice}</p>
      </div>
      <section className="card">
        <h2>Executive Summary</h2>
        <p style={{ marginTop: 15 }}>
          Hồ sơ cùng tên đã được đối chiếu với các trang công khai và chủ dự án
          xác nhận đúng bác sĩ. Phạm vi phù hợp để xây dựng nội dung là Nội Cơ
          xương khớp [S1,S2]. Việc ưu tiên trước mắt là thống nhất thông tin
          thương hiệu, làm rõ quy trình liên hệ và thiết lập baseline; chưa có
          căn cứ dự báo lead hoặc doanh thu. Chưa hoàn thành kiểm toán Facebook
          hoặc benchmark 5–10 đối thủ.
        </p>
        <p style={{ marginTop: 12 }}>
          Các đề xuất trọng tâm: chia nhóm người tìm thông tin/người thân/người
          đã có hồ sơ khám thành ba giả thuyết để phỏng vấn; thử nghiệm nội dung
          giải thích và chuẩn bị đi khám; đánh giá theo lead, đặt lịch và đến
          khám cùng với chỉ số nội dung. Tất cả kế hoạch thử nghiệm cần chủ dự
          án và bác sĩ duyệt.
        </p>
      </section>
      {briefSections.map((section, i) => (
        <section className="card" key={section.title}>
          <div className="section-heading">
            <span className="step-number">0{i + 1}</span>
            <h2>{section.title}</h2>
          </div>
          <h3>Phát hiện, phân tích & giới hạn</h3>
          {section.findings.map((x) => (
            <p style={{ marginTop: 14, lineHeight: 1.9 }} key={x}>
              {x}
            </p>
          ))}
          <h3 style={{ marginTop: 22 }}>
            Việc nên làm tiếp · Đề xuất cần kiểm chứng
          </h3>
          <ol>
            {section.actions.map((x) => (
              <li style={{ marginBottom: 12 }} key={x}>
                {x}
              </li>
            ))}
          </ol>
        </section>
      ))}
      <section className="card">
        <h2>30 câu hỏi cho Reels, bài viết và phỏng vấn bác sĩ</h2>
        <p style={{ marginTop: 10 }}>
          Đây là ý tưởng biên tập chuyên khoa, không phải hướng dẫn điều trị.
          Mỗi câu hỏi cần câu trả lời được bác sĩ duyệt trước khi xuất bản.
          Content Matrix trong ứng dụng dùng các chủ đề này cho dự án có fanpage
          đã cung cấp.
        </p>
        <ol>
          {clinicalTopics.map((topic) => (
            <li style={{ margin: "12px 0" }} key={topic}>
              {topic}
            </li>
          ))}
        </ol>
        <h3>Dàn ý mẫu 60–75 giây</h3>
        <p style={{ marginTop: 12 }}>
          0–10 giây: đặt câu hỏi của người tìm hiểu. 10–25 giây: giải thích bối
          cảnh vì sao câu hỏi cần được làm rõ. 25–55 giây: bác sĩ trình bày 2–3
          ý đã kiểm chứng; không đưa lời khuyên cho một ca bệnh cụ thể. 55–75
          giây: tóm tắt, nêu giới hạn và mời xem thông tin chuẩn bị/đặt lịch
          chính thức. Chưa điền lời giải chuyên môn khi chưa được bác sĩ duyệt.
        </p>
      </section>
      <section className="card">
        <h2>Bằng chứng & thời điểm thu thập</h2>
        <p>
          Đã mở các URL bên dưới lúc biên soạn ngày 17/10/2026. Đây là quan sát
          nội dung trang công khai, không xác minh độc lập mọi tuyên bố của cơ
          sở. Chưa truy xuất được fanpage Facebook; không có số liệu
          performance, giá khám hoặc lịch khám hiện tại đã được xác nhận.
        </p>
        {briefSources.map((s) => (
          <div
            key={s.id}
            style={{ padding: "18px 0", borderBottom: "1px solid #e8edf3" }}
          >
            <h3>
              {s.id} · {s.name}
            </h3>
            <a
              href={s.url}
              rel="noreferrer"
              target="_blank"
              style={{ overflowWrap: "anywhere" }}
            >
              {s.url}
            </a>
            <p>{s.note}</p>
          </div>
        ))}
      </section>
      <p>
        Để đưa phân tích này vào báo cáo phiên bản mới: chọn Nghiên cứu lại →
        nguồn Website/Web research → khoảng ngày có 17/10/2026. Báo cáo sẽ ghi
        rõ đang dùng bản lưu, không coi đây là lần thu thập web mới. Báo cáo cũ
        được giữ nguyên; bản có nguồn có thể xuất Excel hoặc In/Lưu PDF ở mục
        Báo cáo.
      </p>
    </main>
  );
}
