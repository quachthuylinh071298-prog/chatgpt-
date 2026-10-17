import type { StrategyTable } from "@/lib/strategy-tables";
export function WorkspacePrint({
  tables,
  name,
  subtitle,
}: {
  tables: StrategyTable[];
  name: string;
  subtitle: string;
}) {
  return (
    <div className="workspace-print">
      <h1>{name}</h1>
      <p>
        {subtitle} · Nghiên cứu Marketing · Thông tin người dùng cung cấp và giả
        thuyết cần kiểm chứng. Nguồn có ngày riêng; không phải lần thu thập web
        mới.
      </p>
      {tables.map((t) => (
        <section key={t.id}>
          <h2>{t.title}</h2>
          <p>{t.note}</p>
          <table>
            <thead>
              <tr>
                {t.headers.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((v, c) => (
                    <td key={c}>{v ?? "Chưa có dữ liệu"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
