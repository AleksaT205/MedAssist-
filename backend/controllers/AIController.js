import OpenAI from "openai";

const OPENAI_API_KEY = "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";
const OPENAI_PROJECT = "proj_vKfpHSLwUUh1kBL9b60jQhFD";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  project: OPENAI_PROJECT,
});

export const analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || symptoms.trim() === "") {
      return res.status(400).json({ message: "Morate uneti simptome." });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Ti si AI asistent za osnovne savete kod sportskih povreda i manjih problema. 
- Fokusiraj se na blage povrede, manje zdravstvene probleme i sportske povrede.
- Daj jasan savet i moguće opcije samopomoći ili lekova.
- Za ozbiljne simptome, uvek naglasi da se pacijent obrati odgovarajućem lekaru.
- Formatiraj odgovor kao običan tekst, bez zvezdica, hash oznaka ili Markdown sintakse.
- Koristi redove i kratke pasuse, da tekst bude pregledan.
- Na kraju naglasi da je ovo AI savet i da se ne sme striktno koristiti kao zamena za lekara.
          `,
        },
        {
          role: "user",
          content: `Pacijent navodi sledeće simptome: ${symptoms}. Napiši pregledan AI savet sa preporukama, lekovima i samopomoći, u običnom tekstu.`
        },
      ],
    });

    const aiMessage = completion.choices?.[0]?.message?.content?.trim();

    if (!aiMessage) {
      return res.status(500).json({ message: "AI nije vratio odgovor." });
    }

    res.json({ advice: aiMessage });
  } catch (error) {
    console.error("❌ Greška u AIController:", error);
    res.status(500).json({
      message: "Greška pri analizi simptoma.",
      error: error.message,
    });
  }
};
