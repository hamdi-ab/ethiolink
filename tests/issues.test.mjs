import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import {
  validateIssuePayload,
  VALID_CATEGORIES,
  VALID_STATUSES,
  VALID_PRIORITIES,
  getIssueCategoryMeta,
  getIssueStatusMeta,
  getIssuePriorityMeta,
} from "../src/lib/issues.ts";
import { GET as getIssues, POST as postIssue } from "../src/app/api/support/issues/route.ts";
import { PATCH as patchIssue, GET as getSingleIssue } from "../src/app/api/support/issues/[id]/route.ts";
import { ReportIssueModal } from "../src/components/support/ReportIssueModal.tsx";

test("validateIssuePayload accepts valid operational issue data", () => {
  const result = validateIssuePayload({
    title: "Telegram redirect button returning 404",
    description: "Customers in Bole branch reported that clicking the Telegram chat button fails to resolve the t.me handle.",
    category: "CAMPAIGN_LINK_DOWN",
    priority: "HIGH",
    campaignId: "camp_12345",
  });

  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
  assert.equal(result.data?.title, "Telegram redirect button returning 404");
  assert.equal(result.data?.category, "CAMPAIGN_LINK_DOWN");
  assert.equal(result.data?.priority, "HIGH");
  assert.equal(result.data?.campaignId, "camp_12345");
  assert.equal(result.data?.saleId, null);
});

test("validateIssuePayload assigns default MEDIUM priority when omitted", () => {
  const result = validateIssuePayload({
    title: "Discrepancy in recorded cashier amount",
    description: "The recorded in-store sale was entered as 500 ETB instead of 5000 ETB for campaign promo code BONANZA.",
    category: "TRANSACTION_DISPUTE",
  });

  assert.equal(result.valid, true);
  assert.equal(result.data?.priority, "MEDIUM");
});

test("validateIssuePayload rejects invalid inputs and empty fields", () => {
  // Missing/short title
  const res1 = validateIssuePayload({
    title: "ab",
    description: "Valid description longer than 10 characters",
    category: "GENERAL_INQUIRY",
  });
  assert.equal(res1.valid, false);
  assert.ok(res1.errors.some((e) => e.includes("Title")));

  // Missing/short description
  const res2 = validateIssuePayload({
    title: "Valid Title Here",
    description: "Too short",
    category: "GENERAL_INQUIRY",
  });
  assert.equal(res2.valid, false);
  assert.ok(res2.errors.some((e) => e.includes("Description")));

  // Invalid category
  const res3 = validateIssuePayload({
    title: "Valid Title Here",
    description: "Valid description longer than 10 characters",
    category: "INVALID_CAT",
  });
  assert.equal(res3.valid, false);
  assert.ok(res3.errors.some((e) => e.includes("Category")));

  // Invalid priority
  const res4 = validateIssuePayload({
    title: "Valid Title Here",
    description: "Valid description longer than 10 characters",
    category: "GENERAL_INQUIRY",
    priority: "CRITICAL_SUPER",
  });
  assert.equal(res4.valid, false);
  assert.ok(res4.errors.some((e) => e.includes("Priority")));
});

test("getIssueCategoryMeta returns localized labels and tokens across all categories", () => {
  for (const cat of VALID_CATEGORIES) {
    const meta = getIssueCategoryMeta(cat);
    assert.ok(meta.label.length > 0, `Category ${cat} must have a label`);
    assert.ok(meta.amharic.length > 0, `Category ${cat} must have an Amharic translation`);
    assert.ok(meta.badgeClass.includes("bg-"), `Category ${cat} must have a valid badge class`);
  }
});

test("getIssueStatusMeta returns styling tokens for all issue lifecycle statuses", () => {
  for (const status of VALID_STATUSES) {
    const meta = getIssueStatusMeta(status);
    assert.ok(meta.label.length > 0, `Status ${status} must have a label`);
    assert.ok(meta.badgeClass.includes("bg-"), `Status ${status} must have a valid badge class`);
  }
});

test("getIssuePriorityMeta returns styling badges for all priority levels", () => {
  for (const priority of VALID_PRIORITIES) {
    const meta = getIssuePriorityMeta(priority);
    assert.ok(meta.label.length > 0, `Priority ${priority} must have a label`);
    assert.ok(meta.badgeClass.includes("bg-"), `Priority ${priority} must have a valid badge class`);
  }
});

test("GET /api/support/issues strictly enforces authentication", async () => {
  const req = new NextRequest("http://localhost:3000/api/support/issues", {
    method: "GET",
  });

  const res = await getIssues(req);
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.equal(data.error, "Unauthorized");
});

test("POST /api/support/issues strictly enforces authentication", async () => {
  const req = new NextRequest("http://localhost:3000/api/support/issues", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Test Issue",
      description: "Description of test issue",
      category: "GENERAL_INQUIRY",
    }),
  });

  const res = await postIssue(req);
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.equal(data.error, "Unauthorized");
});

test("PATCH /api/support/issues/[id] strictly enforces authentication", async () => {
  const req = new NextRequest("http://localhost:3000/api/support/issues/issue_123", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "RESOLVED" }),
  });

  const res = await patchIssue(req, { params: Promise.resolve({ id: "issue_123" }) });
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.equal(data.error, "Unauthorized");
});

test("GET /api/support/issues/[id] strictly enforces authentication", async () => {
  const req = new NextRequest("http://localhost:3000/api/support/issues/issue_123", {
    method: "GET",
  });

  const res = await getSingleIssue(req, { params: Promise.resolve({ id: "issue_123" }) });
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.equal(data.error, "Unauthorized");
});

test("ReportIssueModal component exports successfully for React client consumption", () => {
  assert.equal(typeof ReportIssueModal, "function");
});
