"use client";

import { useState } from "react";
import { submitRegistration } from "@/app/actions/submit-registration";
import { UploadDropzone } from "../utils/uploadthing";

// ── Price lookup table ───────────────────────────────────────────────────────
type Origin = "local" | "international";
type Role = "specialist" | "physician" | "med_student";
type AccomKey = "none" | "room1" | "room2" | "room3";

const PRICES: Record<Origin, Record<Role, Record<AccomKey, number>>> = {
  local: {
    specialist:  { none: 500,  room1: 1200, room2: 950,  room3: 800  },
    physician:   { none: 400,  room1: 1100, room2: 850,  room3: 700  },
    med_student: { none: 250,  room1: 900,  room2: 700,  room3: 600  },
  },
  international: {
    specialist:  { none: 80,  room1: 180,  room2: 140,  room3: 120  },
    physician:   { none: 60,  room1: 160,  room2: 120,  room3: 100  },
    med_student: { none: 40,  room1: 130,  room2: 100,  room3: 80   },
  },
};

function getPrice(origin: Origin, role: Role, accomKey: AccomKey) {
  return PRICES[origin]?.[role]?.[accomKey] ?? 0;
}

// ── Wizard sub-component ─────────────────────────────────────────────────────
function RegistrationWizard() {
  const [step, setStep] = useState(0);
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [wantsAccom, setWantsAccom] = useState<boolean | null>(null);
  const [roomSize, setRoomSize] = useState<1 | 2 | 3 | null>(null);
  const [roommateId, setRoommateId] = useState("");
  const [passportUrl, setPassportUrl] = useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [taahhutChecked, setTaahhutChecked] = useState(false);

  const isLocal = origin === "local";
  const accomKey: AccomKey = !wantsAccom ? "none" : roomSize === 1 ? "room1" : roomSize === 2 ? "room2" : "room3";
  const price = origin && role ? getPrice(origin, role, accomKey) : 0;
  const currency = isLocal ? "₺" : "€";

  const roleLabel = (r: Role | null) => {
    if (!r) return "";
    return r === "specialist" ? (isLocal ? "Uzman" : "Specialist") : r === "physician" ? (isLocal ? "Hekim" : "Physician") : (isLocal ? "Tıp Öğrencisi" : "Medical Student");
  };

  const accomLabel = () => {
    if (!wantsAccom) return isLocal ? "Konaklama İstiyorum (9 Mayıs, 1 gece)" : "Accommodation — May 9 (1 night)";
    return isLocal ? `Konaklama — ${roomSize} Kişilik Oda` : `Accommodation — ${roomSize}-person room`;
  };

  const reset = () => {
    setStep(0); setOrigin(null); setRole(null); setWantsAccom(null);
    setRoomSize(null); setRoommateId(""); setPassportUrl(null); setReceiptUrl(null);
    setTaahhutChecked(false); setSubmitResult(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!taahhutChecked) {
      setSubmitResult({ type: 'error', text: isLocal ? 'Lütfen taahhütnameyi onaylayın.' : 'Please accept the commitment form.' });
      return;
    }
    if (!isLocal && !passportUrl) {
      setSubmitResult({ type: 'error', text: 'Please upload your passport photo.' });
      return;
    }
    if (!receiptUrl) {
      setSubmitResult({ type: 'error', text: isLocal ? 'Lütfen ödeme dekontunuzu yükleyin.' : 'Please upload your payment receipt.' });
      return;
    }
    setIsSubmitting(true);
    setSubmitResult(null);
    const fd = new FormData(e.currentTarget);
    fd.set('origin', origin!);
    fd.set('role', role!);
    fd.set('accommodation', wantsAccom ? accomKey : 'none');
    fd.set('roomSize', roomSize?.toString() ?? '');
    fd.set('roommateId', roommateId);
    fd.set('price', price.toString());
    fd.set('currency', isLocal ? 'TRY' : 'EUR');
    fd.set('passportPhotoUrl', passportUrl ?? '');
    fd.set('receiptUrl', receiptUrl ?? '');
    const result = await submitRegistration(fd);
    setIsSubmitting(false);
    if (result.success) {
      setSubmitResult({ type: 'success', text: isLocal ? 'Başvurunuz alındı! En kısa sürede sizinle iletişime geçilecektir.' : 'Your registration has been received! We will contact you shortly.' });
      setStep(99); // success screen
    } else {
      setSubmitResult({ type: 'error', text: result.error ?? (isLocal ? 'Gönderim sırasında hata oluştu.' : 'An error occurred.') });
    }
  };

  // ─── Progress bar (steps 0-3 shown, step 4 is form) ───────────────────────
  const progressSteps = isLocal
    ? ['Katılımcı Tipi', 'Rol', 'Konaklama', 'Ücret', 'Kişisel Bilgiler']
    : ['Participant Type', 'Role', 'Accommodation', 'Price', 'Personal Info'];

  return (
    <div className="min-h-[60vh] flex flex-col">
      {/* Progress indicator */}
      {step < 99 && (
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-congress-red z-0 transition-all duration-500"
              style={{ width: `${(Math.min(step, 4) / 4) * 100}%` }}
            />
            {progressSteps.map((label, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step > i ? 'bg-congress-red text-white shadow-md' :
                  step === i ? 'bg-congress-red text-white ring-4 ring-congress-red/20 shadow-lg' :
                  'bg-white border-2 border-gray-200 text-gray-400'
                }`}>
                  {step > i ? <i className="fa-solid fa-check text-[10px]" /> : i + 1}
                </div>
                <span className={`text-[9px] md:text-[10px] font-semibold uppercase tracking-wider text-center leading-tight max-w-[60px] ${
                  step >= i ? 'text-congress-red' : 'text-gray-400'
                }`}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 0: Origin ── */}
      {step === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <p className="text-gray-500 text-center">Lütfen katılımcı tipinizi seçin / Please select your participant type</p>
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
            {(['local', 'international'] as const).map((o) => (
              <button
                key={o}
                onClick={() => { setOrigin(o); setStep(1); }}
                className="group flex flex-col items-center gap-3 bg-white border-2 border-gray-200 hover:border-congress-red rounded-2xl p-8 transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <div className="w-14 h-14 rounded-full bg-congress-red/10 group-hover:bg-congress-red/20 flex items-center justify-center transition-colors">
                  <i className={`fa-solid ${o === 'local' ? 'fa-flag' : 'fa-earth-europe'} text-2xl text-congress-red`} />
                </div>
                <span className="font-bold text-gray-800 text-lg">{o === 'local' ? 'Local' : 'International'}</span>
                <span className="text-xs text-gray-500">{o === 'local' ? 'Türkiye' : 'Outside Turkey'}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 1: Role ── */}
      {step === 1 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <p className="text-gray-500 text-center">{isLocal ? 'Rolünüzü seçin' : 'Select your role'}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
            {([
              { key: 'specialist', icon: 'fa-user-doctor', labelTR: 'Uzman', labelEN: 'Specialist' },
              { key: 'physician',  icon: 'fa-stethoscope', labelTR: 'Hekim',  labelEN: 'Physician'  },
              { key: 'med_student',icon: 'fa-graduation-cap', labelTR: 'Tıp Öğrencisi', labelEN: 'Med Student' },
            ] as const).map((r) => (
              <button
                key={r.key}
                onClick={() => { setRole(r.key); setStep(2); }}
                className="group flex flex-col items-center gap-3 bg-white border-2 border-gray-200 hover:border-congress-red rounded-2xl p-7 transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <div className="w-14 h-14 rounded-full bg-congress-red/10 group-hover:bg-congress-red/20 flex items-center justify-center transition-colors">
                  <i className={`fa-solid ${r.icon} text-2xl text-congress-red`} />
                </div>
                <span className="font-bold text-gray-800 text-base">{isLocal ? r.labelTR : r.labelEN}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(0)} className="text-sm text-gray-400 hover:text-congress-red transition-colors mt-2">
            ← {isLocal ? 'Geri' : 'Back'}
          </button>
        </div>
      )}

      {/* ── STEP 2: Accommodation ── */}
      {step === 2 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <p className="text-gray-500 text-center">{isLocal ? 'Konaklama tercihinizi seçin' : 'Select your accommodation preference'}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
            <button
              onClick={() => { setWantsAccom(true); }}
              className={`group flex flex-col items-center gap-3 border-2 rounded-2xl p-7 transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                wantsAccom === true ? 'border-congress-red bg-congress-red/5' : 'bg-white border-gray-200 hover:border-congress-red'
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-congress-red/10 group-hover:bg-congress-red/20 flex items-center justify-center transition-colors">
                <i className="fa-solid fa-bed text-2xl text-congress-red" />
              </div>
              <span className="font-bold text-gray-800 text-base text-center">
                {isLocal ? '9 Mayıs (1 Gece)' : 'May 9 (1 Night)'}
              </span>
              <span className="text-xs text-gray-500">{isLocal ? 'Konaklama dahil' : 'Accommodation included'}</span>
            </button>
            <button
              onClick={() => { setWantsAccom(false); setRoomSize(null); setStep(3); }}
              className={`group flex flex-col items-center gap-3 border-2 rounded-2xl p-7 transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                wantsAccom === false ? 'border-congress-red bg-congress-red/5' : 'bg-white border-gray-200 hover:border-congress-red'
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-congress-red/10 group-hover:bg-congress-red/20 flex items-center justify-center transition-colors">
                <i className="fa-solid fa-ban text-2xl text-congress-red" />
              </div>
              <span className="font-bold text-gray-800 text-base">{isLocal ? 'İstemiyorum' : "I don't want"}</span>
              <span className="text-xs text-gray-500">{isLocal ? 'Konaklama yok' : 'No accommodation'}</span>
            </button>
          </div>

          {wantsAccom === true && (
            <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-sm">
              <p className="font-semibold text-gray-700">{isLocal ? 'Oda kapasitesi' : 'Room capacity'}</p>
              <div className="grid grid-cols-3 gap-3">
                {([1, 2, 3] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => setRoomSize(n)}
                    className={`py-4 rounded-xl font-bold text-lg border-2 transition-all duration-200 ${
                      roomSize === n ? 'bg-congress-red text-white border-congress-red shadow-md' : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-congress-red hover:scale-105'
                    }`}
                  >
                    {n} <span className="text-xs font-normal">{isLocal ? 'kişi' : 'person'}</span>
                  </button>
                ))}
              </div>
              {roomSize && roomSize > 1 && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-600">
                    {isLocal ? 'Birlikte kalmak istediğiniz kişinin kişisel ID\'si (isteğe bağlı)' : 'Personal ID of your preferred roommate (optional)'}
                  </label>
                  <input
                    type="text"
                    value={roommateId}
                    onChange={e => setRoommateId(e.target.value)}
                    placeholder={isLocal ? 'TC Kimlik / Öğrenci ID' : 'Personal / Student ID'}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-congress-red/30"
                  />
                </div>
              )}
              <button
                onClick={() => { if (roomSize) setStep(3); }}
                disabled={!roomSize}
                className="w-full py-3 rounded-xl bg-congress-red text-white font-bold disabled:opacity-40 hover:bg-congress-dark transition-colors"
              >
                {isLocal ? 'İleri →' : 'Next →'}
              </button>
            </div>
          )}

          <button onClick={() => setStep(1)} className="text-sm text-gray-400 hover:text-congress-red transition-colors">
            ← {isLocal ? 'Geri' : 'Back'}
          </button>
        </div>
      )}

      {/* ── STEP 3: Price & IBAN ── */}
      {step === 3 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-lg mx-auto">
          {/* Summary card */}
          <div className="w-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="font-serif text-xl font-bold text-congress-red">
              {isLocal ? 'Ücret Özeti' : 'Price Summary'}
            </h3>
            <div className="divide-y divide-gray-100 text-sm">
              {[
                [isLocal ? 'Katılımcı Tipi' : 'Type', isLocal ? 'Yerel' : 'International'],
                [isLocal ? 'Rol' : 'Role', roleLabel(role)],
                [isLocal ? 'Konaklama' : 'Accommodation', wantsAccom
                  ? (isLocal ? `${roomSize} Kişilik Oda — 9 Mayıs` : `${roomSize}-person room — May 9`)
                  : (isLocal ? 'Yok' : 'None')],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between py-2.5">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-800">{val}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-3 border-t-2 border-congress-red/20">
              <span className="font-bold text-gray-700">{isLocal ? 'Toplam Ücret' : 'Total Fee'}</span>
              <span className="text-3xl font-bold text-congress-red">{currency}{price}</span>
            </div>
          </div>

          {/* IBAN info */}
          <div className="w-full bg-congress-red/5 border border-congress-red/20 rounded-2xl p-6">
            <h4 className="font-bold text-congress-red mb-3 flex items-center gap-2">
              <i className="fa-solid fa-building-columns" />
              {isLocal ? 'Ödeme Bilgileri' : 'Payment Details'}
            </h4>
            <div className="space-y-2 text-sm">
              {isLocal ? (
                <>
                  <p><span className="text-gray-500">Banka:</span> <strong>Ziraat Bankası</strong></p>
                  <p><span className="text-gray-500">IBAN:</span> <strong className="font-mono">TR00 0000 0000 0000 0000 0000 00</strong></p>
                  <p><span className="text-gray-500">Hesap Sahibi:</span> <strong>EMSA Dokuz Eylül</strong></p>
                  <p className="bg-white border border-congress-red/10 rounded-lg px-3 py-2 mt-3 text-gray-600 text-xs">
                    📌 Açıklamaya: <span className="font-bold text-congress-red">[Ad Soyad] – Vita Cordis 2026</span> yazınız
                  </p>
                </>
              ) : (
                <>
                  <p><span className="text-gray-500">Bank:</span> <strong>Ziraat Bankası</strong></p>
                  <p><span className="text-gray-500">IBAN:</span> <strong className="font-mono">TR00 0000 0000 0000 0000 0000 00</strong></p>
                  <p><span className="text-gray-500">Account Holder:</span> <strong>EMSA Dokuz Eylül</strong></p>
                  <p className="bg-white border border-congress-red/10 rounded-lg px-3 py-2 mt-3 text-gray-600 text-xs">
                    📌 Description: <span className="font-bold text-congress-red">[Full Name] – Vita Cordis 2026</span>
                  </p>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => setStep(4)}
            className="w-full py-4 rounded-xl bg-congress-red text-white font-bold text-base hover:bg-congress-dark transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            {isLocal ? 'Kişisel Bilgilere Geç' : 'Continue to Personal Info'}
            <i className="fa-solid fa-arrow-right" />
          </button>
          <button onClick={() => setStep(2)} className="text-sm text-gray-400 hover:text-congress-red transition-colors">
            ← {isLocal ? 'Geri' : 'Back'}
          </button>
        </div>
      )}

      {/* ── STEP 4: Personal Info Form ── */}
      {step === 4 && (
        <div className="w-full max-w-2xl mx-auto">
          {submitResult && (
            <div className={`mb-6 p-4 rounded-xl border flex items-start gap-4 ${
              submitResult.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
            }`}>
              <i className={`fa-solid mt-1 ${submitResult.type === 'success' ? 'fa-circle-check text-emerald-500' : 'fa-circle-exclamation text-red-500'}`} />
              <p className="font-medium">{submitResult.text}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1: Name + School */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">
                  {isLocal ? 'Ad Soyad *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <i className="fa-regular fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" name="fullName" required
                    className="form-input bg-gray-50 pl-10 w-full"
                    placeholder={isLocal ? 'Ad Soyad' : 'Full Name'} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">
                  {isLocal ? 'Okul / Kurum *' : 'School / Institution *'}
                </label>
                <div className="relative">
                  <i className="fa-solid fa-school absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" name="school" required
                    className="form-input bg-gray-50 pl-10 w-full"
                    placeholder={isLocal ? 'Üniversite / Hastane' : 'University / Hospital'} />
                </div>
              </div>
            </div>

            {/* Row 2: Phone + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">
                  {isLocal ? 'Telefon Numarası *' : 'Phone Number *'}
                </label>
                <div className="relative">
                  <i className="fa-solid fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" name="phone" required
                    className="form-input bg-gray-50 pl-10 w-full"
                    placeholder="+90 5xx xxx xx xx" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">
                  {isLocal ? 'E-posta Adresi *' : 'Email Address *'}
                </label>
                <div className="relative">
                  <i className="fa-regular fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" name="email" required
                    className="form-input bg-gray-50 pl-10 w-full"
                    placeholder="email@example.com" />
                </div>
              </div>
            </div>

            {/* Row 3: Personal ID + Birthdate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">
                  {isLocal ? 'TC Kimlik / Öğrenci No *' : 'Personal / Student ID *'}
                </label>
                <div className="relative">
                  <i className="fa-solid fa-id-card absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" name="personalId" required
                    className="form-input bg-gray-50 pl-10 w-full"
                    placeholder={isLocal ? 'TC Kimlik No' : 'ID Number'} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">
                  {isLocal ? 'Doğum Tarihi *' : 'Date of Birth *'}
                </label>
                <div className="relative">
                  <i className="fa-regular fa-calendar absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="date" name="birthDate" required
                    className="form-input bg-gray-50 pl-10 w-full" />
                </div>
              </div>
            </div>

            {/* International extras */}
            {!isLocal && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-gray-700">Passport / Document Number *</label>
                    <div className="relative">
                      <i className="fa-solid fa-passport absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" name="passportNumber" required
                        className="form-input bg-gray-50 pl-10 w-full"
                        placeholder="AB1234567" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-gray-700">Country *</label>
                    <div className="relative">
                      <i className="fa-solid fa-earth-europe absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" name="country" required
                        className="form-input bg-gray-50 pl-10 w-full"
                        placeholder="e.g. Germany" />
                    </div>
                  </div>
                </div>
                {/* Passport photo upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">Passport Photo *</label>
                  {!passportUrl ? (
                    <UploadDropzone
                      endpoint="receiptPdfUploader"
                      appearance={{
                        container: 'border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 py-4 min-h-0',
                        uploadIcon: 'w-8 h-8 text-gray-400',
                        label: 'text-xs text-gray-500',
                        allowedContent: 'text-[10px] text-gray-400',
                        button: 'text-xs px-4 py-1.5 h-auto mt-1 bg-congress-red hover:bg-congress-dark rounded-lg',
                      }}
                      onClientUploadComplete={(res) => {
                        if (res && res.length > 0) setPassportUrl(res[0].url);
                      }}
                      onUploadError={(error: Error) => {
                        setSubmitResult({ type: 'error', text: `Upload failed: ${error.message}` });
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-between px-5 py-4 border-2 border-emerald-300 rounded-xl bg-emerald-50">
                      <div className="flex items-center gap-3">
                        <i className="fa-solid fa-image text-2xl text-emerald-600" />
                        <div>
                          <p className="text-sm font-medium text-emerald-800">Passport photo uploaded</p>
                          <a href={passportUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline">View</a>
                        </div>
                      </div>
                      <button type="button" onClick={() => setPassportUrl(null)} className="text-sm text-red-500 hover:text-red-700 font-medium">Change</button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Payment receipt upload */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                {isLocal ? 'Ödeme Dekontu *' : 'Payment Receipt *'}
              </label>
              <p className="text-xs text-gray-400">
                {isLocal ? 'Banka transferini yaptıktan sonra dekontunuzu yükleyin.' : 'Upload your bank transfer receipt after completing the payment.'}
              </p>
              {!receiptUrl ? (
                <UploadDropzone
                  endpoint="receiptPdfUploader"
                  appearance={{
                    container: 'border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 py-4 min-h-0',
                    uploadIcon: 'w-8 h-8 text-gray-400',
                    label: 'text-xs text-gray-500',
                    allowedContent: 'text-[10px] text-gray-400',
                    button: 'text-xs px-4 py-1.5 h-auto mt-1 bg-congress-red hover:bg-congress-dark rounded-lg',
                  }}
                  onClientUploadComplete={(res) => {
                    if (res && res.length > 0) setReceiptUrl(res[0].url);
                  }}
                  onUploadError={(error: Error) => {
                    setSubmitResult({ type: 'error', text: isLocal ? `Dekont yüklenemedi: ${error.message}` : `Upload failed: ${error.message}` });
                  }}
                />
              ) : (
                <div className="flex items-center justify-between px-5 py-4 border-2 border-emerald-300 rounded-xl bg-emerald-50">
                  <div className="flex items-center gap-3">
                    <i className="fa-solid fa-file-pdf text-2xl text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium text-emerald-800">{isLocal ? 'Dekont yüklendi' : 'Receipt uploaded'}</p>
                      <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline">{isLocal ? 'Görüntüle' : 'View'}</a>
                    </div>
                  </div>
                  <button type="button" onClick={() => setReceiptUrl(null)} className="text-sm text-red-500 hover:text-red-700 font-medium">{isLocal ? 'Değiştir' : 'Change'}</button>
                </div>
              )}
            </div>

            {/* Taahhütname */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3">
              <h4 className="font-bold text-gray-700 flex items-center gap-2">
                <i className="fa-solid fa-file-contract text-congress-red" />
                {isLocal ? 'Taahhütname' : 'Commitment Declaration'}
              </h4>
              <div className="h-36 overflow-y-auto text-xs text-gray-500 border border-gray-200 rounded-lg bg-white p-3 leading-relaxed whitespace-pre-line">
                {isLocal ? `VİTA CORDİS KATILIMCI DAVRANIŞ KURALLARI SÖZLEŞMESİ

1. Amaç
Bu sözleşme, Vita Cordis Kongresi süresince tüm katılımcılar için güvenli, saygılı ve profesyonel bir ortam sağlamak amacıyla hazırlanmıştır.

2. Genel Davranış İlkeleri
Katılımcılar:
• Tüm bireylere karşı saygılı ve profesyonel davranmayı kabul eder.
• Irk, cinsiyet, din, milliyet, cinsel yönelim, akademik unvan veya görüş farklılıklarına dayalı ayrımcılık yapmaz.
• Akademik ve sosyal ortamlarda etik kurallara uygun davranır.

3. Kabul Edilemez Davranışlar
Aşağıdaki davranışlar kesinlikle yasaktır:
• Sözlü veya fiziksel taciz, tehdit veya zorbalık
• Cinsel taciz veya uygunsuz davranış
• Ayrımcı, aşağılayıcı veya saldırgan dil kullanımı
• Etkinlik düzenini bozacak davranışlar

4. Gizlilik ve Veri Koruma
• Katılımcılar diğer bireylerin kişisel bilgilerini izinsiz paylaşamaz.
• Fotoğraf ve video çekimleri ilgili kişilerin onayı ile yapılmalıdır.

5. Otel ve Mekan Kuralları
• Katılımcılar, etkinliğin gerçekleştirileceği otelin ve ilgili mekanların tüm kurallarına uymayı kabul eder.
• Otel düzenini bozacak, diğer misafirleri rahatsız edecek veya tesis kurallarına aykırı davranışlardan kaçınılmalıdır.

6. Kurallara Uyulmaması Durumu
Bu kurallara uyulmaması durumunda organizasyon komitesi aşağıdaki önlemleri alma hakkını saklı tutar:
• Uyarı verme
• Etkinlikten geçici veya kalıcı olarak çıkarma
• Gerekli durumlarda ilgili kurumlara bildirimde bulunma

7. Kabul
Bu sözleşmeyi onaylayan katılımcılar, yukarıda belirtilen tüm kurallara uymayı kabul etmiş sayılır.

Vita Cordis Organizasyon Komitesi` : `VITA CORDIS CODE OF CONDUCT FOR PARTICIPANTS

1. Purpose
This agreement aims to ensure a safe, respectful, and professional environment for all participants during the Vita Cordis Congress.

2. General Conduct Principles
Participants shall:
• Treat all individuals with respect and professionalism.
• Refrain from discrimination based on race, gender, religion, nationality, sexual orientation, academic status, or opinions.
• Act in accordance with ethical standards in academic and social settings.

3. Unacceptable Behavior
The following behaviors are strictly prohibited:
• Verbal or physical harassment, threats, or intimidation
• Sexual harassment or inappropriate conduct
• Use of discriminatory, degrading, or offensive language
• Disruptive behavior affecting the event flow

4. Privacy and Data Protection
• Participants must not share personal information without consent.
• Photography and video recording require consent.

5. Hotel and Venue Rules
• Participants agree to comply with all rules of the hotel and event venues.
• Any behavior that disturbs other guests or violates facility policies must be avoided.

6. Violation of Rules
In case of violations, the organizing committee reserves the right to:
• Issue a warning
• Remove the participant temporarily or permanently
• Report to relevant authorities if necessary

7. Agreement
By accepting this agreement, participants agree to comply with all the rules stated above.

Vita Cordis Organizing Committee`}
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={taahhutChecked}
                  onChange={e => setTaahhutChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-congress-red"
                />
                <span className="text-sm font-medium text-gray-700">
                  {isLocal
                    ? 'Taahhütnameyi okudum ve kabul ediyorum *'
                    : 'I have read and accept the commitment declaration *'
                  }
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-congress-red text-white font-bold text-base hover:bg-congress-dark transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? <><i className="fa-solid fa-circle-notch fa-spin" /> {isLocal ? 'Gönderiliyor...' : 'Submitting...'}</>
                : <><i className="fa-solid fa-paper-plane" /> {isLocal ? 'Kaydı Tamamla' : 'Complete Registration'}</>
              }
            </button>
            <button type="button" onClick={() => setStep(3)} className="w-full text-sm text-gray-400 hover:text-congress-red transition-colors text-center">
              ← {isLocal ? 'Geri' : 'Back'}
            </button>
          </form>
        </div>
      )}

      {/* ── STEP 99: Success screen ── */}
      {step === 99 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 py-12 text-center">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
            <i className="fa-solid fa-circle-check text-4xl text-emerald-500" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-gray-800">
            {isLocal ? 'Kaydınız Alındı!' : 'Registration Received!'}
          </h3>
          <p className="text-gray-500 max-w-sm">
            {isLocal
              ? 'Başvurunuz başarıyla tamamlandı. Ödemenizi doğruladıktan sonra sizinle iletişime geçilecektir.'
              : 'Your registration has been successfully submitted. We will contact you after verifying your payment.'
            }
          </p>
          <button
            onClick={reset}
            className="px-8 py-3 rounded-xl bg-congress-red text-white font-bold hover:bg-congress-dark transition-colors"
          >
            {isLocal ? 'Yeni Başvuru' : 'New Registration'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main page component ───────────────────────────────────────────────────────
export default function Home() {
  const [activeSection, setActiveSection] = useState("welcome");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const showSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const navLinks = [
    { id: "welcome", html: <>Welcome<br />Message</>, mobileText: "Welcome Message" },
    { id: "general-info", html: <>General<br />Information</>, mobileText: "General Information" },
    { id: "organization", html: <>Organization<br />Committee</>, mobileText: "Organization Committee" },
    { id: "speakers", html: <>Invited<br />Speakers</>, mobileText: "Invited Speakers" },
    { id: "program", html: <>Scientific<br />Program</>, mobileText: "Scientific Program" },
    { id: "abstract", html: <>Abstract<br />Submission</>, mobileText: "Abstract Submission" },
    { id: "social", html: <>Social<br />Events</>, mobileText: "Social Events" },
    { id: "registration", html: <>Registration &<br />Accommodation</>, mobileText: "Registration & Accommodation" },
  ];

  return (
    <>
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-congress-red text-white shadow-xl transition-all duration-300 border-b border-white/10">
        <div className="container mx-auto px-4">
          {/* Mobile Header */}
          <div className="md:hidden flex justify-between items-center py-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => showSection("welcome")}>
              {/* Mobile Logo */}
              <div className="h-10 w-10 rounded-full overflow-hidden bg-white border border-white/20 flex-shrink-0">
                <img src="/logo.jpg" className="h-full w-full object-cover scale-[1.06]" alt="Vita Cordis Logo" />
              </div>
              <span className="font-serif text-xl">Vita Cordis</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white text-2xl">
              <i className="fa-solid fa-bars"></i>
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex flex-wrap justify-between items-center py-4 text-center text-sm lg:text-base leading-tight font-serif font-light">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer mr-2 flex-shrink-0" onClick={() => showSection("welcome")}>
              <div className="h-12 w-12 rounded-full overflow-hidden bg-white border border-white/20 shadow-md">
                <img src="/logo.jpg" className="h-full w-full object-cover scale-[1.06]" alt="Vita Cordis Logo" />
              </div>
            </div>

            {/* Menu Links */}
            {navLinks.map((link) => (
              <div
                key={link.id}
                onClick={() => showSection(link.id)}
                className={`nav-link px-2 ${activeSection === link.id ? "active font-bold" : ""}`}
              >
                {link.html}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-congress-red border-t border-white/10 p-4 absolute w-full left-0 top-full shadow-lg">
            {navLinks.map((link) => (
              <div
                key={link.id}
                onClick={() => showSection(link.id)}
                className={`block py-3 border-b border-white/10 cursor-pointer hover:bg-white/5 ${activeSection === link.id ? "font-bold" : ""}`}
              >
                {link.mobileText}
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow pt-[80px] md:pt-[100px]">

        {/* WELCOME */}
        {activeSection === "welcome" && (
          <div className="page-section">
            <header className="hero-bg relative min-h-[50vh] flex items-center justify-center text-white overflow-hidden mb-12">
              <div className="container mx-auto px-6 text-center relative z-10 py-10">
                <div className="mb-8 flex justify-center">
                  <div className="w-64 h-64 md:w-72 md:h-72 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden bg-white flex items-center justify-center">
                    <img src="/logo.jpg" className="w-full h-full object-cover scale-[1.06]" alt="Vita Cordis Logo" />
                  </div>
                </div>
                <h1 className="text-5xl md:text-8xl font-bold mb-4 font-serif tracking-tight drop-shadow-lg">Vita Cordis</h1>
                <p className="text-lg md:text-2xl font-light italic mb-8 text-white/90">The International Congress on Multidisciplinary Approaches to the Heart</p>
                <div className="inline-flex items-center gap-4 bg-white/10 px-6 py-2 rounded-full backdrop-blur-md border border-white/20">
                  <i className="fa-regular fa-calendar text-congress-gold"></i>
                  <span className="uppercase tracking-widest text-sm font-semibold">May 9–10, 2026 • İzmir, Türkiye</span>
                </div>
              </div>
            </header>

            <div className="container mx-auto px-6 max-w-4xl pb-24">
              <div className="text-center mb-14">
                <span className="text-congress-red font-bold tracking-[0.3em] text-xs uppercase mb-2 block">Welcome Message</span>
                <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">Invitation</h2>
                <div className="w-24 h-1 bg-congress-red mx-auto"></div>
              </div>
              <div className="prose prose-lg mx-auto text-gray-600 font-sans leading-relaxed text-justify bg-white p-8 md:p-12 rounded-xl shadow-sm border border-gray-100">
                <p className="font-bold text-gray-800 text-xl mb-6">Dear Colleagues,</p>
                <p className="mb-6">It is our great pleasure to invite you to <span className="text-congress-red font-serif font-bold">Vita Cordis: The International Congress on Multidisciplinary Approaches to the Heart</span>, to be held in <strong>İzmir</strong>, with the aim of addressing multidisciplinary perspectives on cardiovascular health, sharing current scientific developments, and collaboratively shaping the future of healthcare.</p>
                <p className="mb-6">Taking place on <strong>May 9–10, 2026</strong>, Vita Cordis seeks to provide a comprehensive scientific platform that brings together diverse disciplines involved in cardiovascular care.</p>
                <div className="bg-congress-cream p-6 rounded-lg border-l-4 border-congress-red my-6">
                  <p className="font-semibold text-gray-800 mb-2">The congress will focus on:</p>
                  <ul className="list-disc pl-5 space-y-2 text-sm md:text-base">
                    <li>Clinical case discussions in light of current guidelines</li>
                    <li>Multidisciplinary approaches to critical patient management</li>
                    <li>Integration of next-generation diagnostic technologies</li>
                    <li>Practical solutions for complex clinical scenarios</li>
                  </ul>
                </div>
                <p className="mb-8">We believe that Vita Cordis will significantly contribute to your professional development, enrich your clinical perspective, and open new pathways for collaboration.</p>
                <div className="text-right mt-12 border-t border-gray-100 pt-6">
                  <p className="font-serif text-lg text-gray-800 mb-2">Sincerely,</p>
                  <p className="font-bold text-congress-red text-xl font-serif mt-4">Vita Cordis Organizing Committee</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GENERAL INFORMATION */}
        {activeSection === "general-info" && (
          <div className="page-section py-12">
            <div className="container mx-auto px-6 max-w-5xl">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-serif text-congress-red mb-4">General Information</h2>
                <div className="w-24 h-1 bg-congress-red mx-auto"></div>
              </div>
              <div className="grid gap-6">
                <div className="info-card bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-16 h-16 rounded-full bg-congress-red text-white flex items-center justify-center flex-shrink-0 text-2xl"><i className="fa-solid fa-map-location-dot"></i></div>
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2">Congress Venue</h3>
                    <p className="text-gray-600">The Vita Cordis Congress will be held at the <strong>DEU Faculty of Medicine, Classrooms Building, Founding Faculty Members Conference Hall</strong> in İzmir on May 9–10, 2026.</p>
                  </div>
                </div>
                <div className="info-card bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-16 h-16 rounded-full bg-congress-red text-white flex items-center justify-center flex-shrink-0 text-2xl"><i className="fa-solid fa-language"></i></div>
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2">Congress Language</h3>
                    <p className="text-gray-600">The official language of the congress is <strong>English</strong>.</p>
                  </div>
                </div>
                <div className="info-card bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-16 h-16 rounded-full bg-congress-red text-white flex items-center justify-center flex-shrink-0 text-2xl"><i className="fa-solid fa-id-badge"></i></div>
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2">Name Badges</h3>
                    <p className="text-gray-600">All participants are required to wear their name badges at all times during the congress.</p>
                  </div>
                </div>
                <div className="info-card bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-16 h-16 rounded-full bg-congress-red text-white flex items-center justify-center flex-shrink-0 text-2xl"><i className="fa-solid fa-certificate"></i></div>
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2">Certificate of Participation</h3>
                    <p className="text-gray-600">Participants who register and attend at least <strong>10 sessions</strong> will receive a Certificate of Participation.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ORGANIZATION COMMITTEE */}
        {activeSection === "organization" && (
          <div className="page-section py-12">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-serif text-congress-red mb-4">Organization Committee</h2>
                    <div className="w-24 h-1 bg-congress-red mx-auto mb-6"></div>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg">Meet the dedicated team behind Vita Cordis.</p>
                </div>
                
                {/* Advisors */}
                <div className="mb-20">
                    <h3 className="text-2xl font-serif font-bold text-congress-gold mb-10 text-center uppercase tracking-widest">Congress Advisors</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
                        
                        {/* Advisor 1 */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center group hover:shadow-md transition">
                            <div className="w-32 h-32 mx-auto bg-gray-100 rounded-2xl mb-4 flex items-center justify-center border-4 border-congress-cream overflow-hidden relative shadow-inner">
                                <i className="fa-solid fa-user-tie text-5xl text-gray-300 absolute z-0"></i>
                                <img src="/ceren-sayarer.jpg" className="speaker-img" alt="Asst. Prof. Ceren SAYARER" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-1">Asst. Prof. Ceren SAYARER</h4>
                            <p className="text-sm text-congress-red font-semibold">Congress Advisor</p>
                        </div>
                        
                        {/* Advisor 2 */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center group hover:shadow-md transition">
                            <div className="w-32 h-32 mx-auto bg-gray-100 rounded-2xl mb-4 flex items-center justify-center border-4 border-congress-cream overflow-hidden relative shadow-inner">
                                <i className="fa-solid fa-user-tie text-5xl text-gray-300 absolute z-0"></i>
                                <img src="/tugra-gencpinar.jpg" className="speaker-img" alt="Prof. Dr. Tuğra GENÇPINAR" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-1">Prof. Dr. Tuğra GENÇPINAR</h4>
                            <p className="text-sm text-congress-red font-semibold">Chief Physician, Dokuz Eylül University Hospital</p>
                        </div>
                        
                        {/* Advisor 3 */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center group hover:shadow-md transition">
                            <div className="w-32 h-32 mx-auto bg-gray-100 rounded-2xl mb-4 flex items-center justify-center border-4 border-congress-cream overflow-hidden relative shadow-inner">
                                <i className="fa-solid fa-user-tie text-5xl text-gray-300 absolute z-0"></i>
                                <img src="/serdar-bayrak.jpg" className="speaker-img" alt="Prof. Dr. Serdar BAYRAK" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-1">Prof. Dr. Serdar BAYRAK</h4>
                            <p className="text-sm text-congress-red font-semibold">Dean, Dokuz Eylül University Faculty of Medicine</p>
                        </div>
                    </div>
                </div>

                {/* Organizing Committee */}
                <div>
                    <h3 className="text-2xl font-serif font-bold text-congress-gold mb-10 text-center uppercase tracking-widest">Organizing Committee</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
                        
                        {/* Organizer 1 */}
                        <div className="text-center group">
                            <div className="w-28 h-28 mx-auto bg-gray-100 rounded-2xl mb-4 flex items-center justify-center shadow-inner overflow-hidden relative border-2 border-transparent group-hover:border-congress-gold transition text-gray-300">
                                <i className="fa-solid fa-user text-4xl absolute z-0"></i>
                                <img src="/muge-sagim.jpg" className="speaker-img" alt="Gülsüm Müge Sağım" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900">Gülsüm Müge Sağım</h4>
                            <p className="text-sm text-gray-600 font-semibold">Congress Chair</p>
                            <p className="text-xs text-congress-red font-bold uppercase tracking-wider mt-1">General Coordination</p>
                        </div>

                        {/* Organizer 2 */}
                        <div className="text-center group">
                            <div className="w-28 h-28 mx-auto bg-gray-100 rounded-2xl mb-4 flex items-center justify-center shadow-inner overflow-hidden relative border-2 border-transparent group-hover:border-congress-gold transition text-gray-300">
                                <i className="fa-solid fa-user text-4xl absolute z-0"></i>
                                <img src="/sultan-hilal.jpg" className="speaker-img" alt="Sultan Hilal Solak" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900">Sultan Hilal Solak</h4>
                            <p className="text-sm text-gray-600 font-semibold">Congress Chair</p>
                            <p className="text-xs text-congress-red font-bold uppercase tracking-wider mt-1">Scientific Coordinator</p>
                        </div>

                        {/* Organizer 3 */}
                        <div className="text-center group">
                            <div className="w-28 h-28 mx-auto bg-gray-100 rounded-2xl mb-4 flex items-center justify-center shadow-inner overflow-hidden relative border-2 border-transparent group-hover:border-congress-gold transition text-gray-300">
                                <i className="fa-solid fa-user text-4xl absolute z-0"></i>
                                <img src="/baran-demircan.jpg" className="speaker-img" alt="Tolgay Baran Demircan" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900">Tolgay Baran Demircan</h4>
                            <p className="text-sm text-gray-600 font-semibold">Congress Chair</p>
                            <p className="text-xs text-congress-red font-bold uppercase tracking-wider mt-1">Scientific Coordinator</p>
                        </div>

                        {/* Organizer 4 */}
                        <div className="text-center group">
                            <div className="w-28 h-28 mx-auto bg-gray-100 rounded-2xl mb-4 flex items-center justify-center shadow-inner overflow-hidden relative border-2 border-transparent group-hover:border-congress-gold transition text-gray-300">
                                <i className="fa-solid fa-user text-4xl absolute z-0"></i>
                                <img src="/tunahan-ergurhan.jpg" className="speaker-img" alt="Tunahan Ergürhan" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900">Tunahan Ergürhan</h4>
                            <p className="text-sm text-gray-600 font-semibold">Congress Chair</p>
                            <p className="text-xs text-congress-red font-bold uppercase tracking-wider mt-1">Technical Coordinator</p>
                        </div>

                        {/* Organizer 5 */}
                        <div className="text-center group">
                            <div className="w-28 h-28 mx-auto bg-gray-100 rounded-2xl mb-4 flex items-center justify-center shadow-inner overflow-hidden relative border-2 border-transparent group-hover:border-congress-gold transition text-gray-300">
                                <i className="fa-solid fa-user text-4xl absolute z-0"></i>
                                <img src="/beyza-bilir.jpg" className="speaker-img" alt="Beyza Bilge Bilir" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900">Beyza Bilge Bilir</h4>
                            <p className="text-sm text-gray-600 font-semibold">Congress Chair</p>
                            <p className="text-xs text-congress-red font-bold uppercase tracking-wider mt-1">Design Coordinator</p>
                        </div>

                        {/* Organizer 6 */}
                        <div className="text-center group">
                            <div className="w-28 h-28 mx-auto bg-gray-100 rounded-2xl mb-4 flex items-center justify-center shadow-inner overflow-hidden relative border-2 border-transparent group-hover:border-congress-gold transition text-gray-300">
                                <i className="fa-solid fa-user text-4xl absolute z-0"></i>
                                <img src="/piraye-dundar.jpg" className="speaker-img" alt="Piraye Dündar" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900">Piraye Dündar</h4>
                            <p className="text-sm text-gray-600 font-semibold">Congress Chair</p>
                            <p className="text-xs text-congress-red font-bold uppercase tracking-wider mt-1">Finance Coordinator</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* ── INVITED SPEAKERS ── */}
        {activeSection === "speakers" && (
          <div className="page-section py-12">
            <div className="container mx-auto px-6 max-w-5xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-serif text-congress-red mb-4">Invited Speakers</h2>
                    <div className="w-24 h-1 bg-congress-red mx-auto mb-6"></div>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg">We are honored to host distinguished experts in cardiovascular health.</p>
                </div>
                
                <div className="space-y-12">
                    {/* Carlos A. Mestres */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start hover:shadow-md transition duration-300">
                        <div className="w-full md:w-1/3 flex flex-col items-center text-center flex-shrink-0">
                            <div className="w-40 h-40 rounded-2xl bg-gray-100 border-4 border-congress-cream shadow-inner overflow-hidden relative mb-4 flex items-center justify-center text-gray-300">
                                <i className="fa-solid fa-user-tie text-6xl absolute z-0"></i>
                                <img src="/carlos-mestres.jpg" className="speaker-img" alt="Prof. Dr. Carlos A. Mestres" />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-gray-900 leading-tight">Prof. Dr. Carlos A. Mestres</h3>
                            <p className="text-congress-red font-semibold mt-2">Cardiovascular & Thoracic Surgeon</p>
                        </div>
                        <div className="w-full md:w-2/3">
                            <div className="text-gray-600 text-justify text-sm md:text-base space-y-4 leading-relaxed">
                                <p>Prof. Dr. Carlos A. Mestres is an internationally renowned cardiovascular and thoracic surgeon whose career spans over four decades of clinical excellence, academic leadership, and global collaboration. Trained in Barcelona and holding both MD and PhD degrees, he has built a distinguished career across Europe, the Middle East, and Asia, contributing to some of the most advanced centres in cardiac surgery.</p>
                                <p>He has held senior and leadership positions at institutions such as University Hospital Zürich and Cleveland Clinic Abu Dhabi, and currently serves as Extraordinary Professor of Cardiothoracic Surgery at the University of the Free State. Throughout his career, he has also been actively involved in postgraduate education, surgical training, and international academic programmes, shaping the next generation of cardiac surgeons.</p>
                                <p>Prof. Mestres’ clinical and research interests focus on complex cardiac procedures, including valvular heart disease, aortic pathology, and infective endocarditis. His work integrates surgical innovation with a deep understanding of cardiovascular pathology, contributing to improved patient outcomes and advancing contemporary cardiac surgery.</p>
                                <p>With an extensive portfolio of international lectures, scientific contributions, and collaborative projects, Prof. Dr. Mestres stands as a leading figure in global cardiovascular surgery. His participation in Vita Cordis 2026 offers a unique opportunity for attendees to gain insights from a surgeon whose career reflects both technical mastery and academic depth.</p>
                            </div>
                        </div>
                    </div>

                    {/* Alberto Ortiz */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start hover:shadow-md transition duration-300">
                        <div className="w-full md:w-1/3 flex flex-col items-center text-center flex-shrink-0">
                            <div className="w-40 h-40 rounded-2xl bg-gray-100 border-4 border-congress-cream shadow-inner overflow-hidden relative mb-4 flex items-center justify-center text-gray-300">
                                <i className="fa-solid fa-user-tie text-6xl absolute z-0"></i>
                                <img src="/alberto-ortiz.jpg" className="speaker-img" alt="Prof. Dr. Alberto Ortiz" />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-gray-900 leading-tight">Prof. Dr. Alberto Ortiz</h3>
                            <p className="text-congress-red font-semibold mt-2">Head of Nephrology & Hypertension</p>
                        </div>
                        <div className="w-full md:w-2/3">
                            <div className="text-gray-600 text-justify text-sm md:text-base space-y-4 leading-relaxed">
                                <p>Alberto Ortiz, MD, PhD, FERA, is the Head of Nephrology and Hypertension at Fundación Jiménez Díaz and Professor of Medicine at Universidad Autónoma de Madrid. He serves as Renal Science Chair of the European Renal Association (ERA).</p>
                                <p>Ortiz also coordinates Spain’s Kidney Research Network (REDINREN/RICORS2040) and SPACKDc, focusing on CKD genomics. He received the 2020 ERA Award for Research Excellence and co-chaired the KDIGO Controversies Conference on Kidney Health in 2023.</p>
                                <p>His research focuses on CKD epidemiology, acute kidney injury, and CKD pathogenesis. He was Editor-in-Chief of Clinical Kidney Journal from 2014 to 2022.</p>
                            </div>
                        </div>
                    </div>

                    {/* Mladen Milovanovic */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start hover:shadow-md transition duration-300">
                        <div className="w-full md:w-1/3 flex flex-col items-center text-center flex-shrink-0">
                            <div className="w-40 h-40 rounded-2xl bg-gray-100 border-4 border-congress-cream shadow-inner overflow-hidden relative mb-4 flex items-center justify-center text-gray-300">
                                <i className="fa-solid fa-user-tie text-6xl absolute z-0"></i>
                                <img src="/mladen-milovanovic.jpg" className="speaker-img" alt="Dr. Mladen Milovanovic" />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-gray-900 leading-tight">Dr. Mladen Milovanovic</h3>
                            <p className="text-congress-red font-semibold mt-2">Consultant Cardiologist</p>
                        </div>
                        <div className="w-full md:w-2/3">
                            <div className="text-gray-600 text-justify text-sm md:text-base space-y-4 leading-relaxed">
                                <p>Dr. Mladen Milovanovic is a Consultant Cardiologist with specialist qualifications in Cardiology and Internal Medicine, currently practicing in Sweden. He has extensive clinical experience across multiple healthcare systems, including work within the National Health Service (UK) and the Swedish healthcare system. His practice spans both inpatient and outpatient cardiology, with particular focus on heart failure management, acute cardiology, and cardiovascular diagnostics.</p>
                                <p>In addition to his clinical work, Dr. Milovanovic has a strong academic and strategic interest in healthcare innovation and system development. He studied Strategy and Innovation at Warwick Business School, University of Warwick (Coventry/London), where he was awarded distinction for his work on advanced care delivery models, including Hospital at Home.</p>
                                <p>His professional interests include heart failure, cardiovascular imaging, and the development of patient-centred and sustainable models of care. He is particularly engaged in exploring how clinical practice can be enhanced through innovation, system design, and emerging technologies, including digital health and artificial intelligence.</p>
                                <p>Dr. Milovanovic has contributed to international discussions on healthcare innovation and clinical practice, and is committed to bridging high-quality clinical care with forward-looking healthcare solutions. He is currently based in Stockholm, Sweden, and is actively involved in international clinical and professional collaborations.</p>
                            </div>
                        </div>
                    </div>

                    {/* Yasir Zaroug */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start hover:shadow-md transition duration-300">
                        <div className="w-full md:w-1/3 flex flex-col items-center text-center flex-shrink-0">
                            <div className="w-40 h-40 rounded-2xl bg-gray-100 border-4 border-congress-cream shadow-inner overflow-hidden relative mb-4 flex items-center justify-center text-gray-300">
                                <i className="fa-solid fa-user-tie text-6xl absolute z-0"></i>
                                <img src="/yasir-zaroug.jpg" className="speaker-img" alt="Professor Yasir Zaroug" />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-gray-900 leading-tight">Professor Yasir Zaroug</h3>
                            <p className="text-congress-red font-semibold mt-2">Diabetologist & Metabolic Medicine Researcher</p>
                        </div>
                        <div className="w-full md:w-2/3">
                            <div className="text-gray-600 text-justify text-sm md:text-base space-y-4 leading-relaxed">
                                <p>Professor Zaroug is a distinguished Diabetologist, Metabolic Medicine Researcher, and Family Physician. He holds an IDF fellowship, a Master of Diabetes with Distinction from the University of Warwick, UK, a Master of Family Medicine, and a Postgraduate Award in Healthcare Administration, also from the University of Warwick, UK.</p>
                                <p>He is also the founder of the CTC research hub center. Professor Zaroug has published numerous papers in the field and actively participates in international conferences, contributing significantly to the scientific community.</p>
                                <p>His primary area of contribution lies in the management of cardiovascular risk through the primary prevention and control of Diabetes and obesity (Diabesity).</p>
                            </div>
                        </div>
                    </div>

                    {/* Kutsal Baran Özkurt */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start hover:shadow-md transition duration-300">
                        <div className="w-full md:w-1/3 flex flex-col items-center text-center flex-shrink-0">
                            <div className="w-40 h-40 rounded-2xl bg-gray-100 border-4 border-congress-cream shadow-inner overflow-hidden relative mb-4 flex items-center justify-center text-gray-300">
                                <i className="fa-solid fa-user-tie text-6xl absolute z-0"></i>
                                <img src="/kutsal-baran.jpg" className="speaker-img" alt="Kutsal Baran Özkurt" />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-gray-900 leading-tight">Kutsal Baran Özkurt</h3>
                            <p className="text-congress-red font-semibold mt-2">Engineer, Scientist & Entrepreneur</p>
                        </div>
                        <div className="w-full md:w-2/3">
                            <div className="text-gray-600 text-justify text-sm md:text-base space-y-4 leading-relaxed">
                                <p>Kutsal Baran Özkurt is an engineer, scientist, and entrepreneur dedicated to advancing artificial intelligence in medicine. As the founder of Nexgene AI, he develops sophisticated artificial intelligence models with deep medical reasoning capabilities designed for use in clinical diagnosis and decision support processes.</p>
                                <p>The AI solutions developed by his team are actively utilized by thousands of expert physicians at some of the world's premier healthcare and research institutions, including Harvard Medical School, MD Anderson Cancer Center, and Stanford Medicine.</p>
                                <p>In addition to its national academic achievements at Teknofest, Nexgene AI has proven its success on a global scale by securing awards with its medical AI solutions in competitions hosted by internationally renowned organizations such as the MIT Media Lab, Nvidia, and StartX.</p>
                            </div>
                        </div>
                    </div>

                    {/* Mehmet Kocabey */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start hover:shadow-md transition duration-300">
                        <div className="w-full md:w-1/3 flex flex-col items-center text-center flex-shrink-0">
                            <div className="w-40 h-40 rounded-2xl bg-gray-100 border-4 border-congress-cream shadow-inner overflow-hidden relative mb-4 flex items-center justify-center text-gray-300">
                                <i className="fa-solid fa-user-tie text-6xl absolute z-0"></i>
                                <img src="/mehmet-kocabey.jpg" className="speaker-img" alt="Asst. Prof. Dr. Mehmet Kocabey" />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-gray-900 leading-tight">Asst. Prof. Dr. Mehmet Kocabey</h3>
                            <p className="text-congress-red font-semibold mt-2">Clinical Geneticist</p>
                        </div>
                        <div className="w-full md:w-2/3">
                            <div className="text-gray-600 text-justify text-sm md:text-base space-y-4 leading-relaxed">
                                <p>Mehmet is a clinical geneticist with a special interest in rare diseases. He graduated from Ankara University Faculty of Medicine in 2015. After obtaining his residency degree in medical genetics from Dokuz Eylül University Faculty of Medicine, he played a role in running genetic outpatient clinics in various cities across Turkey. He has diagnosed many patients and provided pre- and post-test genetic counselling. Additionally, he was involved in laboratory setup processes. He has advanced experience in both cytogenetic techniques (chromosome analysis, FISH, etc.) and molecular genetic techniques (Next Generation Sequencing, Sanger sequencing, PCR-based methods, deletion and duplication analyses, etc.). He has been working in the field of clinical and laboratory genetics for the last 11 years, and he has publications and conference presentations on rare diseases. Since 2023, he has been participating as an academic lecturer in undergraduate and postgraduate education at Dokuz Eylül University, Department of Medical Genetics.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
          </div>
        )}

        {/* SCIENTIFIC PROGRAM */}
        {activeSection === "program" && (
          <div className="page-section py-12">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-serif text-congress-red mb-4">Scientific Program</h2>
                    <div className="w-24 h-1 bg-congress-red mx-auto mb-6"></div>
                    <p className="text-gray-500 text-sm uppercase tracking-widest font-bold">Panels & Sessions</p>
                </div>

                {/* Paneller Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* Cardiology */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                        <div className="w-12 h-12 bg-congress-cream rounded-lg flex items-center justify-center text-congress-red mb-4">
                            <i className="fa-solid fa-heart-pulse text-2xl"></i>
                        </div>
                        <h4 className="text-xl font-serif font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Cardiology</h4>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li className="flex items-start gap-2"><i className="fa-solid fa-caret-right text-congress-gold mt-1"></i> <span>Heart Failure: Current Strategies & Emerging Approaches</span></li>
                        </ul>
                    </div>

                    {/* Cardiovascular Surgery & Emergency */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                        <div className="w-12 h-12 bg-congress-cream rounded-lg flex items-center justify-center text-congress-red mb-4">
                            <i className="fa-solid fa-kit-medical text-2xl"></i>
                        </div>
                        <h4 className="text-xl font-serif font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Cardiovascular Surgery & Emergency</h4>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li className="flex items-start gap-2"><i className="fa-solid fa-caret-right text-congress-gold mt-1"></i> <span>Session 1: Acute Cardiac Emergencies: Early Diagnosis and Stabilization</span></li>
                            <li className="flex items-start gap-2"><i className="fa-solid fa-caret-right text-congress-gold mt-1"></i> <span>Session 2: Surgical Strategies in Critical Cardiac Conditions</span></li>
                        </ul>
                    </div>

                    {/* Artificial Intelligence in Cardiology */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                        <div className="w-12 h-12 bg-congress-cream rounded-lg flex items-center justify-center text-congress-red mb-4">
                            <i className="fa-solid fa-microchip text-2xl"></i>
                        </div>
                        <h4 className="text-xl font-serif font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Artificial Intelligence in Cardiology</h4>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li className="flex items-start gap-2"><i className="fa-solid fa-caret-right text-congress-gold mt-1"></i> <span>Session 1: AI-Enabled Innovation in Cardiovascular Diagnostics</span></li>
                            <li className="flex items-start gap-2"><i className="fa-solid fa-caret-right text-congress-gold mt-1"></i> <span>Session 2: Machine Learning and Future of Cardiac Care</span></li>
                        </ul>
                    </div>

                    {/* Nephrology */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                        <div className="w-12 h-12 bg-congress-cream rounded-lg flex items-center justify-center text-congress-red mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-7 h-7 fill-current">
                                <path d="M298.6 38.3C241.5 5.5 162.7 10 114 62.7C53.7 127 34 218 46 305.5C58 392.3 106 468 178 514c22.8 14.5 50.1 15 73.1 .5c36.4-23.1 52.3-69.5 37.8-109.5c-7.7-21.2-22.3-39.2-43.1-51.1c-16-9.1-23.6-28.5-16.7-45.7c5.2-12.9 17.5-21.4 31.4-21.4c13.7 0 25.8 8.3 31.2 21c8.7 20.3 26 36.3 47.9 44.2c35.4 12.8 75.8 3.5 97.4-25.2c33.6-44.5 44-103.5 27.2-155.6C445.6 112 396.4 66.5 335.4 51.5c-12.4-3.1-24.8-4.3-36.8-13.2z"/>
                            </svg>
                        </div>
                        <h4 className="text-xl font-serif font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Nephrology</h4>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li className="flex items-start gap-2"><i className="fa-solid fa-caret-right text-congress-gold mt-1"></i> <span>Cardiorenal Interactions: Hypertension, CKD and Heart Outcomes</span></li>
                        </ul>
                    </div>

                    {/* Neurology */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                        <div className="w-12 h-12 bg-congress-cream rounded-lg flex items-center justify-center text-congress-red mb-4">
                            <i className="fa-solid fa-brain text-2xl"></i>
                        </div>
                        <h4 className="text-xl font-serif font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Neurology</h4>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li className="flex items-start gap-2"><i className="fa-solid fa-caret-right text-congress-gold mt-1"></i> <span>Stroke and Cardiac Risk: Bridging the Gap</span></li>
                        </ul>
                    </div>

                    {/* Oncology */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                        <div className="w-12 h-12 bg-congress-cream rounded-lg flex items-center justify-center text-congress-red mb-4">
                            <i className="fa-solid fa-ribbon text-2xl"></i>
                        </div>
                        <h4 className="text-xl font-serif font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Oncology</h4>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li className="flex items-start gap-2"><i className="fa-solid fa-caret-right text-congress-gold mt-1"></i> <span>Cardiotoxicity in Cancer Therapy: From Bench to Bedside</span></li>
                        </ul>
                    </div>

                    {/* Genetics */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                        <div className="w-12 h-12 bg-congress-cream rounded-lg flex items-center justify-center text-congress-red mb-4">
                            <i className="fa-solid fa-dna text-2xl"></i>
                        </div>
                        <h4 className="text-xl font-serif font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Genetics</h4>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li className="flex items-start gap-2"><i className="fa-solid fa-caret-right text-congress-gold mt-1"></i> <span>Syndromic Heart Diseases: From Genes to Clinics</span></li>
                        </ul>
                    </div>

                    {/* Endocrinology */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                        <div className="w-12 h-12 bg-congress-cream rounded-lg flex items-center justify-center text-congress-red mb-4">
                            <i className="fa-solid fa-vial text-2xl"></i>
                        </div>
                        <h4 className="text-xl font-serif font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Endocrinology</h4>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li className="flex items-start gap-2"><i className="fa-solid fa-caret-right text-congress-gold mt-1"></i> <span>Diabetes and Chronic Disease: Protecting the Heart</span></li>
                        </ul>
                    </div>

                    {/* Environmental Impact */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                        <div className="w-12 h-12 bg-congress-cream rounded-lg flex items-center justify-center text-congress-red mb-4">
                            <i className="fa-solid fa-leaf text-2xl"></i>
                        </div>
                        <h4 className="text-xl font-serif font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Environmental Impact</h4>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li className="flex items-start gap-2"><i className="fa-solid fa-caret-right text-congress-gold mt-1"></i> <span>Air Pollution and Cardiovascular Risk: Evidence and Action</span></li>
                        </ul>
                    </div>

                    {/* Gynecology */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                        <div className="w-12 h-12 bg-congress-cream rounded-lg flex items-center justify-center text-congress-red mb-4">
                            <i className="fa-solid fa-venus text-2xl"></i>
                        </div>
                        <h4 className="text-xl font-serif font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Gynecology</h4>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li className="flex items-start gap-2"><i className="fa-solid fa-caret-right text-congress-gold mt-1"></i> <span>Women and Heart Diseases: Beyond Standard Paradigm</span></li>
                        </ul>
                    </div>

                    {/* Pediatric Cardiology */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                        <div className="w-12 h-12 bg-congress-cream rounded-lg flex items-center justify-center text-congress-red mb-4">
                            <i className="fa-solid fa-baby text-2xl"></i>
                        </div>
                        <h4 className="text-xl font-serif font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Pediatric Cardiology</h4>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li className="flex items-start gap-2"><i className="fa-solid fa-caret-right text-congress-gold mt-1"></i> <span>Congenital Heart Diseases: From Diagnosis to Management</span></li>
                        </ul>
                    </div>

                </div>
            </div>
          </div>
        )}

        {/* ABSTRACT SUBMISSION */}
        {activeSection === "abstract" && (
          <div className="page-section py-12">
            <div className="container mx-auto px-6 max-w-6xl">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-serif text-congress-red mb-4">Abstract Submission</h2>
                <div className="w-24 h-1 bg-congress-red mx-auto mb-8"></div>
                <div className="inline-flex items-center gap-3 bg-red-50 text-congress-red border border-red-100 px-6 py-3 rounded-lg shadow-sm">
                  <i className="fa-regular fa-clock text-xl"></i>
                  <span className="font-bold uppercase tracking-wider">Deadline: <span className="text-black">24 April 2026</span></span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-serif text-gray-800 mb-4">General Rules</h3>
                    <ul className="space-y-4 text-gray-600">
                      <li className="flex items-start gap-3"><i className="fa-solid fa-check text-congress-gold mt-1"></i><span>Oral & Poster accepted.</span></li>
                      <li className="flex items-start gap-3"><i className="fa-solid fa-check text-congress-gold mt-1"></i><span>Language: <strong>English</strong>.</span></li>
                      <li className="flex items-start gap-3"><i className="fa-solid fa-check text-congress-gold mt-1"></i><span>Submission via <strong>e-mail only</strong>.</span></li>
                    </ul>
                  </div>
                  <div className="mt-8">
                    <a href="mailto:vita.cordis.2026@gmail.com" className="inline-flex items-center justify-center w-full bg-congress-red text-white px-6 py-3 rounded-xl hover:bg-congress-dark transition font-bold shadow-lg">
                      <i className="fa-regular fa-paper-plane mr-2"></i> Submit Abstract via Email
                    </a>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-2xl font-serif text-gray-800 mb-4">Writing Guidelines</h3>
                  <div className="space-y-4 text-sm text-gray-600">
                    <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-congress-gold"><strong>Title:</strong> Concise, capitalize each word.</div>
                    <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-congress-gold"><strong>Introduction (Aim):</strong> Purpose & importance.</div>
                    <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-congress-gold"><strong>Results:</strong> Clear numerical findings.</div>
                    <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-congress-gold"><strong>Conclusion:</strong> Scientific contribution.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SOCIAL EVENTS */}
        {activeSection === "social" && (
          <div className="page-section py-24">
            <div className="container mx-auto px-6 text-center max-w-2xl">
              <div className="w-24 h-24 bg-congress-red/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <i className="fa-solid fa-champagne-glasses text-4xl text-congress-red"></i>
              </div>
              <h2 className="text-4xl md:text-5xl font-serif text-congress-red mb-6">Social Events</h2>
              <div className="inline-block px-8 py-3 bg-white border border-congress-red text-congress-red rounded-full font-bold shadow-sm">
                Announcing Soon
              </div>
            </div>
          </div>
        )}

        {/* REGISTRATION */}
        {activeSection === "registration" && (
          <div className="page-section py-12">
            <div className="container mx-auto px-6 max-w-3xl">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-congress-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fa-solid fa-file-signature text-3xl text-congress-red"></i>
                </div>
                <h2 className="text-4xl md:text-5xl font-serif text-congress-red mb-4">Congress Registration</h2>
                <div className="w-24 h-1 bg-congress-red mx-auto mb-4"></div>
                <p className="text-gray-500 text-lg">Please complete the steps below to register for Vita Cordis 2026.</p>
              </div>

              <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
                <RegistrationWizard />
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-congress-red text-white py-8 border-t border-white/10 mt-auto">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-6">
          <div>
            <h3 className="font-serif text-xl font-bold">Vita Cordis 2026</h3>
            <p className="text-white/70 text-xs">International Congress on Multidisciplinary Approaches to the Heart</p>
          </div>
          <div className="text-sm space-y-2">
            <p><i className="fa-solid fa-envelope mr-2 text-congress-gold"></i> vita.cordis.2026@gmail.com</p>
            <p><i className="fa-solid fa-phone mr-2 text-congress-gold"></i> +90 544 213 45 96</p>
            <p><i className="fa-solid fa-location-dot mr-2 text-congress-gold"></i> İzmir, Türkiye</p>
          </div>
          <div className="flex space-x-4">
            <a href="https://www.instagram.com/emsadokuzeylulkongre?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer" className="hover:text-congress-gold text-2xl transition"><i className="fa-brands fa-instagram"></i></a>
          </div>
        </div>
      </footer>
    </>
  );
}
