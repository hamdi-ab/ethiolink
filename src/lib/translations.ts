export type Language = "en" | "am";

export interface Translations {
  offerBadge: string;
  promoCodeLabel: string;
  copyCode: string;
  copied: string;
  telegramBtn: string;
  callBtn: string;
  mapBtn: string;
  validUntil: string;
  poweredBy: string;
  notFoundTitle: string;
  notFoundDesc: string;
  backHome: string;
  creatorTag: string;
  concludedTitle: string;
  concludedDesc: string;
  pausedTitle: string;
  pausedDesc: string;
  contactStore: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    offerBadge: "Special Promotion",
    promoCodeLabel: "PROMO CODE",
    copyCode: "Copy Code",
    copied: "Code Copied!",
    telegramBtn: "Chat on Telegram",
    callBtn: "Call Store Directly",
    mapBtn: "Find Store on Maps",
    validUntil: "Valid until",
    poweredBy: "Powered by EthioLink",
    notFoundTitle: "Campaign Not Found",
    notFoundDesc:
      "This promotional link is inactive, expired, or may have been paused by the business.",
    backHome: "Go to Homepage",
    creatorTag: "Promoted by",
    concludedTitle: "Promotion Concluded",
    concludedDesc:
      "This promotional campaign has ended. Stay tuned for upcoming offers from the business.",
    pausedTitle: "Promotion Temporarily Paused",
    pausedDesc:
      "This promotion is currently paused by the merchant. Please check back soon or reach out directly.",
    contactStore: "Contact Store Directly",
  },
  am: {
    offerBadge: "ልዩ ቅናሽ",
    promoCodeLabel: "የማስተዋወቂያ ኮድ",
    copyCode: "ኮድ ቅዳ",
    copied: "ኮዱ ተቀድቷል!",
    telegramBtn: "በቴሌግራም ያናግሩ",
    callBtn: "በስልክ በቀጥታ ይደውሉ",
    mapBtn: "አድራሻ በካርታ ይመልከቱ",
    validUntil: "የሚያበቃበት ቀን",
    poweredBy: "በEthioLink የተዘጋጀ",
    notFoundTitle: "ዘመቻው አልተገኘም",
    notFoundDesc:
      "ይህ የማስተዋወቂያ ሊንክ ልክ ያልሆነ ነው፣ ጊዜው አልፏል ወይም በነጋዴው ለጊዜው ቆሟል።",
    backHome: "ወደ መነሻ ገጽ ይመለሱ",
    creatorTag: "በአስተዋዋቂው",
    concludedTitle: "ማስተዋወቂያው ተጠናቋል",
    concludedDesc:
      "ይህ የማስተዋወቂያ ዘመቻ ተጠናቋል። ወደፊት ከነጋዴው የሚወጡ አዳዲስ ቅናሾችን ይጠብቁ።",
    pausedTitle: "ማስተዋወቂያው ለጊዜው ቆሟል",
    pausedDesc:
      "ይህ ማስተዋወቂያ በነጋዴው ለጊዜው ቆሟል። እባክዎ ቆየት ብለው በድጋሚ ይሞክሩ ወይም በቀጥታ ያነጋግሩ።",
    contactStore: "ሱቁን በቀጥታ ያነጋግሩ",
  },
};
