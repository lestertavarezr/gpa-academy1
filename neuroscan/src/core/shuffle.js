// Deterministic Park–Miller LCG, identical to v1 so saved `choices` indices stay valid.
// Cosmetic use only: it is predictable and must never drive anything security- or fairness-sensitive.
export function optionOrder(id, count = 4) {
  let seed = (id * 48271) % 2147483647;
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    seed = (seed * 16807) % 2147483647;
    const j = seed % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
