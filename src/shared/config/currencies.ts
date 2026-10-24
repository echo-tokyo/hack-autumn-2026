export const CURRENCIES = ['RUB', 'USD', 'EUR'] as const

export type TCurrency = (typeof CURRENCIES)[number]
