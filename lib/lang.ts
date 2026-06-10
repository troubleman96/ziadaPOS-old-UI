export type Lang = 'sw' | 'en';

export const LANG_LABELS: Record<Lang, string> = {
  sw: 'Kiswahili',
  en: 'English',
};

const dict = {
  // ── Nav ──────────────────────────────────────────────────────────────────────
  nav_product:  { sw: 'Bidhaa',    en: 'Product'  },
  nav_ai:       { sw: 'Ziada AI',  en: 'Ziada AI' },
  nav_pricing:  { sw: 'Bei',       en: 'Pricing'  },
  nav_about:    { sw: 'Kuhusu',    en: 'About'    },
  nav_contact:  { sw: 'Wasiliana', en: 'Contact'  },
  nav_signin:   { sw: 'Ingia',     en: 'Sign in'  },

  // ── Dots menu ─────────────────────────────────────────────────────────────────
  dots_appearance: { sw: 'MUONEKANO', en: 'APPEARANCE' },
  dots_language:   { sw: 'LUGHA',     en: 'LANGUAGE'   },
  dots_light:      { sw: 'Mwanga',    en: 'Light'       },
  dots_dark:       { sw: 'Giza',      en: 'Dark'        },

  // ── Hero ─────────────────────────────────────────────────────────────────────
  hero_badge:      { sw: 'Ziada AI · sasa kila duka',             en: 'Ziada AI · now in every store'            },
  hero_h1a:        { sw: 'Mfumo wa uendeshaji',                   en: 'The operating system'                     },
  hero_h1b:        { sw: 'wa duka lako.',                         en: 'for your shop.'                           },
  hero_sub:        { sw: 'POS, bidhaa, mikopo, uchambuzi na AI inayojua duka lako — mfumo mmoja, wa haraka. Ilijengwa Tanzania, kwa kila kaunta.',
                     en: 'POS, inventory, credit, analytics and an AI that actually knows your store — running on one calm, fast platform. Built in Tanzania, made for any counter.' },
  hero_trial:      { sw: 'Anza majaribio',                         en: 'Start trial'                              },
  hero_signin:     { sw: 'Ingia',                                  en: 'Sign in'                                  },
  hero_trust1:     { sw: 'kadi haihitajiki',                       en: 'no card required'                         },
  hero_trust2:     { sw: 'inafanya kazi bila mtandao',             en: 'works offline'                            },
  hero_trust3:     { sw: 'EN + Kiswahili',                         en: 'EN + Swahili'                             },
  hero_trust4:     { sw: 'M-Pesa, Tigo, Airtel, Benki',           en: 'M-Pesa, Tigo, Airtel, Bank'               },

  // ── Stats ─────────────────────────────────────────────────────────────────────
  stat_stores:     { sw: 'MADUKA YANAYOTUMIA ZIADA',   en: 'STORES RUNNING ZIADA' },
  stat_txns:       { sw: 'MIAMALA 24H ILIYOPITA',      en: 'TXNS LAST 24H'        },
  stat_tzs:        { sw: 'TZS ZILIZOPITA · SIKU 30',   en: 'TZS PROCESSED · 30D'  },
  stat_ai:         { sw: 'MASWALI YA AI · 24H',        en: 'AI QUERIES · 24H'     },
  stat_uptime:     { sw: 'UENDESHAJI · SIKU 90',       en: 'UPTIME · 90D'         },

  // ── Features section header ───────────────────────────────────────────────────
  feat_label:      { sw: '01 · MODULI',                                        en: '01 · MODULES'                          },
  feat_h2:         { sw: 'Jukwaa moja. Sehemu tano. Kila kaunta.',             en: 'One platform. Five surfaces. Every counter.' },
  feat_sub:        { sw: '5 / 5 zimejumuishwa katika kila mpango',             en: '5 / 5 included on every plan'          },

  // POS
  feat_pos_title:  { sw: 'Mauzo',                             en: 'Point of Sale'              },
  feat_pos_tag:    { sw: 'Fanya mauzo kwa mibonyezo mitatu.', en: 'Ring up a sale in three taps.' },
  feat_pos_desc:   { sw: 'Tafuta, skeni, au chagua kutoka kwenye gridi. Pokea pesa taslimu, M-Pesa, Tigo Pesa, Airtel au benki — gawanya kwenye risiti moja.',
                     en: 'Search, scan, or pick from the grid. Take cash, M-Pesa, Tigo Pesa, Airtel or bank — split across any of them on one ticket.' },
  feat_pos_b1:     { sw: 'Nambari ya bidhaa + utafutaji wa picha',   en: 'Barcode + visual search'                       },
  feat_pos_b2:     { sw: 'Malipo ya aina mbalimbali',                en: 'Split tender'                                  },
  feat_pos_b3:     { sw: 'Inafanya kazi bila mtandao, inasawazisha ukiunganika', en: 'Offline-first, syncs when back online' },

  // Inventory
  feat_inv_title:  { sw: 'Hifadhi ya Bidhaa',                   en: 'Inventory'                                  },
  feat_inv_tag:    { sw: 'Jua kilichopo rafu bila kuhesabu.',    en: "Know what's on the shelf without counting." },
  feat_inv_desc:   { sw: 'Hifadhi inasogea kiotomatiki unapouza, kuagiza upya au kuhamisha. Nukta za kuagiza upya na historia ya wasambazaji zinajitokeza kwa kila bidhaa.',
                     en: 'Stock moves automatically as you sell, restock or transfer. Reorder points and supplier history live with each product.' },
  feat_inv_b1:     { sw: 'Nukta za kuagiza upya kiotomatiki',   en: 'Auto reorder points'   },
  feat_inv_b2:     { sw: 'Rejista ya wasambazaji',              en: 'Supplier ledger'        },
  feat_inv_b3:     { sw: 'Bei ya aina na wingi',                en: 'Variant + bulk pricing' },

  // Analytics
  feat_ana_title:  { sw: 'Uchambuzi',                                en: 'Analytics'                     },
  feat_ana_tag:    { sw: 'Mapigo ya moyo ya duka, kila dakika.',     en: "The shop's pulse, every minute." },
  feat_ana_desc:   { sw: 'Mauzo, faida, pembe za faida, mchanganyiko wa malipo na nafasi ya pesa — yote yanaonekana kwa jicho moja, yote yanaweza kuchujwa hadi SKU moja.',
                     en: 'Sales, profit, margins, payment mix and cash position — all visible at a glance, all filterable to a single SKU.' },
  feat_ana_b1:     { sw: 'Mapato kila saa',                en: 'Hour-by-hour revenue'        },
  feat_ana_b2:     { sw: 'Faida kwa bidhaa',               en: 'Profit by product'           },
  feat_ana_b3:     { sw: 'Mtazamo wa wateja wanaorudia',   en: 'Cohort & repeat-customer view' },

  // Credits
  feat_crd_title:  { sw: 'Mikopo',                                 en: 'Credits'                           },
  feat_crd_tag:    { sw: 'Fuatilia kila kopo bila daftari.',       en: 'Track every kopo without a notebook.' },
  feat_crd_desc:   { sw: 'Akaunti wazi, vikumbusho vya malipo, taarifa kupitia WhatsApp. Vikundi vya muda ili ujue daima nani amechelewa.',
                     en: "Open tabs, payment reminders, statements over WhatsApp. Aging buckets so you always know who's overdue." },
  feat_crd_b1:     { sw: 'Vikundi vya mikopo kulingana na muda', en: 'Aging buckets'                },
  feat_crd_b2:     { sw: 'Vikumbusho vya WhatsApp',             en: 'WhatsApp reminders'           },
  feat_crd_b3:     { sw: 'Taarifa ya PDF kwa kibonyezo kimoja',  en: 'Statement PDF in one tap'    },

  // AI module
  feat_ai_title:   { sw: 'Ziada AI',                                    en: 'Ziada AI'                                  },
  feat_ai_tag:     { sw: 'Msaidizi anayejua duka lako kweli kweli.',     en: 'An assistant that actually knows your store.' },
  feat_ai_desc:    { sw: 'Uliza kwa Kiingereza au Kiswahili. Inapata majibu kutoka kwa data yako ya moja kwa moja na inaandaa hatua inayofuata.',
                     en: 'Ask in English or Swahili. Pulls answers from your live data and drafts the next action.'         },
  feat_ai_b1:      { sw: 'Imejengwa kwenye data yako',          en: 'Grounded on your data'              },
  feat_ai_b2:      { sw: 'Lugha mbili EN/SW',                   en: 'Bilingual EN/SW'                    },
  feat_ai_b3:      { sw: 'Inaandika maagizo, ripoti, ujumbe',   en: 'Drafts orders, reports, messages'  },

  // ── AI section ────────────────────────────────────────────────────────────────
  ai_label:        { sw: '02 · ZIADA AI',                                  en: '02 · ZIADA AI'                             },
  ai_h2:           { sw: 'AI ya kwanza inayojua duka lako kweli kweli.',   en: 'The first AI that actually knows your shop.' },
  ai_badge:        { sw: 'imejengwa kwenye data yako · lugha mbili · katika kila skrini', en: 'grounded · bilingual · in every screen' },
  ai_desc:         { sw: 'Msaidizi mwingi wa "AI" ni chatbot tu iliyounganishwa. Ziada AI inasoma mauzo, hifadhi, wasambazaji na mikopo yako ya moja kwa moja — na kuandika jibu. Uliza kwa Kiingereza au Kiswahili na upate jibu na data na hatua inayofuata.',
                     en: 'Most "AI features" are a chatbot bolted on. Ziada AI reads from your live sales, stock, suppliers and credits — and writes back. Ask in English or Swahili and get an answer with data and a next action.' },
  ai_things_label: { sw: 'MAMBO WANAYOULIZA', en: 'THINGS PEOPLE ASK' },
  ai_prop1_t:      { sw: 'Imejengwa',          en: 'Grounded'          },
  ai_prop1_d:      { sw: 'Majibu yanarejelea safu halisi kutoka dukani kwako.', en: 'Answers cite the exact rows from your store.' },
  ai_prop2_t:      { sw: 'Lugha Mbili',         en: 'Bilingual'         },
  ai_prop2_d:      { sw: 'Inasema Kiingereza na Kiswahili, kwa chaguo-msingi.', en: 'Speaks English and Swahili, by default.' },
  ai_prop3_t:      { sw: 'Inachukua Hatua',     en: 'Action-oriented'   },
  ai_prop3_d:      { sw: 'Inaandika agizo la kuagiza, ujumbe, ripoti.',  en: 'Drafts the restock, the message, the report.' },
  ai_prop4_t:      { sw: 'Faragha',             en: 'Private'           },
  ai_prop4_d:      { sw: 'Data yako haifunzi mfano wowote wa AI.',      en: 'Your data never trains a foundation model.'   },

  // ── Testimonials ─────────────────────────────────────────────────────────────
  test_label:      { sw: 'WAFANYABIASHARA',                    en: 'MERCHANTS'                  },
  test_h2:         { sw: 'Wanachosema wamiliki wa maduka.',    en: 'What store owners say.'     },
  test_count:      { sw: 'Maduka 1,247+ Tanzania',             en: '1,247+ stores in Tanzania'  },
  test_q1:         { sw: '"Ziada ilibadilisha jinsi tunavyofanya biashara. Sasa naona data zangu wakati wowote, hata bila internet."',
                     en: '"Ziada changed how we run our business. I can see my data any time, even without internet."' },
  test_q1_role:    { sw: 'Mmiliki wa Supermarket', en: 'Supermarket owner' },
  test_q2:         { sw: '"Ufuatiliaji wa mikopo peke yake ulinisaidia kuzuia kupoteza TZS 2M katika akaunti ambazo hazijalipiwa. Kila mmiliki wa duka anahitaji hili."',
                     en: '"The credit tracking alone saved me from losing TZS 2M in unpaid tabs. Every duka owner needs this."' },
  test_q2_role:    { sw: 'Duka la Dawa',           en: 'Pharmacy'         },
  test_q3:         { sw: '"Kusimamia maduka 3 kutoka skrini moja — hiyo ilikuwa ndoto. Sasa ni kawaida."',
                     en: '"Managing 3 stores from one screen — that used to be a dream. Now it\'s just Tuesday."' },
  test_q3_role:    { sw: 'Mlolongo wa Maduka',     en: 'Retail chain'     },

  // ── Pricing ──────────────────────────────────────────────────────────────────
  pricing_label:   { sw: '03 · BEI',                                      en: '03 · PRICING'                            },
  pricing_h2:      { sw: 'Bei rahisi, ya kweli. Inalipiwa kwa TZS.',      en: 'Simple, honest pricing. Billed in TZS.'  },
  pricing_see:     { sw: 'Ona bei kamili →',                              en: 'See full pricing →'                      },
  pricing_popular: { sw: 'MAARUFU ZAIDI',                                 en: 'MOST POPULAR'                            },
  pricing_trial:   { sw: 'Anza jaribio bure',                             en: 'Start free trial'                        },
  pricing_contact: { sw: 'Wasiliana nasi',                                en: 'Contact us'                              },
  pricing_foot:    { sw: 'Mipango yote ina majaribio ya siku 7 · Uanzishaji wa TZS 10,000 · Bila kadi · M-Pesa · Tigo · Airtel · Benki',
                     en: 'All plans include a 7-day free trial · TZS 10,000 activation · No credit card · M-Pesa · Tigo · Airtel · Bank' },

  // Plan details (keep plan names in English as product terms)
  plan_starter_target: { sw: 'Maduka ya solo na vibanda',          en: 'Solo dukas and kiosks'         },
  plan_starter_desc:   { sw: 'Kila kitu unachohitaji kuanza kidijitali — POS, bidhaa na ufuatiliaji wa mikopo mahali pamoja.',
                          en: 'Everything you need to go digital — POS, inventory and credit tracking in one place.' },
  plan_biz_target:     { sw: 'Maduka yanayokua na minyororo midogo',  en: 'Growing shops and small chains' },
  plan_biz_desc:       { sw: 'Usimamizi wa maduka mengi, Ziada AI, na uchambuzi wa hali ya juu kwa wafanyabiashara wenye nia.',
                          en: 'Multi-store management, Ziada AI, and advanced analytics for ambitious retailers.' },
  plan_ent_target:     { sw: 'Minyororo ya maduka na wauzaji wa jumla', en: 'Retail chains and wholesalers' },
  plan_ent_desc:       { sw: 'Kwa biashara zinazohitaji usaidizi mahususi na uunganishaji wa API.',
                          en: 'For retail chains and wholesalers that need dedicated support.' },

  // ── FAQ ──────────────────────────────────────────────────────────────────────
  faq_label:       { sw: '04 · MASWALI',          en: '04 · FAQ'            },
  faq_h2:          { sw: 'Maswali ya kawaida.',   en: 'Common questions.'   },
  faq_still:       { sw: 'Bado una maswali?',     en: 'Still have questions?' },
  faq_team:        { sw: 'Zungumza na timu moja kwa moja — tunajibu haraka.', en: 'Talk to the team directly — we respond fast.' },
  faq_wa:          { sw: 'Piga gumzo WhatsApp →', en: 'Chat on WhatsApp →'  },
  faq_q1:          { sw: 'Je, Ziada inafanya kazi bila mtandao?',            en: 'Does Ziada work without internet?'           },
  faq_a1:          { sw: 'Ndiyo. Ziada inafanya kazi bila mtandao kwanza — unaweza kufanya mauzo, kusasisha hifadhi na kufuatilia mikopo bila muunganisho. Kila kitu kinasawazishwa kiotomatiki unapounganika tena.',
                     en: "Yes. Ziada is offline-first — you can ring up sales, update stock and track credits with no connection. Everything syncs automatically the moment you're back online." },
  faq_q2:          { sw: 'Naweza kuongeza bidhaa ngapi?',                    en: 'How many products can I add?'               },
  faq_a2:          { sw: 'Mipango ya Starter inasaidia bidhaa hadi 500. Mipango ya Business na Enterprise haina kikomo. Bidhaa zinaweza kuwa na aina mbalimbali (ukubwa, rangi) na viwango vya bei ya jumla.',
                     en: 'Starter plans support up to 500 products. Business and Enterprise plans have no limit. Products can have multiple variants (sizes, colours) and bulk pricing tiers.' },
  faq_q3:          { sw: 'Naweza kusimamia maduka mengi?',                   en: 'Can I manage multiple stores?'              },
  faq_a3:          { sw: 'Ndiyo. Mpango wa Business unasaidia hadi maeneo 3 kutoka dashibodi moja, ikiwa ni pamoja na uhamishaji wa hifadhi kati ya maduka na uchambuzi uliounganishwa. Enterprise inasaidia maduka yasiyokuwa na kikomo.',
                     en: 'Yes. The Business plan supports up to 3 locations from one dashboard, including cross-store stock transfers and consolidated analytics. Enterprise supports unlimited stores.' },
  faq_q4:          { sw: 'Wateja wangu wanaweza kutumia njia gani za malipo?', en: 'What payment methods can my customers use?' },
  faq_a4:          { sw: 'Pesa taslimu, M-Pesa, Tigo Pesa, Airtel Money na uhamisho wa benki — yote kwenye tiketi moja. Malipo yanaweza kugawanywa kati ya njia mbalimbali kwenye mauzo moja.',
                     en: 'Cash, M-Pesa, Tigo Pesa, Airtel Money and bank transfer — all on one ticket. Payments can be split across methods on a single sale.' },
  faq_q5:          { sw: 'Je, data yangu ni salama na ya faragha?',           en: 'Is my data private and secure?'            },
  faq_a5:          { sw: 'Ndiyo. Data yako ya mauzo, wateja na hifadhi haijawahi kutumika kufunza mfano wowote wa AI. Data inahifadhiwa kwenye seva Tanzania, imesimbwa kwa njia fiche wakati wa kupumzika na kusafiri. Unamiliki data yako na unaweza kuisafirisha wakati wowote.',
                     en: 'Yes. Your sales, customer and stock data is never used to train any AI model. Data is stored on servers in Tanzania, encrypted at rest and in transit. You own your data and can export it any time.' },
  faq_q6:          { sw: 'Jinsi gani ya kufuta usajili wangu?',               en: 'How do I cancel my subscription?'          },
  faq_a6:          { sw: 'Unaweza kufuta wakati wowote kutoka Mipangilio → Bili. Hakuna mikataba ya kufunga, hakuna ada ya kutoka. Data yako inabaki inayoweza kusafirishwa kwa siku 30 baada ya kufuta.',
                     en: 'You can cancel any time from Settings → Billing. No lock-in contracts, no exit fees. Your data remains exportable for 30 days after cancellation.' },

  // ── CTA ──────────────────────────────────────────────────────────────────────
  cta_label:       { sw: '05 · PATA ZIADA',                              en: '05 · GET ZIADA'                         },
  cta_h2:          { sw: 'Endesha duka lako kwa programu tulivu.',       en: 'Run your shop on calm software.'        },
  cta_h2a:         { sw: 'Endesha duka lako kwa',                        en: 'Run your shop on'                       },
  cta_h2b:         { sw: 'programu tulivu.',                             en: 'calm software.'                         },
  cta_sub:         { sw: 'Siku saba, kipengele chochote, bila kadi. Maduka mengi yanaanza Ziada ndani ya saa moja.',
                     en: 'Seven days, every feature, no card. Most shops are live on Ziada in under an hour.'        },
  cta_trial:       { sw: 'Anza majaribio',       en: 'Start trial'       },
  cta_talk:        { sw: 'Zungumza na timu',    en: 'Talk to the team'  },

  // ── Footer ───────────────────────────────────────────────────────────────────
  footer_desc:     { sw: 'Mfumo wa uendeshaji wa biashara. Ilijengwa Dar es Salaam, kwa kila kaunta barani.',
                     en: 'The operating system for retail. Built in Dar es Salaam, made for any counter on the continent.' },
  footer_product:  { sw: 'Bidhaa',    en: 'Product'  },
  footer_company:  { sw: 'Kampuni',   en: 'Company'  },
  footer_legal:    { sw: 'Kisheria',  en: 'Legal'    },
  footer_pos:      { sw: 'Mauzo',     en: 'Point of Sale' },
  footer_inv:      { sw: 'Hifadhi',   en: 'Inventory'     },
  footer_analytics:{ sw: 'Uchambuzi', en: 'Analytics'     },
  footer_credits:  { sw: 'Mikopo',    en: 'Credits'        },
  footer_about:    { sw: 'Kuhusu',    en: 'About'          },
  footer_pricing:  { sw: 'Bei',       en: 'Pricing'        },
  footer_contact:  { sw: 'Wasiliana', en: 'Contact'        },
  footer_careers:  { sw: 'Kazi',      en: 'Careers'        },
  footer_terms:    { sw: 'Masharti ya Huduma', en: 'Terms of Service' },
  footer_privacy:  { sw: 'Sera ya Faragha',    en: 'Privacy Policy'   },
  footer_built:    { sw: 'Ilijengwa na',        en: 'Built by'         },
} as const;

export type TKey = keyof typeof dict;

export function t(lang: Lang, key: TKey): string {
  return dict[key][lang];
}
