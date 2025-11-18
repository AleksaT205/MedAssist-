export const generateDailySlots = (
  start = "08:00",
  end = "20:00",
  step = 30
) => {
  const slots = [];
  let [h, m] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);

  while (h < endH || (h === endH && m <= endM)) {
    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");

    slots.push(`${hh}:${mm}`);

    m += step;
    if (m >= 60) {
      h++;
      m = 0;
    }
  }

  return slots;
};
