"use client";

import React, { useState, useEffect, useRef } from "react";
import { Settings, LogOut, User, MonitorPlay, Download, Edit2, Plus, Trash2, Save, X } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Load environment variable for admin access
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

// --- TYPES ---
export interface Project {
  title: string;
  description: string;
  tech: string;
  link?: string;
}

export interface Education {
  school: string;
  degree: string;
  years: string;
}

export interface Skills {
  programming: string[];
  web: string[];
  mobile: string[];
  other: string[];
}

export interface CVData {
  name: string;
  title: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  about: string;
  skills: Skills;
  education: Education[];
  certificates: string[];
  projects: Project[];
}

// --- INITIAL DATA ---
const defaultData: CVData = {
  name: "Yunus Emre Gün",
  title: "BİLGİSAYAR PROGRAMCILIĞI ÖĞRENCİSİ",
  email: "servoyunus@gmail.com",
  phone: "05432454345",
  github: "github.com/servoyunus-del",
  linkedin: "linkedin.com/in/yunus-emre-gün-0792373b0",
  about: "Bilgisayar Programcılığı öğrencisiyim. Web geliştirme ve temel yazılım alanlarında kendimi sürekli geliştiriyorum. HTML, CSS, JavaScript ile responsive projeler üretirken; Python, C# ve C++ dillerinde temel seviyede bilgiye sahibim. GitHub üzerinden paylaştığım Online Film İzleme Sayfası gibi projelerle pratik deneyim kazanıyorum. Öğrenime son derece açık, sorumluluk sahibi ve staj sürecinde ekibe aktif katkı sağlayarak hızlıca değer katmayı hedefleyen biriyim.",
  skills: {
    programming: ["Python", "C#", "C++", "JavaScript", "Kotlin", "Java", "Node.js"],
    web: ["HTML5", "CSS3"],
    mobile: ["Android Studio", "Firebase", "Jitsi Meet SDK"],
    other: ["Temel programlama mantığı", "Algoritmalar", "Windows kurulumu", "Ağ temelleri"]
  },
  education: [
    { school: "Kütahya Dumlupınar Üniversitesi", degree: "Bilgisayar Programcılığı", years: "2024 - Devam Ediyor" }
  ],
  certificates: [
    ""
  ],
  projects: [
    {
      title: "Call Of Duty 2 Oyun Tanıtım sitesi",
      description: "Bilgisayar Programcılığı eğitimim kapsamında geliştirmiş olduğum öğrenim amaçlı web sitesi.",
      tech: "HTML, CSS, JavaScript",
      link: "İncele →"
    }
  ]
};

export default function CVContent() {
  const [data, setData] = useState<CVData>(defaultData);
  const [draftData, setDraftData] = useState<CVData>(defaultData);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSavedPulse, setIsSavedPulse] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const cvRef = useRef<HTMLDivElement>(null);

  // Load from local storage and check active session
  useEffect(() => {
    const adminSession = sessionStorage.getItem("adminSession");
    if (adminSession === "active") {
      setIsAdmin(true);
    }

    const savedData = localStorage.getItem("cvData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData) as CVData;
        setData(parsedData);
        setDraftData(parsedData);
      } catch (e) {
        console.error("Local storage error, using default data initialized.");
      }
    } else {
      // Varsayılan data.json simülasyonu zaten defaultData
      setData(defaultData);
      setDraftData(defaultData);
    }
    setIsLoaded(true);
  }, []);

  const handleAdminToggle = () => {
    if (isAdmin) {
      handleLogout();
    } else {
      setShowPasswordPrompt(true);
    }
  };

  const submitPassword = () => {
    if (isLocked) {
      setErrorMessage("Çok fazla hatalı deneme. Lütfen sistemin kilidinin açılmasını bekleyin.");
      return;
    }

    if (!ADMIN_PASSWORD) {
      // Güvenlik: Fallback (Eğer environment variable set edilmemişse admin girişi bloke olur)
      setErrorMessage("Sistem güvenlik hatası: Admin girişi tanımlanmamış veya kapalı.");
      return;
    }

    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowPasswordPrompt(false);
      setPasswordInput("");
      setFailedAttempts(0);
      setErrorMessage("");
      sessionStorage.setItem("adminSession", "active");
      setDraftData(data);
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      setPasswordInput("");
      
      if (newAttempts >= 3) {
        setIsLocked(true);
        setErrorMessage("Çok fazla hatalı giriş! Sistem 3 dakika kilitlendi.");
        setTimeout(() => {
          setIsLocked(false);
          setFailedAttempts(0);
          setErrorMessage("");
        }, 180000); // 3-minute lockout
      } else {
        setErrorMessage(`Hatalı şifre! (Kalan deneme hakkı: ${3 - newAttempts})`);
      }
    }
  };

  const handleSave = () => {
    setData(draftData);
    localStorage.setItem("cvData", JSON.stringify(draftData));

    // Ufak bir yeşil yanma efekti
    setIsSavedPulse(true);
    setTimeout(() => setIsSavedPulse(false), 1500);
  };

  const handleCancel = () => {
    setDraftData(data); // Revert to original data without logging out
  };

  const handleLogout = () => {
    setDraftData(data); // Revert unsaved changes
    setIsAdmin(false);
    sessionStorage.removeItem("adminSession");
  };

  // Proje işlemleri (Ekleme/Silme)
  const addProject = () => {
    const newProject: Project = {
      title: "Yeni Proje",
      description: "Proje açıklaması, detaylar...",
      tech: "Teknolojiler",
      link: "Bağlantı →"
    };
    setDraftData({ ...draftData, projects: [...draftData.projects, newProject] });
  };

  const removeProject = (index: number) => {
    const newProjects = [...draftData.projects];
    newProjects.splice(index, 1);
    setDraftData({ ...draftData, projects: newProjects });
  };

  // PDF İndirme İşlemi
  const generatePDF = async () => {
    if (!cvRef.current) return;
    setIsGeneratingPDF(true);

    try {
      const canvas = await html2canvas(cvRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#000000"
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("Yunus_Emre_Gun_CV.pdf");
    } catch (error) {
      console.error("PDF oluşturulurken hata:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Generic text editor component
  const EditableField = ({
    value,
    onChange,
    multiline = false,
    className = "",
    wrapperClass = "",
    isLink = false
  }: {
    value: string,
    onChange: (val: string) => void,
    multiline?: boolean,
    className?: string,
    wrapperClass?: string,
    isLink?: boolean
  }) => {
    if (!isAdmin) {
      if (isLink && value) {
        const isEmail = value.includes("@") && !value.includes("/");
        const href = isEmail ? `mailto:${value}` : (value.startsWith("http") ? value : `https://${value}`);
        return (
          <a href={href} target="_blank" rel="noopener noreferrer" className={`${className} hover:text-blue-400 hover:underline transition-colors break-words`}>
            {value}
          </a>
        );
      }
      return <span className={`${className} break-words`}>{value || ""}</span>;
    }

    const baseInputClasses = "w-full bg-transparent border-b border-gray-700/60 border-dashed hover:border-blue-500 hover:bg-white/[0.02] focus:bg-white/[0.04] focus:border-blue-400 focus:border-solid focus:outline-none transition-all px-1 -mx-1 py-0.5 rounded-t placeholder-gray-600";

    return (
      <div className={`relative group ${wrapperClass}`}>
        {multiline ? (
          <textarea
            className={`${baseInputClasses} resize-y min-h-[80px] ${className}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <input
            type="text"
            className={`${baseInputClasses} ${className}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
        <Edit2 size={12} className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 text-blue-500/50 transition-opacity pointer-events-none" />
      </div>
    );
  };

  if (!isLoaded) return null;

  return (
    <div className="relative flex flex-col w-full h-full text-sm sm:text-base selection:bg-blue-500/30">

      {/* Settings Modal */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="bg-[#0a0a0a] border border-gray-800/80 p-8 rounded-xl w-80 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <h2 className="text-xl text-white font-medium mb-6 flex items-center gap-2">
              <Settings className="text-blue-500" size={20} />
              Admin Girişi
            </h2>
            <input
              type="password"
              placeholder="Şifre"
              className={`w-full bg-black border rounded-md p-3 text-white mb-2 focus:outline-none focus:ring-1 transition-all placeholder-gray-600 ${
                errorMessage ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/50" : "border-gray-800 focus:border-blue-500 focus:ring-blue-500/50"
              }`}
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitPassword()}
              disabled={isLocked}
              autoFocus
            />
            {errorMessage && (
              <div className="text-red-400 text-[13px] mb-5 font-medium animate-in fade-in slide-in-from-top-1 px-1">
                {errorMessage}
              </div>
            )}
            {!errorMessage && <div className="mb-6"></div>}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPasswordPrompt(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition rounded-md hover:bg-white/5"
              >
                İptal
              </button>
              <button
                onClick={submitPassword}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all font-medium"
              >
                Giriş
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Action Bar (Fixed at bottom) */}
      {isAdmin && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-gray-800/80 p-4 flex justify-between sm:justify-center items-center gap-4 z-50 animate-in slide-in-from-bottom-5">
          <span className="text-blue-400 text-sm mr-4 hidden sm:flex items-center gap-2 font-medium tracking-wide">
            <Edit2 size={16} />
            Yönetici Modu Aktif
          </span>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleCancel}
              className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-5 py-2.5 bg-transparent border border-gray-700 hover:bg-gray-800/50 hover:text-white text-gray-300 rounded-md transition font-medium"
            >
              <X size={16} />
              <span className="hidden xs:inline">Değişiklikleri</span> İptal Et
            </button>
            <button
              onClick={handleSave}
              className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-all shadow-lg ${isSavedPulse
                ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                }`}
            >
              <Save size={16} className={isSavedPulse ? "animate-pulse" : ""} />
              {isSavedPulse ? "Kaydedildi" : "Değişiklikleri Uygula"}
            </button>
          </div>
        </div>
      )}

      {/* Top Header Controls */}
      <div className="absolute top-4 right-4 flex space-x-3 z-10">
        <button
          onClick={generatePDF}
          disabled={isGeneratingPDF}
          className={`flex items-center space-x-2 px-4 py-2 border border-gray-800/80 bg-black/50 backdrop-blur hover:bg-gray-900 rounded-lg text-sm transition text-gray-300 shadow-lg ${isGeneratingPDF ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Download size={16} className={isGeneratingPDF ? 'animate-bounce' : ''} />
          <span className="hidden sm:inline">{isGeneratingPDF ? 'Hazırlanıyor...' : 'PDF İndir'}</span>
        </button>
        <button
          onClick={handleAdminToggle}
          className={`p-2 border rounded-lg transition shadow-lg ${isAdmin
            ? 'bg-blue-600/10 text-blue-400 border-blue-500/50 hover:bg-blue-600/20'
            : 'bg-black/50 border-gray-800/80 hover:bg-gray-900 text-gray-300 backdrop-blur'
            }`}
          title={isAdmin ? "Çıkış Yap" : "Admin Girişi"}
        >
          {isAdmin ? <LogOut size={16} /> : <Settings size={16} />}
        </button>
      </div>

      {/* Main CV Content Wrapper (for PDF generation) */}
      <div ref={cvRef} className="flex flex-col flex-1 bg-black overflow-hidden relative z-0 pb-16">

        {/* Header Section */}
        <header className="p-8 sm:p-12 border-b border-gray-900/60 bg-[#020202] flex flex-col sm:flex-row justify-between items-start sm:items-center relative">
          <div className="flex-1 pr-4 w-full sm:w-auto z-0">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2 tracking-tight">
              <EditableField
                value={draftData.name}
                onChange={(v) => setDraftData({ ...draftData, name: v })}
              />
            </h1>
            <p className="text-blue-500 font-semibold tracking-widest text-sm sm:text-base">
              <EditableField
                value={draftData.title}
                onChange={(v) => setDraftData({ ...draftData, title: v })}
              />
            </p>
          </div>

          <div className="mt-6 sm:mt-0 flex flex-col space-y-2 text-gray-400 text-sm xl:text-right w-full sm:w-80 shrink-0 z-0 text-right">
            <div className="flex items-start sm:items-center sm:justify-end gap-2 text-gray-300">
              <span className="hidden sm:inline text-gray-500 font-mono text-xs pt-0.5 sm:pt-0">Email</span>
              <EditableField
                value={draftData.email}
                onChange={(v) => setDraftData({ ...draftData, email: v })}
                className="text-right hover:text-white transition"
                wrapperClass="w-full sm:w-auto flex-1 sm:flex-none text-right"
                isLink
              />
            </div>
            <div className="flex items-start sm:items-center sm:justify-end gap-2 text-gray-300">
              <span className="hidden sm:inline text-gray-500 font-mono text-xs pt-0.5 sm:pt-0">Phone</span>
              <EditableField
                value={draftData.phone}
                onChange={(v) => setDraftData({ ...draftData, phone: v })}
                className="text-right hover:text-white transition"
                wrapperClass="w-full sm:w-auto flex-1 sm:flex-none text-right"
              />
            </div>
            <div className="flex items-start sm:items-center sm:justify-end gap-2 text-blue-400/80 hover:text-blue-400 transition cursor-pointer">
              <span className="hidden sm:inline text-blue-500/40 font-mono text-xs pt-0.5 sm:pt-0">GitHub</span>
              <EditableField
                value={draftData.github}
                onChange={(v) => setDraftData({ ...draftData, github: v })}
                className="text-right"
                wrapperClass="w-full sm:w-auto flex-1 sm:flex-none text-right"
                isLink
              />
            </div>
            <div className="flex items-start sm:items-center sm:justify-end gap-2 text-blue-400/80 hover:text-blue-400 transition cursor-pointer">
              <span className="hidden sm:inline text-blue-500/40 font-mono text-xs pt-0.5 sm:pt-0">LinkedIn</span>
              <EditableField
                value={draftData.linkedin}
                onChange={(v) => setDraftData({ ...draftData, linkedin: v })}
                className="text-right"
                wrapperClass="w-full sm:w-auto flex-1 sm:flex-none text-right"
                isLink
              />
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 relative bg-black">

          {/* Left Column */}
          <div className="md:col-span-4 lg:col-span-3 p-8 border-r border-gray-900/60 bg-[#040404]">

            {/* TEKNİK BECERİLER */}
            <div className="mb-12">
              <h3 className="text-blue-500 font-bold mb-6 tracking-[0.2em] text-[13px] border-b border-gray-900 pb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 line-block"></span>
                TEKNİK BECERİLER
              </h3>

              <div className="space-y-8">
                {[
                  { label: "PROGRAMLAMA DİLLERİ", key: "programming" as keyof Skills },
                  { label: "WEB GELİŞTİRME", key: "web" as keyof Skills },
                  { label: "MOBİL & ARAÇLAR", key: "mobile" as keyof Skills },
                  { label: "DİĞER", key: "other" as keyof Skills }
                ].map((category) => (
                  <div key={category.key}>
                    <h4 className="text-gray-300 text-[11px] font-bold mb-3 tracking-[0.1em] opacity-80">{category.label}</h4>
                    <div className="flex flex-wrap gap-2">
                      {draftData.skills[category.key].map((skill, index) => (
                        <div key={index} className="px-3 py-1 bg-[#111] border border-gray-800 text-gray-300 rounded text-xs hover:border-gray-500 hover:text-white transition-colors relative cursor-default">
                          <EditableField
                            value={skill}
                            onChange={(val) => {
                              const newSkills = [...draftData.skills[category.key]];
                              newSkills[index] = val;
                              setDraftData(prev => ({ ...prev, skills: { ...prev.skills, [category.key]: newSkills } }));
                            }}
                            className="w-auto min-w-[3rem] text-center"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* EĞİTİM */}
            <div className="mb-12">
              <h3 className="text-blue-500 font-bold mb-6 tracking-[0.2em] text-[13px] border-b border-gray-900 pb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 line-block"></span>
                EĞİTİM
              </h3>
              <div className="space-y-6">
                {draftData.education.map((edu, idx) => (
                  <div key={idx} className="space-y-1.5 border-l-2 border-gray-800 pl-4 py-1 relative">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-gray-700"></div>
                    <h4 className="text-white font-semibold leading-tight text-[15px]">
                      <EditableField
                        value={edu.degree}
                        onChange={(v) => {
                          const newEd = [...draftData.education];
                          newEd[idx] = { ...newEd[idx], degree: v };
                          setDraftData({ ...draftData, education: newEd });
                        }}
                      />
                    </h4>
                    <div className="text-gray-400 text-sm">
                      <EditableField
                        value={edu.school}
                        onChange={(v) => {
                          const newEd = [...draftData.education];
                          newEd[idx] = { ...newEd[idx], school: v };
                          setDraftData({ ...draftData, education: newEd });
                        }}
                      />
                    </div>
                    <div className="text-blue-500/60 text-xs font-mono">
                      <EditableField
                        value={edu.years}
                        onChange={(v) => {
                          const newEd = [...draftData.education];
                          newEd[idx] = { ...newEd[idx], years: v };
                          setDraftData({ ...draftData, education: newEd });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SERTİFİKALAR */}
            <div>
              <h3 className="text-blue-500 font-bold mb-6 tracking-[0.2em] text-[13px] border-b border-gray-900 pb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 line-block"></span>
                SERTİFİKALAR
              </h3>
              <ul className="list-none text-gray-400 space-y-3 pl-1 text-[13px] max-w-full">
                {draftData.certificates.map((cert, idx) => (
                  <li key={idx} className="leading-relaxed relative flex items-start gap-3">
                    <span className="text-blue-500 mt-1 opacity-60">▹</span>
                    <div className="flex-1">
                      <EditableField
                        value={cert}
                        onChange={(v) => {
                          const newCerts = [...draftData.certificates];
                          newCerts[idx] = v;
                          setDraftData({ ...draftData, certificates: newCerts });
                        }}
                        multiline
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Right Column */}
          <div className="md:col-span-8 lg:col-span-9 p-8 sm:p-12 bg-black">

            {/* HAKKIMDA */}
            <div className="mb-16">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <User className="text-blue-500" size={20} />
                </div>
                <h2 className="text-white text-xl font-bold tracking-widest uppercase">Hakkımda</h2>
              </div>
              <div className="text-gray-300 leading-relaxed text-sm lg:text-[15px] border-t border-gray-900/60 pt-6 font-light tracking-wide">
                <EditableField
                  value={draftData.about}
                  onChange={(v) => setDraftData({ ...draftData, about: v })}
                  multiline
                  className="w-full bg-transparent text-gray-300"
                />
              </div>
            </div>

            {/* ÖNE ÇIKAN PROJELER */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <MonitorPlay className="text-blue-500" size={20} />
                  </div>
                  <h2 className="text-white text-xl font-bold tracking-widest uppercase">Öne Çıkan Projeler</h2>
                </div>

                {/* Proje Ekle Butonu */}
                {isAdmin && (
                  <button
                    onClick={addProject}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600/10 text-blue-400 border border-blue-500/30 hover:bg-blue-600/20 hover:border-blue-500/60 rounded-lg transition-all text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-lg"
                  >
                    <Plus size={16} />
                    Yeni Proje
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6">
                {draftData.projects.map((item, idx) => (
                  <div key={idx} className="bg-[#050505] border border-gray-800/60 p-6 md:p-8 rounded-xl hover:border-blue-500/40 hover:bg-[#080808] transition-all duration-300 group relative">

                    {/* Proje Sil Butonu */}
                    {isAdmin && (
                      <button
                        onClick={() => removeProject(idx)}
                        className="absolute -top-3 -right-3 p-2 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white hover:border-red-600 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10 shadow-lg"
                        title="Projeyi Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}

                    <h3 className="text-white font-bold text-lg mb-3 group-hover:text-blue-400 transition-colors">
                      <EditableField
                        value={item.title}
                        onChange={(v) => {
                          const newProjs = [...draftData.projects];
                          newProjs[idx] = { ...newProjs[idx], title: v };
                          setDraftData({ ...draftData, projects: newProjs });
                        }}
                      />
                    </h3>

                    <div className="text-gray-400 mb-8 text-sm leading-relaxed font-light">
                      <EditableField
                        value={item.description}
                        onChange={(v) => {
                          const newProjs = [...draftData.projects];
                          newProjs[idx] = { ...newProjs[idx], description: v };
                          setDraftData({ ...draftData, projects: newProjs });
                        }}
                        multiline
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-t border-gray-900 pt-5">
                      <div className="text-blue-500/80 text-[12px] font-mono tracking-wide flex-1 uppercase">
                        <EditableField
                          value={item.tech}
                          onChange={(v) => {
                            const newProjs = [...draftData.projects];
                            newProjs[idx] = { ...newProjs[idx], tech: v };
                            setDraftData({ ...draftData, projects: newProjs });
                          }}
                        />
                      </div>

                      <div className="text-gray-500 hover:text-white transition-colors cursor-pointer text-sm shrink-0 flex items-center gap-1 group/link">
                        <EditableField
                          value={item.link || ""}
                          onChange={(v) => {
                            const newProjs = [...draftData.projects];
                            newProjs[idx] = { ...newProjs[idx], link: v };
                            setDraftData({ ...draftData, projects: newProjs });
                          }}
                          className="text-right"
                          isLink
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {draftData.projects.length === 0 && (
                  <div className="text-center p-8 border border-gray-800 border-dashed rounded-xl text-gray-500">
                    Henüz proje eklenmedi.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Kapanış Div'i (PDF sarmalayıcısı için) */}
      </div>

    </div>
  );
}
