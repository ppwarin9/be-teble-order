import { calculateBillTotals } from '@/bill/calculate-bill-totals';

const baseSetting = {
  enableServiceCharge: false,
  serviceChargeRate: 0,
  enableVat: false,
  vatRate: 0,
};

describe('calculateBillTotals', () => {
  it('returns the subtotal unchanged when both service charge and VAT are disabled', () => {
    const result = calculateBillTotals(10000, baseSetting);
    expect(result).toEqual({
      serviceChargeAmount: 0,
      vatAmount: 0,
      grandTotal: 10000,
    });
  });

  it('applies service charge before VAT (VAT is computed on subtotal + service charge)', () => {
    const result = calculateBillTotals(10000, {
      enableServiceCharge: true,
      serviceChargeRate: 0.1,
      enableVat: true,
      vatRate: 0.07,
    });

    // serviceChargeAmount = round(10000 * 0.1) = 1000
    // vatAmount = round((10000 + 1000) * 0.07) = round(770) = 770
    expect(result.serviceChargeAmount).toBe(1000);
    expect(result.vatAmount).toBe(770);
    expect(result.grandTotal).toBe(10000 + 1000 + 770);
  });

  it('applies VAT alone without service charge', () => {
    const result = calculateBillTotals(10000, {
      enableServiceCharge: false,
      serviceChargeRate: 0.1,
      enableVat: true,
      vatRate: 0.07,
    });

    expect(result.serviceChargeAmount).toBe(0);
    expect(result.vatAmount).toBe(700);
    expect(result.grandTotal).toBe(10700);
  });

  it('rounds fractional satang amounts rather than truncating', () => {
    // 333 * 0.07 = 23.31 -> rounds to 23
    const result = calculateBillTotals(333, {
      enableServiceCharge: false,
      serviceChargeRate: 0,
      enableVat: true,
      vatRate: 0.07,
    });

    expect(result.vatAmount).toBe(23);
  });

  it('returns zero totals for a zero subtotal', () => {
    const result = calculateBillTotals(0, {
      enableServiceCharge: true,
      serviceChargeRate: 0.1,
      enableVat: true,
      vatRate: 0.07,
    });

    expect(result).toEqual({
      serviceChargeAmount: 0,
      vatAmount: 0,
      grandTotal: 0,
    });
  });
});
