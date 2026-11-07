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
  exclusiveVoucher: string;
  voucherSub: string;
  useOnlineOrInStore: string;
  redeemOptions: string;
  instantPaths: string;
  telegramTitle: string;
  telegramDesc: string;
  telegramBadge: string;
  paymentMethods: string;
  roasteryLine: string;
  roasteryDesc: string;
  fastestBadge: string;
  openToday: string;
  storeAddress: string;
  storeHours: string;
  getDirections: string;
  inStoreNotice: string;
  verifiedGuarantee: string;
  verifiedGuaranteeDesc: string;
  officialPartner: string;
  activeBadge: string;
  specialOfferBanner: string;
  expiresIn: string;
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
    exclusiveVoucher: "YOUR EXCLUSIVE VOUCHER",
    voucherSub: "20% OFF YOUR FIRST ORDER",
    useOnlineOrInStore: "Use online or show this code at checkout in-store",
    redeemOptions: "REDEEM & ORDER OPTIONS",
    instantPaths: "3 Instant Paths",
    telegramTitle: "Telegram Bot & Channel",
    telegramDesc: "Direct chat ordering with Telebirr / CBE Birr checkout",
    telegramBadge: "Instant",
    paymentMethods: "CBE / Telebirr & Cash on Delivery",
    roasteryLine: "Direct Roastery Line",
    roasteryDesc: "Speak with staff to customize or place order",
    fastestBadge: "Fastest",
    openToday: "Open Today",
    storeAddress: "Next to Morning Star Mall, Bole Sub-City, Addis Ababa",
    storeHours: "Mon - Sat: 8:00 AM - 9:00 PM",
    getDirections: "Get Directions to Store",
    inStoreNotice: "Present code to the cashier prior to billing to claim discount.",
    verifiedGuarantee: "100% Verified Merchant Guarantee",
    verifiedGuaranteeDesc:
      "Attribution tracked via EthioLink SDK. Authentic Ethiopian merchant guarantee and order fulfillment monitoring.",
    officialPartner: "Official Attribution Partner",
    activeBadge: "Active",
    specialOfferBanner: "SPECIAL PARTNER OFFER",
    expiresIn: "EXPIRES IN 48H",
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
    exclusiveVoucher: "የእርስዎ ልዩ ቫውቸር",
    voucherSub: "በመጀመሪያው ትዕዛዝ 20% ቅናሽ",
    useOnlineOrInStore: "በኦንላይን ይጠቀሙ ወይም በሱቅ ውስጥ ክፍያ ሲፈጽሙ ያሳዩ",
    redeemOptions: "የመጠቀሚያና የትዕዛዝ አማራጮች",
    instantPaths: "3 ፈጣን አማራጮች",
    telegramTitle: "የቴሌግራም ቦት እና ቻናል",
    telegramDesc: "በቴሌብር ወይም በንግድ ባንክ ቀጥታ የቴሌግራም ትዕዛዝ",
    telegramBadge: "ፈጣን",
    paymentMethods: "በንግድ ባንክ / ቴሌብር እና በእጅ ክፍያ",
    roasteryLine: "የሱቅ የቀጥታ ስልክ",
    roasteryDesc: "ትዕዛዝዎን ለማበጀት ሰራተኞችን በቀጥታ ያነጋግሩ",
    fastestBadge: "እጅግ ፈጣን",
    openToday: "ዛሬ ክፍት ነው",
    storeAddress: "ሞርኒንግ ስታር ሞል አጠገብ፣ ቦሌ ክፍለ ከተማ፣ አዲስ አበባ",
    storeHours: "ሰኞ - ቅዳሜ፡ ከጠዋቱ 2:00 - ማታ 3:00",
    getDirections: "ወደ ሱቁ አቅጣጫ ይመልከቱ",
    inStoreNotice: "ቅናሹን ለማግኘት ክፍያ ከመፈጸምዎ በፊት ኮዱን ለካሺሩ ያሳዩ።",
    verifiedGuarantee: "100% የተረጋገጠ የነጋዴ ዋስትና",
    verifiedGuaranteeDesc:
      "በEthioLink ቴክኖሎጂ የተረጋገጠ ግብይት። ትክክለኛ የኢትዮጵያ ነጋዴዎች ዋስትና እና የትዕዛዝ ቁጥጥር።",
    officialPartner: "ይፋዊ የአጋርነት ተባባሪ",
    activeBadge: "ንቁ",
    specialOfferBanner: "ልዩ የአጋርነት ቅናሽ",
    expiresIn: "በ48 ሰዓት ውስጥ ያልቃል",
  },
};
