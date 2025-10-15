import React, { useMemo, useState } from "react";

/**
 * Fortlekistan GSYH Simülatörü – Pro Tasarım
 * - Bağımlılık yok (saf React + gömülü CSS)
 * - Modern arayüz, cam/gradient kartlar, mikro animasyonlar
 * - Tek dosya: App.js içine yapıştır ve çalıştır
 */

// ---- Gömülü Stil ----
const styles = `
  :root{
    --bg: #0b1220;
    --card: rgba(255,255,255,0.06);
    --stroke: rgba(255,255,255,0.13);
    --muted: #94a3b8;
    --text: #e5e7eb;
    --accent1: #60a5fa; /* mavi */
    --accent2: #f59e0b; /* turuncu */
    --accent3: #34d399; /* yeşil */
    --accent4: #f87171; /* kırmızı */
    --accent5: #a78bfa; /* mor */
    --accent6: #f472b6; /* pembe */
    --accent7: #38bdf8; /* camgöbeği */
    --accent8: #cbd5e1; /* gri */
    --accent9: #bef264; /* zeytin */
    --accent10:#2dd4bf; /* teal */
  }
  *{box-sizing:border-box}
  body{margin:0}
  .app{
    min-height:100vh; padding:24px; color:var(--text);
    background:
      radial-gradient(1200px 600px at 10% 0%, #13203e, transparent 60%),
      radial-gradient(1000px 500px at 100% 20%, #23143c, transparent 60%),
      linear-gradient(180deg, #0b1220, #0b1220);
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif;
  }
  .container{max-width:1180px; margin:0 auto; display:flex; flex-direction:column; gap:16px}
  .header{display:flex; gap:16px; align-items:flex-end; justify-content:space-between}
  .title{
    display:flex; align-items:center; gap:12px;
  }
  .logo{width:42px; height:42px; border-radius:12px; display:grid; place-items:center;
    background:linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 50%, #ec4899 100%);
    box-shadow:0 10px 30px rgba(99,102,241,0.35);
    font-weight:800; color:white;
  }
  h1{margin:0; font-size:24px; letter-spacing:.3px}
  .subtitle{color:var(--muted); font-size:13px}
  .btns{display:flex; gap:10px}
  .btn{padding:10px 12px; border-radius:12px; border:1px solid var(--stroke); background:var(--card); color:var(--text); cursor:pointer; transition:all .2s}
  .btn:hover{transform:translateY(-1px); background:rgba(255,255,255,.08)}
  .btn.primary{background:linear-gradient(135deg, #111827, #0b1324); color:#fff; border-color:#1f2937}

  .grid4{display:grid; grid-template-columns:repeat(4, 1fr); gap:12px}
  .grid2{display:grid; grid-template-columns:repeat(2, 1fr); gap:12px}
  @media(max-width:980px){ .grid4{grid-template-columns:repeat(2,1fr)} }
  @media(max-width:640px){ .grid2, .grid4{grid-template-columns:1fr} .header{flex-direction:column; align-items:flex-start} }

  .card{background:var(--card); border:1px solid var(--stroke); border-radius:16px; padding:16px; backdrop-filter: blur(8px)}
  .cardHead{display:flex; align-items:center; justify-content:space-between; margin-bottom:10px}
  .badge{font-size:11px; color:var(--muted)}
  .statLabel{color:var(--muted); font-size:12px}
  .statValue{font-size:26px; font-weight:800}

  .bar{width:100%; height:12px; border-radius:8px; overflow:hidden; border:1px solid var(--stroke); display:flex}
  .bar > div{height:100%; transition: width .25s ease}

  .row{display:flex; align-items:center; justify-content:space-between; gap:10px; margin:10px 0}
  .label{font-size:13px; color:var(--muted)}
  .controls{display:flex; align-items:center; gap:8px}
  input[type="range"]{width:190px}
  input[type="number"]{width:90px; padding:8px 10px; border-radius:12px; background:rgba(255,255,255,.03); border:1px solid var(--stroke); color:var(--text)}
  input[type="range"]{appearance:none; height:6px; border-radius:999px; background:linear-gradient(90deg, #3b82f6, #22c55e)}
  input[type="range"]::-webkit-slider-thumb{appearance:none; width:16px; height:16px; border-radius:50%; background:#fff; border:2px solid #0ea5e9; box-shadow:0 4px 12px rgba(14,165,233,.45)}

  .legend{display:flex; gap:8px; flex-wrap:wrap; margin-top:8px}
  .pill{display:flex; align-items:center; gap:6px; padding:6px 10px; border-radius:999px; border:1px solid var(--stroke); background:rgba(255,255,255,.04); font-size:12px}
  .dot{width:10px; height:10px; border-radius:50%}

  .footer{color:var(--muted); font-size:12px; margin-top:6px}
  .spark{width:100%; height:46px}
`;

// Palet
const palette = [
  "var(--accent1)",
  "var(--accent2)",
  "var(--accent3)",
  "var(--accent4)",
  "var(--accent5)",
  "var(--accent6)",
  "var(--accent7)",
  "var(--accent8)",
  "var(--accent9)",
  "var(--accent10)",
];

function ShareBar({ items }) {
  const total = items.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div className="bar">
      {items.map((it, idx) => (
        <div
          key={idx}
          style={{
            width: `${(100 * it.value) / total}%`,
            background: it.color,
          }}
          title={`${it.label}: ${((100 * it.value) / total).toFixed(1)}%`}
        />
      ))}
    </div>
  );
}

function NumberField({
  label,
  value,
  setValue,
  min = 0,
  max = 2000,
  step = 10,
}) {
  return (
    <div className="row">
      <div className="label">{label}</div>
      <div className="controls">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
        />
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(Number(e.target.value || 0))}
        />
      </div>
    </div>
  );
}

function Sparkline({ data, color = "var(--accent7)" }) {
  if (!data || data.length < 2) return <svg className="spark" />;
  const w = 280,
    h = 46,
    p = 2;
  const min = Math.min(...data),
    max = Math.max(...data);
  const scaleX = (i) => p + (i * (w - p * 2)) / (data.length - 1);
  const scaleY = (v) => {
    if (max === min) return h / 2;
    return h - p - ((v - min) * (h - p * 2)) / (max - min);
  };
  const d = data
    .map((v, i) => `${i === 0 ? "M" : "L"}${scaleX(i)},${scaleY(v)}`)
    .join(" ");
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`}>
      <path d={d} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export default function FortlekistanPro() {
  // C alt bileşenleri
  const [cDurables, setCDurables] = useState(180);
  const [cNondurables, setCNondurables] = useState(260);
  const [cServices, setCServices] = useState(360);
  // I alt bileşenleri
  const [iResidential, setIResidential] = useState(140);
  const [iNonresidential, setINonresidential] = useState(110);
  const [iInventories, setIInventories] = useState(20);
  // G alt bileşenleri
  const [gCurrent, setGCurrent] = useState(210);
  const [gCapital, setGCapital] = useState(90);
  // Dış ticaret
  const [x, setX] = useState(180);
  const [m, setM] = useState(190);
  // Önceki dönem & tarihçe (sparkline için son 20 Y)
  const [prevY, setPrevY] = useState(null);
  const [history, setHistory] = useState([]); // sadece Y serisi

  const C = cDurables + cNondurables + cServices;
  const I = iResidential + iNonresidential + iInventories;
  const G = gCurrent + gCapital;
  const NX = x - m;
  const Y = C + I + G + NX;

  // Y değiştikçe küçük bir tarihçe tut
  useMemo(() => {
    setHistory((h) => {
      const next = [...h, Y];
      if (next.length > 20) next.shift();
      return next;
    });
  }, [Y]);

  const growth = useMemo(() => {
    if (prevY === null || prevY === 0) return null;
    return ((Y - prevY) / prevY) * 100;
  }, [Y, prevY]);

  const resetDefaults = () => {
    setCDurables(180);
    setCNondurables(260);
    setCServices(360);
    setIResidential(140);
    setINonresidential(110);
    setIInventories(20);
    setGCurrent(210);
    setGCapital(90);
    setX(180);
    setM(190);
  };

  const componentShares = [
    { label: "C", value: C, color: palette[0] },
    { label: "I", value: I, color: palette[1] },
    { label: "G", value: G, color: palette[2] },
    { label: "NX", value: Math.max(NX, 0), color: palette[3] },
  ];

  const cBreakdown = [
    { label: "Dayanıklı (C_d)", value: cDurables, color: palette[0] },
    { label: "Dayanıksız (C_nd)", value: cNondurables, color: palette[4] },
    { label: "Hizmetler (C_s)", value: cServices, color: palette[5] },
  ];

  const iBreakdown = [
    { label: "Konut (I_r)", value: iResidential, color: palette[1] },
    { label: "İşletme (I_nr)", value: iNonresidential, color: palette[6] },
    { label: "Stok (ΔS)", value: iInventories, color: palette[7] },
  ];

  const gBreakdown = [
    { label: "Cari (G_c)", value: gCurrent, color: palette[2] },
    { label: "Kamu Yatırımı (G_k)", value: gCapital, color: palette[8] },
  ];

  const nxBreakdown = [
    { label: "İhracat (X)", value: x, color: palette[3] },
    { label: "İthalat (M)", value: m, color: palette[9] },
  ];

  return (
    <div className="app">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="title">
            <div className="logo">FL</div>
            <div>
              <h1>
                Fortlekistan GSYH Simülatörü{" "}
                <span className="badge">(Pro)</span>
              </h1>
              <div className="subtitle">
                GSYH = C + I + G + (X − M). Alt bileşenleri sürükleyerek anlık
                etkileri gör.
              </div>
            </div>
          </div>
          <div className="btns">
            <button
              className="btn primary"
              onClick={() => setPrevY(Y)}
              title="Büyüme karşılaştırması için mevcut Y'yi kilitle"
            >
              Mevcudu Önceki Dönem Yap
            </button>
            <button className="btn" onClick={resetDefaults}>
              Varsayılanlara Sıfırla
            </button>
          </div>
        </div>

        {/* Üst statlar */}
        <div className="grid4">
          <div className="card">
            <div className="cardHead">
              <span className="statLabel">Toplam GSYH (milyar FL)</span>
            </div>
            <div className="statValue">{Y.toLocaleString("tr-TR")}</div>
            <div style={{ marginTop: 10 }}>
              <ShareBar items={componentShares} />
            </div>
            <div className="legend">
              {componentShares.map((it) => (
                <div key={it.label} className="pill">
                  <span className="dot" style={{ background: it.color }} />
                  {it.label}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="cardHead">
              <span className="statLabel">Büyüme</span>
            </div>
            <div className="statValue">
              {growth === null ? "—" : `${growth.toFixed(2)} %`}
            </div>
            {prevY !== null && (
              <div className="footer">
                Önceki Y: {prevY.toLocaleString("tr-TR")}
              </div>
            )}
            <div style={{ marginTop: 8 }}>
              <Sparkline data={history} color="var(--accent1)" />
            </div>
          </div>

          <div className="card">
            <div className="cardHead">
              <span className="statLabel">Net İhracat</span>
            </div>
            <div className="statValue">{NX.toLocaleString("tr-TR")}</div>
            <div className="footer">
              X: {x.toLocaleString("tr-TR")} • M: {m.toLocaleString("tr-TR")}
            </div>
            <div style={{ marginTop: 8 }}>
              <ShareBar
                items={[
                  { label: "X", value: x, color: palette[3] },
                  { label: "M", value: m, color: palette[9] },
                ]}
              />
            </div>
          </div>

          <div className="card">
            <div className="cardHead">
              <span className="statLabel">Birimler</span>
            </div>
            <div className="statValue">milyar FL</div>
            <div className="footer">
              Not: Basitleştirilmiş kimlik; çarpan ve vergi eklenebilir.
            </div>
          </div>
        </div>

        {/* Paneller */}
        <div className="grid2">
          <div className="card">
            <div className="cardHead">
              <span className="statLabel">Tüketim (C)</span>{" "}
              <span className="badge">C = C_d + C_nd + C_s</span>
            </div>
            <NumberField
              label="Dayanıklı"
              value={cDurables}
              setValue={setCDurables}
            />
            <NumberField
              label="Dayanıksız"
              value={cNondurables}
              setValue={setCNondurables}
            />
            <NumberField
              label="Hizmetler"
              value={cServices}
              setValue={setCServices}
            />
            <div style={{ marginTop: 10 }}>
              <ShareBar items={cBreakdown} />
            </div>
            <div className="legend">
              {cBreakdown.map((it) => (
                <div key={it.label} className="pill">
                  <span className="dot" style={{ background: it.color }} />
                  {it.label}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="cardHead">
              <span className="statLabel">Yatırım (I)</span>{" "}
              <span className="badge">I = I_r + I_nr + ΔS</span>
            </div>
            <NumberField
              label="Konut"
              value={iResidential}
              setValue={setIResidential}
            />
            <NumberField
              label="İşletme (Makine/Bina)"
              value={iNonresidential}
              setValue={setINonresidential}
            />
            <NumberField
              label="Stok Değişimi"
              value={iInventories}
              setValue={setIInventories}
              step={5}
            />
            <div style={{ marginTop: 10 }}>
              <ShareBar items={iBreakdown} />
            </div>
            <div className="legend">
              {iBreakdown.map((it) => (
                <div key={it.label} className="pill">
                  <span className="dot" style={{ background: it.color }} />
                  {it.label}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="cardHead">
              <span className="statLabel">Kamu (G)</span>{" "}
              <span className="badge">G = G_c + G_k</span>
            </div>
            <NumberField
              label="Cari Harcama"
              value={gCurrent}
              setValue={setGCurrent}
            />
            <NumberField
              label="Kamu Yatırımı"
              value={gCapital}
              setValue={setGCapital}
            />
            <div style={{ marginTop: 10 }}>
              <ShareBar items={gBreakdown} />
            </div>
            <div className="legend">
              {gBreakdown.map((it) => (
                <div key={it.label} className="pill">
                  <span className="dot" style={{ background: it.color }} />
                  {it.label}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="cardHead">
              <span className="statLabel">Dış Ticaret</span>{" "}
              <span className="badge">NX = X − M</span>
            </div>
            <NumberField label="İhracat (X)" value={x} setValue={setX} />
            <NumberField label="İthalat (M)" value={m} setValue={setM} />
            <div style={{ marginTop: 10 }}>
              <ShareBar items={nxBreakdown} />
            </div>
            <div className="legend">
              {nxBreakdown.map((it) => (
                <div key={it.label} className="pill">
                  <span className="dot" style={{ background: it.color }} />
                  {it.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="footer">
          İleri sürüm fikri: MPC, vergi oranı (t), ithalat eğilimi ve basit
          çarpan ile politika senaryoları.
        </div>
      </div>
    </div>
  );
}
