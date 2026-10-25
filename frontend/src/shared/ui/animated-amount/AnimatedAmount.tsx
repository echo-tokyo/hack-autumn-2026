import { formatAmount, useCountUp } from '@/shared/lib'

interface IAnimatedAmountProps {
  value: number
  animateFromZero?: boolean
}

export function AnimatedAmount({
  value,
  animateFromZero = true,
}: IAnimatedAmountProps) {
  return formatAmount(useCountUp(value, animateFromZero))
}
