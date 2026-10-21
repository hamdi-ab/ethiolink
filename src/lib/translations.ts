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
  },
};
