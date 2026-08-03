import { StoreSetting } from '@/database/generated/prisma/client';

export type BillTotals = {
  serviceChargeAmount: number;
  vatAmount: number;
  grandTotal: number;
};

/** Pure money math, isolated from BillService's persistence/validation flow so it can be
 *  unit-tested directly. VAT is computed on (subtotal + serviceCharge), matching how Thai
 *  restaurants commonly apply VAT on top of the service charge, not just the food total. */
export function calculateBillTotals(
  subtotal: number,
  storeSetting: Pick<
    StoreSetting,
    'enableServiceCharge' | 'serviceChargeRate' | 'enableVat' | 'vatRate'
  >,
): BillTotals {
  const serviceChargeAmount = storeSetting.enableServiceCharge
    ? Math.round(subtotal * storeSetting.serviceChargeRate)
    : 0;

  const vatBase = subtotal + serviceChargeAmount;
  const vatAmount = storeSetting.enableVat
    ? Math.round(vatBase * storeSetting.vatRate)
    : 0;

  const grandTotal = subtotal + serviceChargeAmount + vatAmount;

  return { serviceChargeAmount, vatAmount, grandTotal };
}
