import test from "node:test";
import assert from "node:assert/strict";
import {
  generateQRCodeSVG,
  generateTelegramShareUrl,
  formatCampaignShareText,
} from "../src/lib/qr.ts";

test("generateQRCodeSVG produces valid vector SVG with correct tags and dimensions", () => {
  const url = "https://ethiolink.et/c/tomoca-roast";
  const svg = generateQRCodeSVG(url, {
    pixelSize: 12,
    whiteColor: "#ffffff",
    blackColor: "#059669",
  });

  assert.ok(svg.startsWith("<svg"), "QR output must start with <svg tag");
  assert.ok(svg.includes('xmlns="http://www.w3.org/2000/svg"'), "QR output must include SVG namespace");
  assert.ok(svg.includes('viewBox="0 0 '), "QR output must specify a valid viewBox");
  assert.ok(svg.includes('<rect fill="#ffffff"'), "QR output must render quiet zone background rect");
  assert.ok(svg.includes('<path fill="#059669"'), "QR output must render matrix path with custom color");
  assert.ok(svg.endsWith("</svg>"), "QR output must terminate with closing </svg> tag");
});

test("generateTelegramShareUrl constructs valid Telegram deep-link with URL-encoded parameters", () => {
  const targetUrl = "https://ethiolink.et/c/bole-leather-bag";
  const message = "Check out this 20% discount with code BOLE20!";

  const telegramUrl = generateTelegramShareUrl(targetUrl, message);

  assert.ok(telegramUrl.startsWith("https://t.me/share/url?url="), "Must use official Telegram share endpoint");
  assert.ok(telegramUrl.includes(encodeURIComponent(targetUrl)), "Target URL must be properly encoded");
  assert.ok(telegramUrl.includes(encodeURIComponent(message)), "Share message must be properly encoded");

  // Parse with URL to ensure valid RFC URI
  const parsed = new URL(telegramUrl);
  assert.equal(parsed.searchParams.get("url"), targetUrl);
  assert.equal(parsed.searchParams.get("text"), message);
});

test("formatCampaignShareText formats English and Amharic promotional texts accurately", () => {
  const campName = "Bole Roast";
  const brandName = "Tomoca Coffee";
  const promoCode = "TOMOCA20";

  // English formatting
  const textEn = formatCampaignShareText(campName, brandName, promoCode, "en");
  assert.ok(textEn.includes(brandName));
  assert.ok(textEn.includes(campName));
  assert.ok(textEn.includes(promoCode));
  assert.ok(textEn.startsWith("🔥 Exclusive offer"));

  // Amharic formatting
  const textAm = formatCampaignShareText(campName, brandName, promoCode, "am");
  assert.ok(textAm.includes(brandName));
  assert.ok(textAm.includes(campName));
  assert.ok(textAm.includes(promoCode));
  assert.ok(textAm.includes("ልዩ ቅናሽ"));
  assert.ok(textAm.includes("የማስተዋወቂያ ኮድ"));
});
