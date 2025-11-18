export function generateDailySlots(start = "08:00", end = "20:00", stepMin = 30) {
  const slots = [];
  let [h, m] = start.split(":").map(Number);
  let [endH, endM] = end.split(":").map(Number);

  const startTotal = h * 60 + m;
  const endTotal = endH * 60 + endM;

  for (let t = startTotal; t <= endTotal; t += stepMin) {
    const hh = String(Math.floor(t / 60)).padStart(2, "0");
    const mm = String(t % 60).padStart(2, "0");
    slots.push(`${hh}:${mm}`);
  }

  return slots;
}
