import { renderSVG } from "uqr";

export interface QRCodeOptions {
  pixelSize?: number;
  whiteColor?: string;
  blackColor?: string;
}

/**
 * Generates a clean, scalable SVG string of a QR code for a given URL or text payload
 */
export function generateQRCodeSVG(data: string, options?: QRCodeOptions): string {
  return renderSVG(data, {
    pixelSize: options?.pixelSize ?? 10,
    whiteColor: options?.whiteColor ?? "#ffffff",
    blackColor: options?.blackColor ?? "#090d16",
  });
}

/**
 * Generates the official Telegram deep-link for instant channel/chat sharing
 */
export function generateTelegramShareUrl(url: string, text: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

/**
 * Formats high-converting promotional text in English or Amharic for social distribution
 */
export function formatCampaignShareText(
  campaignName: string,
  brandName: string,
  promoCode: string,
  lang: "en" | "am" = "en"
): string {
  if (lang === "am") {
    return `🔥 ከ ${brandName} ልዩ ቅናሽ! የ '${campaignName}' ቅናሽ ለማግኘት የማስተዋወቂያ ኮድ '${promoCode}' ይጠቀሙ፡`;
  }
  return `🔥 Exclusive offer from ${brandName}! Claim the '${campaignName}' discount using promo code '${promoCode}':`;
}
