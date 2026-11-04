import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function json(en: string, gu: string, hi: string): string {
  return JSON.stringify({ en, gu, hi });
}

async function main() {
  console.log("🌱 Seeding database with hashed passwords...");

  const adminPassword = await bcrypt.hash("admin@123", 10);
  const editor1Password = await bcrypt.hash("editor1@123", 10);
  const editor2Password = await bcrypt.hash("editor2@123", 10);

  // ── Users ──────────────────────────────────────────────────────
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
      name: "Editor One",
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
      preferredLang: "GU",
      totpVerified: false,
    },
  });

  console.log("  ✓ Users created with verifiable bcrypt hashes");

  // ── Companies ──────────────────────────────────────────────────
  const companyData = [
    { ticker: "RELIANCE", exchange: "NSE", sector: "Energy", name_en: "Company A (Reliance placeholder)", name_gu: "કંપની A (રિલાયન્સ પ્લેસહોલ્ડર)", name_hi: "कंपनी A (रिलायंस प्लेसहोल्डर)" },
    { ticker: "TCS", exchange: "NSE", sector: "IT", name_en: "Company B (TCS placeholder)", name_gu: "કંપની B (TCS પ્લેસહોલ્ડર)", name_hi: "कंपनी B (TCS प्लेसहोल्डर)" },
    { ticker: "HDFCBANK", exchange: "NSE", sector: "Banking", name_en: "Company C (HDFC Bank placeholder)", name_gu: "કંપની C (HDFC બેન્ક પ્લેસહોલ્ડર)", name_hi: "कंपनी C (HDFC बैंक प्लेसहोल्डर)" },
    { ticker: "INFY", exchange: "NSE", sector: "IT", name_en: "Company D (Infosys placeholder)", name_gu: "કંપની D (ઇન્ફોસિસ પ્લેસહોલ્ડર)", name_hi: "कंपनी D (इंफोसिस प्लेसहोल्डर)" },
    { ticker: "ICICIBANK", exchange: "NSE", sector: "Banking", name_en: "Company E (ICICI Bank placeholder)", name_gu: "કંપની E (ICICI બેન્ક પ્લેસહોલ્ડર)", name_hi: "कंपनी E (ICICI बैंक प्लेसहोल्डर)" },
    { ticker: "SBIN", exchange: "NSE", sector: "Banking", name_en: "Company F (SBI placeholder)", name_gu: "કંપની F (SBI પ્લેસહોલ્ડર)", name_hi: "कंपनी F (SBI प्लेसहोल्डर)" },
    { ticker: "ADANIENT", exchange: "NSE", sector: "Infrastructure", name_en: "Company G (Adani placeholder)", name_gu: "કંપની G (અદાણી પ્લેસહોલ્ડર)", name_hi: "कंपनी G (અદાણી પ્લેસહોલ્ડર)" },
    { ticker: "TATAMOTORS", exchange: "NSE", sector: "Auto", name_en: "Company H (Tata Motors placeholder)", name_gu: "કંપની H (ટાટા મોટર્સ પ્લેસહોલ્ડર)", name_hi: "कंपनी H (ટાટા મોટર્સ પ્લેસહોલ્ડર)" },
  ];

  for (const c of companyData) {
    await prisma.company.upsert({
      where: { ticker: c.ticker },
      update: {},
      create: c,
    });
  }

  console.log("  ✓ Companies created");

  // ── Articles (12 placeholder articles in all 3 languages) ─────
  const categories = ["Markets", "Earnings", "IPO", "Banking", "IT", "Auto", "Commodities", "Gujarat Pulse", "Markets", "Earnings", "Banking", "IT"];
  const sentiments = ["BULLISH", "BEARISH", "NEUTRAL", "BULLISH", "NEUTRAL", "BEARISH", "BULLISH", "NEUTRAL", "BEARISH", "BULLISH", "NEUTRAL", "BEARISH"];

  for (let i = 1; i <= 12; i++) {
    const slug = `placeholder-article-${i}`;
    const cat = categories[i - 1];
    const sent = sentiments[i - 1];
    const author = i % 2 === 0 ? editor1 : editor2;
    const isPublished = i <= 8;

    await prisma.article.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        status: isPublished ? "APPROVED" : i === 9 ? "SUBMITTED" : "DRAFT",
        category: cat,
        sentiment: sent,
        isBreaking: i === 1,
        isFeatured: i <= 3,
        publishAt: isPublished ? new Date() : null,
        authorId: author.id,
        approvedById: isPublished ? admin.id : null,
        title: json(
          `Placeholder Article ${i}: ${cat} Update`,
          `પ્લેસહોલ્ડર લેખ ${i}: ${cat} અપડેટ`,
          `प्लेसहोल्डर लेख ${i}: ${cat} अपडेट`
        ),
        summary: json(
          `This is a placeholder summary for article ${i} in the ${cat} category. Real content will be written by editors.`,
          `આ ${cat} કેટેગરીમાં લેખ ${i} માટે પ્લેસહોલ્ડર સારાંશ છે. વાસ્તવિક સામગ્રી સંપાદકો દ્વારા લખવામાં આવશે.`,
          `यह ${cat} श्रेणी में लेख ${i} के लिए प्लेसहोल्डर सारांश है। वास्तविक सामग्री संपादकों द्वारा लिखी जाएगी।`
        ),
        body: json(
          `<p>This is the full body of placeholder article ${i}. The ${cat} sector saw movement today with key indices changing by 00.00%. Company A reported results of ₹00,000.00 crore.</p><p>Analysts note that the trend is expected to continue. This content is for demonstration only and does not constitute investment advice.</p>`,
          `<p>આ પ્લેસહોલ્ડર લેખ ${i} નો સંપૂર્ણ મુખ્ય ભાગ છે. ${cat} ક્ષેત્રમાં આજે ​​મુખ્ય સૂચકાંકોમાં 00.00% ફેરફાર સાથે હલચલ જોવા મળી.</p>`,
          `<p>यह प्लेसहोल्डर लेख ${i} का पूरा मुख्य भाग है। ${cat} क्षेत्र में आज प्रमुख सूचकांकों में 00.00% बदलाव के साथ हलचल देखी गई।</p>`
        ),
        simpleExplain: json(
          `In simple terms: Article ${i} covers ${cat} news. Think of it like checking the score of a cricket match – we are just telling you what happened, not advising you to bet.`,
          `સરળ ભાષામાં: લેખ ${i} ${cat} સમાચાર આવરી લે છે. ક્રિકેટ મેચનો સ્કોર ચેક કરવા જેવું વિચારો.`,
          `सरल भाषा में: लेख ${i} ${cat} समाचार कवर करता है। क्रिकेट मैच का स्कोर चेक करने जैसा समझें।`
        ),
        keyTakeaways: json(
          JSON.stringify(["Key indices moved by 00.00%", "Company A reported ₹00,000.00 crore", "Sector trend expected to continue"]),
          JSON.stringify(["મુખ્ય સૂચકાંકો 00.00% ખસ્યા", "કંપની A એ ₹00,000.00 કરોડ નોંધાવ્યા"]),
          JSON.stringify(["प्रमुख सूचकांक 00.00% हिले", "कंपनी A ने ₹00,000.00 करोड़ दर्ज किए"])
        ),
      },
    });
  }

  console.log("  ✓ 12 Articles updated with status transitions (APPROVED, SUBMITTED, DRAFT)");
  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
