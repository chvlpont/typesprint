export const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog near the riverbank while the sun sets behind mountains.",
  "Programming is not about what you know it is about what you can figure out when faced with challenging problems.",
  "Success is not final failure is not fatal it is the courage to continue that counts when you face obstacles.",
  "The only way to do great work is to love what you do and keep learning new skills every day.",
  "Practice makes perfect but perfect practice makes champions in any field whether you are learning to code.",
];

// Get a random text from the sample texts
export const getRandomText = () => {
  return SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
};
