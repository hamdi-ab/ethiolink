"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Clock,
  Database,
  Globe,
  FileSpreadsheet,
  ArrowRight,
  CheckCircle2,
  Server,
  KeyRound,
  FileText,
} from "lucide-react";
import { BrandDashboardTab } from "./BrandDashboardView";

export interface BrandPrivacyAuditViewProps {
  brandName: string;
  onNavigateTab?: (tab: BrandDashboardTab) => void;
  onOpenReportModal?: () => void;
}

export function BrandPrivacyAuditView({
  brandName,
  onNavigateTab,
  onOpenReportModal,
}: BrandPrivacyAuditViewProps) {
  const [locale, setLocale] = useState<"en" | "am">("en");

  return (
    <div className="space-y-6">
      {/* Top Banner / Privacy Header */}
      <div className="bg-white dark:bg-[#14211D] border border-[#D7DED9]/80 dark:border-[#26372F] rounded-2xl p-6 sm:p-7 shadow-2xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-[#78B99D] border border-emerald-200/80 dark:border-emerald-800/80">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-[#78B99D]" />
            <span>PRD FR-020 Compliance &bull; Data Governance</span>
          </div>

          {/* Bilingual Switcher */}
          <button
            type="button"
            onClick={() => setLocale(locale === "en" ? "am" : "en")}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-[#101C18] border border-slate-200 dark:border-[#26372F] text-slate-700 dark:text-[#F1F5F1] hover:bg-slate-100 dark:hover:bg-[#192E26] transition-all cursor-pointer"
            title="Toggle English / Amharic language"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-[#78B99D]" />
            <span>{locale === "en" ? "አማርኛ (Switch to Amharic)" : "English (Switch to English)"}</span>
          </button>
        </div>

        <div>
          <h2 className="font-headline font-bold text-xl sm:text-2xl text-slate-900 dark:text-[#F1F5F1] tracking-tight">
            {locale === "en"
              ? "Privacy, Telemetry & Data Retention Practices"
              : "የግላዊነት፣ የቴሌሜትሪ እና የውሂብ አያያዝ ፖሊሲ"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9BAAA1] mt-1.5 max-w-3xl leading-relaxed">
            {locale === "en"
              ? `EthioLink provides non-custodial influencer campaign attribution for ${brandName}. We operate with radical transparency: customer touchpoints are anonymized at ingest, financial credentials are never intercepted, and operational records are systematically purged.`
              : `ኢትዮሊንክ ለ${brandName} ገለልተኛ የግብይት እና የማስታወቂያ አስተዋፅኦ መከታተያ ነው። የደንበኞችን ግላዊነት እንዴት እንደምንጠብቅ፣ ክፍያ እንደማንይዝ እና መረጃን በስርዓት እንደምናስወግድ በግልፅ እንገልፃለን።`}
          </p>
        </div>

        {/* Live System Posture Badges */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#101C18] border border-slate-200/80 dark:border-[#26372F] flex items-center gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#78B99D] shrink-0" />
            <div>
              <div className="font-semibold text-slate-800 dark:text-[#F1F5F1]">Ingest Anonymization</div>
              <div className="text-[11px] text-slate-500 dark:text-[#9BAAA1]">SHA-256 Daily Salt</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#101C18] border border-slate-200/80 dark:border-[#26372F] flex items-center gap-2.5 text-xs">
            <Lock className="w-4 h-4 text-emerald-600 dark:text-[#78B99D] shrink-0" />
            <div>
              <div className="font-semibold text-slate-800 dark:text-[#F1F5F1]">Zero Interception</div>
              <div className="text-[11px] text-slate-500 dark:text-[#9BAAA1]">No PIN or Card Storage</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#101C18] border border-slate-200/80 dark:border-[#26372F] flex items-center gap-2.5 text-xs">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-[#78B99D] shrink-0" />
            <div>
              <div className="font-semibold text-slate-800 dark:text-[#F1F5F1]">90-Day Retention</div>
              <div className="text-[11px] text-slate-500 dark:text-[#9BAAA1]">Automated Prune Engine</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#101C18] border border-slate-200/80 dark:border-[#26372F] flex items-center gap-2.5 text-xs">
            <Database className="w-4 h-4 text-emerald-600 dark:text-[#78B99D] shrink-0" />
            <div>
              <div className="font-semibold text-slate-800 dark:text-[#F1F5F1]">Attribution Scope</div>
              <div className="text-[11px] text-slate-500 dark:text-[#9BAAA1]">Merchant Receipts Only</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pillar 1 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#14211D] border border-[#D7DED9]/80 dark:border-[#26372F] shadow-2xs space-y-3 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <EyeOff className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-base text-slate-900 dark:text-[#F1F5F1]">
              {locale === "en" ? "1. Anonymous IP Hashing" : "1. ስም-አልባ የIP ጥበቃ"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-[#9BAAA1] mt-1.5 leading-relaxed">
              {locale === "en"
                ? "Raw IP addresses are never written to disk or database tables. Telemetry ingestion generates a 64-character SHA-256 hash combined with a daily rotating cryptographic salt, used solely for 15-minute sliding deduplication."
                : "ትክክለኛ የIP አድራሻዎች በዳታቤዝ ውስጥ ፈጽሞ አይቀመጡም። የደንበኞችን ተደጋጋሚ ጠቅታ ለመከላከል በየቀኑ በሚቀያየር የይለፍ ቃል አማካኝነት በSHA-256 ኢንክሪፕት ይደረጋሉ።"}
            </p>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#14211D] border border-[#D7DED9]/80 dark:border-[#26372F] shadow-2xs space-y-3 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-[#78B99D] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-base text-slate-900 dark:text-[#F1F5F1]">
              {locale === "en" ? "2. Zero Financial Interception" : "2. የክፍያ መረጃ አይጠየቅም"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-[#9BAAA1] mt-1.5 leading-relaxed">
              {locale === "en"
                ? "EthioLink is not a payment gateway. We never collect or store Telebirr PINs, CBE Birr credentials, bank account numbers, or payment card details. All customer transactions are completed directly with merchants."
                : "ኢትዮሊንክ የክፍያ መድረክ አይደለም። የቴሌብር ፒን፣ የባንክ ሂሳብ ወይም የካርድ መረጃ በፍጹም አንጠይቅም ወይም አናስቀምጥም። ክፍያዎች በቀጥታ በነጋዴው እና በደንበኛው መካከል ይፈጸማሉ።"}
            </p>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#14211D] border border-[#D7DED9]/80 dark:border-[#26372F] shadow-2xs space-y-3 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-[#F0B85C] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-base text-slate-900 dark:text-[#F1F5F1]">
              {locale === "en" ? "3. 90-Day Telemetry Retention" : "3. የ90 ቀናት የውሂብ ቆይታ"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-[#9BAAA1] mt-1.5 leading-relaxed">
              {locale === "en"
                ? "Raw individual event telemetry records (page views, button clicks) are systematically pruned after 90 days by our automated retention engine. Aggregate hourly and daily performance totals remain available for reporting."
                : "የነጠላ ጉብኝቶች እና የጠቅታ ዝርዝሮች ከ90 ቀናት በኋላ በራስ-ሰር ይሰረዛሉ። አጠቃላይ የሪፖርት ማጠቃለያዎች ብቻ ለዘመቻ ትንተና ይቀመጣሉ።"}
            </p>
          </div>
        </div>

        {/* Pillar 4 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#14211D] border border-[#D7DED9]/80 dark:border-[#26372F] shadow-2xs space-y-3 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-base text-slate-900 dark:text-[#F1F5F1]">
              {locale === "en" ? "4. Attribution Transparency" : "4. የአስተዋፅኦ ግልፅነት"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-[#9BAAA1] mt-1.5 leading-relaxed">
              {locale === "en"
                ? "Per PRD FR-025 and FR-036, all sales figures displayed on brand and creator dashboards represent merchant-recorded in-store receipts. They are operational attribution metrics, not independently verified bank ledger entries."
                : "በPRD FR-025 መሠረት በዳሽቦርዱ ላይ የሚታዩ የሽያጭ አሃዞች በነጋዴዎች የተመዘገቡ የሱቅ ደረሰኞች ናቸው። እንደ ገለልተኛ የባንክ ግብይት አይቆጠሩም።"}
            </p>
          </div>
        </div>
      </div>

      {/* Granular Governance & Data Rights Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Section 1 */}
        <div className="bg-white dark:bg-[#14211D] border border-[#D7DED9]/80 dark:border-[#26372F] rounded-2xl p-5 shadow-2xs space-y-3 transition-colors">
          <div className="flex items-center gap-2 text-slate-900 dark:text-[#F1F5F1] font-headline font-bold text-sm">
            <Server className="w-4 h-4 text-emerald-600 dark:text-[#78B99D]" />
            <h4>{locale === "en" ? "Technical Telemetry Ingest" : "የሚሰበሰቡ ቴክኒካል መረጃዎች"}</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-[#9BAAA1] leading-relaxed">
            {locale === "en"
              ? "When end customers visit campaign pages, EthioLink records only the technical minimum required to attribute conversion:"
              : "ደንበኞች የዘመቻ ገጾችን ሲጎበኙ የሚሰበሰቡ አነስተኛ መረጃዎች፡"}
          </p>
          <ul className="text-xs text-slate-600 dark:text-[#9BAAA1] space-y-1.5 list-disc pl-4 leading-relaxed">
            <li>
              <strong>Page Views:</strong> {locale === "en" ? "Anonymous timestamp." : "ስም-አልባ የጉብኝት ሰዓት።"}
            </li>
            <li>
              <strong>Intent Actions:</strong> {locale === "en" ? "Telegram, Call, Map, and Code copy clicks." : "የቴሌግራም፣ የስልክ፣ የካርታ ወይም የኮድ ጠቅታዎች።"}
            </li>
            <li>
              <strong>Browser UUID:</strong> {locale === "en" ? "Session identifier for deduplication." : "ተደጋጋሚ ጠቅታን ለመለየት የሚረዳ መለያ።"}
            </li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="bg-white dark:bg-[#14211D] border border-[#D7DED9]/80 dark:border-[#26372F] rounded-2xl p-5 shadow-2xs space-y-3 transition-colors">
          <div className="flex items-center gap-2 text-slate-900 dark:text-[#F1F5F1] font-headline font-bold text-sm">
            <KeyRound className="w-4 h-4 text-emerald-600 dark:text-[#78B99D]" />
            <h4>{locale === "en" ? "Backup & Snapshot Integrity" : "የዳታቤዝ ምትኬ እና ደህንነት"}</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-[#9BAAA1] leading-relaxed">
            {locale === "en"
              ? "In accordance with Section 10.3 and Section 16 of the PRD, platform databases are backed up automatically. Each snapshot is cryptographically verified using SHA-256 integrity checksums to guarantee point-in-time recovery and zero data loss."
              : "በPRD መስፈርት መሠረት፣ የዳታቤዝ ምትኬዎች በየጊዜው በSHA-256 የደህንነት ማረጋገጫ ተዘጋጅተው ይቀመጣሉ።"}
          </p>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#101C18] border border-slate-200 dark:border-[#26372F] text-[11px] text-slate-500 dark:text-[#9BAAA1] font-mono">
            SHA-256 Manifest Verification &bull; Automated Cold Storage Snapshots
          </div>
        </div>

        {/* Section 3 */}
        <div className="bg-white dark:bg-[#14211D] border border-[#D7DED9]/80 dark:border-[#26372F] rounded-2xl p-5 shadow-2xs space-y-3 transition-colors">
          <div className="flex items-center gap-2 text-slate-900 dark:text-[#F1F5F1] font-headline font-bold text-sm">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-[#78B99D]" />
            <h4>{locale === "en" ? "Merchant Data Portability" : "የመረጃ ባለቤትነት እና ማውረድ"}</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-[#9BAAA1] leading-relaxed">
            {locale === "en"
              ? "Businesses retain 100% ownership of their campaign records, customer action analytics, and in-store sales logs. You can export complete audit ledgers in standard RFC 4180 CSV format at any time."
              : "ነጋዴዎች የዘመቻቸውን እና የሽያጭ መረጃዎቻቸውን ሙሉ በሙሉ ይቆጣጠራሉ። በማንኛውም ጊዜ በCSV ፎርማት ማውረድ ይችላሉ።"}
          </p>
          <div className="pt-1 flex flex-wrap gap-2">
            {onOpenReportModal && (
              <button
                type="button"
                onClick={onOpenReportModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Executive Report</span>
              </button>
            )}
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab("analytics")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#101C18] dark:hover:bg-[#192E26] text-slate-700 dark:text-[#F1F5F1] cursor-pointer transition-all"
              >
                <span>Attribution Analytics</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
