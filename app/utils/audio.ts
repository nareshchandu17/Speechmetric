// Helper to generate dynamic deterministic curves for the selected word's pitch/intensity
export function generatePitchData(word: string, isCorrect: boolean) {
  const points = 24;
  const userPath: string[] = [];
  const idealPath: string[] = [];
  
  // Deterministic seed based on word characters
  let seed = 0;
  for (let i = 0; i < word.length; i++) {
    seed += word.charCodeAt(i);
  }
  
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    // Ideal curve: smooth sine wave/envelope representing standardized sound release
    const baseWave = Math.sin(t * Math.PI);
    // Add sub-peaks based on the word length and seed
    const idealSecondary = Math.sin(t * Math.PI * 3 + seed * 0.1) * 0.12;
    const idealY = 24 + (baseWave + idealSecondary) * -16;
    
    // User curve: follows ideal closely if correct, deviates with phase/amplitude shift if incorrect
    const tShifted = isCorrect ? t : t * 1.05 - 0.02;
    const userBaseWave = Math.sin(tShifted * Math.PI);
    const userSecondary = Math.sin(tShifted * Math.PI * 3 + seed * 0.1) * 0.12;
    const deviationFreq = isCorrect ? 0.05 : 0.28;
    const deviationAmp = isCorrect ? 1.5 : 5.5;
    
    // Deviation is a wave that peaks near the center of the word pronunciation
    const deviation = Math.sin(t * Math.PI * 4 + seed) * Math.sin(t * Math.PI) * deviationAmp;
    const userY = 24 + (userBaseWave + userSecondary) * -16 + deviation;
    
    const x = t * 100;
    
    if (i === 0) {
      userPath.push(`M ${x} ${userY}`);
      idealPath.push(`M ${x} ${idealY}`);
    } else {
      userPath.push(`L ${x} ${userY}`);
      idealPath.push(`L ${x} ${idealY}`);
    }
  }
  
  return {
    user: userPath.join(" "),
    ideal: idealPath.join(" ")
  };
}
