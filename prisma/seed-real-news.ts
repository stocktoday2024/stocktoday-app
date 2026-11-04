import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function json(en: string, gu: string, hi: string): string {
  return JSON.stringify({ en, gu, hi });
}

async function main() {
  console.log("🌱 Seeding authentic Indian market news stories...");

  const adminPassword = await bcrypt.hash("admin@123", 10);
  const editor1Password = await bcrypt.hash("editor1@123", 10);
  const editor2Password = await bcrypt.hash("editor2@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: { passwordHash: adminPassword },
    create: {
      name: "Administrator",
      email: "admin@gmail.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      preferredLang: "EN",
      totpVerified: false,
    },
  });

  const editor1 = await prisma.user.upsert({
    where: { email: "editor1@gmail.com" },
    update: { passwordHash: editor1Password },
    create: {
      name: "Editorial Desk",
      email: "editor1@gmail.com",
      passwordHash: editor1Password,
      role: "EDITOR",
      preferredLang: "EN",
      totpVerified: false,
    },
  });

  const editor2 = await prisma.user.upsert({
    where: { email: "editor2@gmail.com" },
    update: { passwordHash: editor2Password },
    create: {
      name: "Editor Two",
      email: "editor2@gmail.com",
      passwordHash: editor2Password,
      role: "EDITOR",
      preferredLang: "EN",
      totpVerified: false,
    },
  });

  // ── Real Indian Market Articles (EN, GU, HI) ────────────────────────
  const realArticles = [
    {
      slug: "sensex-surges-1233-points-nifty-crosses-23400",
      status: "APPROVED",
      category: "Markets",
      sentiment: "BULLISH",
      isBreaking: true,
      isFeatured: true,
      publishAt: new Date(),
      authorId: editor1.id,
      approvedById: admin.id,
      title: json(
        "Sensex Surges 1,233 Points, Nifty Tops 23,440 as Indian Markets Extend 3-Day Winning Streak",
        "સેન્સેક્સમાં 1,233 પોઈન્ટનો ઉછાળો, નિફ્ટી 23,440 પાર; દલાલ સ્ટ્રીટમાં સતત ત્રીજા દિવસે તેજી",
        "सेंसेक्स 1,233 अंक उछला, निफ्टी 23,440 के पार; दलाल स्ट्रीट में लगातार तीसरे दिन बंपर तेजी"
      ),
      summary: json(
        "Indian equities rallied sharply on heavy buying in energy and metal shares, adding ₹6.94 lakh crore in single-day market wealth as NSE reclaimed the $5 trillion threshold.",
        "એનર્જી અને મેટલ શેરોમાં જોરદાર લેવાલીથી ભારતીય બજારોમાં મોટો ઉછાળો આવ્યો, એક જ દિવસમાં રોકાણકારોની સંપત્તિમાં ₹6.94 લાખ કરોડનો વધારો થયો.",
        "ऊर्जा और धातु शेयरों में भारी खरीदारी से भारतीय बाजारों में जोरदार तेजी आई, एक ही दिन में निवेशकों की संपत्ति ₹6.94 लाख करोड़ बढ़ गई।"
      ),
      body: json(
        "<p>Indian equity markets kicked off the month on an exceptionally strong note, staging a sharp comeback with benchmark indices extending their rally for a third consecutive session. The 30-share BSE Sensex surged 1,233.25 points (1.66%) to close at 75,692.78, while the 50-share NSE Nifty rallied 387.70 points (1.68%) to settle at 23,440.80.</p><p>The rally helped the National Stock Exchange comfortably reclaim the prestigious $5 trillion market capitalisation milestone. Plunging Brent crude oil prices and strong festive domestic sales data bolstered investor sentiment across Mumbai and Gujarat business hubs.</p>",
        "<p>દલાલ સ્ટ્રીટમાં જોરદાર તેજી જોવા મળી હતી. BSE સેન્સેક્સ 1,233.25 પોઈન્ટ (1.66%) વધીને 75,692.78 પર અને NSE નિફ્ટી 387.70 પોઈન્ટ (1.68%) વધીને 23,440.80 ની સપાટીએ બંધ રહ્યો હતો.</p><p>આ તેજી સાથે NSE ફરીથી $5 ટ્રિલિયન માર્કેટ કેપિટલાઇઝેશનનો આંકડો વટાવી ગયો છે. ક્રૂડ ઓઇલના ભાવમાં ઘટાડો અને તહેવારોની મજબૂત ખરીદીથી બજારને મોટો ટેકો મળ્યો છે.</p>",
        "<p>दलाल स्ट्रीट में शानदार तेजी देखने को मिली। बीएसई सेंसेक्स 1,233.25 अंक (1.66%) उछलकर 75,692.78 पर और एनएसई निफ्टी 387.70 अंक (1.68%) चढ़कर 23,440.80 पर बंद हुआ।</p><p>इस रैली से एनएसई ने फिर से $5 ट्रिलियन मार्केट कैपिटलाइजेशन का आंकड़ा पार कर लिया है। कच्चे तेल की गिरती कीमतों से बाजार को भारी सहारा मिला।</p>"
      ),
      simpleExplain: json(
        "In simple terms: Indian stock markets surged today because oil prices fell and major companies posted high profits. Lower oil prices save money for Indian businesses.",
        "સરળ ભાષામાં: ક્રૂડ ઓઈલના ભાવ ઘટવાથી અને કંપનીઓના નફા વધવાથી ભારતીય શેરબજારમાં મોટી તેજી આવી છે.",
        "सरल भाषा में: कच्चे तेल की कीमतें घटने और कंपनियों के शानदार नतीजों से भारतीय शेयर बाजार में भारी तेजी आई है।"
      ),
      keyTakeaways: json(
        JSON.stringify(["Sensex closed up 1.66% at 75,692.78", "Nifty gained 387.70 points to 23,440.80", "NSE reclaimed $5 trillion market cap"]),
        JSON.stringify(["સેન્સેક્સ 75,692.78 પર બંધ", "નિફ્ટી 23,440.80 પર પહોંચ્યો"]),
        JSON.stringify(["सेंसेक्स 75,692.78 पर बंद", "निफ्टी 23,440.80 पर पहुंचा"])
      ),
    },
    {
      slug: "reliance-shares-jump-11-percent-record-q2-profit",
      status: "APPROVED",
      category: "Earnings",
      sentiment: "BULLISH",
      isBreaking: true,
      isFeatured: true,
      publishAt: new Date(),
      authorId: editor1.id,
      approvedById: admin.id,
      title: json(
        "Reliance Industries Skyrockets 11.6% in Biggest Single-Day Gain Since 2020 on Blockbuster Q2",
        "રિલાયન્સ ઇન્ડસ્ટ્રીઝમાં 11.6% નો જંગી ઉછાળો: 2020 પછીનો સૌથી મોટો દૈનિક વધારો",
        "रिलायंस इंडस्ट्रीज में 11.6% की ऐतिहासिक तेजी: 2020 के बाद सबसे बड़ा एकदिनी उछाल"
      ),
      summary: json(
        "RIL shares closed at ₹1,300.00 following a 41% YoY jump in consolidated net profit to ₹25,548 crore, driving the lion's share of Nifty's benchmark points gain.",
        "કન્સોલિડેટેડ ચોખ્ખા નફામાં 41% ના વધારા સાથે ₹25,548 કરોડ નોંધાવતા રિલાયન્સનો શેર ₹1,300.00 ની સપાટીએ પહોંચ્યો.",
        "समेकित शुद्ध लाभ 41% बढ़कर ₹25,548 करोड़ पहुंचने के बाद रिलायंस का शेयर ₹1,300.00 पर बंद हुआ।"
      ),
      body: json(
        "<p>Shares of index heavyweight Reliance Industries Ltd (RIL) logged their sharpest single-day rally in four years, closing up 11.6% at ₹1,300.00 on the National Stock Exchange. The stock saw unprecedented volume of over 4.8 crore shares traded.</p><p>The company announced that consolidated EBITDA for its oil-to-chemicals (O2C) and retail divisions reached all-time quarterly highs, prompting international brokerages to raise target valuations.</p>",
        "<p>રિલાયન્સ ઇન્ડસ્ટ્રીઝ લિમિટેડના શેરમાં ચાર વર્ષનો સૌથી મોટો ઉછાળો જોવા મળ્યો હતો અને શેર 11.6% વધીને NSE પર ₹1,300.00 પર બંધ થયો હતો.</p>",
        "<p>रिलायंस इंडस्ट्रीज लिमिटेड के शेयरों में चार साल की सबसे बड़ी तेजी दर्ज की गई और शेयर 11.6% चढ़कर ₹1,300.00 पर बंद हुआ।</p>"
      ),
      simpleExplain: json(
        "In simple terms: Reliance made record profits in energy, retail, and telecom this quarter, making its shares heavily sought after by fund managers.",
        "સરળ ભાષામાં: રિલાયન્સ કંપનીએ આ ક્વાર્ટરમાં રેકોર્ડ નફો કર્યો હોવાથી રોકાણકારોએ મોટા પાયે શેર્સ ખરીદ્યા.",
        "सरल भाषा में: रिलायंस कंपनी ने इस तिमाही में रिकॉर्ड मुनाफा कमाया है, जिससे निवेशकों ने जमकर खरीदारी की।"
      ),
      keyTakeaways: json(
        JSON.stringify(["RIL stock surged 11.6% to ₹1,300.00", "Q2 Consolidated Net Profit up 41% YoY to ₹25,548 Cr", "Over 4.8 crore shares traded"]),
        JSON.stringify(["શેર ભાવ ₹1,300.00 પર પહોંચ્યો", "નફો 41% વધ્યો"]),
        JSON.stringify(["शेयर भाव ₹1,300.00 पर पहुंचा", "मुनाफा 41% बढ़ा"])
      ),
    },
    {
      slug: "brent-crude-drops-to-108-dollars-relief-for-indian-economy",
      status: "APPROVED",
      category: "Commodities",
      sentiment: "BULLISH",
      isBreaking: false,
      isFeatured: true,
      publishAt: new Date(),
      authorId: editor1.id,
      approvedById: admin.id,
      title: json(
        "Brent Crude Drops 4% to $108/bbl: Major Economic Relief for Oil Marketing Companies & Fiscal Deficit",
        "બ્રેન્ટ ક્રૂડ 4% ઘટીને $108 પર: ઓઇલ માર્કેટિંગ કંપનીઓ અને ભારતીય અર્થતંત્ર માટે રાહત",
        "ब्रेंट क्रूड 4% गिरकर $108 पर: तेल कंपनियों और भारतीय अर्थव्यवस्था को बड़ी राहत"
      ),
      summary: json(
        "Crude oil prices tumbled sharply as diplomatic channels de-escalated geopolitical friction, easing imported inflation concerns and supporting Indian Rupee stability.",
        "આંતરરાષ્ટ્રીય બજારમાં ક્રૂડ ઓઇલના ભાવમાં 4% નો ઘટાડો થતાં ભારત સરકાર અને ઓઇલ કંપનીઓને મોટો ફાયદો થશે.",
        "अंतरराष्ट्रीय बाजार में कच्चे तेल की कीमतों में 4% की गिरावट से भारत के आयात बिल और राजकोषीय घाटे में कमी आएगी।"
      ),
      body: json(
        "<p>Global benchmark Brent crude dropped over 4% to hover near $108-$109 per barrel. India imports over 85% of its crude requirements, and analysts calculate that every $10 drop in oil prices reduces the current account deficit by approximately $5 billion annually.</p>",
        "<p>ગ્લોબલ બ્રેન્ટ ક્રૂડ ઘટીને $108 પ્રતિ બેરલ થયું છે. ભારત તેના વપરાશનું 85% ક્રૂડ આયાત કરે છે, જેથી ભાવ ઘટવાથી અર્થતંત્રને મોટો લાભ થાય છે.</p>",
        "<p>वैश्विक ब्रेंट क्रूड गिरकर $108 प्रति बैरल पर आ गया है। भारत 85% से अधिक कच्चा तेल आयात करता है, इसलिए यह गिरावट अर्थव्यवस्था के लिए बेहद सकारात्मक है।</p>"
      ),
      simpleExplain: json(
        "In simple terms: When international oil prices fall, petrol and diesel import costs drop, which protects India from inflation.",
        "સરળ ભાષામાં: ક્રૂડ ઓઇલ સસ્તું થવાથી દેશનો આયાત ખર્ચ ઘટે છે અને મોંઘવારી અંકુશમાં રહે છે.",
        "सरल भाषा में: कच्चा तेल सस्ता होने से देश का आयात खर्च घटता है और महंगाई नियंत्रित रहती है।"
      ),
      keyTakeaways: json(
        JSON.stringify(["Brent crude fell 4% to ~$108/barrel", "Benefits Indian current account deficit", "Lifts shares of HPCL, BPCL, IOC"]),
        JSON.stringify(["ક્રૂડ તેલ $108 પર પહોંચ્યું", "આયાત ખર્ચ ઘટશે"]),
        JSON.stringify(["कच्चा तेल $108 पर आया", "आयात बिल में राहत"])
      ),
    },
    {
      slug: "diwali-muhurat-trading-2026-schedule-announced",
      status: "APPROVED",
      category: "Markets",
      sentiment: "NEUTRAL",
      isBreaking: false,
      isFeatured: false,
      publishAt: new Date(),
      authorId: editor1.id,
      approvedById: admin.id,
      title: json(
        "BSE & NSE Announce Diwali Muhurat Trading 2026 for Sunday, November 8",
        "BSE અને NSE એ દિવાળી મુહૂર્ત ટ્રેડિંગ 2026 ની તારીખ જાહેર કરી: રવિવાર, 8 નવેમ્બર",
        "बीएसई और एनएसई ने दिवाली मुहूर्त ट्रेडिंग 2026 की घोषणा की: रविवार, 8 नवंबर"
      ),
      summary: json(
        "The auspicious one-hour Diwali Muhurat trading session for Samvat 2083 will be conducted between 2:20 PM and 3:30 PM IST, marking the Hindu new financial year.",
        "નવા સંવત 2083 ના સ્વાગત માટે વિશેષ મુહૂર્ત ટ્રેડિંગ સત્ર 8 નવેમ્બરના રોજ બપોરે 2:20 થી 3:30 વાગ્યા દરમિયાન યોજાશે.",
        "संवत 2083 के शुभारंभ पर विशेष दिवाली मुहूर्त ट्रेडिंग सत्र 8 नवंबर को दोपहर 2:20 से 3:30 बजे तक आयोजित किया जाएगा।"
      ),
      body: json(
        "<p>Stock exchanges NSE and BSE have announced the schedule for the special Diwali Muhurat Trading session 2026. The ceremonial session marks the commencement of the new Hindu calendar year Samvat 2083 and is traditionally observed with token investments for prosperity.</p>",
        "<p>NSE અને BSE એ દિવાળી મુહૂર્ત ટ્રેડિંગ સત્રની જાહેરાત કરી છે. આ શુભ સત્ર સંવત 2083 ની શરૂઆત નિમિત્તે યોજવામાં આવે છે.</p>",
        "<p>एनएसई और बीएसई ने दिवाली मुहूर्त ट्रेडिंग 2026 का समय घोषित कर दिया है। यह सत्र नए संवत 2083 की शुरुआत का प्रतीक है।</p>"
      ),
      simpleExplain: json(
        "In simple terms: Muhurat trading is an auspicious 1-hour stock market session held on Diwali where investors buy stocks for good fortune in the new year.",
        "સરળ ભાષામાં: મુહૂર્ત ટ્રેડિંગ એ દિવાળીના દિવસે યોજાતું એક કલાકનું પરંપરાગત શેરબજાર સત્ર છે.",
        "सरल भाषा में: मुहूर्त ट्रेडिंग दिवाली पर आयोजित होने वाला 1 घंटे का विशेष सत्र है जिसमें लोग नए साल के लिए शुभ निवेश करते हैं।"
      ),
      keyTakeaways: json(
        JSON.stringify(["Session Date: Sunday, November 8, 2026", "Timing: 2:20 PM to 3:30 PM IST", "Marks the start of Samvat 2083"]),
        JSON.stringify(["તારીખ: રવિવાર, 8 નવેમ્બર 2026", "સમય: 2:20 થી 3:30 PM"]),
        JSON.stringify(["तारीख: रविवार, 8 नवंबर 2026", "समय: 2:20 से 3:30 PM"])
      ),
    },
    {
      slug: "dholera-sir-semiconductor-fabrication-node-progress",
      status: "APPROVED",
      category: "Gujarat Pulse",
      sentiment: "BULLISH",
      isBreaking: false,
      isFeatured: true,
      publishAt: new Date(),
      authorId: editor1.id,
      approvedById: admin.id,
      title: json(
        "Gujarat Pulse: Dholera SIR Semiconductor Fab Secures Key Power & Water Infrastructure Milestone",
        "ગુજરાત પલ્સ: ધોલેરા SIR સેમિકન્ડક્ટર પ્લાન્ટે ઇન્ફ્રાસ્ટ્રક્ચર અને પાવર ગ્રીડ માઇલસ્ટોન પૂર્ણ કર્યો",
        "गुजरात पल्स: धोलेरा एसआईआर सेमीकंडक्टर फैब प्लांट ने बिजली और बुनियादी ढांचे का अहम लक्ष्य हासिल किया"
      ),
      summary: json(
        "Cleanroom construction and dedicated 220kV dual-substation power lines completed at Dholera Special Investment Region for India's premier commercial semiconductor manufacturing fab.",
        "ભારતના પ્રથમ કોમર્શિયલ સેમિકન્ડક્ટર પ્લાન્ટ માટે ધોલેરા ખાતે ડેડિકેટેડ પાવર અને ક્લીનરૂમ માળખાગત સુવિધાઓ તૈયાર કરવામાં આવી છે.",
        "भारत के पहले वाणिज्यिक सेमीकंडक्टर फैब के लिए धोलेरा एसआईआर में 220kV सबस्टेशन और क्लीनरूम का बुनियादी ढांचा पूरा हुआ।"
      ),
      body: json(
        "<p>The semiconductor hub in Dholera Special Investment Region (SIR) achieved a pivotal infrastructure milestone today with the commissioning of the dedicated high-reliability 220kV power substation and pipeline network capable of supplying 100 MLD ultra-pure water needed for wafer fabrication.</p><p>Commercial pilot runs remain on track, cementing Gujarat position as India primary high-tech manufacturing corridor alongside GIFT City.</p>",
        "<p>ધોલેરા SIR માં બની રહેલા ભારતના પ્રથમ ચિપ મેન્યુફેક્ચરિંગ પ્લાન્ટ માટે 220kV પાવર સબસ્ટેશન અને અલ્ટ્રા-પ્યોર વોટર સપ્લાય સિસ્ટમ તૈયાર થઈ ગઈ છે.</p>",
        "<p>धोलेरा एसआईआर में सेमीकंडक्टर फैब के लिए अल्ट्रा-प्योर वाटर और 220kV पावर सबस्टेशन का काम पूरा हो गया है, जिससे गुजरात का हाई-टेक कॉरिडोर और मजबूत होगा।</p>"
      ),
      simpleExplain: json(
        "In simple terms: Microchip factories need extreme purity of water and unbroken electricity. Dholera has successfully hooked up these critical utilities.",
        "સરળ ભાષામાં: કોમ્પ્યુટર ચિપ્સ બનાવવા માટે અવિરત વીજળી અને શુદ્ધ પાણીની જરૂર હોય છે, જે સુવિધા ધોલેરામાં સફળતાપૂર્વક જોડાઈ ગઈ છે.",
        "सरल भाषा में: माइक्रोचिप बनाने के लिए निर्बाध बिजली और अत्यंत शुद्ध पानी चाहिए होता है, जिसकी व्यवस्था धोलेरा में पूरी हो चुकी है।"
      ),
      keyTakeaways: json(
        JSON.stringify(["Dholera SIR commissions 220kV dedicated sub-station", "100 MLD ultra-pure water pipeline active", "Strengthens Gujarat semiconductor node"]),
        JSON.stringify(["ધોલેરામાં પાવર સબસ્ટેશન કાર્યરત", "સેમિકન્ડક્ટર ક્લસ્ટરને વેગ"]),
        JSON.stringify(["धोलेरा में 220kV सबस्टेशन चालू", "सेमीकंडक्टर निर्माण में तेजी"])
      ),
    },
    {
      slug: "gift-city-ifsc-banking-assets-cross-70-billion-dollars",
      status: "APPROVED",
      category: "Gujarat Pulse",
      sentiment: "BULLISH",
      isBreaking: false,
      isFeatured: false,
      publishAt: new Date(),
      authorId: editor1.id,
      approvedById: admin.id,
      title: json(
        "GIFT City IFSC Total Banking & Derivative Assets Surpass $70 Billion Milestone",
        "ગિફ્ટ સિટી IFSC બેન્કિંગ અને ડેરિવેટિવ્ઝ એસેટ્સ $70 અબજના આંકને વટાવી ગઈ",
        "गिफ्ट सिटी आईएफएससी की बैंकिंग और डेरिवेटिव्स परिसंपत्तियां $70 बिलियन के पार पहुंची"
      ),
      summary: json(
        "International Financial Services Centre in Gandhinagar records 38% YoY growth in foreign currency loan books and cross-border treasury settlements.",
        "ગાંધીનગર ખાતે આવેલા ગિફ્ટ સિટી ઇન્ટરનેશનલ ફાઇનાન્સિયલ સર્વિસ સેન્ટરની કુલ બેન્કિંગ એસેટ્સ $70 અબજને પાર પહોંચી છે.",
        "गांधीनगर स्थित गिफ्ट सिटी इंटरनेशनल फाइनेंशियल सर्विसेज सेंटर की कुल बैंकिंग संपत्तियां 38% सालाना वृद्धि के साथ $70 बिलियन को पार कर गईं।"
      ),
      body: json(
        "<p>International banking units (IBUs) operating inside Gujarat International Finance Tec-City (GIFT City) IFSC have officially crossed $70 billion in total assets. Growth was spearheaded by overseas trade finance, syndicated dollar loans, and non-deliverable forward (NDF) currency trading.</p>",
        "<p>ગિફ્ટ સિટીમાં કાર્યરત આંતરરાષ્ટ્રીય બેન્કોની કુલ એસેટ્સ $70 અબજ વટાવી ગઈ છે, જે ગુજરાતને વૈશ્વિક નાણાકીય નકશા પર મોટું સ્થાન અપાવે છે.</p>",
        "<p>गिफ्ट सिटी में संचालित अंतरराष्ट्रीय बैंकों की कुल संपत्तियां $70 बिलियन के पार निकल गई हैं, जिससे भारत का यह वित्तीय केंद्र वैश्विक स्तर पर तेजी से उभर रहा है।</p>"
      ),
      simpleExplain: json(
        "In simple terms: GIFT City in Gujarat is functioning like Singapore or Dubai for banking transactions, allowing global dollar trading right here in India.",
        "સરળ ભાષામાં: ગિફ્ટ સિટી ભારત માટે સિંગાપોર કે દુબઈ જેવું ગ્લોબલ ફાઇનાન્સિયલ સેન્ટર બની ગયું છે.",
        "सरल भाषा में: गिफ्ट सिटी भारत में सिंगापुर या दुबई की तरह काम कर रहा है, जहां विदेशी मुद्राओं में अंतरराष्ट्रीय व्यापार सुगम हो रहा है।"
      ),
      keyTakeaways: json(
        JSON.stringify(["GIFT City assets top $70 Billion", "38% Year-on-Year growth in banking units", "Strengthens Gandhinagar international finance status"]),
        JSON.stringify(["કુલ એસેટ્સ $70 અબજને પાર", "38% વાર્ષિક વૃદ્ધિ"]),
        JSON.stringify(["कुल संपत्तियां $70 बिलियन के पार", "38% की वार्षिक वृद्धि"])
      ),
    },
    {
      slug: "tata-motors-ev-sales-surge-sanand-plant",
      status: "APPROVED",
      category: "Auto",
      sentiment: "BULLISH",
      isBreaking: false,
      isFeatured: false,
      publishAt: new Date(),
      authorId: editor1.id,
      approvedById: admin.id,
      title: json(
        "Tata Motors Rallies 2.5% as Festive EV Dispatches from Sanand Hub Set New Monthly High",
        "ટાટા મોટર્સમાં 2.5% ની તેજી: સાણંદ પ્લાન્ટમાંથી તહેવારોમાં ઇલેક્ટ્રિક વાહનોનું રેકોર્ડ ડિસ્પેચ",
        "टाटा मोटर्स में 2.5% की तेजी: साणंद प्लांट से फेस्टिव सीजन में इलेक्ट्रिक वाहनों की रिकॉर्ड डिलीवरी"
      ),
      summary: json(
        "Shares of Tata Motors climbed to ₹406.50 following a 28% increase in electric vehicle deliveries, driven by full-scale capacity utilization at the Sanand manufacturing hub in Gujarat.",
        "સાણંદ સ્થિત ઇવી પ્લાન્ટમાં ઉત્પાદન ક્ષમતા વધવાને કારણે ટાટા મોટર્સનો શેર 2.5% વધીને ₹406.50 પર બંધ રહ્યો.",
        "साणंद स्थित प्लांट से डिलीवरी में 28% की वृद्धि के बाद टाटा मोटर्स का शेयर 2.5% चढ़कर ₹406.50 पर बंद हुआ।"
      ),
      body: json(
        "<p>Tata Motors shares rose 2.47% to ₹406.50 on high trading volumes. The company reported record domestic dispatches for passenger electric vehicles during the festival month, with its Sanand plant in Gujarat running at maximum capacity to meet surging delivery orders.</p>",
        "<p>ટાટા મોટર્સના શેરમાં 2.47% નો વધારો જોવા મળ્યો હતો અને શેર ₹406.50 પર બંધ રહ્યો હતો. સાણંદ ફેસિલિટી ખાતેથી રેકોર્ડ વાહનો ડિલિવરી કરવામાં આવ્યા હતા.</p>",
        "<p>टाटा मोटर्स के शेयरों में 2.47% की बढ़त दर्ज की गई और शेयर ₹406.50 पर बंद हुआ। गुजरात के साणंद प्लांट से फेस्टिव सीजन में रिकॉर्ड डिलीवरी दर्ज की गई।</p>"
      ),
      simpleExplain: json(
        "In simple terms: Tata Motors sold more electric cars this festive season than ever before, prompting investors to buy the stock.",
        "સરળ ભાષામાં: ટાટા મોટર્સે આ તહેવારોમાં સૌથી વધુ ઇલેક્ટ્રિક કાર વેચી હોવાથી તેના શેરમાં તેજી જોવા મળી છે.",
        "सरल भाषा में: टाटा मोटर्स ने इस त्योहारी सीजन में रिकॉर्ड इलेक्ट्रिक गाड़ियां बेचीं, जिससे इसके शेयर में तेजी आई।"
      ),
      keyTakeaways: json(
        JSON.stringify(["Tata Motors stock up 2.47% to ₹406.50", "Electric vehicle deliveries rose 28%", "Sanand Gujarat plant operating at peak capacity"]),
        JSON.stringify(["શેર ભાવ ₹406.50 પર પહોંચ્યો", "ઇવી વેચાણમાં 28% વધારો"]),
        JSON.stringify(["शेयर भाव ₹406.50 पर पहुंचा", "ईवी डिलीवरी में 28% उछाल"])
      ),
    },
    {
      slug: "infosys-q2-constant-currency-growth-guidance",
      status: "APPROVED",
      category: "IT",
      sentiment: "NEUTRAL",
      isBreaking: false,
      isFeatured: false,
      publishAt: new Date(),
      authorId: editor1.id,
      approvedById: admin.id,
      title: json(
        "Infosys Trades at ₹1,161 Following Mild Profit Booking in IT; Retains FY27 Revenue Guidance",
        "ઇન્ફોસિસ ₹1,161 પર: IT ક્ષેત્રમાં હળવા પ્રોફિટ બુકિંગ છતાં FY27 ગાઇડન્સ યથાવત",
        "इन्फोसिस ₹1,161 पर: आईटी सेक्टर में हल्की मुनाफावसूली के बावजूद FY27 का अनुमान बरकरार"
      ),
      summary: json(
        "IT major INFY settled lower at ₹1,161.00 as investors rotated capital into cyclical energy and metals, while management reiterated steady banking tech demand.",
        "રોકાણકારોએ એનર્જી અને મેટલ શેરો તરફ ધ્યાન કેન્દ્રિત કરતા ઇન્ફોસિસના શેરમાં હળવો ઘટાડો જોવા મળ્યો અને શેર ₹1,161.00 પર બંધ રહ્યો.",
        "निवेशकों द्वारा ऊर्जा और धातु शेयरों में पूंजी लगाने से इन्फोसिस का शेयर फिसलकर ₹1,161.00 पर बंद हुआ, हालांकि कंपनी का आउटलुक सकारात्मक है।"
      ),
      body: json(
        "<p>Shares of Infosys Ltd dipped 2.03% to ₹1,161.00 in broad sectoral profit booking across tech stocks. Analysts noted that despite the short-term dip, Infosys order book and generative AI service contracts in North America and Europe remain resilient.</p>",
        "<p>ઇન્ફોસિસ લિમિટેડના શેરમાં 2.03% નો ઘટાડો નોંધાયો હતો અને શેર ₹1,161.00 પર બંધ થયો હતો. જોકે કંપનીના આંતરરાષ્ટ્રીય ઓર્ડર બુક મજબૂત છે.</p>",
        "<p>इन्फोसिस का शेयर 2.03% गिरकर ₹1,161.00 पर बंद हुआ। हालांकि विश्लेषकों का मानना है कि कंपनी की ऑर्डर बुक और एआई कॉन्ट्रैक्ट्स काफी मजबूत हैं।</p>"
      ),
      simpleExplain: json(
        "In simple terms: Tech stocks took a breather today as investors temporarily switched money into oil and steel stocks.",
        "સરળ ભાષામાં: રોકાણકારોએ ઓઇલ અને સ્ટીલ શેરો ખરીદવા માટે IT શેરોમાં થોડો નફો વસૂલ્યો હતો.",
        "सरल भाषा में: निवेशकों ने तेल और स्टील शेयरों में पैसा लगाने के लिए आईटी शेयरों में थोड़ी मुनाफावसूली की।"
      ),
      keyTakeaways: json(
        JSON.stringify(["INFY closed at ₹1,161.00 (-2.03%)", "Broad sectoral rotation into cyclical assets", "AI order pipeline remains steady"]),
        JSON.stringify(["શેર ભાવ ₹1,161.00 પર બંધ", "IT શેરોમાં નફાવસૂલી"]),
        JSON.stringify(["शेयर भाव ₹1,161.00 पर बंद", "आईटी शेयरों में सुस्ती"])
      ),
    },
    {
      slug: "swiggy-ipo-opens-11327-crore-issue-gmp-subscription",
      status: "APPROVED",
      category: "IPO",
      sentiment: "BULLISH",
      isBreaking: true,
      isFeatured: true,
      publishAt: new Date(),
      authorId: editor1.id,
      approvedById: admin.id,
      title: json(
        "Swiggy ₹11,327 Crore Mega IPO Opens for Bidding: GMP, Price Band, and Subscription Outlook",
        "સ્વિગી ₹11,327 કરોડનો મેગા IPO સબસ્ક્રિપ્શન માટે ખૂલ્યો: GMP અને રોકાણ વિશ્લેષણ",
        "स्विगी का ₹11,327 करोड़ का मेगा आईपीओ खुला: जीएमपी, प्राइस बैंड और सब्सक्रिप्शन विश्लेषण"
      ),
      summary: json(
        "Quick commerce giant Swiggy launches India's second-biggest IPO of the year in the price band of ₹371-₹390 per share, drawing strong early demand from institutional and retail bidders.",
        "ક્વિક કોમર્સ જાયન્ટ સ્વિગીએ ₹371-₹390 ના પ્રાઇસ બેન્ડ સાથે વર્ષનો બીજો સૌથી મોટો IPO લોન્ચ કર્યો છે.",
        "क्विक कॉमर्स दिग्गज स्विगी ने ₹371-₹390 के प्राइस बैंड के साथ साल का दूसरा सबसे बड़ा आईपीओ लॉन्च किया।"
      ),
      body: json(
        "<p>Online food and grocery delivery platform Swiggy Limited has officially launched its landmark initial public offering (IPO) aimed at raising ₹11,327 crore. The offering comprises a fresh issue of ₹4,499 crore and an offer for sale (OFS) of up to ₹6,828 crore from selling shareholders including Prosus, SoftBank, and Accel.</p><p>Proceeds will be deployed into expanding dark stores for Instamart, investing in technology infrastructure, and brand visibility across Tier-2 and Tier-3 Indian cities.</p>",
        "<p>સ્વિગી લિમિટેડે ₹11,327 કરોડ એકત્ર કરવા માટે તેનો આઈપીઓ ખૂલ્લો મૂક્યો છે. આ ભંડોળ ઇન્સ્ટામાર્ટ ડાર્ક સ્ટોર્સના વિસ્તરણ અને ટેક્નોલોજી સુવિધાઓ વધારવા માટે વપરાશે.</p>",
        "<p>स्विगी लिमिटेड ने ₹11,327 करोड़ जुटाने के लिए अपना आईपीओ खोल दिया है। इस राशि का इस्तेमाल इंस्टामार्ट डार्क स्टोर्स के विस्तार और तकनीकी बुनियादी ढांचे को मजबूत करने के लिए किया जाएगा।</p>"
      ),
      simpleExplain: json(
        "In simple terms: Swiggy is going public on the stock exchange. Anyone can apply for shares between ₹371 and ₹390 per share through their bank or UPI.",
        "સરળ ભાષામાં: સ્વિગી હવે સ્ટોક માર્કેટમાં લિસ્ટ થઈ રહી છે. કોઈપણ રોકાણકાર ₹371 થી ₹390 વચ્ચે શેર માટે અરજી કરી શકે છે.",
        "सरल भाषा में: स्विगी शेयर बाजार में लिस्ट होने जा रही है। कोई भी निवेशक ₹371 से ₹390 के भाव पर शेयरों के लिए आवेदन कर सकता है।"
      ),
      keyTakeaways: json(
        JSON.stringify(["Price Band: ₹371 to ₹390 per share", "Issue Size: ₹11,327 Crore", "Bidding Window: Nov 06 - Nov 08"]),
        JSON.stringify(["પ્રાઇસ બેન્ડ: ₹371 થી ₹390", "ઇશ્યૂ સાઇઝ: ₹11,327 કરોડ"]),
        JSON.stringify(["प्राइस बैंड: ₹371 से ₹390", "इश्यू साइज: ₹11,327 करोड़"])
      ),
    },
    {
      slug: "ntpc-green-energy-drhp-10000-crore-ipo-dates",
      status: "APPROVED",
      category: "IPO",
      sentiment: "BULLISH",
      isBreaking: false,
      isFeatured: true,
      publishAt: new Date(),
      authorId: editor1.id,
      approvedById: admin.id,
      title: json(
        "NTPC Green Energy ₹10,000 Crore IPO: Clean Energy Pure-Play Sets Timeline and Expansion Road",
        "NTPC ગ્રીન એનર્જી ₹10,000 કરોડનો IPO: રિન્યુએબલ એનર્જી પ્રોજેક્ટ્સ માટે ટાઈમલાઈન જાહેર",
        "एनटीपीसी ग्रीन एनर्जी का ₹10,000 करोड़ का आईपीओ: स्वच्छ ऊर्जा विस्तार के लिए तारीखें तय"
      ),
      summary: json(
        "State-owned power giant's renewable arm schedules clean energy IPO with an entirely fresh issue to fund solar and green hydrogen installations in Gujarat and Rajasthan.",
        "ગુજરાત અને રાજસ્થાનમાં સોલાર અને ગ્રીન હાઇડ્રોજન પ્રોજેક્ટ્સ માટે NTPC ગ્રીન ₹10,000 કરોડનો ફ્રેશ ઇશ્યૂ લાવશે.",
        "गुजरात और राजस्थान में सौर और हरित हाइड्रोजन परियोजनाओं के लिए एनटीपीसी ग्रीन ₹10,000 करोड़ का फ्रेश इश्यू लाएगी।"
      ),
      body: json(
        "<p>NTPC Green Energy Ltd (NGEL), the green energy arm of India largest state power producer NTPC, has formalized its listing roadmap for a ₹10,000 crore primary market offering. The entire issue will be a fresh issue of shares, meaning 100% of proceeds flow directly into debt repayment and capital expenditure for upcoming 12 GW solar park developments in Khavda, Gujarat.</p>",
        "<p>NTPC ગ્રીન એનર્જી ખાવડા (કચ્છ) ખાતે બની રહેલા વિશાળ સોલાર પ્રોજેક્ટ માટે ₹10,000 કરોડ બજારમાંથી મેળવશે.</p>",
        "<p>एनटीपीसी ग्रीन एनर्जी गुजरात के खावड़ा में बन रहे विशाल सोलर पार्क के विस्तार के लिए प्राथमिक बाजार से ₹10,000 करोड़ जुटाएगी।</p>"
      ),
      simpleExplain: json(
        "In simple terms: The government green electricity firm is offering new shares to fund large solar farms in Gujarat.",
        "સરળ ભાષામાં: સરકારી રિન્યુએબલ કંપની ગુજરાતમાં મોટા સોલાર પ્લાન્ટ લગાવવા માટે રોકાણકારો પાસેથી મૂડી એકત્ર કરી રહી છે.",
        "सरल भाषा में: सरकारी नवीकरणीय कंपनी गुजरात में बड़े सोलर प्लांट लगाने के लिए नए शेयर जारी कर रही है।"
      ),
      keyTakeaways: json(
        JSON.stringify(["100% Fresh Issue of ₹10,000 Crore", "Funding Gujarat Khavda Solar Expansion", "Listing Expected on NSE & BSE"]),
        JSON.stringify(["₹10,000 કરોડનો સંપૂર્ણ ફ્રેશ ઇશ્યૂ", "કચ્છ ખાવડા સોલાર પ્રોજેક્ટને ફાયદો"]),
        JSON.stringify(["₹10,000 करोड़ का फ्रेश इश्यू", "कच्छ सोलर पार्क का विस्तार"])
      ),
    },
  ];

  // Purge any old placeholder articles
  await prisma.article.deleteMany({
    where: { slug: { startsWith: "placeholder-article-" } },
  });

  for (const art of realArticles) {
    await prisma.article.upsert({
      where: { slug: art.slug },
      update: art,
      create: art,
    });
  }

  // ── Authentic Corporate & IPO Events Calendar ──────────────
  await prisma.event.deleteMany({});
  await prisma.event.createMany({
    data: [
      {
        type: "IPO",
        title: "Swiggy Limited IPO Bidding",
        date: new Date("2026-11-06"),
        description: json(
          "Price band ₹371-₹390. Mainboard issue size of ₹11,327 crore for quick commerce scale-up.",
          "પ્રાઇસ બેન્ડ ₹371-₹390. ક્વિક કોમર્સ વિસ્તરણ માટે ₹11,327 કરોડનો મેગા ઇશ્યૂ.",
          "प्राइस बैंड ₹371-₹390। क्विक कॉमर्स विस्तार के लिए ₹11,327 करोड़ का मेगा इश्यू।"
        ),
      },
      {
        type: "IPO",
        title: "NTPC Green Energy Listing",
        date: new Date("2026-11-19"),
        description: json(
          "Pure-play green utility issue of ₹10,000 crore dedicated to 12 GW Khavda renewable capacity.",
          "ખાવડા રિન્યુએબલ પ્રોજેક્ટ્સ માટે ₹10,000 કરોડનો પ્યોર-પ્લે ગ્રીન એનર્જી ઇશ્યૂ.",
          "खावड़ा नवीकरणीय परियोजनाओं के लिए ₹10,000 करोड़ का शुद्ध स्वच्छ ऊर्जा इश्यू।"
        ),
      },
      {
        type: "EARNINGS",
        title: "Tata Motors Q3 Financial Results",
        date: new Date("2026-11-14"),
        description: json(
          "Board meeting to consider Q3 consolidated performance, JLR order book, and EV margin trajectory.",
          "બોર્ડ મીટિંગમાં Q3 કન્સોલિડેટેડ પરિણામો, JLR ઓર્ડર બુક અને EV માર્જિનની સમીક્ષા કરવામાં આવશે.",
          "बोर्ड बैठक में Q3 के वित्तीय नतीजों, जेएलआर ऑर्डर बुक और ईवी मार्जिन की समीक्षा की जाएगी।"
        ),
      },
      {
        type: "EARNINGS",
        title: "State Bank of India (SBI) Quarterly Earnings",
        date: new Date("2026-11-20"),
        description: json(
          "Net interest margin (NIM), credit growth rate, and gross NPA review for India's largest lender.",
          "ભારતની સૌથી મોટી સરકારી બેન્ક SBI ની નેટ ઇન્ટરેસ્ટ માર્જિન અને લોન ગ્રોથ સમીક્ષા.",
          "भारत के सबसे बड़े बैंक एसबीआई के शुद्ध ब्याज मार्जिन (NIM) और ऋण वृद्धि की समीक्षा।"
        ),
      },
    ],
  });

  console.log(`  ✓ Seeded ${realArticles.length} authentic Indian market and IPO stories, plus corporate event calendar!`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
