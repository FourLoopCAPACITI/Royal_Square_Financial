/**
 * Royal Square FAQ Bot — hardcoded, client-side, informational only.
 *
 * To add an FAQ: append an entry below.
 *   id        unique slug
 *   suggest   true → shown as a tap-to-ask chip on an empty chat
 *   keywords  words/phrases (any language) that trigger this answer. Matched at the start of a word;
 *             longer phrases score higher, so be specific. Lower-case, no punctuation.
 *   q / a     the question (used for the chip) and the answer, per language: en, af, zu.
 *             A missing af / zu falls back to English.
 * Never add answers that recommend products, give advice, or predict claim outcomes.
 */

export const FAQ_FALLBACK = {
  en: "I'm sorry, I don't have an answer for that yet. Please speak to your Royal Square Financial adviser for assistance.",
  af: 'Jammer, ek het nog nie \'n antwoord hierop nie. Praat asseblief met jou Royal Square Financial-adviseur vir hulp.',
  zu: 'Ngiyaxolisa, angikabi nayo impendulo yalokhu. Sicela ukhulume nomluleki wakho weRoyal Square Financial ukuze uthole usizo.',
};

export const FAQS = [
  {
    id: 'disclaimer',
    keywords: [
      'disclaimer', 'financial advice', 'legal advice', 'insurance advice', 'invest', 'which policy', 'which product', 'which fund',
      'should i buy', 'should i take', 'should i choose', 'recommend', 'best policy', 'best insurer', 'best fund',
      'will my claim be', 'claim approved', 'claim outcome', 'will i be paid', 'sue', 'lawyer',
      'belê', 'belegg', 'aanbeveel', 'aanbeveling', 'advies', 'watter polis', 'sal my eis',
      'tshala', 'ingangiluleka', 'incoma', 'izincomo', 'iseluleko', 'iphi ipholisi', 'kufanele ngithenge',
    ],
    q: { en: 'Can the FAQ Bot give me advice?', af: 'Kan die VGV-Bot my advies gee?', zu: 'Ingabe i-FAQ Bot ingangiluleka?' },
    a: {
      en: 'No. The Royal Square FAQ Bot is informational only. It does not provide financial, investment, insurance, legal or claims advice, recommend products, or predict the outcome of a claim.\n\nFor advice, please speak to your Royal Square Financial adviser.',
      af: 'Nee. Die Royal Square VGV-Bot is slegs informatief. Dit gee nie finansiële, beleggings-, versekerings-, regs- of eisadvies nie, beveel nie produkte aan nie en voorspel nie die uitslag van \'n eis nie.\n\nPraat vir advies met jou Royal Square Financial-adviseur.',
      zu: 'Cha. I-Royal Square FAQ Bot inikeza ulwazi kuphela. Ayinikezi iseluleko sezezimali, sokutshala imali, somshwalense, sezomthetho noma sezicelo zesinxephezelo, ayincomi imikhiqizo, futhi ayiqagheli umphumela wesicelo.\n\nNgeseluleko, sicela ukhulume nomluleki wakho weRoyal Square Financial.',
    },
  },
  {
    id: 'what-is-rsf',
    suggest: true,
    keywords: [
      'what is royal square', 'about royal square', 'who are you', 'who is royal square', 'what do you do', 'what is rsf', 'about this app', 'about the portal',
      'wat is royal square', 'oor royal square', 'wie is jy', 'iyini iroyal', 'ngeroyal square',
    ],
    q: { en: 'What is Royal Square Financial?', af: 'Wat is Royal Square Financial?', zu: 'Iyini iRoyal Square Financial?' },
    a: {
      en: 'Royal Square Financial is a financial services practice. This portal connects you and your adviser in one place, so you can see what is happening with your requests, claims and documents, and who is responsible for the next step.',
      af: 'Royal Square Financial is \'n finansiëledienstepraktyk. Hierdie portaal bring jou en jou adviseur op een plek bymekaar, sodat jy kan sien wat met jou versoeke, eise en dokumente gebeur, en wie vir die volgende stap verantwoordelik is.',
      zu: 'IRoyal Square Financial iyinkampani yezinsizakalo zezezimali. Le phothali ihlanganisa wena nomluleki wakho endaweni eyodwa, ukuze ubone okwenzeka ngezicelo zakho, izicelo zesinxephezelo namadokhumenti, nokuthi ubani onesibopho sesinyathelo esilandelayo.',
    },
  },
  {
    id: 'client-portal',
    keywords: [
      'client portal', 'what is the client portal', 'my portal', 'client view', 'client side',
      'kliëntportaal', 'kliente portaal', 'iphothali yekhasimende', 'iphothali yamakhasimende',
    ],
    q: { en: 'What is the Client Portal?', af: 'Wat is die Kliëntportaal?', zu: 'Iyini Iphothali Yekhasimende?' },
    a: {
      en: 'The Client Portal is your personal space. Use it to:\n\n- see your dashboard and what needs your attention\n- report an accident\n- upload and track documents\n- submit requests and follow their progress\n- track your claims and goals\n\nAll of this works from the menu on the left (or the bottom bar on your phone).',
      af: 'Die Kliëntportaal is jou persoonlike spasie. Gebruik dit om:\n\n- jou kontrolepaneel te sien en wat jou aandag nodig het\n- \'n ongeluk aan te meld\n- dokumente op te laai en te volg\n- versoeke in te dien en hul vordering te volg\n- jou eise en doelwitte te volg\n\nDit werk alles vanaf die kieslys links (of die onderste balk op jou foon).',
      zu: 'Iphothali Yekhasimende iyindawo yakho siqu. Isebenzise ukuze:\n\n- ubone ideshibhodi yakho nokudinga ukunaka kwakho\n- ubike ingozi\n- ulayishe futhi ulandelele amadokhumenti\n- uthumele izicelo futhi ulandelele inqubekelaphambili yazo\n- ulandelele izicelo zakho zesinxephezelo nezinjongo\n\nKonke lokhu kusebenza kusuka kumenyu esesokunxele (noma kubha engezansi efonini yakho).',
    },
  },
  {
    id: 'adviser-portal',
    keywords: [
      'adviser portal', 'advisor portal', 'what is the adviser portal', 'adviser view', 'adviser side', 'action inbox',
      'adviseurportaal', 'adviseur portaal', 'iphothali yomluleki',
    ],
    q: { en: 'What is the Adviser Portal?', af: 'Wat is die Adviseurportaal?', zu: 'Iyini Iphothali Yomluleki?' },
    a: {
      en: 'The Adviser Portal is where advisers manage their clients. It shows an Action Inbox of what needs attention, client details, requests, claims, documents, providers and workflows, so every process has a clear owner and next step.',
      af: 'Die Adviseurportaal is waar adviseurs hul kliënte bestuur. Dit wys \'n Aksie-inkassie van wat aandag nodig het, kliëntbesonderhede, versoeke, eise, dokumente, verskaffers en werkvloeie, sodat elke proses \'n duidelike eienaar en volgende stap het.',
      zu: 'Iphothali Yomluleki yindawo lapho abaluleki baphatha khona amakhasimende abo. Ibonisa Ibhokisi Lezenzo lokudinga ukunakwa, imininingwane yekhasimende, izicelo, izicelo zesinxephezelo, amadokhumenti, abahlinzeki nokugeleza komsebenzi, ukuze inqubo ngayinye ibe nomnikazi nesinyathelo esilandelayo esicacile.',
    },
  },
  {
    id: 'report-accident',
    suggest: true,
    keywords: [
      'accident', 'crash', 'collision', 'report a claim', 'submit a claim', 'make a claim', 'file a claim', 'new claim', 'car damage', 'i was hit',
      'ongeluk', 'botsing', 'eis aanmeld', 'ingozi', 'ingozini', 'ngozi',
    ],
    q: { en: 'How do I report an accident or claim?', af: 'Hoe meld ek \'n ongeluk of eis aan?', zu: 'Ngibika kanjani ingozi noma isicelo sesinxephezelo?' },
    a: {
      en: 'Tap the red "I\'ve been in an accident" button, or go to Life Events → I\'ve been in an accident. Accident Assist guides you through 10 short steps and still works without signal.\n\nIf anyone is hurt, call 112 from a mobile first.',
      af: 'Tik op die rooi "Ek was in \'n ongeluk"-knoppie, of gaan na Lewensgebeure → Ek was in \'n ongeluk. Ongelukhulp lei jou deur 10 kort stappe en werk selfs sonder sein.\n\nAs iemand beseer is, bel eers 112 vanaf \'n selfoon.',
      zu: 'Thinta inkinobho ebomvu ethi "Ngibe ngengozini", noma uye ku-Izigameko zempilo → Ngibe ngengozini. I-Accident Assist ikuhola ngezinyathelo ezingu-10 ezimfushane futhi isebenza ngisho ngaphandle kwesignali.\n\nUma umuntu elimele, shayela i-112 ocingweni lwesikhathi kuqala.',
    },
  },
  {
    id: 'upload-documents',
    suggest: true,
    keywords: [
      'upload', 'document', 'licence', 'license', 'proof of address', 'attach', 'send a document', 'annual review',
      'oplaai', 'laai op', 'dokument', 'lisensie', 'bewys van adres', 'jaarlikse hersiening',
      'layisha', 'ukulayisha', 'amadokhumenti', 'ilayisense', 'ubufakazi bekheli',
    ],
    q: { en: 'How do I upload documents?', af: 'Hoe laai ek dokumente op?', zu: 'Ngilayisha kanjani amadokhumenti?' },
    a: {
      en: 'Go to Documents → Upload document and choose the document type. For a driver\'s licence we read the expiry date and set a renewal reminder for you.\n\nFor an annual review you will usually need your ID, proof of address (not older than 3 months), recent policy and investment statements, and proof of income. Your adviser confirms the final list.',
      af: 'Gaan na Dokumente → Laai dokument op en kies die dokumentsoort. By \'n bestuurslisensie lees ons die vervaldatum en stel \'n hernuwingsherinnering vir jou.\n\nVir \'n jaarlikse hersiening het jy gewoonlik jou ID, bewys van adres (nie ouer as 3 maande nie), onlangse polis- en beleggingstate, en bewys van inkomste nodig. Jou adviseur bevestig die finale lys.',
      zu: 'Iya ku-Amadokhumenti → Layisha idokhumenti bese ukhetha uhlobo lwedokhumenti. Ilayisense yokushayela siyifunda usuku lokuphelelwa yisikhathi bese sikusetha isikhumbuzo sokuvuselela.\n\nEkubuyekezweni konyaka ngokuvamile udinga isazisi sakho, ubufakazi bekheli (obungadluli izinyanga ezingu-3), izitatimende zamaphoslisi nezokutshala imali zamuva, nobufakazi bemali engenayo. Umluleki wakho uqinisekisa uhlu lokugcina.',
    },
  },
  {
    id: 'submit-request',
    suggest: true,
    keywords: [
      'submit a request', 'make a request', 'new request', 'request a', 'policy document', 'policy schedule', 'schedule', 'border letter', 'irp5', 'tax certificate',
      'change address', 'update address', 'my address', 'moved', 'bank details',
      'versoek', 'polisdokument', 'skedule', 'grensbrief', 'belastingsertifikaat', 'adres', 'getrek',
      'isicelo', 'izicelo', 'idokhumenti yepholisi', 'ikheli', 'ngithuthile',
    ],
    q: { en: 'How do I submit a request?', af: 'Hoe dien ek \'n versoek in?', zu: 'Ngithumela kanjani isicelo?' },
    a: {
      en: 'Go to Requests and choose what you need, for example a policy document, a change of address or new bank details. Each request becomes a tracked process, so you can see who is working on it at every step.\n\nMoving house? Use Life Events → I moved. It creates one change-of-address process for your profile and each affected policy; you only need to upload proof of address.',
      af: 'Gaan na Versoeke en kies wat jy nodig het, byvoorbeeld \'n polisdokument, \'n adresverandering of nuwe bankbesonderhede. Elke versoek word \'n gevolgde proses, sodat jy by elke stap kan sien wie daaraan werk.\n\nTrek jy? Gebruik Lewensgebeure → Ek het getrek. Dit skep een adresveranderingsproses vir jou profiel en elke geraakte polis; jy hoef net bewys van adres op te laai.',
      zu: 'Iya ku-Izicelo bese ukhetha okudingayo, isibonelo idokhumenti yepholisi, ukushintsha ikheli noma imininingwane entsha yebhange. Isicelo ngasinye siba inqubo elandelelwayo, ukuze ubone ukuthi ubani asebenza kuso esinyathelweni ngasinye.\n\nUyathutha? Sebenzisa Izigameko zempilo → Ngithuthile. Idala inqubo eyodwa yokushintsha ikheli yephrofayela yakho nepholisi ngalinye elithintekayo; udinga kuphela ukulayisha ubufakazi bekheli.',
    },
  },
  {
    id: 'check-status',
    suggest: true,
    keywords: [
      'status', 'progress', 'track', 'where is my', 'how far', 'follow my', 'check my request', 'check my claim', 'update on',
      'vordering', 'volg', 'waar is my', 'vordering van', 'inqubekelaphambili', 'landelela',
    ],
    q: { en: 'How do I check the progress of a request?', af: 'Hoe kyk ek na die vordering van \'n versoek?', zu: 'Ngiyibona kanjani inqubekelaphambili yesicelo?' },
    a: {
      en: 'Open Claims, Requests or your Dashboard. Each process shows the current step, who is holding the ball, the next action and the due date. Tap a process to see its full timeline and activity.',
      af: 'Maak Eise, Versoeke of jou Kontrolepaneel oop. Elke proses wys die huidige stap, wie die bal het, die volgende aksie en die sperdatum. Tik op \'n proses om sy volle tydlyn en aktiwiteit te sien.',
      zu: 'Vula Izicelo zesinxephezelo, Izicelo noma Ideshibhodi yakho. Inqubo ngayinye ibonisa isinyathelo samanje, ukuthi ubani ophethe ibhola, isenzo esilandelayo nosuku lokuphela. Thinta inqubo ukuze ubone ulayini wesikhathi nomsebenzi wayo ophelele.',
    },
  },
  {
    id: 'workflow-status',
    suggest: true,
    keywords: [
      'holding the ball', 'who has the ball', 'who is holding', 'workflow', 'waiting on provider', 'waiting on', 'provider', 'status mean', 'next step',
      'wie het die bal', 'bal', 'werkvloei', 'wag op verskaffer', 'verskaffer',
      'ibhola', 'ophethe ibhola', 'ukugeleza komsebenzi', 'ilinde umhlinzeki', 'umhlinzeki',
    ],
    q: { en: 'What does "who\'s holding the ball" mean?', af: 'Wat beteken "wie het die bal"?', zu: 'Kusho ukuthini "ubani ophethe ibhola"?' },
    a: {
      en: 'Every process (a claim or a request) has several steps, and at any moment one party is responsible for the next one: you, your adviser, Royal Square\'s service team, or the insurer/provider. That party is "holding the ball".\n\nFor example, "waiting on provider" means Royal Square has sent your request to the insurer or investment company and is waiting for them. Your adviser follows up; you don\'t need to do anything.',
      af: 'Elke proses (\'n eis of versoek) het verskeie stappe, en op enige oomblik is een party vir die volgende een verantwoordelik: jy, jou adviseur, Royal Square se dienspan, of die versekeraar/verskaffer. Daardie party "het die bal".\n\nByvoorbeeld, "wag op verskaffer" beteken Royal Square het jou versoek na die versekeraar of beleggingsmaatskappy gestuur en wag vir hulle. Jou adviseur volg op; jy hoef niks te doen nie.',
      zu: 'Inqubo ngayinye (isicelo sesinxephezelo noma isicelo) inezinyathelo eziningi, futhi noma nini iqembu elilodwa linesibopho sesilandelayo: wena, umluleki wakho, ithimba lezinsizakalo leRoyal Square, noma umshwalense/umhlinzeki. Leli qembu "liphethe ibhola".\n\nIsibonelo, "ilinde umhlinzeki" kusho ukuthi iRoyal Square ithumele isicelo sakho enkampanini yomshwalense noma yokutshala imali futhi ilindele impendulo yabo. Umluleki wakho uyalandelela; awudingi ukwenza lutho.',
    },
  },
  {
    id: 'contact-adviser',
    suggest: true,
    keywords: [
      'contact', 'speak to', 'talk to', 'adviser', 'advisor', 'call', 'phone', 'email', 'human', 'reach',
      'kontak', 'praat met', 'adviseur', 'bel', 'foon', 'kontakteer',
      'xhumana', 'nomluleki', 'khuluma', 'umluleki', 'shayela', 'ucingo',
    ],
    q: { en: 'How do I speak to an adviser?', af: 'Hoe praat ek met \'n adviseur?', zu: 'Ngikhuluma kanjani nomluleki?' },
    a: {
      en: 'Your adviser\'s details are on your Profile page. You can also submit a Consultation request under Requests, and your adviser will follow up. For anything about your specific cover or for advice, your adviser is the right person to ask.',
      af: 'Jou adviseur se besonderhede is op jou Profielbladsy. Jy kan ook \'n Konsultasieversoek onder Versoeke indien, en jou adviseur sal opvolg. Vir enigiets oor jou spesifieke dekking of vir advies is jou adviseur die regte persoon om te vra.',
      zu: 'Imininingwane yomluleki wakho isekhasini Lephrofayela yakho. Ungathumela futhi isicelo Sokubonisana ngaphansi kwe-Izicelo, futhi umluleki wakho uzolandelela. Nganoma yini mayelana nomshwalense wakho ngqo noma ngeseluleko, umluleki wakho ungumuntu ofanele ukumbuza.',
    },
  },
  {
    id: 'service-centre',
    keywords: [
      'client service centre', 'client service center', 'service centre', 'service center', 'csc', 'service team',
      'kliëntedienssentrum', 'dienssentrum', 'isikhungo sezinsizakalo',
    ],
    q: { en: 'What is the Client Service Centre?', af: 'Wat is die Kliëntedienssentrum?', zu: 'Iyini Isikhungo Sezinsizakalo Zamakhasimende?' },
    a: {
      en: 'The Client Service Centre is the Royal Square team that handles everyday service requests such as policy documents, address and bank detail changes, and annual reviews. You reach it through Requests in the portal. Every request runs as a tracked process, so you always see who is working on it.',
      af: 'Die Kliëntedienssentrum is die Royal Square-span wat alledaagse diensversoeke hanteer, soos polisdokumente, adres- en bankbesonderhede-veranderings en jaarlikse hersienings. Jy bereik dit deur Versoeke in die portaal. Elke versoek loop as \'n gevolgde proses, sodat jy altyd sien wie daaraan werk.',
      zu: 'Isikhungo Sezinsizakalo Zamakhasimende yithimba leRoyal Square eliphatha izicelo zensizakalo zansuku zonke ezifana namadokhumenti amaphoslisi, ukushintsha ikheli nemininingwane yebhange, nokubuyekezwa konyaka. Usifinyelela nge-Izicelo ephothali. Isicelo ngasinye siba inqubo elandelelwayo, ukuze ubone njalo ukuthi ubani asebenza kuso.',
    },
  },
  {
    id: 'language',
    suggest: true,
    keywords: [
      'language', 'afrikaans', 'zulu', 'isizulu', 'english', 'translate', 'translation',
      'taal', 'tale', 'vertaal', 'ulimi', 'izilimi', 'humusha',
    ],
    q: { en: 'Which languages are available?', af: 'Watter tale is beskikbaar?', zu: 'Yiziphi izilimi ezitholakalayo?' },
    a: {
      en: 'The portal is available in English, Afrikaans and isiZulu. Change it from the language menu on the login page or on your Profile page. Your choice is saved and this FAQ Bot answers in the same language.',
      af: 'Die portaal is beskikbaar in Engels, Afrikaans en isiZulu. Verander dit in die taalkieslys op die aanmeldbladsy of op jou Profielbladsy. Jou keuse word gestoor en hierdie VGV-Bot antwoord in dieselfde taal.',
      zu: 'Iphothali itholakala ngesiNgisi, i-Afrikaans nesiZulu. Shintsha ekhasini lokungena noma ekhasini Lephrofayela yakho ngemenyu yolimi. Ukhetho lwakho luyalondolozwa futhi le FAQ Bot iphendula ngolimi olufanayo.',
    },
  },
  {
    id: 'navigation',
    suggest: true,
    keywords: [
      'navigate', 'navigation', 'menu', 'where do i find', 'where can i find', 'where is', 'find', 'how do i get to', 'go to', 'page', 'dashboard', 'notifications', 'goals', 'profile', 'life events',
      'navigeer', 'my pad', 'kieslys', 'waar vind', 'bladsy', 'kontrolepaneel', 'kennisgewings', 'doelwitte', 'profiel', 'lewensgebeure',
      'imenyu', 'indlela', 'ikhasi', 'ideshibhodi', 'izaziso', 'izinjongo', 'iphrofayela', 'izigameko zempilo', 'ngitholaphi',
    ],
    q: { en: 'How do I find my way around the portal?', af: 'Hoe vind ek my pad in die portaal?', zu: 'Ngiyithola kanjani indlela kuphothali?' },
    a: {
      en: 'Use the menu on the left (or the bottom bar on your phone):\n\n- **Dashboard**: an overview and what needs your attention\n- **My Actions**: things waiting for you\n- **Documents**: upload and track documents\n- **Claims** and **Requests**: follow their progress\n- **Life Events**: report an accident or a move\n- **Notifications**, **Goals** and **Profile**\n\nAdvisers see their own menu with the Action Inbox, Clients, Workflows and Providers.',
      af: 'Gebruik die kieslys links (of die onderste balk op jou foon):\n\n- **Kontrolepaneel**: \'n oorsig en wat jou aandag nodig het\n- **My aksies**: dinge wat vir jou wag\n- **Dokumente**: laai dokumente op en volg hulle\n- **Eise** en **Versoeke**: volg hul vordering\n- **Lewensgebeure**: meld \'n ongeluk of trek aan\n- **Kennisgewings**, **Doelwitte** en **Profiel**\n\nAdviseurs sien hul eie kieslys met die Aksie-inkassie, Kliënte, Werkvloeie en Verskaffers.',
      zu: 'Sebenzisa imenyu esesokunxele (noma ibha engezansi efonini yakho):\n\n- **Ideshibhodi**: ukubuka konke nokudinga ukunaka kwakho\n- **Izenzo zami**: izinto ezikulindele\n- **Amadokhumenti**: layisha futhi ulandelele amadokhumenti\n- **Izicelo zesinxephezelo** ne-**Izicelo**: landelela inqubekelaphambili yazo\n- **Izigameko zempilo**: bika ingozi noma ukuthutha\n- **Izaziso**, **Izinjongo** ne-**Iphrofayela**\n\nAbaluleki babona imenyu yabo enebhokisi lezenzo, Amakhasimende, Ukugeleza komsebenzi nabahlinzeki.',
    },
  },
];

const normalise = (s) =>
  ` ${s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim()}`;

/** Score = words in each keyword found at the start of a word in the question. Ties go to the earlier FAQ. */
function score(faq, question) {
  return faq.keywords.reduce((total, kw) => {
    const k = normalise(kw);
    return question.includes(k) ? total + k.trim().split(' ').length : total;
  }, 0);
}

const pick = (byLang, lang) => byLang[lang] ?? byLang.en;

/** Returns the best-matching FAQ answer in `lang`, or the fallback when nothing matches. */
export function answerQuestion(text, lang = 'en') {
  const question = normalise(text);
  let best = null;
  let bestScore = 0;
  for (const faq of FAQS) {
    const s = score(faq, question);
    if (s > bestScore) [best, bestScore] = [faq, s];
  }
  return best ? pick(best.a, lang) : pick(FAQ_FALLBACK, lang);
}

/** Tap-to-ask chips for an empty chat. */
export const suggestedQuestions = (lang = 'en') => FAQS.filter((f) => f.suggest).map((f) => pick(f.q, lang));
