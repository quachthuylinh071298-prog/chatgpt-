"use client";
import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Search,
  Save,
  X,
  ArrowRight,
  Table2,
} from "lucide-react";
import type { StrategyTable } from "@/lib/strategy-tables";
type Props = {
  tables: StrategyTable[];
  ids?: string[];
  onChange?: (tables: StrategyTable[]) => void;
  onSave?: () => void;
  dirty?: boolean;
  saving?: boolean;
  title?: string;
  readOnly?: boolean;
};
export function ResearchWorkspacePanel({
  tables,
  ids,
  onChange,
  onSave,
  dirty,
  saving,
  title = "Trường nghiên cứu & kế hoạch",
  readOnly = false,
}: Props) {
  const available = tables.filter((t) => !ids || ids.includes(t.id));
  const [chosen, setChosen] = useState(available[0]?.id || ""),
    [query, setQuery] = useState(""),
    [limit, setLimit] = useState(8);
  const [edit, setEdit] = useState<{
      tableId: string;
      index: number | null;
      values: string[];
    } | null>(null),
    [error, setError] = useState("");
  const table = available.find((t) => t.id === chosen) || available[0];
  const signature = ids?.join(",") || "all";
  useEffect(() => {
    setQuery("");
    setLimit(8);
    setEdit(null);
  }, [signature, chosen]);
  useEffect(() => {
    if (!edit) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEdit(null);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [edit]);
  if (!table) return null;
  const rows = table.rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) =>
      row.some((v) =>
        String(v ?? "")
          .toLocaleLowerCase("vi")
          .includes(query.toLocaleLowerCase("vi")),
      ),
    );
  function commit(remove = false) {
    if (!edit || !onChange) return;
    const source = tables.find((t) => t.id === edit.tableId)!;
    const next = edit.values.map((value, i) => {
      const previous = edit.index === null ? null : source.rows[edit.index][i];
      return typeof previous === "number" && value.trim() !== ""
        ? Number(value)
        : value;
    });
    if (next.some((v) => typeof v === "number" && !Number.isFinite(v))) {
      setError("Giá trị số chưa hợp lệ.");
      return;
    }
    const updated = tables.map((t) => {
      if (t.id !== source.id) return t;
      const result = t.rows.map((row) => [...row]);
      if (edit.index === null) result.push(next);
      else if (remove) result.splice(edit.index, 1);
      else result[edit.index] = next;
      return { ...t, rows: result };
    });
    onChange(updated);
    setEdit(null);
    setError("");
  }
  return (
    <section className="card workspace-panel">
      <div className="card-heading">
        <div>
          <div className="eyebrow">RESEARCH WORKSPACE</div>
          <h2>{title}</h2>
          <p>
            {readOnly
              ? "Bản lưu trong báo cáo — giữ nguyên dữ liệu tại thời điểm tạo."
              : "Điền, đối chiếu và lưu nghiên cứu ngay trong dashboard."}
          </p>
        </div>
        {!readOnly && onSave && (
          <button
            className="btn primary"
            disabled={!dirty || saving}
            onClick={onSave}
          >
            <Save size={16} />
            {saving ? "Đang lưu…" : "Lưu nghiên cứu"}
          </button>
        )}
      </div>
      <div
        className="workspace-tabs"
        role="group"
        aria-label="Các bảng nghiên cứu"
      >
        {available.map((t) => (
          <button
            aria-pressed={t.id === table.id}
            key={t.id}
            onClick={() => {
              setChosen(t.id);
              setQuery("");
              setLimit(8);
            }}
            className={t.id === table.id ? "selected" : ""}
          >
            <Table2 size={15} />
            {t.title.replace(/^\d+\. /, "")}
            <small>{t.rows.length}</small>
          </button>
        ))}
      </div>
      <div className="workspace-table-heading">
        <div>
          <h3>{table.title}</h3>
          <p>{table.note}</p>
        </div>
        {!readOnly && onChange && (
          <button
            className="btn"
            onClick={() => {
              setError("");
              setEdit({
                tableId: table.id,
                index: null,
                values: table.headers.map(() => ""),
              });
            }}
          >
            <Plus size={15} />
            Thêm dòng
          </button>
        )}
      </div>
      <div className="workspace-search">
        <Search size={16} />
        <input
          type="search"
          aria-label="Tìm trong bảng nghiên cứu"
          placeholder="Tìm trong bảng nghiên cứu…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setLimit(8);
          }}
        />
        <small>{rows.length} dòng</small>
      </div>
      {table.rows.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <Table2 size={24} />
          </div>
          <h3>Chưa có nội dung trong mục này</h3>
          <p>
            Chọn Thêm dòng để nhập nghiên cứu hoặc giả thuyết cần kiểm chứng. Dữ
            liệu chưa có sẽ được giữ trống.
          </p>
        </div>
      ) : (
        <div className="table-wrap strategy-table">
          <table>
            <thead>
              <tr>
                {table.headers.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
                {!readOnly && onChange && <th>Chỉnh sửa</th>}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, limit).map(({ row, index }) => (
                <tr key={index}>
                  {row.map((value, c) => (
                    <td key={c}>
                      {typeof value === "string" &&
                      /^https?:\/\//i.test(value) ? (
                        <a target="_blank" rel="noreferrer" href={value}>
                          Mở nguồn ↗
                        </a>
                      ) : value === null || value === "" ? (
                        <span className="cell-empty">Chưa có dữ liệu</span>
                      ) : (
                        value
                      )}
                    </td>
                  ))}
                  {!readOnly && onChange && (
                    <td>
                      <button
                        className="btn row-edit"
                        aria-label={`Sửa dòng ${index + 1}`}
                        onClick={() => {
                          setError("");
                          setEdit({
                            tableId: table.id,
                            index,
                            values: row.map((v) =>
                              v === null ? "" : String(v),
                            ),
                          });
                        }}
                      >
                        <Pencil size={13} />
                        Sửa
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {rows.length > limit && (
        <button
          className="text-link"
          style={{ marginTop: 16 }}
          onClick={() => setLimit(limit + 10)}
        >
          Xem thêm 10 dòng <ArrowRight size={15} />
        </button>
      )}
      {!readOnly && (
        <p className="workspace-footnote">
          Các chỉnh sửa được ghi nhận là thông tin người dùng cung cấp, chưa xác
          minh độc lập. Không nhập bệnh án hoặc dữ liệu định danh bệnh nhân.
        </p>
      )}
      {edit && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Chỉnh sửa trường nghiên cứu"
          >
            <div className="modal-heading">
              <div>
                <h2>
                  {edit.index === null
                    ? "Thêm dòng nghiên cứu"
                    : "Chỉnh sửa nghiên cứu"}
                </h2>
                <p>{tables.find((t) => t.id === edit.tableId)?.title}</p>
              </div>
              <button
                className="icon-btn"
                aria-label="Đóng chỉnh sửa"
                onClick={() => setEdit(null)}
              >
                <X />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                commit();
              }}
            >
              <div className="form-grid">
                {tables
                  .find((t) => t.id === edit.tableId)!
                  .headers.map((h, i) => (
                    <label
                      key={i}
                      className={edit.values[i].length > 130 ? "span-2" : ""}
                    >
                      {h}
                      <textarea
                        autoFocus={i === 0}
                        rows={edit.values[i].length > 130 ? 5 : 3}
                        maxLength={4000}
                        value={edit.values[i]}
                        onChange={(e) =>
                          setEdit({
                            ...edit,
                            values: edit.values.map((v, c) =>
                              c === i ? e.target.value : v,
                            ),
                          })
                        }
                      />
                    </label>
                  ))}
              </div>
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <div className="modal-actions">
                {edit.index !== null && (
                  <button
                    className="btn danger"
                    type="button"
                    onClick={() => commit(true)}
                  >
                    Xóa dòng khỏi bản nháp
                  </button>
                )}
                <button
                  className="btn"
                  type="button"
                  onClick={() => setEdit(null)}
                >
                  Hủy
                </button>
                <button className="btn primary">Áp dụng vào bản nháp</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
