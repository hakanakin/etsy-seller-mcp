import assert from "node:assert/strict";
import test from "node:test";
import { assertListingOwner, assertReceiptOwner } from "../src/ownership.ts";

test("accepts resources owned by the connected seller", () => {
  assert.doesNotThrow(() => assertListingOwner({ shop_id: 123 }, "123"));
  assert.doesNotThrow(() => assertReceiptOwner({ seller_user_id: 456 }, "456"));
});

test("rejects another shop or seller and missing ownership fields", () => {
  assert.throws(() => assertListingOwner({ shop_id: 999 }, "123"));
  assert.throws(() => assertListingOwner({}, "123"));
  assert.throws(() => assertReceiptOwner({ seller_user_id: 999 }, "456"));
  assert.throws(() => assertReceiptOwner({}, "456"));
});
