export function assertListingOwner(listing: { shop_id?: number }, shopId: string): void {
  if (String(listing.shop_id) !== shopId) throw new Error("Listing does not belong to connected shop");
}

export function assertReceiptOwner(receipt: { seller_user_id?: number }, userId: string): void {
  if (String(receipt.seller_user_id) !== userId) throw new Error("Order does not belong to connected seller");
}
