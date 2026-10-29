"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Clock,
  ArrowLeft,
  Database,
  Globe,
} from "lucide-react";

export default function PrivacyPolicyPage() {
  const [locale, setLocale] = useState<"en" | "am">("en");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-body transition-colors">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{locale === "en" ? "Back to EthioLink" : "ወደ ዋናው ገጽ ተመለስ"}</span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Bilingual Toggle */}
            <button
              onClick={() => setLocale(locale === "en" ? "am" : "en")}
              className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{locale === "en" ? "አማርኛ" : "English"}</span>
            </button>

            <ThemeToggle size="sm" />
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PRD FR-020 Compliance &bull; Data Governance</span>
          </div>
          <h1 className="font-headline font-black text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
            {locale === "en"
              ? "Privacy, Telemetry & Data Retention Practices"
              : "የግላዊነት፣ የቴሌሜትሪ እና የውሂብ አያያዝ ፖሊሲ"}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            {locale === "en"
              ? "EthioLink is an influencer campaign attribution and marketing analytics layer. We believe in radical transparency: how we collect customer touchpoints, how we protect user privacy, and how data is systematically purged."
              : "ኢትዮሊንክ የግብይት እና የማስታወቂያ አስተዋፅኦ መከታተያ መድረክ ነው። የደንበኞችን ግላዊነት እንዴት እንደምንጠብቅ እና መረጃን እንዴት በስርዓት እንደምናስወግድ በግልፅ እንገልፃለን።"}
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pillar 1 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <EyeOff className="w-5 h-5" />
            </div>
            <h3 className="font-headline font-bold text-base text-slate-900 dark:text-slate-100">
              {locale === "en" ? "Anonymous IP Hashing" : "ስም-አልባ የIP ጥበቃ"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {locale === "en"
                ? "Raw IP addresses are never written to disk or database tables. Telemetry ingestion generates a SHA-256 hash combined with a daily rotating cryptographic salt, used solely for 15-minute sliding deduplication."
                : "ትክክለኛ የIP አድራሻዎች በዳታቤዝ ውስጥ ፈጽሞ አይቀመጡም። የደንበኞችን ተደጋጋሚ ጠቅታ ለመከላከል በየቀኑ በሚቀያየር የይለፍ ቃል አማካኝነት በSHA-256 ኢንክሪፕት ይደረጋሉ።"}
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-headline font-bold text-base text-slate-900 dark:text-slate-100">
              {locale === "en" ? "Zero Financial Interception" : "የክፍያ መረጃ አይጠየቅም"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {locale === "en"
                ? "EthioLink is not a payment gateway. We never collect or store Telebirr PINs, CBE Birr credentials, bank account numbers, or payment card details. All customer transactions are completed directly with merchants."
                : "ኢትዮሊንክ የክፍያ መድረክ አይደለም። የቴሌብር ፒን፣ የባንክ ሂሳብ ወይም የካርድ መረጃ በፍጹም አንጠይቅም ወይም አናስቀምጥም። ክፍያዎች በቀጥታ በነጋዴው እና በደንበኛው መካከል ይፈጸማሉ።"}
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-headline font-bold text-base text-slate-900 dark:text-slate-100">
              {locale === "en" ? "90-Day Telemetry Retention" : "የ90 ቀናት የውሂብ ቆይታ"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {locale === "en"
                ? "Raw individual event telemetry records (page views, button clicks) are systematically pruned after 90 days by our automated retention engine. Aggregate hourly and daily performance totals remain available for reporting."
                : "የነጠላ ጉብኝቶች እና የጠቅታ ዝርዝሮች ከ90 ቀናት በኋላ በራስ-ሰር ይሰረዛሉ። አጠቃላይ የሪፖርት ማጠቃለያዎች ብቻ ለዘመቻ ትንተና ይቀመጣሉ።"}
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-headline font-bold text-base text-slate-900 dark:text-slate-100">
              {locale === "en" ? "Attribution Transparency" : "የአስተዋፅኦ ግልፅነት"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {locale === "en"
                ? "Per PRD FR-025 and FR-036, all sales figures displayed on brand and creator dashboards represent merchant-recorded in-store receipts. They are operational attribution metrics, not independently verified bank ledger entries."
                : "በPRD FR-025 መሠረት በዳሽቦርዱ ላይ የሚታዩ የሽያጭ አሃዞች በነጋዴዎች የተመዘገቡ የሱቅ ደረሰኞች ናቸው። እንደ ገለልተኛ የባንክ ግብይት አይቆጠሩም።"}
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 pt-4">
          <section className="space-y-3">
            <h2 className="font-headline font-bold text-lg text-slate-900 dark:text-white">
              {locale === "en" ? "1. What We Collect on Public Campaign Pages" : "1. በዘመቻ ገጾች ላይ የምንሰበስበው መረጃ"}
            </h2>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
              <p>
                {locale === "en"
                  ? "When an end customer opens an influencer's campaign page (/c/[slug]), EthioLink records only the minimum technical telemetry necessary to provide attribution analytics:"
                  : "ደንበኛው የማስታወቂያ ሊንኩን ሲከፍት፣ ኢትዮሊንክ ለአስተዋፅኦ ትንተና የሚያስፈልገውን አነስተኛ መረጃ ብቻ ይመዘግባል፡"}
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Page Views:</strong> {locale === "en" ? "Anonymous timestamp of the visit." : "የጉብኝት ሰዓት"}
                </li>
                <li>
                  <strong>Intent Actions:</strong> {locale === "en" ? "Clicks on 'Chat on Telegram', 'Call Now', 'Get Directions', or 'Copy Promo Code'." : "በቴሌግራም፣ ስልክ፣ ካርታ ወይም ኮድ መቅዳት ላይ የተደረጉ ጠቅታዎች።"}
                </li>
                <li>
                  <strong>Anonymous Visitor UUID:</strong> {locale === "en" ? "A randomized string stored in the browser session to estimate unique visitors." : "ልዩ ጎብኝዎችን ለመለየት በብሮውዘር የሚቀመጥ ቁጥር።"}
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline font-bold text-lg text-slate-900 dark:text-white">
              {locale === "en" ? "2. Backup Reliability and Recovery Safeguards" : "2. የመረጃ ምትኬ እና ደህንነት"}
            </h2>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
              <p>
                {locale === "en"
                  ? "In accordance with Section 10.3 and Section 16 of the Product Requirements Document, platform databases are backed up automatically. Each snapshot is cryptographically verified using SHA-256 integrity checksums to guarantee point-in-time recovery and zero data loss in the event of an infrastructure incident."
                  : "በPRD መስፈርት መሠረት፣ የዳታቤዝ ምትኬዎች በየጊዜው በSHA-256 የደህንነት ማረጋገጫ ተዘጋጅተው ይቀመጣሉ።"}
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline font-bold text-lg text-slate-900 dark:text-white">
              {locale === "en" ? "3. Merchant & Creator Data Rights" : "3. የነጋዴዎች እና የፈጣሪዎች መብት"}
            </h2>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
              <p>
                {locale === "en"
                  ? "Businesses retain full ownership of their campaign records, customer action analytics, and sales logs. Account holders can request export of their complete audit ledger in standard RFC 4180 CSV format at any time directly through the Brand Operations portal."
                  : "ነጋዴዎች የዘመቻቸውን እና የሽያጭ መረጃዎቻቸውን በማንኛውም ጊዜ በCSV ፎርማት ማውረድ ይችላሉ።"}
              </p>
            </div>
          </section>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>EthioLink &bull; Addis Ababa, Ethiopia &bull; Version 1.0 MVP</div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Home
            </Link>
            <Link href="/login" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Portal Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
