import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Languages,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  MonitorPlay,
  Image,
  Radio,
} from "lucide-react";

const copy = {
  en: {
    hello: "Hello",
    title: "Welcome to Space",
    intro:
      "Space provides advanced and fast tools for developers and authorized security testing environments.",
    features: "Features",
    items: [
      "Create and manage custom testing payloads through our dedicated API without requiring an external provider.",
      "Use free ports and testing servers.",
      "Work inside an isolated virtual environment through VM Screen without affecting your main device.",
      "Monitor your authorized test environment in real time using Live.",
      "Open and preview images inside your testing environment using Open Image.",
      "Use Windows testing and administration tools in controlled environments.",
      "Communicate with your test environment using Typing.",
      "Perform authorized system-control operations using Control.",
      "Additional advanced and modern features will be added soon.",
    ],
    enjoy: "Enjoy Space.",
    warning: "Warning",
    warningText:
      "Space is provided for educational, development, and authorized security-testing purposes only. We are not responsible for misuse of the tool, unauthorized access, damage, data loss, or any illegal activity.",
    language: "العربية",
  },
  ar: {
    hello: "مرحبًا",
    title: "مرحبًا بك في Space",
    intro:
      "توفّر Space أدوات متقدمة وسريعة للمطورين وبيئات اختبار الأمان المصرّح بها.",
    features: "المميزات",
    items: [
      "إنشاء وإدارة أدوات الاختبار المخصصة من خلال واجهة API الخاصة بنا دون الحاجة إلى مزود خارجي.",
      "استخدام منافذ مجانية وخوادم مخصصة للاختبار.",
      "العمل داخل بيئة افتراضية معزولة عبر VM Screen دون التأثير على جهازك الأساسي.",
      "مراقبة بيئة الاختبار المصرّح بها لحظيًا باستخدام Live.",
      "فتح الصور ومعاينتها داخل بيئة الاختبار باستخدام Open Image.",
      "استخدام أدوات اختبار وإدارة Windows داخل البيئات الخاضعة للتحكم.",
      "التواصل مع بيئة الاختبار باستخدام Typing.",
      "تنفيذ عمليات التحكم المصرّح بها باستخدام Control.",
      "ستتم إضافة المزيد من المميزات الحديثة والمتقدمة قريبًا.",
    ],
    enjoy: "نتمنى لك تجربة رائعة مع Space.",
    warning: "تحذير",
    warningText:
      "تُقدَّم Space لأغراض التعليم والتطوير واختبارات الأمان المصرّح بها فقط. نحن غير مسؤولين عن إساءة الاستخدام أو الوصول غير المصرّح به أو الأضرار أو فقدان البيانات أو أي نشاط غير قانوني.",
    language: "English",
  },
};

export default function ReadmeView({ user }) {
  const [language, setLanguage] = useState("en");
  const text = copy[language];
  const icons = [
    TerminalSquare,
    Sparkles,
    MonitorPlay,
    Radio,
    Image,
    ShieldCheck,
    TerminalSquare,
    ShieldCheck,
    Sparkles,
  ];
  return (
    <div
      className="max-w-5xl mx-auto pb-10"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="relative overflow-hidden rounded-[28px] border border-cyan-400/20 bg-[#090b14]/80 p-6 sm:p-9 shadow-[0_30px_100px_rgba(0,0,0,.45)] backdrop-blur-2xl">
        <div className="absolute -top-32 -right-24 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-5">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs uppercase tracking-[.35em] text-cyan-300/70"
              >
                {text.hello}
              </motion.p>
              <h1 className="mt-2 text-3xl sm:text-5xl font-black text-white drop-shadow-[0_0_24px_rgba(34,211,238,.45)]">
                {user?.username || "Operator"}
              </h1>
              <h2 className="mt-6 text-xl sm:text-2xl font-bold text-white">
                {text.title}
              </h2>
            </div>
            <button
              onClick={() => setLanguage(language === "en" ? "ar" : "en")}
              className="shrink-0 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white backdrop-blur-xl transition hover:bg-white/10 flex items-center gap-2"
            >
              <Languages className="w-4 h-4" />
              {text.language}
            </button>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={language}
              initial={{
                opacity: 0,
                x: language === "ar" ? 18 : -18,
                filter: "blur(5px)",
              }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{
                opacity: 0,
                x: language === "ar" ? -18 : 18,
                filter: "blur(5px)",
              }}
              transition={{ duration: 0.3 }}
            >
              <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-300">
                {text.intro}
              </p>
              <div className="mt-8 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-cyan-300">
                <BookOpen className="w-4 h-4" />
                {text.features}
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {text.items.map((item, i) => {
                  const Icon = icons[i];
                  return (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/8 bg-white/[.035] p-4 text-xs leading-6 text-zinc-300 transition hover:border-cyan-400/25 hover:bg-cyan-400/[.045]"
                    >
                      <Icon className="mb-2 h-4 w-4 text-cyan-300" />
                      {item}
                    </div>
                  );
                })}
              </div>
              <p className="mt-7 text-lg font-semibold text-white">
                {text.enjoy}
              </p>
              <div className="mt-7 rounded-2xl border border-amber-400/25 bg-amber-500/[.07] p-5">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <ShieldCheck className="w-5 h-5" />
                  {text.warning}
                </div>
                <p className="mt-2 text-xs leading-6 text-amber-100/75">
                  {text.warningText}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
