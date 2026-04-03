import { useState, useEffect, useRef, useCallback } from "react";

// ─── Global Styles ────────────────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a1a0f; font-family: 'Plus Jakarta Sans', sans-serif; }

  :root {
    --green-deep:   #052e16;
    --green-dark:   #166534;
    --green-mid:    #16a34a;
    --green-bright: #22c55e;
    --green-light:  #86efac;
    --green-pale:   #dcfce7;
    --amber:        #f59e0b;
    --amber-light:  #fde68a;
    --sky:          #0ea5e9;
    --red:          #ef4444;
    --white:        #ffffff;
    --card-bg:      #ffffff;
    --text-primary: #0f1f0a;
    --text-muted:   #6b7280;
    --radius-xl:    20px;
    --radius-lg:    16px;
    --radius-md:    12px;
    --shadow-card:  0 4px 24px rgba(0,0,0,0.07);
    --shadow-green: 0 8px 32px rgba(34,197,94,0.25);
  }

  /* ── Keyframes ── */
  @keyframes fadeUp      { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn      { from { opacity:0; } to { opacity:1; } }
  @keyframes scaleIn     { from { opacity:0; transform:scale(.88); } to { opacity:1; transform:scale(1); } }
  @keyframes slideRight  { from { transform:translateX(-100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
  @keyframes slideLeft   { from { transform:translateX(100%);  opacity:0; } to { transform:translateX(0); opacity:1; } }
  @keyframes pulse       { 0%,100% { box-shadow:0 0 0 8px rgba(34,197,94,.15); } 50% { box-shadow:0 0 0 22px rgba(34,197,94,.04); } }
  @keyframes pulseDanger { 0%,100% { box-shadow:0 0 0 8px rgba(239,68,68,.15); } 50% { box-shadow:0 0 0 20px rgba(239,68,68,.04); } }
  @keyframes spin        { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  @keyframes grow        { from { width:0; } to { width:70%; } }
  @keyframes float       { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-8px); } }
  @keyframes shimmer     { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
  @keyframes ripple      { 0% { transform:scale(0); opacity:.6; } 100% { transform:scale(2.5); opacity:0; } }
  @keyframes bounce      { 0%,100% { transform:translateY(0); } 40% { transform:translateY(-10px); } 70% { transform:translateY(-4px); } }
  @keyframes waveBar     { 0%,100% { height:8px; } 50% { height:28px; } }
  @keyframes bgShift     { 0% { background-position:0% 50%; } 50% { background-position:100% 50%; } 100% { background-position:0% 50%; } }
  @keyframes leafSway    { 0%,100% { transform:rotate(-5deg); } 50% { transform:rotate(5deg); } }
  @keyframes countUp     { from { opacity:0; transform:translateY(10px) scale(.9); } to { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes glowPulse   { 0%,100% { opacity:.6; } 50% { opacity:1; } }
  @keyframes progressFill{ from { width:0%; } to { width:var(--fill); } }
  @keyframes cardEntrance{ from { opacity:0; transform:translateY(32px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes headerSlide { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pestBlink   { 0%,100% { border-color:#f59e0b; } 50% { border-color:#fde68a; box-shadow:0 0 16px #f59e0b66; } }
  @keyframes tabGlow     { from { box-shadow:none; } to { box-shadow:0 0 12px rgba(34,197,94,.5); } }

  /* ── Floating crops canvas layer ── */
  .crop-canvas-layer {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    z-index: 0;
  }

  .animate-fadeUp   { animation: fadeUp  .5s cubic-bezier(.22,1,.36,1) both; }
  .animate-scaleIn  { animation: scaleIn .4s cubic-bezier(.22,1,.36,1) both; }
  .animate-float    { animation: float 3.5s ease-in-out infinite; }
  .animate-spin     { animation: spin 1.2s linear infinite; }
  .animate-pulse    { animation: pulse 2s ease-in-out infinite; }
  .animate-bounce   { animation: bounce .8s ease-in-out; }

  .d0  { animation-delay:0ms;   } .d50 { animation-delay:50ms;  }
  .d1  { animation-delay:100ms; } .d15 { animation-delay:150ms; }
  .d2  { animation-delay:200ms; } .d25 { animation-delay:250ms; }
  .d3  { animation-delay:300ms; } .d35 { animation-delay:350ms; }
  .d4  { animation-delay:400ms; } .d5  { animation-delay:500ms; }
  .d6  { animation-delay:600ms; } .d7  { animation-delay:700ms; }
  .d8  { animation-delay:800ms; } .d9  { animation-delay:900ms; }

  .card-hover { transition:transform .22s ease,box-shadow .22s ease; cursor:pointer; }
  .card-hover:hover { transform:translateY(-4px) scale(1.02); box-shadow:0 12px 36px rgba(0,0,0,.12); }

  .nav-btn { transition:transform .18s cubic-bezier(.34,1.56,.64,1),box-shadow .18s ease; }
  .nav-btn:hover  { transform:scale(1.08) translateY(-3px); }
  .nav-btn:active { transform:scale(.95); }

  .ripple-container { position:relative; overflow:hidden; }
  .ripple-container::after { content:''; position:absolute; inset:0; border-radius:inherit; background:rgba(255,255,255,.25); transform:scale(0); opacity:0; }
  .ripple-container:active::after { animation:ripple .4s ease-out; }

  .shimmer { background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; border-radius:8px; }

  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-thumb { background:#22c55e44; border-radius:99px; }

  .wave-bar { width:4px; border-radius:99px; background:var(--green-bright); display:inline-block; }
  .wave-bar:nth-child(1){animation:waveBar .6s ease-in-out infinite .0s}
  .wave-bar:nth-child(2){animation:waveBar .6s ease-in-out infinite .1s}
  .wave-bar:nth-child(3){animation:waveBar .6s ease-in-out infinite .2s}
  .wave-bar:nth-child(4){animation:waveBar .6s ease-in-out infinite .3s}
  .wave-bar:nth-child(5){animation:waveBar .6s ease-in-out infinite .4s}

  .gradient-header {
    background:linear-gradient(135deg,#052e16 0%,#14532d 60%,#166534 100%);
    background-size:200% 200%;
    animation:bgShift 8s ease infinite;
  }
`;

// ─── Floating Crops Canvas ────────────────────────────────────────────────────
const CROP_EMOJIS = ['🌾','🌽','🌿','🍅','🥕','🌱','🌻','🍃','🧅','🌶️','🫘','🥦'];

function FloatingCropsCanvas({ opacity = 0.3 }) {
  const canvasRef   = useRef(null);
  const particlesRef= useRef([]);
  const rafRef      = useRef(null);

  const rand = (a, b) => a + Math.random() * (b - a);

  const makeParticle = useCallback((W, H, fromBottom = false) => ({
    x:       rand(0, W),
    y:       fromBottom ? H + rand(20, 80) : rand(-H * 0.2, H * 1.1),
    emoji:   CROP_EMOJIS[Math.floor(Math.random() * CROP_EMOJIS.length)],
    size:    rand(14, 34),
    vx:      rand(-0.22, 0.22),
    vy:      -rand(0.28, 0.9),
    rot:     rand(0, Math.PI * 2),
    rotV:    rand(-0.012, 0.012),
    alpha:   fromBottom ? 0 : rand(0.1, 0.9),
    life:    fromBottom ? 0 : rand(0, 480),
    maxLife: rand(300, 580),
    sway:    rand(0.3, 1.1),
    swayOff: rand(0, Math.PI * 2),
    swaySpd: rand(0.006, 0.02),
  }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = W * devicePixelRatio;
      canvas.height = H * devicePixelRatio;
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };

    resize();

    const COUNT = Math.min(30, Math.floor(W / 28));
    particlesRef.current = Array.from({ length: COUNT }, () => makeParticle(W, H, false));

    const tick = () => {
      ctx.clearRect(0, 0, W, H);

      particlesRef.current.forEach((p, i) => {
        if (!p) return;
        p.life++;
        const prog = p.life / p.maxLife;

        if      (p.life < 60)    p.alpha = Math.min(1, p.life / 60);
        else if (prog > 0.80)    p.alpha = Math.max(0, 1 - (prog - 0.80) / 0.20);
        else                     p.alpha = 1;

        p.x   += p.vx + Math.sin(p.life * p.swaySpd + p.swayOff) * p.sway * 0.055;
        p.y   += p.vy;
        p.rot += p.rotV;

        ctx.save();
        ctx.globalAlpha = p.alpha * opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.font = `${p.size}px serif`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();

        if (p.y < -90 || p.life >= p.maxLife) {
          particlesRef.current[i] = makeParticle(W, H, true);
        }
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    tick();

    const onResize = () => {
      cancelAnimationFrame(rafRef.current);
      resize();
      const COUNT2 = Math.min(30, Math.floor(W / 28));
      particlesRef.current = Array.from({ length: COUNT2 }, () => makeParticle(W, H, false));
      tick();
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, [makeParticle, opacity]);

  return <canvas ref={canvasRef} className="crop-canvas-layer" />;
}

// ─── i18n ─────────────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    appName:"KisanAI", tagline:"Your Smart Farming Assistant", speak:"Speak",
    scanCrop:"Scan Crop", weather:"Weather", advice:"Smart Advice", myFarm:"My Farm",
    expert:"Call Expert", market:"Market Prices", schemes:"Govt Schemes",
    community:"Community", equipment:"Equipment", soil:"Soil Health",
    irrigation:"Irrigation", listening:"Listening...", tapToSpeak:"Tap to Speak",
    offline:"Offline Mode Active",
    greeting:"Hello! I am KisanAI, your farming assistant. How can I help you today?",
    analyzingCrop:"Analyzing your crop image...", diseaseDetected:"Disease Detected",
    treatment:"Treatment", confidence:"Confidence", yieldPrediction:"Yield Prediction",
    tons:"tons/hectare", loading:"Loading...", onboarding:"Create Your Farm Profile",
    farmerName:"Your Name", phone:"Phone Number", village:"Village", district:"District",
    state:"State", language:"Preferred Language", farmSize:"Farm Size (acres)",
    soilType:"Soil Type", primaryCrop:"Primary Crop", save:"Save Profile",
    back:"Back", next:"Next", pestAlert:"Pest Alert in Your Area!",
    fertilizer:"Fertilizer Guide", rotation:"Crop Rotation",
  },
  hi: {
    appName:"किसान AI", tagline:"आपका स्मार्ट खेती सहायक", speak:"बोलें",
    scanCrop:"फसल स्कैन", weather:"मौसम", advice:"स्मार्ट सलाह", myFarm:"मेरा खेत",
    expert:"विशेषज्ञ", market:"बाजार भाव", schemes:"सरकारी योजना",
    community:"समुदाय", equipment:"उपकरण", soil:"मिट्टी स्वास्थ्य",
    irrigation:"सिंचाई", listening:"सुन रहा हूँ...", tapToSpeak:"बोलने के लिए दबाएं",
    offline:"ऑफलाइन मोड सक्रिय",
    greeting:"नमस्ते! मैं किसान AI हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?",
    analyzingCrop:"आपकी फसल की छवि का विश्लेषण हो रहा है...",
    diseaseDetected:"रोग पाया गया", treatment:"उपचार", confidence:"विश्वास",
    yieldPrediction:"उपज अनुमान", tons:"टन/हेक्टेयर", loading:"लोड हो रहा है...",
    onboarding:"अपना फार्म प्रोफाइल बनाएं", farmerName:"आपका नाम", phone:"फोन नंबर",
    village:"गाँव", district:"जिला", state:"राज्य", language:"पसंदीदा भाषा",
    farmSize:"खेत का आकार (एकड़)", soilType:"मिट्टी का प्रकार", primaryCrop:"मुख्य फसल",
    save:"प्रोफाइल सहेजें", back:"वापस", next:"आगे",
    pestAlert:"आपके क्षेत्र में कीट चेतावनी!", fertilizer:"उर्वरक मार्गदर्शिका",
    rotation:"फसल चक्र",
  },
  te: {
    appName:"కిసాన్ AI", tagline:"మీ స్మార్ట్ వ్యవసాయ సహాయకుడు", speak:"మాట్లాడు",
    scanCrop:"పంట స్కాన్", weather:"వాతావరణం", advice:"సలహా", myFarm:"నా పొలం",
    expert:"నిపుణుడు", market:"మార్కెట్ ధరలు", schemes:"ప్రభుత్వ పథకాలు",
    community:"సమాజం", equipment:"పరికరాలు", soil:"నేల ఆరోగ్యం",
    irrigation:"నీటిపారుదల", listening:"వింటున్నాను...", tapToSpeak:"మాట్లాడటానికి నొక్కండి",
    offline:"ఆఫ్‌లైన్ మోడ్ యాక్టివ్",
    greeting:"నమస్కారం! నేను కిసాన్ AI. మీకు ఎలా సహాయం చేయాలి?",
    analyzingCrop:"మీ పంట చిత్రాన్ని విశ్లేషిస్తున్నాను...",
    diseaseDetected:"వ్యాధి గుర్తించబడింది", treatment:"చికిత్స", confidence:"నమ్మకం",
    yieldPrediction:"దిగుబడి అంచనా", tons:"టన్నులు/హెక్టేర్", loading:"లోడవుతోంది...",
    onboarding:"మీ ఫార్మ్ ప్రొఫైల్ సృష్టించండి", farmerName:"మీ పేరు",
    phone:"ఫోన్ నంబర్", village:"గ్రామం", district:"జిల్లా", state:"రాష్ట్రం",
    language:"ఇష్టపడే భాష", farmSize:"పొలం పరిమాణం", soilType:"నేల రకం",
    primaryCrop:"ప్రధాన పంట", save:"ప్రొఫైల్ సేవ్ చేయండి", back:"వెనక్కి",
    next:"తదుపరి", pestAlert:"మీ ప్రాంతంలో పురుగుల హెచ్చరిక!",
    fertilizer:"ఎరువుల మార్గదర్శి", rotation:"పంట మార్పిడి",
  },
};

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const DISEASES = [
  { name:"Brown Spot",           confidence:92, treatment:"Apply Propiconazole 25% EC @ 1ml/L. Remove infected leaves. Ensure proper drainage.", icon:"🍂", color:"#f59e0b" },
  { name:"Leaf Blast",           confidence:87, treatment:"Spray Tricyclazole 75% WP @ 0.6g/L. Avoid excess nitrogen. Maintain water level.",   icon:"💨", color:"#0ea5e9" },
  { name:"Bacterial Leaf Blight",confidence:78, treatment:"Use copper-based bactericide. Drain fields. Avoid flood irrigation.",                  icon:"🦠", color:"#ef4444" },
  { name:"Healthy Crop",         confidence:96, treatment:"Your crop looks healthy! Continue current practices.",                                   icon:"✅", color:"#22c55e" },
];
const MARKET_DATA = [
  { crop:"Rice",   price:2180, change:+45,  trend:"up",   unit:"₹/quintal" },
  { crop:"Wheat",  price:2275, change:-20,  trend:"down", unit:"₹/quintal" },
  { crop:"Cotton", price:6850, change:+120, trend:"up",   unit:"₹/quintal" },
  { crop:"Tomato", price:1240, change:+380, trend:"up",   unit:"₹/quintal" },
  { crop:"Onion",  price:890,  change:-110, trend:"down", unit:"₹/quintal" },
  { crop:"Maize",  price:1950, change:+30,  trend:"up",   unit:"₹/quintal" },
];
const SCHEMES = [
  { name:"PM-KISAN",          amount:"₹6,000/year",  desc:"Direct income support for farmers. 3 installments of ₹2,000.", eligible:"All small & marginal farmers",      icon:"🏛️", color:"#6366f1" },
  { name:"Fasal Bima Yojana", amount:"Up to ₹2 lakh", desc:"Crop insurance against natural calamities, pests & diseases.", eligible:"All farmers growing notified crops", icon:"🛡️", color:"#0ea5e9" },
  { name:"Kisan Credit Card", amount:"Up to ₹3 lakh", desc:"Short-term credit for crop cultivation needs.",                  eligible:"Farmers with land holdings",        icon:"💳", color:"#22c55e" },
  { name:"Soil Health Card",  amount:"Free",           desc:"Free soil testing and fertilizer recommendations.",               eligible:"All farmers",                       icon:"🧪", color:"#f59e0b" },
];
const WEATHER_DATA = {
  today:{ temp:32, humidity:68, condition:"Partly Cloudy", icon:"⛅", wind:12, rain:0 },
  forecast:[
    { day:"Tomorrow", temp:29, icon:"🌧️", rain:80, desc:"Heavy Rain"    },
    { day:"Wed",      temp:31, icon:"⛅", rain:20, desc:"Partly Cloudy" },
    { day:"Thu",      temp:34, icon:"☀️", rain:5,  desc:"Sunny"         },
    { day:"Fri",      temp:33, icon:"☀️", rain:0,  desc:"Clear"         },
    { day:"Sat",      temp:30, icon:"🌦️", rain:60, desc:"Light Rain"    },
  ],
};
const PEST_DATA = [
  { name:"Brown Plant Hopper", severity:"High",   area:"2.3 km away", icon:"🦗", treatment:"Apply Imidacloprid 200 SL @ 0.3ml/L. Drain fields for 3 days." },
  { name:"Fall Armyworm",      severity:"Medium",  area:"5.1 km away", icon:"🐛", treatment:"Use Emamectin Benzoate 5% SG @ 0.4g/L. Early morning spray." },
];
const SOIL_ADVICE = {
  pH:6.4, N:280, P:45, K:180,
  recommendations:[
    "Apply 50 kg Urea per acre for Nitrogen",
    "Add 25 kg DAP for Phosphorus boost",
    "Soil pH is optimal for rice cultivation",
    "Consider green manure to improve organic matter",
  ],
};

// ─── Speak util ───────────────────────────────────────────────────────────────
async function speak(text) {
  try {
    const res  = await fetch("http://127.0.0.1:8000/speak", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({text}) });
    const blob = await res.blob();
    new Audio(URL.createObjectURL(blob)).play();
  } catch(e) { console.warn("speak:", e); }
}

// ─── AnimatedNumber ───────────────────────────────────────────────────────────
function AnimatedNumber({ target, duration=1200, suffix="" }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start=performance.now(), num=parseFloat(target)||0;
    const tick=(now)=>{ const e=Math.min((now-start)/duration,1), ease=1-Math.pow(1-e,3); setVal(Math.round(ease*num*10)/10); if(e<1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <span>{val}{suffix}</span>;
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────
function ProgressBar({ value, color="#22c55e", delay=0 }) {
  const [fill, setFill] = useState(0);
  useEffect(()=>{ const t=setTimeout(()=>setFill(value),delay+200); return ()=>clearTimeout(t); },[value,delay]);
  return (
    <div style={{ height:6, borderRadius:99, background:"#e5e7eb", overflow:"hidden" }}>
      <div style={{ height:"100%", borderRadius:99, background:`linear-gradient(90deg,${color}88,${color})`, width:`${fill}%`, transition:"width 1.2s cubic-bezier(.22,1,.36,1)" }} />
    </div>
  );
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────
function StatusBadge({ label, available }) {
  return (
    <span style={{ fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:99, background:available?"#dcfce7":"#fee2e2", color:available?"#16a34a":"#dc2626", display:"flex", alignItems:"center", gap:4 }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:available?"#22c55e":"#dc2626", display:"inline-block", animation:available?"pulse 2s infinite":"none" }} />
      {label}
    </span>
  );
}

// ─── OfflineBanner ────────────────────────────────────────────────────────────
function OfflineBanner({ t }) {
  return (
    <div className="animate-fadeUp" style={{ background:"linear-gradient(90deg,#f59e0b,#d97706)", color:"#fff", padding:"8px 16px", textAlign:"center", fontSize:13, fontWeight:700, letterSpacing:.5, position:"relative", zIndex:2 }}>
      📴 {t.offline}
    </div>
  );
}

// ─── MicButton ────────────────────────────────────────────────────────────────
function MicButton({ listening, onToggle, t }) {
  return (
    <button onClick={onToggle} className="ripple-container" style={{
      width:88, height:88, borderRadius:"50%", border:"none",
      background:listening?"linear-gradient(135deg,#ef4444,#dc2626)":"linear-gradient(135deg,#22c55e,#16a34a)",
      cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      boxShadow:listening?"0 0 0 12px rgba(239,68,68,.2),0 8px 32px rgba(239,68,68,.35)":"0 0 0 8px rgba(34,197,94,.18),0 8px 32px rgba(34,197,94,.28)",
      transition:"all .3s cubic-bezier(.34,1.56,.64,1)",
      transform:listening?"scale(1.1)":"scale(1)",
      animation:listening?"pulseDanger 1.2s ease-in-out infinite":"pulse 2.5s ease-in-out infinite",
    }}>
      {listening ? (
        <div style={{ display:"flex", gap:3, alignItems:"center", marginBottom:4 }}>
          {[0,1,2,3,4].map(i=><div key={i} className="wave-bar" style={{ height:8 }} />)}
        </div>
      ) : (
        <span style={{ fontSize:30, animation:"float 2.5s ease-in-out infinite" }}>🎤</span>
      )}
      <span style={{ color:"#fff", fontSize:10, fontWeight:800, marginTop:listening?0:2, letterSpacing:.3 }}>
        {listening ? t.listening : t.tapToSpeak}
      </span>
    </button>
  );
}

// ─── NavGrid ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key:"scanCrop",  emoji:"📷", color:"#8b5cf6" },
  { key:"weather",   emoji:"🌦️", color:"#0ea5e9" },
  { key:"advice",    emoji:"🌱", color:"#22c55e" },
  { key:"myFarm",    emoji:"📊", color:"#f59e0b" },
  { key:"market",    emoji:"💰", color:"#10b981" },
  { key:"soil",      emoji:"🧪", color:"#a16207" },
  { key:"irrigation",emoji:"💧", color:"#38bdf8" },
  { key:"fertilizer",emoji:"🌿", color:"#4ade80" },
  { key:"schemes",   emoji:"🏛️", color:"#6366f1" },
  { key:"community", emoji:"🤝", color:"#ec4899" },
  { key:"equipment", emoji:"🚜", color:"#f97316" },
  { key:"expert",    emoji:"📞", color:"#14b8a6" },
];

function NavGrid({ onSelect, t }) {
  const delays=["d0","d50","d1","d15","d2","d25","d3","d35","d4","d5","d6","d7"];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, padding:"0 4px" }}>
      {NAV_ITEMS.map(({ key, emoji, color }, idx) => (
        <button key={key} onClick={()=>onSelect(key)} className={`nav-btn animate-fadeUp ${delays[idx]}`}
          style={{ background:"rgba(255,255,255,.93)", border:`2px solid ${color}22`, borderRadius:18, padding:"14px 6px 12px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6, boxShadow:`0 2px 16px ${color}14`, fontFamily:"inherit", backdropFilter:"blur(8px)" }}>
          <div style={{ width:50, height:50, borderRadius:14, background:`linear-gradient(135deg,${color}20,${color}45)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, transition:"transform .2s ease" }}>
            {emoji}
          </div>
          <span style={{ fontSize:11, fontWeight:700, color:"#374151", textAlign:"center", lineHeight:1.3 }}>{t[key]||key}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Screen: Disease Detection ────────────────────────────────────────────────
function DiseaseScreen({ t }) {
  const [phase,setPhase]=useState("upload");
  const [result,setResult]=useState(null);
  const [progress,setProgress]=useState(0);
  const fileRef=useRef();

  const handleFile=(e)=>{
    if(!e.target.files[0])return;
    setPhase("analyzing"); setProgress(0);
    const iv=setInterval(()=>setProgress(p=>Math.min(p+3,95)),60);
    setTimeout(()=>{ clearInterval(iv); setProgress(100); const r=DISEASES[Math.floor(Math.random()*DISEASES.length)]; setResult(r); setPhase("result"); speak(`${r.name} ${r.confidence} శాతం నమ్మకంతో గుర్తించబడింది. ${r.treatment}`); },2600);
  };

  return (
    <div style={{ padding:"0 16px", position:"relative", zIndex:1 }}>
      <h2 className="animate-fadeUp" style={{ fontSize:20, fontWeight:800, color:"#1a2e0a", marginBottom:4, fontFamily:"'Playfair Display',serif" }}>📷 {t.scanCrop}</h2>

      {phase==="upload"&&(
        <div className="animate-fadeUp d1" onClick={()=>fileRef.current.click()}
          style={{ border:"3px dashed #22c55e", borderRadius:22, padding:"48px 24px", textAlign:"center", background:"rgba(240,253,244,.92)", backdropFilter:"blur(8px)", cursor:"pointer", marginTop:16, transition:"all .2s" }}
          onMouseEnter={e=>e.currentTarget.style.borderColor="#16a34a"} onMouseLeave={e=>e.currentTarget.style.borderColor="#22c55e"}>
          <div className="animate-float" style={{ fontSize:64 }}>📸</div>
          <p style={{ fontWeight:800, color:"#166534", marginTop:12, fontSize:16 }}>Take or Upload Crop Photo</p>
          <p style={{ color:"#4b7c4b", fontSize:13, marginTop:4 }}>Point camera at leaves, stems or roots</p>
          <div style={{ marginTop:16, display:"inline-flex", gap:8 }}>
            <span style={{ background:"#22c55e22", color:"#166534", borderRadius:99, padding:"4px 12px", fontSize:12, fontWeight:700 }}>🌿 Leaf</span>
            <span style={{ background:"#22c55e22", color:"#166534", borderRadius:99, padding:"4px 12px", fontSize:12, fontWeight:700 }}>🌱 Stem</span>
            <span style={{ background:"#22c55e22", color:"#166534", borderRadius:99, padding:"4px 12px", fontSize:12, fontWeight:700 }}>🌾 Roots</span>
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display:"none" }} onChange={handleFile}/>
        </div>
      )}

      {phase==="analyzing"&&(
        <div className="animate-scaleIn" style={{ textAlign:"center", padding:"40px 16px" }}>
          <div className="animate-spin" style={{ fontSize:60, display:"inline-block" }}>🔍</div>
          <p style={{ fontWeight:800, color:"#166634", marginTop:16, fontSize:16 }}>{t.analyzingCrop}</p>
          <div style={{ marginTop:20, borderRadius:99, background:"#dcfce7", overflow:"hidden", height:8 }}>
            <div style={{ height:"100%", borderRadius:99, background:"linear-gradient(90deg,#22c55e,#16a34a,#22c55e)", backgroundSize:"200% 100%", animation:"shimmer 1.2s linear infinite", width:`${progress}%`, transition:"width .3s ease" }}/>
          </div>
          <p style={{ fontSize:12, color:"#6b7280", marginTop:10 }}>EfficientNet CNN · {progress}%</p>
        </div>
      )}

      {phase==="result"&&result&&(
        <div className="animate-scaleIn" style={{ marginTop:16 }}>
          <div style={{ background:result.name==="Healthy Crop"?"linear-gradient(135deg,#dcfce7,#bbf7d0)":"linear-gradient(135deg,#fef3c7,#fde68a)", borderRadius:22, padding:20, border:`2px solid ${result.color}`, boxShadow:`0 8px 32px ${result.color}30` }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:44, animation:"float 2.5s ease-in-out infinite" }}>{result.icon}</span>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:11, color:"#6b7280", fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>{t.diseaseDetected}</p>
                <p style={{ fontSize:22, fontWeight:900, color:"#1a2e0a", fontFamily:"'Playfair Display',serif" }}>{result.name}</p>
              </div>
              <div style={{ background:"#fff", borderRadius:16, padding:"10px 14px", textAlign:"center", boxShadow:"0 4px 16px #0001" }}>
                <p style={{ fontSize:26, fontWeight:900, color:result.color }}><AnimatedNumber target={result.confidence} suffix="%"/></p>
                <p style={{ fontSize:10, color:"#6b7280", fontWeight:600 }}>{t.confidence}</p>
              </div>
            </div>
            <div style={{ marginTop:12 }}><ProgressBar value={result.confidence} color={result.color}/></div>
          </div>
          <div className="animate-fadeUp d2" style={{ background:"rgba(255,255,255,.95)", backdropFilter:"blur(8px)", borderRadius:18, padding:16, marginTop:12, border:"1px solid #e5e7eb", boxShadow:"0 4px 20px #0001" }}>
            <p style={{ fontWeight:800, color:"#1a2e0a", marginBottom:8, fontSize:15 }}>💊 {t.treatment}</p>
            <p style={{ color:"#374151", lineHeight:1.7, fontSize:14 }}>{result.treatment}</p>
            <button className="ripple-container" onClick={()=>speak(result.treatment)} style={{ marginTop:12, background:"linear-gradient(135deg,#22c55e,#16a34a)", color:"#fff", border:"none", borderRadius:12, padding:"10px 20px", fontWeight:700, cursor:"pointer", fontSize:14, fontFamily:"inherit", transition:"transform .15s,box-shadow .15s", boxShadow:"0 4px 16px #22c55e44" }}
              onMouseEnter={e=>e.currentTarget.style.transform="scale(1.04)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>🔊 Listen to Treatment</button>
          </div>
          <button onClick={()=>{setPhase("upload");setResult(null);}} style={{ width:"100%", marginTop:10, background:"rgba(243,244,246,.9)", border:"none", borderRadius:12, padding:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>📷 Scan Another Crop</button>
        </div>
      )}
    </div>
  );
}

// ─── Screen: Weather ──────────────────────────────────────────────────────────
function WeatherScreen({ t, farmer }) {
  useEffect(()=>{ speak(`ఈరోజు ఉష్ణోగ్రత ${WEATHER_DATA.today.temp} డిగ్రీలు ఉంది. తేమ ${WEATHER_DATA.today.humidity} శాతం ఉంది. రేపు భారీ వర్షం వచ్చే అవకాశం ఉంది.`); },[]);
  return (
    <div style={{ padding:"0 16px", position:"relative", zIndex:1 }}>
      <h2 className="animate-fadeUp" style={{ fontSize:20, fontWeight:800, color:"#1a2e0a", marginBottom:14, fontFamily:"'Playfair Display',serif" }}>🌦️ {t.weather}</h2>
      <div className="animate-scaleIn" style={{ background:"linear-gradient(135deg,#0369a1,#0ea5e9,#38bdf8)", backgroundSize:"200% 200%", animation:"bgShift 6s ease infinite", borderRadius:24, padding:24, color:"#fff", marginBottom:16, boxShadow:"0 12px 40px rgba(14,165,233,.35)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ fontSize:52, fontWeight:900, fontFamily:"'Playfair Display',serif" }}><AnimatedNumber target={WEATHER_DATA.today.temp} suffix="°C"/></p>
            <p style={{ fontSize:16, opacity:.92 }}>{WEATHER_DATA.today.condition}</p>
            <p style={{ fontSize:13, opacity:.7, marginTop:4 }}>{farmer?.village||"Your Farm"}</p>
          </div>
          <span style={{ fontSize:72, animation:"float 3s ease-in-out infinite" }}>{WEATHER_DATA.today.icon}</span>
        </div>
        <div style={{ display:"flex", gap:16, marginTop:16, paddingTop:16, borderTop:"1px solid rgba(255,255,255,.22)" }}>
          {[{label:"Humidity",value:`${WEATHER_DATA.today.humidity}%`,icon:"💧"},{label:"Wind",value:`${WEATHER_DATA.today.wind} km/h`,icon:"💨"},{label:"Rain",value:`${WEATHER_DATA.today.rain}%`,icon:"🌧️"}].map((item,i)=>(
            <div key={i} className={`animate-fadeUp d${i+1}`} style={{ flex:1, textAlign:"center", background:"rgba(255,255,255,.15)", borderRadius:12, padding:"8px 4px" }}>
              <p style={{ fontSize:18 }}>{item.icon}</p><p style={{ fontWeight:800, fontSize:15 }}>{item.value}</p><p style={{ fontSize:11, opacity:.7 }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8 }}>
        {WEATHER_DATA.forecast.map((d,i)=>(
          <div key={i} className={`card-hover animate-fadeUp d${i+1}`} style={{ minWidth:78, background:"rgba(255,255,255,.93)", backdropFilter:"blur(8px)", borderRadius:16, padding:12, textAlign:"center", border:"1px solid #e5e7eb", boxShadow:"0 2px 12px #0001", flexShrink:0 }}>
            <p style={{ fontSize:11, fontWeight:700, color:"#6b7280" }}>{d.day}</p>
            <span style={{ fontSize:26, display:"block", margin:"4px 0", animation:"float 3s ease-in-out infinite" }}>{d.icon}</span>
            <p style={{ fontWeight:900, fontSize:17, color:"#1a2e0a" }}>{d.temp}°</p>
            <p style={{ fontSize:10, color:"#0ea5e9", fontWeight:700 }}>{d.rain}%</p>
          </div>
        ))}
      </div>
      {WEATHER_DATA.forecast[0].rain>70&&(
        <div className="animate-fadeUp d5" style={{ background:"linear-gradient(135deg,#fef3c7,#fde68a)", borderRadius:16, padding:14, marginTop:12, border:"2px solid #f59e0b", animation:"pestBlink 2s ease-in-out infinite", display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:28 }}>⚠️</span>
          <div><p style={{ fontWeight:800, color:"#92400e", fontSize:14 }}>Rain Alert Tomorrow</p><p style={{ color:"#78350f", fontSize:12, marginTop:2 }}>Avoid irrigation. Heavy rain expected. Protect harvested crops.</p></div>
        </div>
      )}
    </div>
  );
}

// ─── Screen: Market Prices ────────────────────────────────────────────────────
function MarketScreen({ t }) {
  return (
    <div style={{ padding:"0 16px", position:"relative", zIndex:1 }}>
      <h2 className="animate-fadeUp" style={{ fontSize:20, fontWeight:800, color:"#1a2e0a", marginBottom:4, fontFamily:"'Playfair Display',serif" }}>💰 {t.market}</h2>
      <p className="animate-fadeUp d1" style={{ color:"#6b7280", fontSize:12, marginBottom:14, display:"flex", alignItems:"center", gap:6 }}>
        <span style={{ width:7, height:7, borderRadius:"50%", background:"#22c55e", display:"inline-block", animation:"pulse 1.5s infinite" }}/>Live Mandi Prices · Updated Today
      </p>
      {MARKET_DATA.map((item,i)=>(
        <div key={i} className={`card-hover animate-fadeUp d${i}`} style={{ background:"rgba(255,255,255,.93)", backdropFilter:"blur(8px)", borderRadius:18, padding:"14px 16px", marginBottom:10, border:"1px solid #f0f0f0", display:"flex", alignItems:"center", gap:12, boxShadow:"0 2px 12px #0001" }}>
          <div style={{ width:46, height:46, borderRadius:14, background:item.trend==="up"?"linear-gradient(135deg,#dcfce7,#bbf7d0)":"linear-gradient(135deg,#fee2e2,#fecaca)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
            {item.trend==="up"?"📈":"📉"}
          </div>
          <div style={{ flex:1 }}><p style={{ fontWeight:800, color:"#1a2e0a", fontSize:16 }}>{item.crop}</p><p style={{ fontSize:11, color:"#6b7280" }}>{item.unit}</p></div>
          <div style={{ textAlign:"right" }}>
            <p style={{ fontWeight:900, fontSize:18, color:"#1a2e0a" }}>₹<AnimatedNumber target={item.price} duration={900}/></p>
            <p style={{ fontSize:12, fontWeight:700, color:item.trend==="up"?"#16a34a":"#dc2626" }}>{item.trend==="up"?"▲":"▼"} ₹{Math.abs(item.change)}</p>
          </div>
        </div>
      ))}
      <div className="animate-fadeUp d6" style={{ background:"linear-gradient(135deg,#052e16,#166534)", borderRadius:18, padding:18, marginTop:8, color:"#fff", boxShadow:"0 8px 32px #22c55e22" }}>
        <p style={{ fontWeight:800, fontSize:14, marginBottom:8 }}>🤖 AI Price Prediction</p>
        <p style={{ fontSize:13, lineHeight:1.6, opacity:.9 }}>Tomato prices expected to rise 30% next week. Good time to hold stock if possible.</p>
        <button onClick={()=>speak("టమాటా ధరలు వచ్చే వారం 30 శాతం పెరిగే అవకాశం ఉంది. నిల్వ ఉంచితే మంచి లాభం వస్తుంది.")} style={{ marginTop:10, background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.3)", color:"#fff", borderRadius:10, padding:"8px 16px", fontWeight:700, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>🔊 Listen</button>
      </div>
    </div>
  );
}

// ─── Screen: Schemes ──────────────────────────────────────────────────────────
function SchemesScreen({ t }) {
  return (
    <div style={{ padding:"0 16px", position:"relative", zIndex:1 }}>
      <h2 className="animate-fadeUp" style={{ fontSize:20, fontWeight:800, color:"#1a2e0a", marginBottom:16, fontFamily:"'Playfair Display',serif" }}>🏛️ {t.schemes}</h2>
      {SCHEMES.map((s,i)=>(
        <div key={i} className={`card-hover animate-fadeUp d${i+1}`} style={{ background:"rgba(255,255,255,.93)", backdropFilter:"blur(8px)", borderRadius:20, padding:16, marginBottom:12, border:`1.5px solid ${s.color}22`, boxShadow:`0 4px 20px ${s.color}10` }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
            <div style={{ width:48, height:48, borderRadius:14, background:`linear-gradient(135deg,${s.color}22,${s.color}44)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, animation:"float 3s ease-in-out infinite" }}>{s.icon}</div>
            <div><p style={{ fontWeight:800, color:"#1a2e0a", fontSize:16 }}>{s.name}</p><p style={{ fontSize:13, color:s.color, fontWeight:700 }}>{s.amount}</p></div>
          </div>
          <p style={{ color:"#374151", fontSize:13, lineHeight:1.6 }}>{s.desc}</p>
          <p style={{ fontSize:12, color:"#6b7280", marginTop:6 }}>✅ Eligible: {s.eligible}</p>
          <div style={{ display:"flex", gap:8, marginTop:10 }}>
            <button onClick={()=>speak(`${s.name} పథకం. ${s.desc}. అర్హత: ${s.eligible}`)} style={{ flex:1, background:"#f0fdf4", border:"1px solid #22c55e", borderRadius:10, padding:8, fontWeight:700, cursor:"pointer", fontSize:12, color:"#166534", fontFamily:"inherit" }}>🔊 Listen</button>
            <button className="ripple-container" style={{ flex:1, background:`linear-gradient(135deg,${s.color},${s.color}cc)`, border:"none", borderRadius:10, padding:8, fontWeight:700, cursor:"pointer", fontSize:12, color:"#fff", fontFamily:"inherit" }}>Apply Now →</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Screen: Soil Health ──────────────────────────────────────────────────────
function SoilScreen({ t }) {
  const [showResult,setShowResult]=useState(false);
  const [ph,setph]=useState(""); const [n,setn]=useState(""); const [p,setp]=useState(""); const [k,setk]=useState("");
  const analyze=()=>{ setShowResult(true); speak("మీ నేల పీహెచ్ 6.4 ఉంది. ఇది వరి పంటకు చాలా మంచిది. ప్రతి ఎకరాకు 50 కిలోల యూరియా మరియు 25 కిలోల DAP వేయండి."); };
  const metrics=[
    { label:"pH",        value:SOIL_ADVICE.pH,         color:"#22c55e", fill:64, status:"Optimal"  },
    { label:"Nitrogen",  value:SOIL_ADVICE.N+" kg/ha", color:"#f59e0b", fill:56, status:"Low"      },
    { label:"Phosphorus",value:SOIL_ADVICE.P+" kg/ha", color:"#0ea5e9", fill:78, status:"Adequate" },
    { label:"Potassium", value:SOIL_ADVICE.K+" kg/ha", color:"#8b5cf6", fill:72, status:"Good"     },
  ];
  return (
    <div style={{ padding:"0 16px", position:"relative", zIndex:1 }}>
      <h2 className="animate-fadeUp" style={{ fontSize:20, fontWeight:800, color:"#1a2e0a", marginBottom:16, fontFamily:"'Playfair Display',serif" }}>🧪 {t.soil}</h2>
      {!showResult?(
        <div className="animate-fadeUp">
          <p style={{ color:"#6b7280", fontSize:13, marginBottom:16 }}>Enter your soil test report values:</p>
          {[["pH Level",ph,setph,"6.5"],["Nitrogen (kg/ha)",n,setn,"240"],["Phosphorus (kg/ha)",p,setp,"40"],["Potassium (kg/ha)",k,setk,"160"]].map(([label,val,setter,pl],i)=>(
            <div key={i} className={`animate-fadeUp d${i+1}`} style={{ marginBottom:12 }}>
              <label style={{ fontSize:13, fontWeight:700, color:"#374151", display:"block", marginBottom:4 }}>{label}</label>
              <input type="number" value={val} onChange={e=>setter(e.target.value)} placeholder={pl}
                style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:"2px solid #e5e7eb", fontSize:16, outline:"none", boxSizing:"border-box", transition:"border-color .2s", fontFamily:"inherit", background:"rgba(255,255,255,.9)" }}
                onFocus={e=>e.target.style.borderColor="#22c55e"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
            </div>
          ))}
          <button onClick={analyze} className="ripple-container" style={{ width:"100%", background:"linear-gradient(135deg,#22c55e,#16a34a)", color:"#fff", border:"none", borderRadius:14, padding:14, fontWeight:800, cursor:"pointer", fontSize:16, marginTop:8, fontFamily:"inherit", boxShadow:"0 6px 24px #22c55e44" }}>🔬 Analyze Soil</button>
          <button onClick={()=>{setph("6.4");setn("280");setp("45");setk("180");}} style={{ width:"100%", marginTop:8, background:"rgba(243,244,246,.9)", border:"none", borderRadius:12, padding:12, fontWeight:700, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>Load Sample Data</button>
        </div>
      ):(
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
            {metrics.map((m,i)=>(
              <div key={i} className={`animate-fadeUp d${i+1}`} style={{ background:"rgba(255,255,255,.93)", backdropFilter:"blur(8px)", borderRadius:18, padding:14, border:`1.5px solid ${m.color}22`, boxShadow:`0 4px 16px ${m.color}10` }}>
                <p style={{ fontSize:11, color:"#6b7280", fontWeight:700, marginBottom:4 }}>{m.label}</p>
                <p style={{ fontSize:20, fontWeight:900, color:"#1a2e0a", marginBottom:6 }}>{m.value}</p>
                <ProgressBar value={m.fill} color={m.color} delay={i*100}/>
                <span style={{ fontSize:11, fontWeight:700, color:m.color, marginTop:6, display:"block" }}>{m.status}</span>
              </div>
            ))}
          </div>
          <div className="animate-fadeUp d5" style={{ background:"rgba(255,255,255,.93)", backdropFilter:"blur(8px)", borderRadius:18, padding:16, border:"1px solid #e5e7eb" }}>
            <p style={{ fontWeight:800, color:"#1a2e0a", marginBottom:10 }}>💡 AI Recommendations</p>
            {SOIL_ADVICE.recommendations.map((r,i)=>(
              <div key={i} className={`animate-fadeUp d${i+1}`} style={{ display:"flex", gap:8, marginBottom:10, alignItems:"flex-start" }}>
                <span style={{ color:"#22c55e", fontWeight:700, marginTop:1 }}>✓</span>
                <p style={{ fontSize:13, color:"#374151", lineHeight:1.5 }}>{r}</p>
              </div>
            ))}
            <button onClick={()=>speak(SOIL_ADVICE.recommendations.join(". "))} style={{ marginTop:8, background:"linear-gradient(135deg,#22c55e,#16a34a)", color:"#fff", border:"none", borderRadius:10, padding:"10px 20px", fontWeight:700, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 4px 16px #22c55e33" }}>🔊 Listen to Advice</button>
          </div>
          <button onClick={()=>setShowResult(false)} style={{ width:"100%", marginTop:10, background:"rgba(243,244,246,.9)", border:"none", borderRadius:12, padding:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>← New Analysis</button>
        </div>
      )}
    </div>
  );
}

// ─── Screen: My Farm Dashboard ────────────────────────────────────────────────
function DashboardScreen({ t, farmer, yieldPrediction }) {
  const metrics=[
    { label:"Yield Prediction", value:`${yieldPrediction||"—"}`, unit:"tons/ha", icon:"🌾", color:"#22c55e", change:"+12%" },
    { label:"Crop Health",      value:"82",                       unit:"% score",  icon:"💚", color:"#10b981", change:"Good" },
    { label:"Soil Status",      value:"Moderate",                 unit:"NPK",       icon:"🧪", color:"#f59e0b", change:"Needs care" },
    { label:"Weather Risk",     value:"Low",                      unit:"7 days",    icon:"🌦️", color:"#0ea5e9", change:"Rain tmrw" },
  ];
  return (
    <div style={{ padding:"0 16px", position:"relative", zIndex:1 }}>
      <h2 className="animate-fadeUp" style={{ fontSize:20, fontWeight:800, color:"#1a2e0a", marginBottom:4, fontFamily:"'Playfair Display',serif" }}>📊 {t.myFarm}</h2>
      {farmer&&<p className="animate-fadeUp d1" style={{ color:"#6b7280", fontSize:13, marginBottom:14 }}>👨‍🌾 {farmer.name} · {farmer.primaryCrop} · {farmer.farmSize} acres</p>}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
        {metrics.map((m,i)=>(
          <div key={i} className={`animate-fadeUp d${i+1}`} style={{ background:"rgba(255,255,255,.93)", backdropFilter:"blur(8px)", borderRadius:20, padding:14, border:`1.5px solid ${m.color}22`, boxShadow:`0 4px 20px ${m.color}10` }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <span style={{ fontSize:22, animation:"float 3s ease-in-out infinite" }}>{m.icon}</span>
              <p style={{ fontSize:10, color:"#6b7280", fontWeight:700, lineHeight:1.2 }}>{m.label}</p>
            </div>
            <p style={{ fontSize:22, fontWeight:900, color:"#1a2e0a" }}>{m.value}</p>
            <p style={{ fontSize:11, color:"#9ca3af", marginBottom:4 }}>{m.unit}</p>
            <span style={{ fontSize:11, color:m.color, fontWeight:700 }}>{m.change}</span>
          </div>
        ))}
      </div>
      <div className="animate-fadeUp d5" style={{ background:"linear-gradient(135deg,#fef3c7,#fde68a)", borderRadius:18, padding:14, border:"2px solid #f59e0b", animation:"pestBlink 2.5s ease-in-out infinite", marginBottom:12, display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}>
        <span style={{ fontSize:28 }}>⚠️</span>
        <div><p style={{ fontWeight:800, color:"#92400e", fontSize:14 }}>{t.pestAlert}</p><p style={{ color:"#78350f", fontSize:12, marginTop:2 }}>{PEST_DATA[0].name} · {PEST_DATA[0].area}</p></div>
      </div>
      <div className="animate-fadeUp d6" style={{ background:"rgba(255,255,255,.93)", backdropFilter:"blur(8px)", borderRadius:18, padding:16, border:"1px solid #e5e7eb" }}>
        <p style={{ fontWeight:800, color:"#1a2e0a", marginBottom:12, fontSize:15 }}>📅 Today's Recommendations</p>
        {[{icon:"💧",text:"No irrigation needed today. Rain expected tomorrow."},{icon:"🌿",text:"Apply second dose of urea this week."},{icon:"🔍",text:"Inspect crop for signs of leaf blast."}].map((r,i)=>(
          <div key={i} className={`animate-fadeUp d${i+1}`} style={{ display:"flex", gap:10, marginBottom:12, alignItems:"flex-start", padding:"10px 12px", background:"rgba(249,250,251,.9)", borderRadius:12 }}>
            <span style={{ fontSize:20, animation:"float 3s ease-in-out infinite" }}>{r.icon}</span>
            <p style={{ fontSize:13, color:"#374151", lineHeight:1.5 }}>{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Screen: Expert ───────────────────────────────────────────────────────────
function ExpertScreen({ t }) {
  return (
    <div style={{ padding:"0 16px", position:"relative", zIndex:1 }}>
      <h2 className="animate-fadeUp" style={{ fontSize:20, fontWeight:800, color:"#1a2e0a", marginBottom:16, fontFamily:"'Playfair Display',serif" }}>📞 {t.expert}</h2>
      {[{name:"Dr. Ravi Kumar",role:"Plant Pathologist",rating:4.8,available:true},{name:"Priya Nair",role:"Soil Scientist",rating:4.6,available:true},{name:"Mahesh Rao",role:"Agriculture Officer",rating:4.9,available:false}].map((expert,i)=>(
        <div key={i} className={`card-hover animate-fadeUp d${i+1}`} style={{ background:"rgba(255,255,255,.93)", backdropFilter:"blur(8px)", borderRadius:20, padding:16, marginBottom:12, border:"1px solid #e5e7eb", boxShadow:"0 4px 20px #0001" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:52, height:52, borderRadius:16, background:"linear-gradient(135deg,#22c55e22,#22c55e44)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>👨‍🔬</div>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:800, color:"#1a2e0a" }}>{expert.name}</p>
              <p style={{ fontSize:12, color:"#6b7280" }}>{expert.role}</p>
              <p style={{ fontSize:12, color:"#f59e0b", fontWeight:700 }}>⭐ {expert.rating}</p>
            </div>
            <StatusBadge label={expert.available?"Available":"Offline"} available={expert.available}/>
          </div>
          <div style={{ display:"flex", gap:8, marginTop:12 }}>
            <button className="ripple-container" style={{ flex:1, background:"linear-gradient(135deg,#22c55e,#16a34a)", color:"#fff", border:"none", borderRadius:10, padding:10, fontWeight:700, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>📞 Call</button>
            <button className="ripple-container" style={{ flex:1, background:"#25D366", color:"#fff", border:"none", borderRadius:10, padding:10, fontWeight:700, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>💬 WhatsApp</button>
            <button style={{ flex:1, background:"rgba(243,244,246,.9)", color:"#374151", border:"none", borderRadius:10, padding:10, fontWeight:700, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>📋 Request</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Screen: Advice ───────────────────────────────────────────────────────────
function AdviceScreen({ t, farmer }) {
  return (
    <div style={{ padding:"0 16px", position:"relative", zIndex:1 }}>
      <h2 className="animate-fadeUp" style={{ fontSize:20, fontWeight:800, color:"#1a2e0a", marginBottom:16, fontFamily:"'Playfair Display',serif" }}>🌱 {t.advice}</h2>
      <div className="animate-fadeUp d1" style={{ background:"rgba(239,246,255,.95)", backdropFilter:"blur(8px)", borderRadius:20, padding:16, marginBottom:12, border:"2px solid #3b82f6", boxShadow:"0 4px 20px #3b82f620" }}>
        <p style={{ fontWeight:800, color:"#1e3a8a", fontSize:15, marginBottom:8 }}>💧 Irrigation Schedule</p>
        <p style={{ fontSize:14, color:"#1d4ed8", lineHeight:1.6 }}>🌧️ Heavy rain expected tomorrow. <strong>Skip irrigation today and tomorrow.</strong> Next: Thursday, 30 min for rice.</p>
        <button onClick={()=>speak("ఈరోజు మరియు రేపు నీటిపారుదల అవసరం లేదు. రేపు భారీ వర్షం వచ్చే అవకాశం ఉంది.")} style={{ marginTop:10, background:"#3b82f6", color:"#fff", border:"none", borderRadius:10, padding:"8px 16px", fontWeight:700, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>🔊 Listen</button>
      </div>
      <div className="animate-fadeUp d2" style={{ background:"rgba(240,253,244,.95)", backdropFilter:"blur(8px)", borderRadius:20, padding:16, marginBottom:12, border:"2px solid #22c55e" }}>
        <p style={{ fontWeight:800, color:"#166534", fontSize:15, marginBottom:10 }}>🌿 {t.fertilizer}</p>
        {[{name:"Urea",amount:"50 kg/acre",purpose:"Nitrogen boost"},{name:"DAP",amount:"25 kg/acre",purpose:"Phosphorus"},{name:"MOP",amount:"20 kg/acre",purpose:"Potassium"}].map((f,i)=>(
          <div key={i} style={{ display:"flex", justifyContent:"space-between", marginBottom:6, background:"rgba(255,255,255,.8)", borderRadius:10, padding:"8px 12px" }}>
            <span style={{ fontWeight:700, color:"#166534" }}>{f.name}</span>
            <span style={{ fontWeight:600, color:"#374151" }}>{f.amount}</span>
            <span style={{ fontSize:12, color:"#6b7280" }}>{f.purpose}</span>
          </div>
        ))}
      </div>
      <div className="animate-fadeUp d3" style={{ background:"rgba(253,244,255,.95)", backdropFilter:"blur(8px)", borderRadius:20, padding:16, border:"2px solid #a855f7" }}>
        <p style={{ fontWeight:800, color:"#6b21a8", fontSize:15, marginBottom:8 }}>🔄 {t.rotation}</p>
        <p style={{ fontSize:13, color:"#374151", lineHeight:1.6, marginBottom:10 }}>After rice harvest, consider <strong>Green Gram</strong> or <strong>Black Gram</strong>. These legumes restore nitrogen and improve soil fertility.</p>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {["Green Gram","Black Gram","Sunflower"].map((crop,i)=>(
            <span key={i} style={{ background:"#a855f722", color:"#7e22ce", borderRadius:99, padding:"6px 14px", fontSize:12, fontWeight:700 }}>{crop}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Community ────────────────────────────────────────────────────────
function CommunityScreen({ t }) {
  const posts=[
    { farmer:"Ramu Yadav",  village:"Nalgonda",  time:"2h ago", text:"My rice plants are turning yellow. Anyone knows the reason?", image:"🌾", likes:12, replies:8  },
    { farmer:"Sita Devi",   village:"Warangal",  time:"5h ago", text:"Got great yield this season using drip irrigation!",           image:"💧", likes:45, replies:15 },
    { farmer:"Krishnaiah",  village:"Karimnagar", time:"1d ago", text:"Brown spot disease found in my cotton farm. Used Propiconazole spray. Helped a lot!", image:"🌿", likes:30, replies:22 },
  ];
  return (
    <div style={{ padding:"0 16px", position:"relative", zIndex:1 }}>
      <h2 className="animate-fadeUp" style={{ fontSize:20, fontWeight:800, color:"#1a2e0a", marginBottom:12, fontFamily:"'Playfair Display',serif" }}>🤝 {t.community}</h2>
      <div className="animate-fadeUp d1" style={{ display:"flex", gap:8, marginBottom:16 }}>
        <button className="ripple-container" style={{ flex:1, background:"linear-gradient(135deg,#22c55e,#16a34a)", color:"#fff", border:"none", borderRadius:12, padding:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 4px 16px #22c55e33" }}>+ Post Question</button>
        <button style={{ flex:1, background:"rgba(240,253,244,.9)", border:"2px solid #22c55e", color:"#166534", borderRadius:12, padding:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>📷 Share Photo</button>
      </div>
      {posts.map((post,i)=>(
        <div key={i} className={`card-hover animate-fadeUp d${i+1}`} style={{ background:"rgba(255,255,255,.93)", backdropFilter:"blur(8px)", borderRadius:20, padding:16, marginBottom:12, border:"1px solid #e5e7eb", boxShadow:"0 4px 16px #0001" }}>
          <div style={{ display:"flex", gap:10, marginBottom:10 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, animation:"float 3s ease-in-out infinite" }}>{post.image}</div>
            <div><p style={{ fontWeight:700, color:"#1a2e0a", fontSize:14 }}>{post.farmer}</p><p style={{ fontSize:11, color:"#9ca3af" }}>{post.village} · {post.time}</p></div>
          </div>
          <p style={{ fontSize:14, color:"#374151", lineHeight:1.6 }}>{post.text}</p>
          <div style={{ display:"flex", gap:16, marginTop:12, paddingTop:10, borderTop:"1px solid #f0f0f0" }}>
            <button style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:"#6b7280", fontWeight:600, transition:"transform .15s" }} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.15)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>👍 {post.likes}</button>
            <button style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:"#6b7280", fontWeight:600 }}>💬 {post.replies}</button>
            <button style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:"#6b7280", fontWeight:600 }}>📤 Share</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Screen: Equipment ────────────────────────────────────────────────────────
function EquipmentScreen({ t }) {
  const items=[
    { name:"Tractor (45HP)",    owner:"Venkat Farms",  price:"₹800/hr",   available:true,  distance:"2.1 km", icon:"🚜" },
    { name:"Combine Harvester", owner:"Reddy Brothers", price:"₹2,500/hr", available:true,  distance:"5.4 km", icon:"🌾" },
    { name:"Sprayer Pump",      owner:"Rao Equipment",  price:"₹200/hr",   available:false, distance:"1.2 km", icon:"💨" },
    { name:"Rotavator",         owner:"Krishna Agri",   price:"₹600/hr",   available:true,  distance:"3.8 km", icon:"⚙️" },
  ];
  return (
    <div style={{ padding:"0 16px", position:"relative", zIndex:1 }}>
      <h2 className="animate-fadeUp" style={{ fontSize:20, fontWeight:800, color:"#1a2e0a", marginBottom:4, fontFamily:"'Playfair Display',serif" }}>🚜 {t.equipment}</h2>
      <p className="animate-fadeUp d1" style={{ fontSize:13, color:"#6b7280", marginBottom:14 }}>Nearby Available Equipment</p>
      {items.map((item,i)=>(
        <div key={i} className={`card-hover animate-fadeUp d${i+1}`} style={{ background:"rgba(255,255,255,.93)", backdropFilter:"blur(8px)", borderRadius:20, padding:16, marginBottom:12, border:"1px solid #e5e7eb" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:54, height:54, borderRadius:16, background:"#fff7ed", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, animation:"float 3s ease-in-out infinite" }}>{item.icon}</div>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:800, color:"#1a2e0a", fontSize:15 }}>{item.name}</p>
              <p style={{ fontSize:12, color:"#6b7280" }}>{item.owner} · 📍 {item.distance}</p>
              <p style={{ fontWeight:700, color:"#f97316", fontSize:15, marginTop:2 }}>{item.price}</p>
            </div>
            <StatusBadge label={item.available?"Available":"Booked"} available={item.available}/>
          </div>
          {item.available&&<button className="ripple-container" style={{ width:"100%", marginTop:12, background:"linear-gradient(135deg,#f97316,#ea580c)", color:"#fff", border:"none", borderRadius:12, padding:10, fontWeight:700, cursor:"pointer", fontSize:14, fontFamily:"inherit", boxShadow:"0 4px 16px #f9731633" }}>Book Now</button>}
        </div>
      ))}
    </div>
  );
}

// ─── Onboarding ────────────────────────────────────────────────────────────────
function OnboardingScreen({ onComplete, t }) {
  const [step,setStep]=useState(0);
  const [form,setForm]=useState({ name:"", phone:"", village:"", district:"", state:"Telangana", language:"te", farmSize:"", soilType:"Red", primaryCrop:"Rice" });
  const steps=[
    { title:"Welcome to KisanAI 🌱", subtitle:"Your smart farming assistant. Let's set up your profile.",
      fields:[{key:"name",label:"Your Name",type:"text",placeholder:"Enter your name"},{key:"phone",label:"Phone Number",type:"tel",placeholder:"+91 XXXXXXXXXX"}] },
    { title:"Your Location 📍", subtitle:"We'll give you local weather and mandi prices.",
      fields:[{key:"village",label:"Village / Town",type:"text",placeholder:"Your village"},{key:"district",label:"District",type:"text",placeholder:"Your district"},{key:"state",label:"State",type:"select",options:["Telangana","Andhra Pradesh","Maharashtra","Punjab","Karnataka","Tamil Nadu"]}] },
    { title:"Your Farm 🌾", subtitle:"Tell us about your farm for personalized advice.",
      fields:[{key:"farmSize",label:"Farm Size (Acres)",type:"number",placeholder:"e.g. 3.5"},{key:"soilType",label:"Soil Type",type:"select",options:["Red","Black (Clay)","Sandy","Loamy","Alluvial"]},{key:"primaryCrop",label:"Primary Crop",type:"select",options:["Rice","Wheat","Cotton","Maize","Tomato","Onion","Sugarcane","Groundnut"]},{key:"language",label:"Preferred Language",type:"select",options:[{v:"te",l:"Telugu"},{v:"hi",l:"Hindi"},{v:"en",l:"English"}]}] },
  ];
  const current=steps[step], isLast=step===steps.length-1;
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#052e16 0%,#166534 50%,#15803d 100%)", backgroundSize:"200% 200%", animation:"bgShift 8s ease infinite", display:"flex", flexDirection:"column", padding:"40px 24px 32px", fontFamily:"'Plus Jakarta Sans',sans-serif", position:"relative", zIndex:1 }}>
      <div className="animate-fadeUp" style={{ textAlign:"center", marginBottom:28 }}>
        <div className="animate-float" style={{ fontSize:64, marginBottom:10 }}>🌾</div>
        <h1 style={{ color:"#fff", fontSize:30, fontWeight:900, fontFamily:"'Playfair Display',serif", letterSpacing:-.5 }}>KisanAI</h1>
        <p style={{ color:"#86efac", fontSize:14, marginTop:4 }}>Smart Farming Assistant</p>
      </div>
      <div className="animate-scaleIn" style={{ background:"rgba(255,255,255,.96)", backdropFilter:"blur(16px)", borderRadius:28, padding:24, flex:1, boxShadow:"0 24px 64px rgba(0,0,0,.25)" }}>
        <div style={{ display:"flex", gap:6, marginBottom:20 }}>
          {steps.map((_,i)=>(
            <div key={i} style={{ flex:1, height:5, borderRadius:99, background:i<=step?"linear-gradient(90deg,#22c55e,#16a34a)":"#e5e7eb", transition:"background .4s ease", boxShadow:i<=step?"0 2px 8px #22c55e55":"none" }}/>
          ))}
        </div>
        <h2 style={{ fontSize:20, fontWeight:800, color:"#1a2e0a", marginBottom:4, fontFamily:"'Playfair Display',serif" }}>{current.title}</h2>
        <p style={{ color:"#6b7280", fontSize:13, marginBottom:20 }}>{current.subtitle}</p>
        {current.fields.map(field=>(
          <div key={field.key} style={{ marginBottom:14 }}>
            <label style={{ display:"block", fontSize:13, fontWeight:700, color:"#374151", marginBottom:4 }}>{field.label}</label>
            {field.type==="select"?(
              <select value={form[field.key]} onChange={e=>setForm(p=>({...p,[field.key]:e.target.value}))} style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:"2px solid #e5e7eb", fontSize:15, outline:"none", background:"#fff", fontFamily:"inherit" }}>
                {field.options.map(opt=>typeof opt==="string"?<option key={opt} value={opt}>{opt}</option>:<option key={opt.v} value={opt.v}>{opt.l}</option>)}
              </select>
            ):(
              <input type={field.type} value={form[field.key]} onChange={e=>setForm(p=>({...p,[field.key]:e.target.value}))} placeholder={field.placeholder}
                style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:"2px solid #e5e7eb", fontSize:15, outline:"none", boxSizing:"border-box", fontFamily:"inherit", transition:"border-color .2s" }}
                onFocus={e=>e.target.style.borderColor="#22c55e"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
            )}
          </div>
        ))}
        <div style={{ display:"flex", gap:10, marginTop:12 }}>
          {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{ flex:1, background:"#f3f4f6", border:"none", borderRadius:14, padding:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>← Back</button>}
          <button className="ripple-container" onClick={()=>isLast?onComplete(form):setStep(s=>s+1)} style={{ flex:2, background:"linear-gradient(135deg,#22c55e,#16a34a)", color:"#fff", border:"none", borderRadius:14, padding:14, fontWeight:800, cursor:"pointer", fontSize:16, fontFamily:"inherit", boxShadow:"0 6px 24px #22c55e44" }}>
            {isLast?"🚀 Start Farming →":"Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Voice Overlay ─────────────────────────────────────────────────────────────
function VoiceOverlay({ onClose, t, lang, onNavigate }) {
  const [transcript,setTranscript]=useState("");
  const [response,setResponse]=useState("");
  const [listening,setListening]=useState(false);
  const recRef=useRef(null);

  const processCommand=(text)=>{
    const lower=text.toLowerCase(); let resp="", nav=null;
    if(lower.includes("weather")||lower.includes("rain")||lower.includes("వాతావరణం")||lower.includes("వర్షం")){ resp="ఈరోజు ఉష్ణోగ్రత 32 డిగ్రీలు ఉంది. రేపు భారీ వర్షం వచ్చే అవకాశం ఉంది."; nav="weather"; }
    else if(lower.includes("disease")||lower.includes("scan")||lower.includes("వ్యాధి")||lower.includes("పంట")){ resp="పంట వ్యాధి స్కానర్ తెరవబడుతోంది."; nav="scanCrop"; }
    else if(lower.includes("price")||lower.includes("market")||lower.includes("ధర")||lower.includes("మార్కెట్")){ resp="ఈరోజు వరి ధర క్వింటాల్ కు 2180 రూపాయలు ఉంది."; nav="market"; }
    else if(lower.includes("scheme")||lower.includes("government")||lower.includes("పథకం")){ resp="పి ఎం కిసాన్ పథకం ద్వారా రైతులకు సంవత్సరానికి 6000 రూపాయలు అందుతాయి."; nav="schemes"; }
    else if(lower.includes("soil")||lower.includes("fertilizer")||lower.includes("నేల")||lower.includes("ఎరువు")){ resp="నేల ఆరోగ్య విశ్లేషణ తెరవబడుతోంది."; nav="soil"; }
    else{ resp="నేను వాతావరణం, పంట వ్యాధులు, మార్కెట్ ధరలు, ప్రభుత్వ పథకాలు మరియు నేల ఆరోగ్యంపై సహాయం చేయగలను."; }
    setResponse(resp); speak(resp);
    if(nav) setTimeout(()=>{ onNavigate(nav); onClose(); },2500);
  };

  const startListening=()=>{
    if(!("webkitSpeechRecognition" in window||"SpeechRecognition" in window)){ setResponse("Voice recognition not supported."); return; }
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    const rec=new SR();
    rec.lang=lang==="hi"?"hi-IN":lang==="te"?"te-IN":"en-IN";
    rec.interimResults=false;
    rec.onresult=e=>{ const text=e.results[0][0].transcript; setTranscript(text); setListening(false); processCommand(text); };
    rec.onerror=()=>setListening(false); rec.onend=()=>setListening(false);
    recRef.current=rec; rec.start(); setListening(true); setTranscript(""); setResponse("");
  };

  useEffect(()=>{ speak(lang==="te"?"నమస్కారం రైతు గారు. నేను కిసాన్ AI. మీకు ఎలా సహాయం చేయాలి?":t.greeting); },[]);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:999, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      {/* Dark backdrop that lets canvas crops show through */}
      <div style={{ position:"absolute", inset:0, background:"rgba(5,46,22,.85)", backdropFilter:"blur(3px)" }}/>

      <button onClick={onClose} style={{ position:"absolute", top:20, right:20, background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.25)", borderRadius:12, padding:"8px 14px", color:"#fff", fontWeight:700, cursor:"pointer", fontSize:16, backdropFilter:"blur(8px)", zIndex:2 }}>✕</button>

      <div style={{ position:"relative", zIndex:2, display:"flex", flexDirection:"column", alignItems:"center" }}>
        <div className="animate-float" style={{ fontSize:64, marginBottom:8 }}>🌾</div>
        <h2 style={{ color:"#fff", fontSize:26, fontWeight:900, marginBottom:4, fontFamily:"'Playfair Display',serif" }}>KisanAI</h2>
        <p style={{ color:"#86efac", fontSize:14, marginBottom:32 }}>Your Smart Farming Assistant</p>

        {transcript&&(
          <div className="animate-scaleIn" style={{ background:"rgba(255,255,255,.12)", backdropFilter:"blur(12px)", borderRadius:16, padding:"12px 18px", marginBottom:14, maxWidth:320, width:"100%", textAlign:"center", border:"1px solid rgba(255,255,255,.2)" }}>
            <p style={{ color:"#d1fae5", fontSize:14 }}>You said: <strong>"{transcript}"</strong></p>
          </div>
        )}
        {response&&(
          <div className="animate-scaleIn" style={{ background:"rgba(34,197,94,.2)", backdropFilter:"blur(12px)", border:"1px solid rgba(34,197,94,.5)", borderRadius:16, padding:"12px 18px", marginBottom:28, maxWidth:320, width:"100%", textAlign:"center" }}>
            <p style={{ color:"#dcfce7", fontSize:14, lineHeight:1.6 }}>{response}</p>
          </div>
        )}

        <MicButton listening={listening} onToggle={startListening} t={t}/>
        <p style={{ color:"rgba(255,255,255,.5)", fontSize:12, marginTop:24, textAlign:"center" }}>Try: "Check weather" · "Scan my crop" · "Market prices"</p>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,         setScreen]         = useState("home");
  const [farmer,         setFarmer]         = useState(null);
  const [lang,           setLang]           = useState("te");
  const [showVoice,      setShowVoice]      = useState(false);
  const [isOnline,       setIsOnline]       = useState(navigator.onLine);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [yieldPrediction,setYieldPrediction]= useState(null);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Opacity: higher on dark screens (onboarding/voice), subtle on light app screens
  const cropOpacity = showOnboarding ? 0.42 : 0.18;

  const handleOnboardingComplete=(data)=>{
    setFarmer(data); setLang(data.language); setShowOnboarding(false);
    speak(`${data.name} గారూ స్వాగతం. మీ కిసాన్ AI ప్రొఫైల్ సిద్ధమైంది.`);
  };

  useEffect(()=>{
    const on=()=>setIsOnline(true), off=()=>setIsOnline(false);
    window.addEventListener("online",on); window.addEventListener("offline",off);
    return ()=>{ window.removeEventListener("online",on); window.removeEventListener("offline",off); };
  },[]);

  useEffect(()=>{
    async function fetchPrediction(){
      try{
        const res=await fetch("http://127.0.0.1:8000/predict-yield",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ crop:"rice",rainfall:1000,temperature:28,soil_moisture:60,soil_ph:6.5,fertilizer_kg_per_hectare:140,farm_size_hectare:5 }) });
        const data=await res.json();
        setYieldPrediction(data.predicted_yield_tons_per_hectare);
        if(data.yield_per_hectare) setYieldPrediction(Math.abs(data.yield_per_hectare).toFixed(1));
      }catch(e){ console.warn(e); }
    }
    fetchPrediction();
  },[]);

  const renderScreen=()=>{
    switch(screen){
      case "scanCrop":  return <DiseaseScreen  t={t} lang={lang}/>;
      case "weather":   return <WeatherScreen  t={t} lang={lang} farmer={farmer}/>;
      case "market":    return <MarketScreen   t={t} lang={lang}/>;
      case "schemes":   return <SchemesScreen  t={t} lang={lang}/>;
      case "soil":      return <SoilScreen     t={t} lang={lang}/>;
      case "myFarm":    return <DashboardScreen t={t} farmer={farmer} yieldPrediction={yieldPrediction}/>;
      case "expert":    return <ExpertScreen   t={t}/>;
      case "advice":    return <AdviceScreen   t={t} lang={lang} farmer={farmer}/>;
      case "community": return <CommunityScreen t={t}/>;
      case "equipment": return <EquipmentScreen t={t}/>;
      default:          return null;
    }
  };

  const hour=new Date().getHours();
  const greeting=hour<12?"Good Morning":hour<17?"Good Afternoon":"Good Evening";

  // ── Shared canvas rendered at root for ALL screens ──────────────────────────
  const canvas = <FloatingCropsCanvas opacity={cropOpacity}/>;

  if(showOnboarding) return (
    <>
      <style>{GLOBAL_STYLES}</style>
      {/* Dark green background sits behind canvas */}
      <div style={{ position:"fixed", inset:0, background:"linear-gradient(160deg,#052e16 0%,#166534 50%,#15803d 100%)", backgroundSize:"200% 200%", animation:"bgShift 8s ease infinite", zIndex:0 }}/>
      {canvas}
      <OnboardingScreen onComplete={handleOnboardingComplete} t={t}/>
    </>
  );

  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      {/* ── Canvas always behind everything ── */}
      {canvas}

      {!isOnline&&<OfflineBanner t={t}/>}

      <div style={{ maxWidth:430, margin:"0 auto", minHeight:"100vh", background:"rgba(245,247,245,.88)", backdropFilter:"blur(2px)", fontFamily:"'Plus Jakarta Sans',sans-serif", position:"relative", zIndex:1, overflowX:"hidden" }}>

        {/* Header */}
        <div className="gradient-header animate-fadeUp" style={{ padding:"14px 18px 18px", position:"sticky", top:0, zIndex:100, boxShadow:"0 4px 24px rgba(5,46,22,.4)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              {screen!=="home"&&(
                <button onClick={()=>setScreen("home")} style={{ background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.2)", borderRadius:10, width:36, height:36, cursor:"pointer", color:"#fff", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", transition:"background .2s" }}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.25)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.15)"}>←</button>
              )}
              <div>
                <h1 style={{ color:"#fff", fontSize:22, fontWeight:900, fontFamily:"'Playfair Display',serif", letterSpacing:-.3 }}>🌾 {t.appName}</h1>
                {farmer&&<p style={{ color:"#86efac", fontSize:11, marginTop:1 }}>👨‍🌾 {farmer.name} · {farmer.village}</p>}
              </div>
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <select value={lang} onChange={e=>setLang(e.target.value)} style={{ background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.25)", borderRadius:10, padding:"6px 10px", color:"#fff", fontSize:12, cursor:"pointer", backdropFilter:"blur(8px)" }}>
                <option value="en" style={{color:"#000"}}>EN</option>
                <option value="hi" style={{color:"#000"}}>हि</option>
                <option value="te" style={{color:"#000"}}>తె</option>
              </select>
              <button onClick={()=>setShowVoice(true)} className="ripple-container" style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)", border:"none", borderRadius:12, width:44, height:44, cursor:"pointer", fontSize:22, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 16px rgba(34,197,94,.4)", transition:"transform .15s" }}
                onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>🎤</button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ paddingBottom:100, paddingTop:16 }}>
          {screen==="home"?(
            <div>
              {/* Hero card */}
              <div className="animate-scaleIn" style={{ margin:"0 14px 16px", background:"linear-gradient(135deg,#052e16 0%,#14532d 50%,#166534 100%)", backgroundSize:"200% 200%", animation:"bgShift 6s ease infinite", borderRadius:24, padding:22, color:"#fff", boxShadow:"0 12px 40px rgba(5,46,22,.4)", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:-20, right:-20, width:100, height:100, borderRadius:"50%", background:"rgba(34,197,94,.15)", animation:"glowPulse 3s ease-in-out infinite" }}/>
                <div style={{ position:"absolute", bottom:-30, left:-10, width:80, height:80, borderRadius:"50%", background:"rgba(134,239,172,.08)", animation:"glowPulse 4s ease-in-out infinite 1s" }}/>
                <p style={{ fontSize:17, fontWeight:800, marginBottom:4, position:"relative" }}>🌞 {greeting}!</p>
                <p style={{ fontSize:13, opacity:.85, lineHeight:1.5, position:"relative" }}>{farmer?`Your ${farmer.primaryCrop} farm is ready for today's check`:"What would you like to do today?"}</p>
                <div style={{ marginTop:14, display:"flex", gap:10, position:"relative" }}>
                  {[{label:"Today",value:"32°C"},{label:"Tomorrow",value:"🌧️"},{label:"Predicted",value:yieldPrediction?`${yieldPrediction}T`:"..."}].map((item,i)=>(
                    <div key={i} className={`animate-fadeUp d${i+1}`} style={{ background:"rgba(255,255,255,.12)", backdropFilter:"blur(8px)", borderRadius:14, padding:"10px 8px", flex:1, textAlign:"center", border:"1px solid rgba(255,255,255,.15)", transition:"transform .2s" }}
                      onMouseEnter={e=>e.currentTarget.style.transform="scale(1.05)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                      <p style={{ fontSize:18, fontWeight:900, lineHeight:1 }}>{item.value}</p>
                      <p style={{ fontSize:10, opacity:.75, marginTop:2 }}>{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pest alert */}
              <div onClick={()=>setScreen("advice")} className="animate-fadeUp d2" style={{ margin:"0 14px 16px", background:"linear-gradient(135deg,#fef3c7,#fde68a)", borderRadius:18, padding:"12px 14px", border:"2px solid #f59e0b", cursor:"pointer", display:"flex", alignItems:"center", gap:10, animation:"pestBlink 2.5s ease-in-out infinite", boxShadow:"0 4px 16px rgba(245,158,11,.2)" }}>
                <span style={{ fontSize:24, animation:"bounce .8s ease-in-out infinite" }}>🐛</span>
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:800, color:"#92400e", fontSize:13 }}>{t.pestAlert}</p>
                  <p style={{ fontSize:11, color:"#78350f", marginTop:2 }}>{PEST_DATA[0].name} · {PEST_DATA[0].area}</p>
                </div>
                <span style={{ color:"#92400e", fontWeight:800, fontSize:18 }}>→</span>
              </div>

              {/* Nav grid */}
              <div style={{ padding:"0 10px" }}>
                <NavGrid onSelect={setScreen} t={t}/>
              </div>
            </div>
          ):renderScreen()}
        </div>

        {/* Floating mic */}
        {screen==="home"&&(
          <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", zIndex:200, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
            <button onClick={()=>setShowVoice(true)} className="ripple-container animate-pulse" style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#22c55e,#16a34a)", border:"4px solid #fff", cursor:"pointer", fontSize:30, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 32px rgba(34,197,94,.5)", transition:"transform .15s" }}
              onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}><span className="animate-float">🎤</span></button>
            <span style={{ background:"linear-gradient(135deg,#052e16,#166534)", color:"#86efac", fontSize:11, fontWeight:700, padding:"4px 14px", borderRadius:99, boxShadow:"0 4px 12px rgba(5,46,22,.3)", letterSpacing:.5 }}>{t.tapToSpeak}</span>
          </div>
        )}
      </div>

      {/* Voice overlay */}
      {showVoice&&<VoiceOverlay onClose={()=>setShowVoice(false)} t={t} lang={lang} onNavigate={(s)=>{ setScreen(s); setShowVoice(false); }}/>}
    </>
  );
}