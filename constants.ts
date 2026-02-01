import { LanguageMode, Player, CATEGORIES } from './types';



export const getRandomLetter = (language: LanguageMode): string => {
  if (language === LanguageMode.SINHALA) {
    const letters = ['අ', 'ක', 'ම', 'න', 'ප', 'ර', 'ස', 'බ', 'ල', 'ව', 'ග', 'හ'];
    return letters[Math.floor(Math.random() * letters.length)];
  } else {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T'];
    return letters[Math.floor(Math.random() * letters.length)];
  }
}

export const generateRoomCode = () => Math.floor(1000 + Math.random() * 9000).toString();

export const SPY_WORDS = [
  "Coconut Tree (පොල් ගස)",
  "Tuk Tuk (ත්‍රී රෝද රිය)",
  "Cricket Bat (ක්‍රිකට් පිත්ත)",
  "Elephant (අලියා)",
  "Tea Cup (තේ කෝප්පය)",
  "School Van (පාසල් වෑන් රිය)",
  "Rice & Curry (බත් සහ කරි)",
  "Lotus Tower (නෙළුම් කුළුණ)",
  "Sigiriya (සීගිරිය)",
  "Vesak Lantern (වෙසක් කූඩුව)",
  "Kottu Roti (කොත්තු)",
  "Woodapple (දිවුල්)",
  "Train (දුම්රිය)",
  "Arrack (අරක්කු)",
  "Betel Leaf (බුලත් කොළ)",
  "Cinnamon (කුරුඳු)",
  "Mask (වෙස් මුහුණ)",
  "Drum (බෙරය)",
  "Fishing Boat (ධීවර බෝට්ටුව)",
  "Temple (පන්සල)"
];
