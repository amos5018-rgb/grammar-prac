// Lightweight pre-computed question ID/count maps.
// Client components import this instead of coverage.ts
// to avoid bundling the full question dataset (~158KB → ~2KB).
// Update when question IDs change.

export const questionIdMap: Record<string, string[]> = {
  "phoneme-basics": ["PB001","PB002","PB003","PB004","PB005","PB006","PB007","PB008","PB009","PB010","PB011","PB012","PB013"],
  "consonant-system": ["CS001","CS002","CS003","CS004","CS005","CS006","CS007","CS008","CS009","CS010","CS011","CS012","CS013","CS014","CS015"],
  "final-consonants": ["FC001","FC002","FC003","FC004","FC005","FC006","FC007","FC008","FC009","FC010","FC011","FC012","FC013","FC014","FC015","FC016","FC017"],
  "morpheme-basics": ["MB001","MB002","MB003","MB004","MB005","MB006","MB007","MB008","MB009","MB010","MB011","MB012","MB013","MB014","MB015"],
  "phoneme-change-types": ["PC001","PC002","PC003","PC004","PC005","PC006","PC007","PC008","PC009","PC010","PC011","PC012"],
  "nasal-liquid": ["NL001","NL002","NL003","NL004","NL005","NL006","NL007","NL008","NL009","NL010","NL011","NL012","NL013","NL014"],
  "palatalization": ["PL001","PL002","PL003","PL004","PL005","PL006","PL007","PL008","PL009","PL010"],
  "tensification-aspiration": ["TA001","TA002","TA003","TA004","TA005","TA006","TA007","TA008","TA009","TA010","TA011","TA012","TA013","TA014"],
  "deletion-addition": ["DA001","DA002","DA003","DA004","DA005","DA006","DA007","DA008","DA009","DA010","DA011","DA012","DA013"],
  "honorifics": ["HN001","HN002","HN003","HN004","HN005","HN006","HN007","HN008","HN009","HN010","HN011"],
  "time-expression": ["TE001","TE002","TE003","TE004","TE005","TE006","TE007","TE008","TE009","TE010","TE011"],
  "passive-quotation": ["PQ001","PQ002","PQ003","PQ004","PQ005","PQ006","PQ007","PQ008","PQ009","PQ010","PQ011","PQ012"],
  "phoneme-change-review": ["PCR001","PCR002","PCR003","PCR004","PCR005","PCR006","PCR007","PCR008","PCR009","PCR010","PCR011","PCR012","PCR013","PCR014","PCR015","PCR016","PCR017","PCR018","PCR019","PCR020","PCR021","PCR022","PCR023","PCR024","PCR025","PCR026","PCR027","PCR028","PCR029","PCR030"],
  "grammar-elements-review": ["GER001","GER002","GER003","GER004","GER005","GER006","GER007","GER008","GER009","GER010","GER011","GER012","GER013","GER014","GER015","GER016","GER017","GER018","GER019","GER020","GER021","GER022","GER023","GER024","GER025","GER026","GER027","GER028","GER029","GER030","GER031","GER032","GER033","GER034","GER035","GER036","GER037","GER038","GER039","GER040","GER041","GER042","GER043","GER044","GER045","GER046","GER047","GER048","GER049","GER050","GER051","GER052","GER053","GER054","GER055","GER056","GER057","GER058","GER059","GER060"],
  "advanced-basics-1": ["AB001","AB002","AB003","AB004","AB005","AB006","AB007","AB008"],
  "advanced-basics-2": ["AB009","AB010","AB011","AB012","AB013","AB014","AB015","AB016"],
  "advanced-basics-3": ["AB017","AB018","AB019","AB020","AB021","AB022","AB023","AB024","AB025"],
  "advanced-phoneme-change-1": ["AP001","AP002","AP003","AP004","AP005","AP006","AP007","AP008"],
  "advanced-phoneme-change-2": ["AP009","AP010","AP011","AP012","AP013","AP014","AP015","AP016"],
  "advanced-phoneme-change-3": ["AP017","AP018","AP019","AP020","AP021","AP022","AP023","AP024","AP025"],
  "advanced-grammar-1": ["AG001","AG002","AG003","AG004","AG005","AG006","AG007","AG008"],
  "advanced-grammar-2": ["AG009","AG010","AG011","AG012","AG013","AG014","AG015","AG016"],
  "advanced-grammar-3": ["AG017","AG018","AG019","AG020","AG021","AG022","AG023","AG024","AG025"],
};

export const questionCountMap: Record<string, number> = {
  "phoneme-basics": 13,
  "consonant-system": 15,
  "final-consonants": 17,
  "morpheme-basics": 15,
  "phoneme-change-types": 12,
  "nasal-liquid": 14,
  "palatalization": 10,
  "tensification-aspiration": 14,
  "deletion-addition": 13,
  "honorifics": 11,
  "time-expression": 11,
  "passive-quotation": 12,
  "phoneme-change-review": 30,
  "grammar-elements-review": 60,
  "advanced-basics-1": 8,
  "advanced-basics-2": 8,
  "advanced-basics-3": 9,
  "advanced-phoneme-change-1": 8,
  "advanced-phoneme-change-2": 8,
  "advanced-phoneme-change-3": 9,
  "advanced-grammar-1": 8,
  "advanced-grammar-2": 8,
  "advanced-grammar-3": 9,
};

export function getUnitQuestionIdsLight(unitCode: string): string[] {
  return questionIdMap[unitCode] ?? [];
}
