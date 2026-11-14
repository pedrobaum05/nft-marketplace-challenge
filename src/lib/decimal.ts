import Decimal from "decimal.js"

Decimal.set({
  precision: 40,
  rounding: Decimal.ROUND_HALF_UP,
})

export function addAmounts(
  first: string,
  second: string,
): string {
  return new Decimal(first).plus(second).toString()
}

export function subtractAmounts(
  first: string,
  second: string,
): string {
  return new Decimal(first).minus(second).toString()
}

export function multiplyAmount(
  amount: string,
  quantity: number,
): string {
  if (!Number.isSafeInteger(quantity) || quantity < 0) {
    throw new Error("Quantidade inválida.")
  }

  return new Decimal(amount).times(quantity).toString()
}

export function isValidAmount(amount: string): boolean {
  if (amount.trim() === "") return false

  return new Decimal(amount).isFinite() &&
    new Decimal(amount).greaterThanOrEqualTo(0)
}