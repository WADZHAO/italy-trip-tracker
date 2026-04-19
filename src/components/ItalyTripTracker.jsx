import { useState, useRef, useEffect } from "react";
import { supabase, uploadPhoto } from "../supabase";

const EUR_TO_USD = 1.08;
const CITIES = ["Rome", "Florence", "Venice", "Milan", "Amalfi", "Naples", "Other"];
const TABS = ["🗺️ Trip", "📅 Schedule", "💶 Expenses", "🎒 Packing", "📓 Journal"];
const EXPENSE_CATS = ["🍕 Food", "🚌 Transport", "🏨 Hotel", "🎭 Activities", "🛍️ Shopping", "💊 Health", "📦 Other"];
const HEADING = "'Lora', Georgia, serif";

// ── 3 Theme palettes ──────────────────────────────────────────────────────
const THEMES = {
  sand: {
    name: "Sand & Amber", emoji: "🏖️",
    bg: "#fdf6ec", bgCard: "#fffaf3", cream: "#fef0d0",
    sand: "#e8d5a8", border: "#e2cfa0",
    accent: "#c8860a", accentLt: "#f5c842",
    ocean: "#4a8fa8", oceanLt: "#d0eaf5",
    text: "#4a3728", textMid: "#8a6e52", textSoft: "#b5977a",
    green: "#5a9e72",
    heroGrad: "linear-gradient(135deg, #fde68a 0%, #fcd34d 45%, #d0eaf5 100%)",
    todayBg: "#fff8e6", todayBorder: "#f5c842",
    totalBg: "#d0eaf5", totalBorder: "#a8d4e8",
  },
  positano: {
    name: "Positano Pink", emoji: "🌸",
    bg: "#fdf5f5", bgCard: "#fffafa", cream: "#fce8e0",
    sand: "#f0d0c8", border: "#e4beb5",
    accent: "#c2566a", accentLt: "#e88a98",
    ocean: "#2888a5", oceanLt: "#d8f0f8",
    text: "#3a2028", textMid: "#7a4858", textSoft: "#b08090",
    green: "#4a9a70",
    heroGrad: "linear-gradient(135deg, #fde68a 0%, #f5b0b8 45%, #d8f0f8 100%)",
    todayBg: "#fff0e8", todayBorder: "#f5b0b8",
    totalBg: "#d8f0f8", totalBorder: "#90c8e0",
  },
  capri: {
    name: "Capri Coastline", emoji: "🌊",
    bg: "#f4f8fb", bgCard: "#ffffff", cream: "#fef9e7",
    sand: "#d4e4f0", border: "#c2d6e8",
    accent: "#1a6b8a", accentLt: "#3ba5cc",
    ocean: "#0e4d6e", oceanLt: "#e0f0f8",
    text: "#1a3548", textMid: "#4a7085", textSoft: "#8aaabb",
    green: "#3d9e6e",
    heroGrad: "linear-gradient(135deg, #fef3a0 0%, #a8dce8 40%, #2d8ab5 100%)",
    todayBg: "#fef9e7", todayBorder: "#f5d456",
    totalBg: "#e0f0f8", totalBorder: "#8ac8e0",
  },
  amalfi: {
    name: "Amalfi Sunset", emoji: "🌅",
    bg: "#fef7f0", bgCard: "#fffbf5", cream: "#fde8cf",
    sand: "#f0d4b0", border: "#e4c49e",
    accent: "#c45d2c", accentLt: "#e8944d",
    ocean: "#2e7d9e", oceanLt: "#d6ecf4",
    text: "#3d2415", textMid: "#7a5438", textSoft: "#b58a6a",
    green: "#4d9a6a",
    heroGrad: "linear-gradient(135deg, #fde68a 0%, #f0a050 40%, #d6ecf4 100%)",
    todayBg: "#fff3e0", todayBorder: "#f0a050",
    totalBg: "#d6ecf4", totalBorder: "#8ac0da",
  },
  tuscany: {
    name: "Tuscan Villa", emoji: "🫒",
    bg: "#f8f4ec", bgCard: "#fdfaf2", cream: "#f0e8d0",
    sand: "#d8cdb0", border: "#c8bda0",
    accent: "#8a7340", accentLt: "#c4a860",
    ocean: "#6a7e5a", oceanLt: "#e4ecdc",
    text: "#3d3520", textMid: "#706040", textSoft: "#a09070",
    green: "#5a8050",
    heroGrad: "linear-gradient(135deg, #f0e4c0 0%, #c4a860 40%, #e4ecdc 100%)",
    todayBg: "#f8f0dc", todayBorder: "#c4a860",
    totalBg: "#e4ecdc", totalBorder: "#b0c4a0",
  },
  venetian: {
    name: "Venetian Gold", emoji: "🏛️",
    bg: "#f8f5ee", bgCard: "#fefcf5", cream: "#f0e8ca",
    sand: "#d8cba0", border: "#c8b890",
    accent: "#b8860b", accentLt: "#daa520",
    ocean: "#1e3a5f", oceanLt: "#dce8f5",
    text: "#2a2010", textMid: "#5a4a28", textSoft: "#8a7a58",
    green: "#3a7850",
    heroGrad: "linear-gradient(135deg, #fde68a 0%, #daa520 45%, #dce8f5 100%)",
    todayBg: "#fef5d8", todayBorder: "#daa520",
    totalBg: "#dce8f5", totalBorder: "#a0b8d8",
  },
};

function todayStr() { return new Date().toISOString().slice(0, 10); }
function diffDays(a, b) { return Math.round((new Date(b) - new Date(a)) / 86400000); }
function reorder(arr, from, to) { const r = [...arr]; const [item] = r.splice(from, 1); r.splice(to, 0, item); return r; }

const mkCard = (T, ex = {}) => ({ background: T.bgCard, borderRadius: 18, border: `1px solid ${T.border}`, padding: 18, ...ex });
const mkLbl  = (T, ex = {}) => ({ fontSize: 10, letterSpacing: 1.5, color: T.textSoft, fontWeight: 700, textTransform: "uppercase", marginBottom: 8, display: "block", ...ex });
const mkInp  = (T, ex = {}) => ({ background: T.cream, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text, padding: "9px 12px", fontSize: 13, outline: "none", fontFamily: "inherit", ...ex });
const mkPill = (T, on) => ({ background: on ? T.accent : T.sand, color: on ? "#fff" : T.textMid, border: "none", borderRadius: 20, padding: "7px 14px", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", fontWeight: on ? 700 : 500, flexShrink: 0, transition: "all 0.18s" });

// ── Weather ───────────────────────────────────────────────────────────────
function weatherIcon(code) {
  if (code === 0) return "☀️"; if (code <= 3) return "⛅"; if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️"; if (code <= 77) return "🌨️"; if (code <= 82) return "🌦️"; return "⛈️";
}
function getTimezoneCity() {
  try { const p = (Intl.DateTimeFormat().resolvedOptions().timeZone || "").split("/"); return (p[p.length-1]||"").replace(/_/g," "); } catch { return ""; }
}
function useWeather() {
  const [w, setW] = useState({ city: getTimezoneCity(), temp: null, icon: null, loading: true, error: false });
  const [rc, setRc] = useState(0);
  useEffect(() => {
    setW(p => ({ ...p, loading: true, error: false }));
    if (!navigator.geolocation) { setW(p => ({ ...p, loading: false, error: true })); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords;
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`);
          if (!res.ok) throw 0; const d = await res.json();
          const temp = Math.round(d.current.temperature_2m); const icon = weatherIcon(d.current.weather_code);
          let city = getTimezoneCity();
          try { const g = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,{headers:{"Accept":"application/json"}}); if(g.ok){const gd=await g.json(); city=gd.address?.city||gd.address?.town||gd.address?.village||gd.address?.county||city;} } catch {}
          setW({ city, temp, icon, loading: false, error: false });
        } catch { setW(p => ({ ...p, loading: false, error: true })); }
      },
      () => setW(p => ({ ...p, loading: false, error: true })),
      { timeout: 10000, enableHighAccuracy: false, maximumAge: 300000 }
    );
  }, [rc]);
  return { ...w, retry: () => setRc(c => c+1) };
}

// ── Couple Avatar ─────────────────────────────────────────────────────────
function CoupleAvatar({ size = 48, T }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="40" fill="#fde68a"/>
      {[0,45,90,135,180,225,270,315].map((d,i)=>(<line key={i} x1={40+36*Math.cos(d*Math.PI/180)} y1={40+36*Math.sin(d*Math.PI/180)} x2={40+43*Math.cos(d*Math.PI/180)} y2={40+43*Math.sin(d*Math.PI/180)} stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"/>))}
      <ellipse cx="27" cy="57" rx="9" ry="11" fill="#f9a8d4"/><path d="M18 62 Q27 74 36 62" fill="#f472b6" opacity="0.7"/>
      <circle cx="27" cy="35" r="9" fill="#fde68a"/>
      <path d="M18 33 Q15 43 17 52" stroke="#92400e" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M36 33 Q39 43 37 52" stroke="#92400e" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M19 28 Q27 21 35 28" fill="#92400e"/>
      <circle cx="24" cy="35" r="1.2" fill="#4a3728"/><circle cx="30" cy="35" r="1.2" fill="#4a3728"/>
      <rect x="22" y="33" width="4.5" height="2.8" rx="1.4" fill={T.ocean} opacity="0.75"/>
      <rect x="28" y="33" width="4.5" height="2.8" rx="1.4" fill={T.ocean} opacity="0.75"/>
      <line x1="26.5" y1="34.4" x2="28" y2="34.4" stroke={T.ocean} strokeWidth="1" opacity="0.75"/>
      <path d="M24 39 Q27 42 30 39" stroke="#c2410c" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <ellipse cx="53" cy="57" rx="9" ry="11" fill="#93c5fd"/><circle cx="53" cy="35" r="9" fill="#fed7aa"/>
      <path d="M44 31 Q53 23 62 31 Q62 27 53 25 Q44 27 44 31Z" fill="#78350f"/>
      <circle cx="50" cy="35" r="1.2" fill="#4a3728"/><circle cx="56" cy="35" r="1.2" fill="#4a3728"/>
      <path d="M50 39 Q53 42 56 39" stroke="#c2410c" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <ellipse cx="53" cy="28" rx="10" ry="3" fill={T.accent}/><rect x="47" y="20" width="12" height="8" rx="2" fill={T.accent}/>
      <path d="M37 47 Q40 43 43 47 Q46 43 49 47 Q49 52 40 57 Q31 52 37 47Z" fill="#fb7185" opacity="0.9"/>
    </svg>
  );
}

// ── Crop Modal ────────────────────────────────────────────────────────────
function CropModal({ src, onDone, onCancel, T }) {
  const canvasRef = useRef(); const imgRef = useRef();
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const dragRef = useRef({ dragging: false, sx: 0, sy: 0, ox: 0, oy: 0 });
  const TARGET_W = 500; const TARGET_H = 250;

  useEffect(() => {
    const img = new Image(); img.onload = () => {
      const s = Math.max(TARGET_W / img.width, TARGET_H / img.height);
      setScale(s); setImgSize({ w: img.width, h: img.height });
      setOffset({ x: (TARGET_W - img.width * s) / 2, y: (TARGET_H - img.height * s) / 2 });
      imgRef.current = img;
    }; img.src = src;
  }, [src]);

  const onPointerDown = (e) => { dragRef.current = { dragging: true, sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y }; };
  const onPointerMove = (e) => { if (!dragRef.current.dragging) return; const d = dragRef.current; setOffset({ x: d.ox + e.clientX - d.sx, y: d.oy + e.clientY - d.sy }); };
  const onPointerUp = () => { dragRef.current.dragging = false; };

  const crop = () => {
    const c = canvasRef.current; c.width = TARGET_W; c.height = TARGET_H;
    const ctx = c.getContext("2d");
    ctx.drawImage(imgRef.current, offset.x, offset.y, imgSize.w * scale, imgSize.h * scale);
    onDone(c.toDataURL("image/jpeg", 0.7));
  };

  const adjustScale = (delta) => {
    setScale(s => {
      const ns = Math.max(0.1, s + delta);
      setOffset(o => ({ x: o.x + (imgSize.w * s - imgSize.w * ns) / 2, y: o.y + (imgSize.h * s - imgSize.h * ns) / 2 }));
      return ns;
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ color: "#fff", fontSize: 14, marginBottom: 10, fontWeight: 600 }}>Drag to reposition, +/− to zoom</div>
      <div style={{ width: "100%", maxWidth: TARGET_W / 2, aspectRatio: "2/1", overflow: "hidden", borderRadius: 16, border: "2px solid rgba(255,255,255,0.3)", position: "relative", touchAction: "none", cursor: "grab" }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
        {imgSize.w > 0 && <img src={src} alt="crop" style={{ position: "absolute", left: offset.x / 2, top: offset.y / 2, width: (imgSize.w * scale) / 2, height: (imgSize.h * scale) / 2, pointerEvents: "none", userSelect: "none" }} />}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
        <button onClick={() => adjustScale(-0.05)} style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" }}>−</button>
        <button onClick={() => adjustScale(0.05)} style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" }}>+</button>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button onClick={onCancel} style={{ padding: "10px 24px", borderRadius: 12, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 14, cursor: "pointer" }}>Cancel</button>
        <button onClick={crop} style={{ padding: "10px 24px", borderRadius: 12, background: T.accent, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>✓ Crop & Add</button>
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

// ── Photo Carousel ────────────────────────────────────────────────────────
function PhotoCarousel({ photos, onAddPhotos, onDeletePhoto, T }) {
  const [idx, setIdx] = useState(0);
  const [cropSrc, setCropSrc] = useState(null);
  const [cropQueue, setCropQueue] = useState([]);
  const [croppedBatch, setCroppedBatch] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();
  const touchX = useRef(0);

  const handleFiles = (e) => {
    const fs = Array.from(e.target.files); if (!fs.length) return;
    Promise.all(fs.map(f => new Promise(r => { const rd = new FileReader(); rd.onload = ev => r(ev.target.result); rd.readAsDataURL(f); }))).then(urls => {
      setCropQueue(urls.slice(1)); setCroppedBatch([]); setCropSrc(urls[0]);
    });
    e.target.value = "";
  };

  const uploadAndAdd = async (batch) => {
    setUploading(true);
    try {
      const urls = await Promise.all(batch.map(b => uploadPhoto(b, "hero")));
      onAddPhotos(urls);
    } finally {
      setUploading(false);
    }
  };

  const onCropDone = (url) => {
    const next = [...croppedBatch, url];
    if (cropQueue.length > 0) {
      setCropSrc(cropQueue[0]); setCropQueue(q => q.slice(1)); setCroppedBatch(next);
    } else {
      setCropSrc(null); setCroppedBatch([]);
      uploadAndAdd(next);
    }
  };
  const onCropCancel = () => {
    if (cropQueue.length > 0) {
      setCropSrc(cropQueue[0]); setCropQueue(q => q.slice(1));
    } else {
      setCropSrc(null);
      if (croppedBatch.length > 0) uploadAndAdd(croppedBatch);
      setCroppedBatch([]);
    }
  };

  const si = Math.min(idx, Math.max(0, photos.length - 1));
  const doDelete = () => { onDeletePhoto(si); if (si > 0) setIdx(si - 1); };

  // Smooth infinite: clone last→front and first→end
  const slides = photos.length > 1 ? [photos[photos.length - 1], ...photos, photos[0]] : [...photos];
  const [pos, setPos] = useState(photos.length > 1 ? 1 : 0);
  const [anim, setAnim] = useState(true);

  useEffect(() => { setAnim(true); setPos(photos.length > 1 ? si + 1 : si); }, [si, photos.length]);

  const onTransEnd = () => {
    if (photos.length <= 1) return;
    if (pos === 0) { setAnim(false); setPos(photos.length); setIdx(photos.length - 1); }
    if (pos === slides.length - 1) { setAnim(false); setPos(1); setIdx(0); }
  };

  const goNext = () => { if (photos.length <= 1) return; setAnim(true); setPos(p => p + 1); setIdx(i => (i + 1) % photos.length); };
  const goPrev = () => { if (photos.length <= 1) return; setAnim(true); setPos(p => p - 1); setIdx(i => (i - 1 + photos.length) % photos.length); };

  // Auto-scroll every 20s
  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(goNext, 20000);
    return () => clearInterval(timer);
  }, [photos.length]);

  if (cropSrc) return <CropModal src={cropSrc} onDone={onCropDone} onCancel={onCropCancel} T={T} />;

  if (uploading) return (
    <div style={{ marginBottom: 16, border: `2px dashed ${T.sand}`, borderRadius: 18, padding: 22, textAlign: "center", color: T.textSoft, fontSize: 13, background: T.cream }}>
      <div style={{ fontSize: 28, marginBottom: 6 }}>⏳</div>Uploading photos…
    </div>
  );

  if (!photos.length) return (
    <div style={{ marginBottom: 16 }}>
      <div onClick={() => fileRef.current.click()} style={{ border: `2px dashed ${T.sand}`, borderRadius: 18, padding: 22, textAlign: "center", cursor: "pointer", color: T.textSoft, fontSize: 13, background: T.cream }}>
        <div style={{ fontSize: 28, marginBottom: 6 }}>🏔️</div>Tap to add trip cover photos
      </div>
      <input type="file" accept="image/*" multiple ref={fileRef} onChange={handleFiles} style={{ display: "none" }} />
    </div>
  );

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", border: `1px solid ${T.border}`, userSelect: "none" }}
        onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={e => { const dx = e.changedTouches[0].clientX - touchX.current; if (dx < -40) goNext(); if (dx > 40) goPrev(); }}>

        <div onTransitionEnd={onTransEnd} style={{ display: "flex", transition: anim ? "transform 0.35s ease" : "none", transform: `translateX(-${pos * 100}%)` }}>
          {slides.map((u,i) => <img key={i} src={u} alt="" draggable={false} style={{ width: "100%", height: 200, objectFit: "cover", display: "block", flexShrink: 0 }} />)}
        </div>

        {photos.length > 1 && <button onClick={goPrev} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.8)", border: "none", borderRadius: "50%", width: 32, height: 32, fontSize: 16, cursor: "pointer", color: T.text, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>}
        {photos.length > 1 && <button onClick={goNext} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.8)", border: "none", borderRadius: "50%", width: 32, height: 32, fontSize: 16, cursor: "pointer", color: T.text, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>}
        {photos.length > 1 && <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
          {photos.map((_,i) => <div key={i} onClick={() => { setAnim(true); setIdx(i); }} style={{ width: i===si?18:7, height: 7, borderRadius: 4, background: i===si?T.accent:"rgba(255,255,255,0.6)", cursor: "pointer", transition: "all 0.2s" }} />)}
        </div>}

        {/* Trash — bottom left */}
        <button onClick={doDelete} style={{ position: "absolute", bottom: 10, left: 10, background: "rgba(0,0,0,0.45)", border: "none", borderRadius: "50%", width: 34, height: 34, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>🗑️</button>

        {/* Add — bottom right, icon only */}
        <button onClick={() => fileRef.current.click()} style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(255,255,255,0.88)", border: `1px solid ${T.border}`, borderRadius: "50%", width: 34, height: 34, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>📷</button>
      </div>
      <input type="file" accept="image/*" multiple ref={fileRef} onChange={handleFiles} style={{ display: "none" }} />
      <div style={{ textAlign: "center", marginTop: 6, fontSize: 11, color: T.textSoft }}>{si+1} / {photos.length}</div>
    </div>
  );
}

// ── Compact Theme Picker (for header) ─────────────────────────────────────
function ThemePicker({ themeId, setThemeId, T }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{ background: T.cream, border: `1px solid ${T.border}`, borderRadius: "50%", width: 32, height: 32, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        🎨
      </button>
      {open && (
        <div style={{ position: "absolute", top: "100%", right: 0, zIndex: 100, background: T.bgCard, borderRadius: 14, border: `1px solid ${T.border}`, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", overflow: "hidden", marginTop: 6, width: 200 }}>
          {Object.entries(THEMES).map(([id, theme]) => (
            <button key={id} onClick={() => { setThemeId(id); setOpen(false); }}
              style={{ width: "100%", padding: "10px 12px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, textAlign: "left", background: id === themeId ? T.cream : "transparent", borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 14 }}>{theme.emoji}</span>
              <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: T.text }}>{theme.name}</span>
              {id === themeId && <span style={{ color: T.accent, fontWeight: 700, fontSize: 12 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// TRIP SUMMARY
// ════════════════════════════════════════════════════════════════
function TripSummary({ expenses, packingList, tripDates, setTripDates, tripName, setTripName, heroPhotos, setHeroPhotos, T, schedule }) {
  const today = todayStr();
  const todayEUR = expenses.filter(e => e.date === today).reduce((s,e) => s+parseFloat(e.amount||0), 0);
  const totalEUR = expenses.reduce((s,e) => s+parseFloat(e.amount||0), 0);
  const packed = packingList.filter(p => p.packed).length;
  const daysPlanned = (tripDates.start && tripDates.end) ? Math.max(0, diffDays(tripDates.start, tripDates.end)+1) : "—";
  let daysInTrip = 0;
  if (tripDates.start) { const s = diffDays(tripDates.start, today); if (s >= 0) { const ed = tripDates.end || today; daysInTrip = diffDays(ed, today) > 0 ? diffDays(tripDates.start, ed)+1 : s+1; } }

  return (
    <div style={{ paddingBottom: 40 }}>

      {/* Emergency Numbers */}
      <div style={{ ...mkCard(T), marginBottom: 14, padding: "14px 16px" }}>
        <span style={mkLbl(T)}>🚨 Emergency Numbers — Italy</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { icon: "🆘", label: "General Emergency", num: "112" },
            { icon: "🚔", label: "Police", num: "113" },
            { icon: "🚑", label: "Ambulance", num: "118" },
            { icon: "🇨🇳", label: "Chinese Embassy Rome", num: "+39 06 96524200" },
          ].map(e => (
            <a key={e.num} href={`tel:${e.num.replace(/\s/g,"")}`} style={{ flex: "1 1 45%", display: "flex", alignItems: "center", gap: 8, background: T.cream, borderRadius: 10, padding: "10px 12px", textDecoration: "none", border: `1px solid ${T.border}`, minWidth: 140 }}>
              <span style={{ fontSize: 18 }}>{e.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.accent, fontFamily: HEADING }}>{e.num}</div>
                <div style={{ fontSize: 10, color: T.textSoft }}>{e.label}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <PhotoCarousel photos={heroPhotos} onAddPhotos={urls => setHeroPhotos(p => [...p,...urls])} onDeletePhoto={i => setHeroPhotos(p => p.filter((_,j) => j !== i))} T={T} />

      {/* Spend */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div style={mkCard(T, { background: T.todayBg, borderColor: T.todayBorder })}>
          <span style={mkLbl(T)}>Today's Spend</span>
          <div style={{ fontSize: 24, fontWeight: 700, color: T.accent, fontFamily: HEADING }}>€{todayEUR.toFixed(2)}</div>
          <div style={{ fontSize: 11, color: T.textSoft, marginTop: 3 }}>${(todayEUR*EUR_TO_USD).toFixed(2)} USD</div>
        </div>
        <div style={mkCard(T, { background: T.totalBg, borderColor: T.totalBorder })}>
          <span style={mkLbl(T, { color: T.ocean })}>Total So Far</span>
          <div style={{ fontSize: 24, fontWeight: 700, color: T.ocean, fontFamily: HEADING }}>€{totalEUR.toFixed(2)}</div>
          <div style={{ fontSize: 11, color: T.oceanLt !== T.ocean ? T.ocean : T.textSoft, marginTop: 3, opacity: 0.7 }}>${(totalEUR*EUR_TO_USD).toFixed(2)} USD</div>
        </div>
      </div>

      {/* Days + Spending insights */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div style={mkCard(T, { background: T.cream })}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>📅</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: T.text, fontFamily: HEADING }}>{daysPlanned}</div>
          <div style={{ fontSize: 12, color: T.textSoft, marginTop: 2 }}>Days Planned</div>
          <div style={{ fontSize: 18, marginTop: 12, marginBottom: 4 }}>✈️</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: daysInTrip > 0 ? T.accent : T.textSoft, fontFamily: HEADING }}>{daysInTrip}</div>
          <div style={{ fontSize: 12, color: T.textSoft, marginTop: 2 }}>{daysInTrip > 0 ? "Days In Trip" : "Not started yet"}</div>
        </div>
        <div style={mkCard(T, { background: T.oceanLt })}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>📊</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: T.ocean, fontFamily: HEADING }}>€{daysInTrip > 0 ? (totalEUR / daysInTrip).toFixed(0) : "—"}</div>
          <div style={{ fontSize: 12, color: T.textSoft, marginTop: 2 }}>Avg / Day</div>
          {(() => {
            const cats = EXPENSE_CATS.map(c => ({ c, t: expenses.filter(e => e.category === c).reduce((s,e) => s + parseFloat(e.amount||0), 0) })).filter(x => x.t > 0).sort((a,b) => b.t - a.t);
            const top = cats[0];
            if (!top) return <div style={{ fontSize: 12, color: T.textSoft, marginTop: 12 }}>No expenses yet</div>;
            return (
              <>
                <div style={{ fontSize: 18, marginTop: 12, marginBottom: 4 }}>{top.c.split(" ")[0]}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.text, fontFamily: HEADING }}>€{top.t.toFixed(0)}</div>
                <div style={{ fontSize: 12, color: T.textSoft, marginTop: 2 }}>Top Category</div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Share button */}
      <ShareSummary tripName={tripName} tripDates={tripDates} totalEUR={totalEUR} daysPlanned={daysPlanned} daysInTrip={daysInTrip} packed={packed} packingList={packingList} schedule={schedule} T={T} />
    </div>
  );
}

// ── Share Summary Component ───────────────────────────────────────────────
function ShareSummary({ tripName, tripDates, totalEUR, daysPlanned, daysInTrip, packed, packingList, schedule, T }) {
  const [show, setShow] = useState(false);

  if (!show) return (
    <button onClick={() => setShow(true)} style={{ ...mkCard(T, { cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", background: T.cream, border: `1px solid ${T.border}`, width: "100%" }) }}>
      <span style={{ fontSize: 18 }}>🔗</span>
      <span style={{ fontWeight: 600, fontSize: 13, color: T.accent }}>Share Trip Summary</span>
    </button>
  );

  const cities = [...new Set(schedule.map(d => d.city))].join(" → ");

  return (
    <div>
      <div style={{ ...mkCard(T), padding: 22, marginBottom: 10 }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🇮🇹✈️</div>
          <div style={{ fontFamily: HEADING, fontSize: 24, fontWeight: 700, color: T.accent, marginBottom: 4 }}>{tripName}</div>
          {cities && <div style={{ fontSize: 14, color: T.textMid, marginBottom: 4 }}>{cities}</div>}
          <div style={{ fontSize: 13, color: T.textSoft }}>{tripDates.start || "?"} → {tripDates.end || "?"}</div>
        </div>

        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14, marginBottom: 14 }}>
          <p style={{ color: T.textMid, fontSize: 13, lineHeight: 1.7, margin: "0 0 10px", textAlign: "center" }}>
            {daysInTrip > 0
              ? `We're on day ${daysInTrip} of our ${daysPlanned}-day Italian adventure! So far we've spent €${totalEUR.toFixed(2)} ($${(totalEUR * EUR_TO_USD).toFixed(2)} USD) exploring ${cities || "Italy"}.`
              : `We're planning a ${daysPlanned}-day trip to Italy! ${cities ? `Our route: ${cities}.` : ""} We've got ${packed}/${packingList.length} items packed and ready to go.`
            }
          </p>
        </div>

        {schedule.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={mkLbl(T)}>Our Itinerary</div>
            {schedule.map((day, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: T.cream, border: `1px solid ${T.sand}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: T.accent, fontWeight: 700, flexShrink: 0 }}>{i+1}</div>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>📍 {day.city}</span>
                  <span style={{ fontSize: 11, color: T.textSoft, marginLeft: 6 }}>{day.date} · {day.events.length} activities</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, textAlign: "center" }}>
          <div style={{ background: T.cream, borderRadius: 10, padding: "10px 6px" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.accent, fontFamily: HEADING }}>€{totalEUR.toFixed(2)}</div>
            <div style={{ fontSize: 10, color: T.textSoft }}>spent</div>
          </div>
          <div style={{ background: T.cream, borderRadius: 10, padding: "10px 6px" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.text, fontFamily: HEADING }}>{daysPlanned}</div>
            <div style={{ fontSize: 10, color: T.textSoft }}>days</div>
          </div>
          <div style={{ background: T.cream, borderRadius: 10, padding: "10px 6px" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.green, fontFamily: HEADING }}>{packed}/{packingList.length}</div>
            <div style={{ fontSize: 10, color: T.textSoft }}>packed</div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 14, fontSize: 11, color: T.textSoft }}>Made with 🇮🇹 Italy Trip Tracker</div>
      </div>
      <button onClick={() => setShow(false)} style={{ ...mkCard(T, { cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", background: T.sand, border: `1px solid ${T.border}`, width: "100%" }) }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: T.textMid }}>Close Preview</span>
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SCHEDULE — editable, reorderable events with booking fields
// ════════════════════════════════════════════════════════════════
const gripStyle = (T) => ({ background: "none", border: "none", color: T.textSoft, cursor: "pointer", fontSize: 14, padding: "2px 4px", lineHeight: 1 });

function Schedule({ schedule, setSchedule, T }) {
  const [newCity, setNewCity] = useState("Rome"); const [newDate, setNewDate] = useState("");
  const [ne, setNe] = useState({ di: null, time: "", title: "", note: "", confirmNo: "", address: "", phone: "", url: "" });
  const [editing, setEditing] = useState(null);

  const addDay = () => { if (!newDate) return; setSchedule(s => [...s, { city: newCity, date: newDate, events: [] }]); setNewDate(""); };
  const addEv = (di) => {
    if (!ne.title) return;
    setSchedule(s => s.map((d,i) => i===di ? { ...d, events: [...d.events, { time: ne.time, title: ne.title, note: ne.note, confirmNo: ne.confirmNo, address: ne.address, phone: ne.phone, url: ne.url }] } : d));
    setNe({ di: null, time: "", title: "", note: "", confirmNo: "", address: "", phone: "", url: "" });
  };
  const updateEv = (di, ei, field, val) => {
    setSchedule(s => s.map((d,i) => i===di ? { ...d, events: d.events.map((ev,j) => j===ei ? { ...ev, [field]: val } : ev) } : d));
  };
  const moveDay = (from, to) => { if (to < 0 || to >= schedule.length) return; setSchedule(s => reorder(s, from, to)); };
  const moveEv = (di, from, to) => {
    const evs = schedule[di].events;
    if (to < 0 || to >= evs.length) return;
    setSchedule(s => s.map((d,i) => i===di ? { ...d, events: reorder(d.events, from, to) } : d));
  };

  const evForm = (vals, onChange, onSave, onCancel) => (
    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input type="time" value={vals.time} onChange={e => onChange("time", e.target.value)} style={mkInp(T, { width: 90 })} />
        <input placeholder="Activity name" value={vals.title} onChange={e => onChange("title", e.target.value)} style={mkInp(T, { flex: 1 })} />
      </div>
      <input placeholder="Notes (optional)" value={vals.note} onChange={e => onChange("note", e.target.value)} style={mkInp(T)} />
      <input placeholder="📋 Confirmation # (optional)" value={vals.confirmNo || ""} onChange={e => onChange("confirmNo", e.target.value)} style={mkInp(T, { fontSize: 12 })} />
      <input placeholder="📍 Address (optional)" value={vals.address || ""} onChange={e => onChange("address", e.target.value)} style={mkInp(T, { fontSize: 12 })} />
      <div style={{ display: "flex", gap: 8 }}>
        <input placeholder="📞 Phone" value={vals.phone || ""} onChange={e => onChange("phone", e.target.value)} style={mkInp(T, { flex: 1, fontSize: 12 })} />
        <input placeholder="🔗 URL" value={vals.url || ""} onChange={e => onChange("url", e.target.value)} style={mkInp(T, { flex: 1, fontSize: 12 })} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onSave} style={{ flex: 1, background: T.accent, color: "#fff", border: "none", borderRadius: 10, padding: "9px", fontWeight: 700, cursor: "pointer" }}>Save</button>
        <button onClick={onCancel} style={{ background: T.sand, color: T.textMid, border: "none", borderRadius: 10, padding: "9px 14px", cursor: "pointer" }}>Cancel</button>
      </div>
    </div>
  );

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ ...mkCard(T), marginBottom: 18 }}>
        <span style={mkLbl(T)}>Add Day</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input placeholder="City..." value={newCity} onChange={e => setNewCity(e.target.value)} style={mkInp(T, { flex: 1, minWidth: 100 })} />
          <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={mkInp(T, { flex: 1, minWidth: 120 })} />
          <button onClick={addDay} style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Add</button>
        </div>
      </div>
      {schedule.length === 0 && <div style={{ textAlign: "center", color: T.textSoft, padding: "60px 20px" }}><div style={{ fontSize: 40, marginBottom: 12 }}>🗓️</div><div style={{ fontSize: 14 }}>No days yet — add your first day above!</div></div>}
      {schedule.map((day, di) => (
        <div key={di} style={{ ...mkCard(T), marginBottom: 14, padding: 0, overflow: "hidden" }}>
          <div style={{ background: T.cream, padding: "10px 16px", display: "flex", alignItems: "center", gap: 6, borderBottom: `1px solid ${T.border}` }}>
            {/* Day reorder arrows */}
            <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
              <button onClick={() => moveDay(di, di-1)} disabled={di===0} style={{ ...gripStyle(T), opacity: di===0?0.25:1 }}>▲</button>
              <button onClick={() => moveDay(di, di+1)} disabled={di===schedule.length-1} style={{ ...gripStyle(T), opacity: di===schedule.length-1?0.25:1 }}>▼</button>
            </div>
            <div style={{ flex: 1 }}><span style={{ color: T.accent, fontWeight: 700, fontSize: 15, fontFamily: HEADING }}>📍 {day.city}</span><span style={{ color: T.textSoft, fontSize: 12, marginLeft: 10 }}>{day.date}</span></div>
            <button onClick={() => setSchedule(s => s.filter((_,i) => i!==di))} style={{ background: T.sand, border: "none", borderRadius: 6, color: T.textMid, cursor: "pointer", padding: "3px 8px", fontSize: 14 }}>✕</button>
          </div>
          <div style={{ padding: "10px 14px" }}>
            {day.events.map((ev,ei) => {
              const isEditing = editing && editing.di === di && editing.ei === ei;
              if (isEditing) return (
                <div key={ei} style={{ padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                  {evForm(ev, (f, v) => updateEv(di, ei, f, v), () => setEditing(null), () => setEditing(null))}
                </div>
              );
              return (
                <div key={ei} style={{ display: "flex", gap: 6, alignItems: "flex-start", padding: "9px 0", borderBottom: `1px solid ${T.border}` }}>
                  {/* Event reorder arrows */}
                  <div style={{ display: "flex", flexDirection: "column", flexShrink: 0, paddingTop: 2 }}>
                    <button onClick={() => moveEv(di, ei, ei-1)} disabled={ei===0} style={{ ...gripStyle(T), fontSize: 10, opacity: ei===0?0.25:1 }}>▲</button>
                    <button onClick={() => moveEv(di, ei, ei+1)} disabled={ei===day.events.length-1} style={{ ...gripStyle(T), fontSize: 10, opacity: ei===day.events.length-1?0.25:1 }}>▼</button>
                  </div>
                  <div onClick={() => setEditing({ di, ei })} style={{ display: "flex", gap: 10, alignItems: "flex-start", flex: 1, cursor: "pointer" }}>
                    <div style={{ color: T.accent, fontSize: 12, fontWeight: 700, minWidth: 44, paddingTop: 2 }}>{ev.time||"--:--"}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: T.text, fontSize: 14, fontWeight: 500 }}>{ev.title}</div>
                      {ev.note && <div style={{ color: T.textSoft, fontSize: 12, marginTop: 2 }}>{ev.note}</div>}
                      {(ev.confirmNo || ev.address || ev.phone || ev.url) && (
                        <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
                          {ev.confirmNo && <div style={{ fontSize: 11, color: T.ocean }}>📋 {ev.confirmNo}</div>}
                          {ev.address && <div style={{ fontSize: 11, color: T.textMid }}>📍 {ev.address}</div>}
                          {ev.phone && <div style={{ fontSize: 11, color: T.textMid }}>📞 <a href={`tel:${ev.phone}`} onClick={e => e.stopPropagation()} style={{ color: T.ocean, textDecoration: "none" }}>{ev.phone}</a></div>}
                          {ev.url && <div style={{ fontSize: 11 }}>🔗 <a href={ev.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: T.ocean, textDecoration: "underline" }}>Open booking</a></div>}
                        </div>
                      )}
                      <div style={{ fontSize: 10, color: T.textSoft, marginTop: 4 }}>✏️ tap to edit</div>
                    </div>
                  </div>
                  <button onClick={() => setSchedule(s => s.map((d,i) => i===di ? { ...d, events: d.events.filter((_,j)=>j!==ei) } : d))} style={{ background: "none", border: "none", color: T.textSoft, cursor: "pointer", fontSize: 14 }}>✕</button>
                </div>
              );
            })}
            {ne.di === di ? (
              evForm(ne, (f, v) => setNe(n => ({ ...n, [f]: v })), () => addEv(di), () => setNe({ di: null, time: "", title: "", note: "", confirmNo: "", address: "", phone: "", url: "" }))
            ) : <button onClick={() => setNe({ di, time: "", title: "", note: "", confirmNo: "", address: "", phone: "", url: "" })} style={{ marginTop: 10, background: T.cream, border: `1px dashed ${T.sand}`, borderRadius: 10, color: T.accent, padding: "8px 16px", fontSize: 12, cursor: "pointer", width: "100%", fontWeight: 600 }}>+ Add Activity</button>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// EXPENSES
// ════════════════════════════════════════════════════════════════
function Expenses({ expenses, setExpenses, T }) {
  const [form, setForm] = useState({ date: todayStr(), category: EXPENSE_CATS[0], description: "", amount: "", city: "" });
  const [filter, setFilter] = useState("All");
  const [editingExp, setEditingExp] = useState(null);
  const add = () => { if (!form.amount||!form.description) return; setExpenses(e => [...e, { ...form, id: Date.now() }]); setForm(f => ({ ...f, description: "", amount: "" })); };
  const filtered = filter === "All" ? expenses : expenses.filter(e => e.category === filter);
  const total = expenses.reduce((s,e) => s+parseFloat(e.amount||0), 0);
  const todayS = expenses.filter(e => e.date === todayStr()).reduce((s,e) => s+parseFloat(e.amount||0), 0);
  const byCat = EXPENSE_CATS.map(cat => ({ cat, total: expenses.filter(e => e.category===cat).reduce((s,e)=>s+parseFloat(e.amount||0),0) })).filter(c => c.total > 0);

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div style={mkCard(T, { background: T.todayBg, borderColor: T.todayBorder })}><span style={mkLbl(T)}>Today</span><div style={{ fontSize: 24, fontWeight: 700, color: T.accent, fontFamily: HEADING }}>€{todayS.toFixed(2)}</div><div style={{ fontSize: 11, color: T.textSoft, marginTop: 3 }}>${(todayS*EUR_TO_USD).toFixed(2)} USD</div></div>
        <div style={mkCard(T, { background: T.totalBg, borderColor: T.totalBorder })}><span style={mkLbl(T, { color: T.ocean })}>Total</span><div style={{ fontSize: 24, fontWeight: 700, color: T.ocean, fontFamily: HEADING }}>€{total.toFixed(2)}</div><div style={{ fontSize: 11, color: T.textSoft, marginTop: 3 }}>${(total*EUR_TO_USD).toFixed(2)} USD</div></div>
      </div>
      {byCat.length > 0 && <div style={{ ...mkCard(T), marginBottom: 14 }}><span style={mkLbl(T)}>By Category</span>{byCat.map(({cat,total:ct})=>(<div key={cat} style={{ marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 12, color: T.textMid }}>{cat}</span><span style={{ fontSize: 12, color: T.accent, fontWeight: 600 }}>€{ct.toFixed(2)} <span style={{ color: T.textSoft, fontWeight: 400 }}>/ ${(ct*EUR_TO_USD).toFixed(2)}</span></span></div><div style={{ background: T.sand, borderRadius: 4, height: 5 }}><div style={{ height: "100%", borderRadius: 4, background: `linear-gradient(90deg,${T.accent},${T.accentLt})`, width: `${(ct/total)*100}%`, transition: "width 0.4s" }} /></div></div>))}</div>}

      {/* Quick expense buttons */}
      <div style={{ ...mkCard(T), marginBottom: 14 }}>
        <span style={mkLbl(T)}>Quick Add</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { emoji: "☕", label: "Coffee", amount: 3, cat: "🍕 Food" },
            { emoji: "🍦", label: "Gelato", amount: 4, cat: "🍕 Food" },
            { emoji: "🍕", label: "Pizza", amount: 8, cat: "🍕 Food" },
            { emoji: "🍷", label: "Wine", amount: 6, cat: "🍕 Food" },
            { emoji: "🚕", label: "Taxi", amount: 15, cat: "🚌 Transport" },
            { emoji: "🚌", label: "Bus", amount: 2, cat: "🚌 Transport" },
            { emoji: "🚂", label: "Train", amount: 25, cat: "🚌 Transport" },
            { emoji: "⛴️", label: "Ferry", amount: 18, cat: "🚌 Transport" },
            { emoji: "🎫", label: "Ticket", amount: 20, cat: "🎭 Activities" },
            { emoji: "🎭", label: "Museum", amount: 15, cat: "🎭 Activities" },
            { emoji: "💊", label: "Health", amount: 10, cat: "💊 Health" },
            { emoji: "🛍️", label: "Souvenir", amount: 12, cat: "🛍️ Shopping" },
          ].map(q => (
            <button key={q.label} onClick={() => setExpenses(e => [...e, { id: Date.now(), date: todayStr(), category: q.cat, description: q.label, amount: String(q.amount), city: form.city }])}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: T.cream, border: `1px solid ${T.border}`, borderRadius: 12, padding: "8px 12px", cursor: "pointer", minWidth: 56, transition: "all 0.15s" }}>
              <span style={{ fontSize: 20 }}>{q.emoji}</span>
              <span style={{ fontSize: 10, color: T.textMid, fontWeight: 600 }}>{q.label}</span>
              <span style={{ fontSize: 11, color: T.accent, fontWeight: 700 }}>€{q.amount}</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{ ...mkCard(T), marginBottom: 14 }}><span style={mkLbl(T)}>Record Expense</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <div style={{ display: "flex", gap: 8 }}><select value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))} style={mkInp(T,{flex:1})}>{EXPENSE_CATS.map(c=><option key={c}>{c}</option>)}</select><input placeholder="City..." value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} style={mkInp(T,{flex:1})} /></div>
          <input placeholder="Description" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} style={mkInp(T)} />
          <div style={{ display: "flex", gap: 8 }}><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={mkInp(T,{flex:1})} /><div style={{ position:"relative",flex:1 }}><span style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:T.accent,fontWeight:700 }}>€</span><input type="number" placeholder="0.00" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} style={mkInp(T,{width:"100%",paddingLeft:26,boxSizing:"border-box"})} /></div></div>
          {parseFloat(form.amount)>0 && <div style={{ fontSize:11,color:T.textSoft,textAlign:"right" }}>≈ ${(parseFloat(form.amount)*EUR_TO_USD).toFixed(2)} USD</div>}
          <button onClick={add} style={{ background:T.accent,color:"#fff",border:"none",borderRadius:10,padding:"10px",fontWeight:700,fontSize:14,cursor:"pointer" }}>+ Add Expense</button>
        </div>
      </div>
      <div style={{ display:"flex",gap:6,overflowX:"auto",paddingBottom:10,marginBottom:10 }}>{["All",...EXPENSE_CATS].map(cat=><button key={cat} onClick={()=>setFilter(cat)} style={mkPill(T,filter===cat)}>{cat}</button>)}</div>
      {filtered.length===0 && <div style={{ textAlign:"center",color:T.textSoft,padding:"40px 20px" }}><div style={{ fontSize:36,marginBottom:10 }}>💶</div><div>No expenses yet</div></div>}
      {[...filtered].reverse().map(exp=>{
        const isEd = editingExp === exp.id;
        if (isEd) return (
          <div key={exp.id} style={{ ...mkCard(T), marginBottom: 8, padding: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <select value={exp.category} onChange={e => setExpenses(es => es.map(x => x.id===exp.id ? {...x, category: e.target.value} : x))} style={mkInp(T,{flex:1})}>{EXPENSE_CATS.map(c=><option key={c}>{c}</option>)}</select>
                <input value={exp.city} onChange={e => setExpenses(es => es.map(x => x.id===exp.id ? {...x, city: e.target.value} : x))} placeholder="City..." style={mkInp(T,{flex:1})} />
              </div>
              <input value={exp.description} onChange={e => setExpenses(es => es.map(x => x.id===exp.id ? {...x, description: e.target.value} : x))} placeholder="Description" style={mkInp(T)} />
              <div style={{ display: "flex", gap: 8 }}>
                <input type="date" value={exp.date} onChange={e => setExpenses(es => es.map(x => x.id===exp.id ? {...x, date: e.target.value} : x))} style={mkInp(T,{flex:1})} />
                <div style={{ position:"relative",flex:1 }}>
                  <span style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:T.accent,fontWeight:700 }}>€</span>
                  <input type="number" value={exp.amount} onChange={e => setExpenses(es => es.map(x => x.id===exp.id ? {...x, amount: e.target.value} : x))} style={mkInp(T,{width:"100%",paddingLeft:26,boxSizing:"border-box"})} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setEditingExp(null)} style={{ flex:1, background:T.accent, color:"#fff", border:"none", borderRadius:10, padding:"9px", fontWeight:700, cursor:"pointer" }}>✓ Done</button>
                <button onClick={() => { setExpenses(e => e.filter(x => x.id !== exp.id)); setEditingExp(null); }} style={{ background:"#fde8e8", color:"#c0392b", border:"1px solid #f5c0c0", borderRadius:10, padding:"9px 14px", cursor:"pointer", fontWeight:600 }}>🗑</button>
              </div>
            </div>
          </div>
        );
        return (
          <div key={exp.id} onClick={() => setEditingExp(exp.id)} style={{ ...mkCard(T),display:"flex",alignItems:"center",gap:12,marginBottom:8,padding:"13px 14px",cursor:"pointer" }}>
            <div style={{ fontSize:22 }}>{exp.category.split(" ")[0]}</div>
            <div style={{ flex:1 }}><div style={{ color:T.text,fontSize:14,fontWeight:500 }}>{exp.description}</div><div style={{ color:T.textSoft,fontSize:11,marginTop:2 }}>{exp.city} · {exp.date}</div></div>
            <div style={{ textAlign:"right" }}><div style={{ color:T.accent,fontWeight:700,fontSize:15 }}>€{parseFloat(exp.amount).toFixed(2)}</div><div style={{ color:T.textSoft,fontSize:11 }}>${(parseFloat(exp.amount)*EUR_TO_USD).toFixed(2)}</div></div>
            <div style={{ fontSize:10,color:T.textSoft }}>✏️</div>
          </div>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// PACKING
// ════════════════════════════════════════════════════════════════
const initialPackingList = [
  { id:1,item:"Passport & ID",packed:false,category:"Documents"},{ id:2,item:"Travel Insurance",packed:false,category:"Documents"},
  { id:3,item:"Flight tickets",packed:false,category:"Documents"},{ id:4,item:"Hotel bookings",packed:false,category:"Documents"},
  { id:5,item:"Adapter (Type L plug)",packed:false,category:"Electronics"},{ id:6,item:"Phone charger",packed:false,category:"Electronics"},
  { id:7,item:"Camera",packed:false,category:"Electronics"},{ id:8,item:"Portable battery",packed:false,category:"Electronics"},
  { id:9,item:"Walking shoes",packed:false,category:"Clothing"},{ id:10,item:"Sunscreen SPF 50+",packed:false,category:"Toiletries"},
  { id:11,item:"Sunglasses",packed:false,category:"Clothing"},{ id:12,item:"Light scarf (for churches)",packed:false,category:"Clothing"},
  { id:13,item:"First aid kit",packed:false,category:"Health"},{ id:14,item:"Euros (cash)",packed:false,category:"Money"},
  { id:15,item:"Credit card (no foreign fees)",packed:false,category:"Money"},
];

function Packing({ packingList, setPackingList, T }) {
  const [addingTo, setAddingTo] = useState(null); const [inlineItem, setInlineItem] = useState("");
  const [newCatName, setNewCatName] = useState(""); const [showNewCat, setShowNewCat] = useState(false);
  const cats = [...new Set(packingList.map(p => p.category))]; const packed = packingList.filter(p => p.packed).length;
  const commitItem = (cat) => { if (!inlineItem.trim()) { setAddingTo(null); return; } setPackingList(l => [...l, { id: Date.now(), item: inlineItem.trim(), packed: false, category: cat }]); setInlineItem(""); setAddingTo(null); };
  const commitCat = () => { if (!newCatName.trim()) { setShowNewCat(false); return; } setPackingList(l => [...l, { id: Date.now(), item: "New item", packed: false, category: newCatName.trim() }]); setNewCatName(""); setShowNewCat(false); };

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ ...mkCard(T), marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}><span style={{ color: T.textMid, fontSize: 13, fontWeight: 600 }}>Packing Progress</span><span style={{ color: T.accent, fontWeight: 700 }}>{packed}/{packingList.length}</span></div>
        <div style={{ background: T.sand, borderRadius: 8, height: 10, overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 8, background: packed===packingList.length&&packingList.length>0?T.green:`linear-gradient(90deg,${T.accent},${T.accentLt})`, width: `${packingList.length>0?(packed/packingList.length)*100:0}%`, transition: "width 0.4s" }} /></div>
        {packed===packingList.length&&packingList.length>0 && <div style={{ textAlign:"center",marginTop:10,color:T.green,fontSize:14,fontWeight:600 }}>🎉 All packed! Buon viaggio!</div>}
      </div>
      {showNewCat ? (
        <div style={{ ...mkCard(T), marginBottom: 16 }}><span style={mkLbl(T)}>New Category</span><div style={{ display:"flex",gap:8 }}><input autoFocus placeholder="Category name..." value={newCatName} onChange={e=>setNewCatName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&commitCat()} style={mkInp(T,{flex:1})} /><button onClick={commitCat} style={{ background:T.accent,color:"#fff",border:"none",borderRadius:10,padding:"9px 14px",fontWeight:700,cursor:"pointer" }}>Add</button><button onClick={()=>{setShowNewCat(false);setNewCatName("");}} style={{ background:T.sand,color:T.textMid,border:"none",borderRadius:10,padding:"9px 12px",cursor:"pointer" }}>✕</button></div></div>
      ) : (
        <button onClick={()=>setShowNewCat(true)} style={{ ...mkCard(T), width:"100%",textAlign:"left",cursor:"pointer",marginBottom:16,color:T.accent,fontWeight:600,fontSize:13,display:"flex",alignItems:"center",gap:8,border:`1px dashed ${T.sand}`,background:T.cream }}><span style={{ fontSize:20,fontWeight:300 }}>＋</span> Add New Category</button>
      )}
      {cats.map(cat => {
        const catItems = packingList.filter(p => p.category === cat);
        const allPacked = catItems.length > 0 && catItems.every(p => p.packed);
        const toggleAll = () => setPackingList(l => l.map(p => p.category === cat ? { ...p, packed: !allPacked } : p));
        return (
        <div key={cat} style={{ marginBottom: 18 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8,paddingLeft:2 }}>
            <button onClick={toggleAll} style={{ width:20,height:20,borderRadius:6,flexShrink:0,background:allPacked?T.green:T.cream,border:allPacked?"none":`2px solid ${T.sand}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff",cursor:"pointer",padding:0 }}>{allPacked?"✓":""}</button>
            <span style={{ fontSize:10,letterSpacing:1.5,color:T.textSoft,fontWeight:700,textTransform:"uppercase",flex:1 }}>{cat}</span>
            <button onClick={()=>{setAddingTo(addingTo===cat?null:cat);setInlineItem("");}} style={{ width:24,height:24,borderRadius:"50%",background:T.accent,color:"#fff",border:"none",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontWeight:700 }}>+</button>
          </div>
          {packingList.filter(p=>p.category===cat).map(item=>(
            <div key={item.id} onClick={()=>setPackingList(l=>l.map(p=>p.id===item.id?{...p,packed:!p.packed}:p))}
              style={{ display:"flex",alignItems:"center",gap:12,background:item.packed?"#f0f9f4":T.bgCard,borderRadius:10,padding:"12px 14px",marginBottom:6,cursor:"pointer",border:`1px solid ${item.packed?"#b8dfc9":T.border}`,opacity:item.packed?0.7:1,transition:"all 0.2s" }}>
              <div style={{ width:20,height:20,borderRadius:6,flexShrink:0,background:item.packed?T.green:T.cream,border:item.packed?"none":`2px solid ${T.sand}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff" }}>{item.packed?"✓":""}</div>
              <span style={{ flex:1,color:T.text,fontSize:14,textDecoration:item.packed?"line-through":"none" }}>{item.item}</span>
              <button onClick={e=>{e.stopPropagation();setPackingList(l=>l.filter(p=>p.id!==item.id));}} style={{ background:"none",border:"none",color:T.textSoft,cursor:"pointer",fontSize:14,padding:"0 2px" }}>✕</button>
            </div>
          ))}
          {addingTo===cat && <div style={{ display:"flex",gap:8,marginTop:4 }}><input autoFocus placeholder={`Add item to ${cat}...`} value={inlineItem} onChange={e=>setInlineItem(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")commitItem(cat);if(e.key==="Escape")setAddingTo(null);}} style={mkInp(T,{flex:1})} /><button onClick={()=>commitItem(cat)} style={{ background:T.accent,color:"#fff",border:"none",borderRadius:10,padding:"9px 14px",fontWeight:700,cursor:"pointer" }}>Add</button><button onClick={()=>setAddingTo(null)} style={{ background:T.sand,color:T.textMid,border:"none",borderRadius:10,padding:"9px 12px",cursor:"pointer" }}>✕</button></div>}
        </div>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// JOURNAL
// ════════════════════════════════════════════════════════════════
function Journal({ entries, setEntries, T }) {
  const blank = () => ({ date: todayStr(), city: "", title: "", note: "", photoDataURL: null });
  const [form, setForm] = useState(blank()); const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(); const editRef = useRef();

  const pickPhoto = async (file, onUrl) => {
    setUploading(true);
    try {
      const b64 = await new Promise(r => { const rd = new FileReader(); rd.onload = ev => r(ev.target.result); rd.readAsDataURL(file); });
      const url = await uploadPhoto(b64, "journal");
      onUrl(url);
    } finally {
      setUploading(false);
    }
  };

  const save = () => { if (!form.title || uploading) return; setEntries(p => [...p, { ...form, id: Date.now() }]); setForm(blank()); if (fileRef.current) fileRef.current.value=""; };

  if (editing !== null) {
    const entry = entries[editing];
    return (
      <div style={{ paddingBottom: 40 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
          <button onClick={()=>setEditing(null)} style={mkPill(T,false)}>← Back</button>
          <button onClick={()=>{setEntries(p=>p.filter((_,i)=>i!==editing));setEditing(null);}} style={{ background:"#fde8e8",color:"#c0392b",border:"1px solid #f5c0c0",borderRadius:20,padding:"7px 14px",fontSize:12,cursor:"pointer",fontWeight:600 }}>🗑 Delete</button>
        </div>
        <div onClick={()=>editRef.current.click()} style={{ marginBottom:14,cursor:"pointer",borderRadius:18,overflow:"hidden",border:`1px solid ${T.border}`,minHeight:80 }}>
          {entry.photoDataURL ? <img src={entry.photoDataURL} alt="" style={{ width:"100%",maxHeight:240,objectFit:"cover",display:"block" }} /> : <div style={{ background:T.cream,padding:20,textAlign:"center",color:T.textSoft,fontSize:13 }}><div style={{ fontSize:26,marginBottom:6 }}>📷</div>Tap to add photo</div>}
        </div>
        <input type="file" accept="image/*" ref={editRef} onChange={e=>{const f=e.target.files[0];if(!f)return;pickPhoto(f,url=>setEntries(p=>p.map((en,i)=>i===editing?{...en,photoDataURL:url}:en)));}} style={{ display:"none" }} />
        <div style={{ ...mkCard(T),display:"flex",flexDirection:"column",gap:10 }}>
          <div style={{ display:"flex",gap:8 }}><input placeholder="City..." value={entry.city} onChange={e=>setEntries(p=>p.map((en,i)=>i===editing?{...en,city:e.target.value}:en))} style={mkInp(T,{flex:1})} /><input type="date" value={entry.date} onChange={e=>setEntries(p=>p.map((en,i)=>i===editing?{...en,date:e.target.value}:en))} style={mkInp(T,{flex:1})} /></div>
          <input value={entry.title} onChange={e=>setEntries(p=>p.map((en,i)=>i===editing?{...en,title:e.target.value}:en))} style={mkInp(T,{ fontFamily:HEADING,fontSize:18,fontWeight:700,color:T.accent })} />
          <textarea value={entry.note} onChange={e=>setEntries(p=>p.map((en,i)=>i===editing?{...en,note:e.target.value}:en))} rows={6} style={{ ...mkInp(T),resize:"vertical",fontFamily:"inherit",lineHeight:1.7 }} />
          <button onClick={()=>setEditing(null)} style={{ background:T.accent,color:"#fff",border:"none",borderRadius:10,padding:"11px",fontWeight:700,fontSize:14,cursor:"pointer" }}>✓ Done Editing</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ ...mkCard(T), marginBottom: 20 }}><span style={mkLbl(T)}>New Journal Entry</span>
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          <div style={{ display:"flex",gap:8 }}><input placeholder="City..." value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} style={mkInp(T,{flex:1})} /><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={mkInp(T,{flex:1})} /></div>
          <input placeholder="Entry title..." value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} style={mkInp(T)} />
          <textarea placeholder="Write your memory..." value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} rows={3} style={{ ...mkInp(T),resize:"vertical",fontFamily:"inherit" }} />
          <div onClick={()=>fileRef.current.click()} style={{ border:`2px dashed ${T.sand}`,borderRadius:12,padding:16,textAlign:"center",cursor:"pointer",color:T.textSoft,fontSize:13,background:T.cream,overflow:"hidden",minHeight:64 }}>
            {form.photoDataURL ? <img src={form.photoDataURL} alt="" style={{ width:"100%",maxHeight:180,objectFit:"cover",borderRadius:8,display:"block" }} /> : <><div style={{ fontSize:28,marginBottom:6 }}>📷</div>Tap to add photo</>}
          </div>
          <input type="file" accept="image/*" ref={fileRef} onChange={e=>{const f=e.target.files[0];if(!f)return;pickPhoto(f,url=>setForm(p=>({...p,photoDataURL:url})));}} style={{ display:"none" }} />
          <button onClick={save} disabled={uploading} style={{ background:uploading?T.sand:T.accent,color:"#fff",border:"none",borderRadius:10,padding:"11px",fontWeight:700,fontSize:14,cursor:uploading?"not-allowed":"pointer" }}>{uploading?"⏳ Uploading…":"💾 Save Memory"}</button>
        </div>
      </div>
      {entries.length===0 && <div style={{ textAlign:"center",color:T.textSoft,padding:"40px 20px" }}><div style={{ fontSize:40,marginBottom:10 }}>📓</div><div style={{ fontSize:14 }}>Your travel memories will appear here</div></div>}
      {[...entries].reverse().map((entry,i) => {
        const revIdx = entries.length-1-i;
        return (
          <div key={entry.id} style={{ ...mkCard(T),overflow:"hidden",marginBottom:14,padding:0 }}>
            {entry.photoDataURL && <img src={entry.photoDataURL} alt="" onClick={()=>setEditing(revIdx)} style={{ width:"100%",height:170,objectFit:"cover",display:"block",cursor:"pointer" }} />}
            <div style={{ padding:"14px 16px" }}>
              <div onClick={()=>setEditing(revIdx)} style={{ cursor:"pointer" }}>
                <div style={{ color:T.textSoft,fontSize:11,marginBottom:4 }}>📍 {entry.city} · {entry.date}</div>
                <div style={{ color:T.accent,fontFamily:HEADING,fontSize:18,marginBottom:5,fontWeight:700 }}>{entry.title}</div>
                {entry.note && <div style={{ color:T.textMid,fontSize:13,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" }}>{entry.note}</div>}
                <div style={{ marginTop:8,fontSize:11,color:T.textSoft }}>✏️ Tap to edit</div>
              </div>
              {/* Reorder arrows */}
              <div style={{ display:"flex",gap:8,marginTop:10,justifyContent:"flex-end" }}>
                <button onClick={()=>{ if(revIdx<entries.length-1) setEntries(e=>reorder(e,revIdx,revIdx+1)); }} disabled={revIdx===entries.length-1}
                  style={{ ...gripStyle(T), background:T.cream, border:`1px solid ${T.border}`, borderRadius:8, padding:"4px 10px", opacity:revIdx===entries.length-1?0.3:1 }}>▲</button>
                <button onClick={()=>{ if(revIdx>0) setEntries(e=>reorder(e,revIdx,revIdx-1)); }} disabled={revIdx===0}
                  style={{ ...gripStyle(T), background:T.cream, border:`1px solid ${T.border}`, borderRadius:8, padding:"4px 10px", opacity:revIdx===0?0.3:1 }}>▼</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


// ════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════
export default function ItalyTripTracker() {
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState(0);
  const [themeId, setThemeId] = useState("sand");
  const [tripName, setTripName] = useState("My Italy Adventure");
  const [tripDates, setTripDates] = useState({ start: "", end: "" });
  const [heroPhotos, setHeroPhotos] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [packingList, setPackingList] = useState(initialPackingList);
  const [journalEntries, setJournalEntries] = useState([]);
  const weather = useWeather();
  const T = THEMES[themeId];
  const skipNextSave = useRef(false);
  const saveTimer = useRef(null);

  const applyData = (d) => {
    skipNextSave.current = true;
    if (d.themeId) setThemeId(d.themeId);
    if (d.tripName) setTripName(d.tripName);
    if (d.tripDates) setTripDates(d.tripDates);
    if (d.heroPhotos) setHeroPhotos(d.heroPhotos);
    if (d.schedule) setSchedule(d.schedule);
    if (d.expenses) setExpenses(d.expenses);
    if (d.packingList) setPackingList(d.packingList);
    if (d.journalEntries) setJournalEntries(d.journalEntries);
  };

  // Load + subscribe to real-time changes
  useEffect(() => {
    supabase.from("trip_data").select("data").eq("id", "shared").single().then(({ data: row }) => {
      if (row?.data) applyData(row.data);
      setLoaded(true);
    });

    const channel = supabase.channel("trip")
      .on("postgres_changes", { event: "*", schema: "public", table: "trip_data", filter: "id=eq.shared" }, (payload) => {
        if (payload.new?.data) applyData(payload.new.data);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Debounced auto-save (skips writes triggered by remote updates)
  useEffect(() => {
    if (!loaded) return;
    if (skipNextSave.current) { skipNextSave.current = false; return; }
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      supabase.from("trip_data").upsert({ id: "shared", data: { themeId, tripName, tripDates, heroPhotos, schedule, expenses, packingList, journalEntries }, updated_at: new Date().toISOString() });
    }, 800);
    return () => clearTimeout(saveTimer.current);
  }, [loaded, themeId, tripName, tripDates, heroPhotos, schedule, expenses, packingList, journalEntries]);

  if (!loaded) return (
    <div style={{ minHeight: "100vh", background: "#fdf6ec", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito', sans-serif" }}>
      <div style={{ textAlign: "center", color: "#b5977a" }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🇮🇹</div>
        <div style={{ fontSize: 14 }}>Loading your trip...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Nunito', sans-serif", color: T.text, maxWidth: 480, margin: "0 auto", transition: "background 0.4s" }}>
      <link href="https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ padding: "14px 18px 0", background: T.bg, position: "sticky", top: 0, zIndex: 20, borderBottom: `1px solid ${T.border}`, boxShadow: `0 2px 12px ${T.accent}10`, transition: "all 0.4s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ borderRadius: "50%", overflow: "hidden", width: 46, height: 46, flexShrink: 0, boxShadow: `0 2px 10px ${T.accent}30`, border: `2px solid ${T.accentLt}` }}>
            <CoupleAvatar size={46} T={T} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <input value={tripName} onChange={e => setTripName(e.target.value)} placeholder="My Italy Adventure"
              style={{ fontFamily: HEADING, fontSize: 17, fontWeight: 700, color: T.text, lineHeight: 1.1, background: "transparent", border: "none", outline: "none", width: "100%", padding: 0 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
              <span style={{ fontSize: 10, color: T.textSoft }}>🇮🇹</span>
              <input type="date" value={tripDates.start} onChange={e => setTripDates(d => ({ ...d, start: e.target.value }))}
                style={{ background: "transparent", border: "none", outline: "none", color: T.textSoft, fontSize: 10, fontFamily: "inherit", padding: 0, width: 90 }} />
              <span style={{ fontSize: 10, color: T.textSoft }}>→</span>
              <input type="date" value={tripDates.end} onChange={e => setTripDates(d => ({ ...d, end: e.target.value }))}
                style={{ background: "transparent", border: "none", outline: "none", color: T.textSoft, fontSize: 10, fontFamily: "inherit", padding: 0, width: 90 }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {/* Theme picker */}
            <ThemePicker themeId={themeId} setThemeId={setThemeId} T={T} />
            {/* Weather */}
            <div style={{ textAlign: "right", minWidth: 48 }}>
            {weather.loading ? (
              <div style={{ fontSize: 11, color: T.textSoft }}><div style={{ fontSize: 18 }}>🌤️</div><div>loading…</div></div>
            ) : weather.temp !== null ? (
              <><div style={{ fontSize: 20, lineHeight: 1 }}>{weather.icon}</div><div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{weather.temp}°C</div>{weather.city && <div style={{ fontSize: 10, color: T.textSoft, maxWidth: 70, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📍 {weather.city}</div>}</>
            ) : weather.error ? (
              <div onClick={weather.retry} style={{ cursor: "pointer" }}><div style={{ fontSize: 18 }}>🌤️</div>{weather.city && <div style={{ fontSize: 10, color: T.textSoft, maxWidth: 70, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📍 {weather.city}</div>}<div style={{ fontSize: 9, color: T.accent, marginTop: 2 }}>retry</div></div>
            ) : <div style={{ fontSize: 20 }}>☀️</div>}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 12 }}>
          {TABS.map((t,i) => <button key={i} onClick={()=>setTab(i)} style={mkPill(T,tab===i)}>{t}</button>)}
        </div>
      </div>

      <div style={{ padding: "18px 18px" }}>
        {tab===0 && <TripSummary expenses={expenses} packingList={packingList} tripDates={tripDates} setTripDates={setTripDates} tripName={tripName} setTripName={setTripName} heroPhotos={heroPhotos} setHeroPhotos={setHeroPhotos} T={T} schedule={schedule} />}
        {tab===1 && <Schedule schedule={schedule} setSchedule={setSchedule} T={T} />}
        {tab===2 && <Expenses expenses={expenses} setExpenses={setExpenses} T={T} />}
        {tab===3 && <Packing packingList={packingList} setPackingList={setPackingList} T={T} />}
        {tab===4 && <Journal entries={journalEntries} setEntries={setJournalEntries} T={T} />}
      </div>
    </div>
  );
}
