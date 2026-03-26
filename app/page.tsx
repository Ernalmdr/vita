"use client";

import { useState } from "react";
import { submitRegistration } from "@/app/actions/submit-registration";
import { UploadDropzone } from "../utils/uploadthing";

export default function Home() {
  const [activeSection, setActiveSection] = useState("welcome");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const handleRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    const formData = new FormData(e.currentTarget);
    if (!receiptUrl) {
      setSubmitMessage({ type: 'error', text: 'Lütfen öncelikle dekontunuzu yükleyin.' });
      setIsSubmitting(false);
      return;
    }

    const result = await submitRegistration(formData);

    if (result.success) {
      setSubmitMessage({ type: 'success', text: 'Başvurunuz başarıyla alınmıştır. En kısa sürede sizinle iletişime geçilecektir.' });
      e.currentTarget.reset();
      setReceiptUrl(null);
    } else {
      setSubmitMessage({ type: 'error', text: result.error || 'Gönderim sırasında bir hata oluştu.' });
    }
    setIsSubmitting(false);
  };

  const showSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const navLinks = [
    { id: "welcome", html: <>Welcome<br />Message</>, mobileText: "Welcome Message" },
    { id: "general-info", html: <>General<br />Information</>, mobileText: "General Information" },
    { id: "organization", html: <>Organization<br />Committee</>, mobileText: "Organization Committee" },
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
                  <span className="uppercase tracking-widest text-sm font-semibold">May 2–3, 2026 • İzmir, Türkiye</span>
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
                <p className="mb-6">Taking place on <strong>May 2–3, 2026</strong>, Vita Cordis seeks to provide a comprehensive scientific platform that brings together diverse disciplines involved in cardiovascular care.</p>
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
                  <p className="text-sm text-gray-500 uppercase tracking-widest mt-1">EMSA Dokuz Eylül</p>
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
                    <p className="text-gray-600">The Vita Cordis Congress will be held at the <strong>DEU Faculty of Medicine, Classrooms Building, Founding Faculty Members Conference Hall</strong> in Izmir on May 2-3, 2026.</p>
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
                <p className="text-gray-500 max-w-2xl mx-auto text-lg">We can't wait to introduce our grand team to you.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="w-32 h-32 md:w-40 md:h-40 mx-auto bg-gray-100 rounded-full mb-4 flex items-center justify-center border-4 border-dashed border-gray-300 pulse-mystery">
                    <i className="fa-solid fa-question text-5xl text-gray-300"></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-400">Loading...</h3>
                </div>
                <div className="text-center">
                  <div className="w-32 h-32 md:w-40 md:h-40 mx-auto bg-gray-100 rounded-full mb-4 flex items-center justify-center border-4 border-dashed border-gray-300 pulse-mystery shadow-sm" style={{ animationDelay: '0.5s' }}>
                    <i className="fa-solid fa-question text-5xl text-gray-300"></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-400">Loading...</h3>
                </div>
                <div className="text-center">
                  <div className="w-32 h-32 md:w-40 md:h-40 mx-auto bg-gray-100 rounded-full mb-4 flex items-center justify-center border-4 border-dashed border-gray-300 pulse-mystery" style={{ animationDelay: '1s' }}>
                    <i className="fa-solid fa-question text-5xl text-gray-300"></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-400">Loading...</h3>
                </div>
                <div className="text-center">
                  <div className="w-32 h-32 md:w-40 md:h-40 mx-auto bg-gray-100 rounded-full mb-4 flex items-center justify-center border-4 border-dashed border-gray-300 pulse-mystery" style={{ animationDelay: '1.5s' }}>
                    <i className="fa-solid fa-question text-5xl text-gray-300"></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-400">Loading...</h3>
                </div>
              </div>

              <div className="text-center mt-16">
                <span className="inline-block bg-congress-red text-white px-8 py-3 rounded-full font-bold shadow-md tracking-widest uppercase text-sm">To Be Announced Soon</span>
              </div>
            </div>
          </div>
        )}

        {/* SCIENTIFIC PROGRAM */}
        {activeSection === "program" && (
          <div className="page-section py-12">
            <div className="container mx-auto px-6 max-w-5xl">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-serif text-congress-red mb-4">Scientific Program</h2>
                <div className="w-24 h-1 bg-congress-red mx-auto mb-6"></div>
                <p className="text-gray-500 text-sm uppercase tracking-widest font-bold">Preliminary Schedule</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transform transition duration-500 hover:scale-105">
                  <div className="bg-congress-red text-white p-6 flex justify-between items-center">
                    <h3 className="text-2xl font-serif font-bold">Day 1</h3>
                    <span className="text-sm bg-white/20 px-3 py-1 rounded">May 2, 2026</span>
                  </div>
                  <div className="p-12 text-center flex flex-col items-center justify-center h-64 bg-gray-50">
                    <i className="fa-solid fa-calendar-day text-5xl text-congress-gold mb-6 opacity-70"></i>
                    <h4 className="font-bold text-gray-700 text-xl mb-2">Exciting Sessions Coming Soon</h4>
                    <p className="text-sm text-gray-500">Stay tuned for the detailed schedule of our first day.</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transform transition duration-500 hover:scale-105">
                  <div className="bg-congress-gold text-white p-6 flex justify-between items-center">
                    <h3 className="text-2xl font-serif font-bold text-congress-red">Day 2</h3>
                    <span className="text-sm bg-congress-red/20 text-congress-red px-3 py-1 rounded font-bold">May 3, 2026</span>
                  </div>
                  <div className="p-12 text-center flex flex-col items-center justify-center h-64 bg-gray-50">
                    <i className="fa-solid fa-calendar-check text-5xl text-congress-red mb-6 opacity-70"></i>
                    <h4 className="font-bold text-gray-700 text-xl mb-2">Workshops & Panels Coming Soon</h4>
                    <p className="text-sm text-gray-500">We are preparing an amazing closing day for you.</p>
                  </div>
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
                    <a href="mailto:basharabdu2006@gmail.com" className="inline-flex items-center justify-center w-full bg-congress-red text-white px-6 py-3 rounded-xl hover:bg-congress-dark transition font-bold shadow-lg">
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
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-congress-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fa-solid fa-file-signature text-3xl text-congress-red"></i>
                </div>
                <h2 className="text-4xl md:text-5xl font-serif text-congress-red mb-4">Congress Registration</h2>
                <div className="w-24 h-1 bg-congress-red mx-auto mb-4"></div>
                <p className="text-gray-500 text-lg">Please fill out the form below to initiate your registration.</p>
              </div>

              <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
                {submitMessage && (
                  <div className={`mb-8 p-4 rounded-xl border flex items-start gap-4 ${submitMessage.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                    <i className={`fa-solid mt-1 text-xl ${submitMessage.type === 'success' ? 'fa-circle-check text-emerald-500' : 'fa-circle-exclamation text-red-500'}`}></i>
                    <p className="font-medium text-lg leading-tight">{submitMessage.text}</p>
                  </div>
                )}

                <form onSubmit={handleRegistration} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="block text-sm font-bold text-gray-700">Full Name (Ad Soyad)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fa-regular fa-user text-gray-400"></i>
                        </div>
                        <input type="text" id="fullName" name="fullName" required className="form-input bg-gray-50 pl-10" placeholder="Dr. John Doe" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className="block text-sm font-bold text-gray-700">Phone Number (Telefon)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fa-solid fa-phone text-gray-400"></i>
                        </div>
                        <input type="tel" id="phone" name="phone" required className="form-input bg-gray-50 pl-10" placeholder="+90 5xx xxx xx xx" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-bold text-gray-700">Email Address (E-posta)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fa-regular fa-envelope text-gray-400"></i>
                      </div>
                      <input type="email" id="email" name="email" required className="form-input bg-gray-50 pl-10" placeholder="john.doe@example.com" />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="block text-sm font-bold text-gray-700">Payment Receipt (Dekont - PDF)</label>
                    <input type="hidden" name="receiptUrl" value={receiptUrl || ""} />

                    {!receiptUrl ? (
                      <div className="mt-1 border-2 border-gray-300 border-dashed rounded-xl bg-gray-50 flex justify-center items-center p-4">
                        <UploadDropzone
                          endpoint="receiptPdfUploader"
                          onClientUploadComplete={(res) => {
                            if (res && res.length > 0) {
                              setReceiptUrl(res[0].url);
                              setSubmitMessage({ type: 'success', text: 'Dekont başarıyla yüklendi. Şimdi formu gönderebilirsiniz.' });
                            }
                          }}
                          onUploadError={(error: Error) => {
                            setSubmitMessage({ type: 'error', text: `Dekont yüklenemedi: ${error.message}` });
                          }}
                        />
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center justify-between px-6 py-5 border-2 border-emerald-300 rounded-xl bg-emerald-50">
                        <div className="flex items-center space-x-3">
                          <i className="fa-solid fa-file-pdf text-2xl text-emerald-600"></i>
                          <div>
                            <p className="text-sm font-medium text-emerald-800">Dekont Yüklendi</p>
                            <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline">Görüntüle</a>
                          </div>
                        </div>
                        <button type="button" onClick={() => setReceiptUrl(null)} className="text-sm text-red-500 hover:text-red-700 font-medium">Değiştir</button>
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-congress-red hover:bg-congress-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-congress-red transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <i className="fa-solid fa-circle-notch fa-spin"></i> Submitting...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <i className="fa-solid fa-paper-plane"></i> Submit Registration
                        </span>
                      )}
                    </button>
                  </div>
                </form>
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
            <p><i className="fa-solid fa-envelope mr-2 text-congress-gold"></i> dokuz-eylul@emsa-europe.eu</p>
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
