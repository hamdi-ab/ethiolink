import test from "node:test";
import assert from "node:assert/strict";
import { translations } from "../src/lib/translations.ts";
import { generateMetadata } from "../src/app/c/[slug]/page.tsx";

test("Translations dictionary has identical keys across English and Amharic", () => {
  const enKeys = Object.keys(translations.en).sort();
  const amKeys = Object.keys(translations.am).sort();

  assert.deepEqual(enKeys, amKeys, "English and Amharic dictionaries must have identical key coverage");
  assert.ok(enKeys.length >= 13, "Dictionary must cover all required campaign UI text elements");
});

test("Amharic translations contain Ge'ez unicode characters", () => {
  const amharicRegex = /[\u1200-\u137F]/;
  const amKeys = Object.keys(translations.am);

  for (const key of amKeys) {
    const value = translations.am[key];
    assert.ok(typeof value === "string" && value.length > 0, `Amharic key '${key}' must not be empty`);
    // 'EthioLink' in poweredBy or brand names can be transliterated, but Amharic text must be present
    assert.ok(
      amharicRegex.test(value),
      `Amharic translation for '${key}' must contain Ethiopic script characters`
    );
  }
});

test("English translations contain valid ASCII characters", () => {
  const enKeys = Object.keys(translations.en);

  for (const key of enKeys) {
    const value = translations.en[key];
    assert.ok(typeof value === "string" && value.length > 0, `English key '${key}' must not be empty`);
    assert.ok(/^[\x20-\x7E\s]+$/.test(value), `English translation for '${key}' must be valid ASCII text`);
  }
});

test("generateMetadata returns fallback metadata for non-existent campaign", async () => {
  const metadata = await generateMetadata({
    params: Promise.resolve({ slug: "non-existent-campaign-slug-99999" }),
  });

  assert.ok(metadata.title);
  assert.ok(
    metadata.title.includes("Campaign Not Found") || metadata.title.includes("EthioLink"),
    `Metadata title must signify missing campaign or brand fallback, received: ${metadata.title}`
  );
});
