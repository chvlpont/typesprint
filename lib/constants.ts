export const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog near the riverbank while the sun sets behind the distant mountains painting the sky in shades of orange and purple.",
  "Programming is not about what you know it is about what you can figure out when faced with challenging problems that require creative solutions and persistent debugging efforts.",
  "Success is not final failure is not fatal it is the courage to continue that counts when you face obstacles and setbacks along your journey toward achieving your goals.",
  "The only way to do great work is to love what you do and keep learning new skills every day because the world is constantly changing and evolving around us.",
  "Practice makes perfect but perfect practice makes champions in any field whether you are learning to code or mastering a musical instrument or training for athletic competitions.",
];

// Get a random text from the sample texts
export const getRandomText = () => {
  return SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
};
