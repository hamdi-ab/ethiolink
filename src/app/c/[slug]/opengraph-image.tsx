import { ImageResponse } from "next/og";
import { db } from "@/lib/db";

export const alt = "EthioLink Influencer Campaign";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let campaign = null;

  try {
    campaign = await db.campaign.findUnique({
      where: { slug },
      include: { brand: { select: { name: true } } },
    });
  } catch (err) {
    console.error("OG Image: failed to fetch campaign", err);
  }

  const brandName = campaign?.brand?.name || "Verified Merchant";
  const campaignName = campaign?.name || "Exclusive Promotion";
  const promoCode = campaign?.promoCode || "ETHIOLINK";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          backgroundColor: "#090d16",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(5, 150, 105, 0.28) 0%, transparent 65%), radial-gradient(circle at 10% 90%, rgba(14, 165, 233, 0.15) 0%, transparent 50%)",
        }}
      >
        {/* Top Header Strip */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                backgroundColor: "#059669",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "22px",
              }}
            >
              EL
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "24px", fontWeight: 900, letterSpacing: "-0.5px" }}>
                Ethio<span style={{ color: "#34d399" }}>Link</span>
              </span>
              <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 600 }}>
                Influencer &amp; POS Attribution
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 18px",
              borderRadius: "9999px",
              backgroundColor: "rgba(5, 150, 105, 0.15)",
              border: "1px solid rgba(52, 211, 153, 0.4)",
              color: "#34d399",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            <span>Verified Retail Partner • Addis Ababa</span>
          </div>
        </div>

        {/* Center Content: Campaign Title & Merchant */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "950px" }}>
          <div
            style={{
              fontSize: "18px",
              color: "#94a3b8",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            {brandName}
          </div>
          <div
            style={{
              fontSize: "58px",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-1px",
              color: "#f8fafc",
            }}
          >
            {campaignName}
          </div>
        </div>

        {/* Bottom Banner: Promo Code Badge & Call to Action */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "24px 32px",
            borderRadius: "24px",
            backgroundColor: "rgba(30, 41, 59, 0.7)",
            border: "1px solid rgba(51, 65, 85, 0.8)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <span style={{ fontSize: "16px", color: "#94a3b8", fontWeight: 600 }}>
              Use In-Store / Online Code:
            </span>
            <div
              style={{
                padding: "8px 24px",
                borderRadius: "14px",
                backgroundColor: "#059669",
                color: "#ffffff",
                fontFamily: "monospace",
                fontWeight: 900,
                fontSize: "26px",
                letterSpacing: "3px",
              }}
            >
              {promoCode}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#94a3b8", fontSize: "15px", fontWeight: 600 }}>
            <span>Scan or Tap to Claim Offer</span>
            <span style={{ color: "#34d399", fontSize: "20px" }}>→</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
