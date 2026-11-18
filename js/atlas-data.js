/* Atlas datasets (moved from the inline script of index.html):
   7 muscles, 16 points (coordinates computed from the book's definitions on the 1000x828 head model — see caGeometry),
   study Table 1 and the protocol configurations. */
    // ==================== DATASET 1: THE 7 KEY MUSCLES FOR CHEEK ACUPUNCTURE ====================
    const cheekMuscles = [
      {
        id: "masseter",
        badge: "שריר המפתח #1 בשיטה",
        nameHe: "2. שריר המלעס (Masseter)",
        nameEn: "Masseter Muscle (Superficial & Deep Heads)",
        color: "#f43f5e",
        anatomy: "מתחיל מהגבול התחתון של קשת הזיגומה (עצם הלחי) ויורד למטה ואחורה עד לזווית הלסת התחתונה (Mandibular Angle) ולחלק החיצוני של ענף הלסת (Ramus).",
        palpation: "בקש מהמטופל לנשוך/להדק שיניים חזק – השריר המלבני יקפוץ מיד מתחת לאצבעותיך בחלק האחורי של הלחי. משש את ה'מדרגה' הקדמית שלו (הגבול הקדמי) ואת הבליטה המרכזית שלו.",
        pointsDesc: "זהו 'מגדלור המיפוי' החשוב ביותר בדיקור לחי! שלושת המחממים בצהוב (CA-2, CA-3, CA-4) יושבים על החלק הקדמי שלו – מתהליך הקורונואיד שמתחת לקשת הזיגומה (CA-2) ועד הזווית הפנימית של הלסת (CA-4); המותן והעצה באדום (CA-7, CA-8) סמוכים לשפה האחורית של ענף הלסת; ונקודת הירך בכחול (CA-13) יושבת על בליטת המלעס, צון אחד מלפני ומעל לזווית הלסת.",
        relatedPoints: ["CA-2", "CA-3", "CA-4", "CA-7", "CA-8", "CA-13"]
      },
      {
        id: "temporalis",
        badge: "שריר לעיסה ורקה",
        nameHe: "1. שריר הרקה (Temporalis)",
        nameEn: "Temporalis Muscle",
        color: "#a855f7",
        anatomy: "שריר רחב דמוי מניפה המכסה את עצם הרקה (מעל קשת הזיגומה). סיביו מתכנסים למטה, עוברים מתחת לקשת הזיגומה ומתחברים לזיז הוויי (Coronoid Process) של הלסת התחתונה.",
        palpation: "הנח אצבעות על הרקה (מעל עצם הלחי, בגובה קו העין) ובקש מהמטופל להדק שיניים – תרגיש את המניפה השרירית מתכווצת. הגיד התחתון שלו מתחבר בדיוק באזור נקודת המחמם העליון (CA-2).",
        pointsDesc: "על הבטן השרירית של הרקה, צון אחד מעל אמצע קשת הזיגומה, יושבת נקודת הראש הסגולה הגדולה (CA-1); על קשת הזיגומה עצמה (התפר הרקתי-זיגומטי) יושבת נקודת הכתף (CA-9); ובשפה האחורית של תהליך הקורונואיד, שאליו נאחז גיד הרקה, יושבת נקודת המחמם העליון (CA-2).",
        relatedPoints: ["CA-1", "CA-2", "CA-9"]
      },
      {
        id: "buccinator",
        badge: "שריר שקע הלחי (המחממים)",
        nameHe: "3. השריר המחצצר (Buccinator)",
        nameEn: "Buccinator Muscle (Deep Cheek Wall)",
        color: "#f97316",
        anatomy: "השריר העמוק המרכיב את הדופן הרכה של הלחי ('השקע של הלחי'). עובר אופקית מהלסת העליונה והתחתונה (מול השיניים הטוחנות) קדימה אל זווית הפה, ממוקם ממש קדמית לשריר המלעס.",
        palpation: "זהו האזור הרך של הלחי שלתוכו האצבע שוקעת ברגע שמחליקים קדימה משריר המלעס הקשה. הוא פועל כשמנפחים את הלחיים או שואבים אותן פנימה.",
        pointsDesc: "בשכבה העמוקה של המחמם האמצעי והתחתון (CA-3, CA-4) נמצאת לפי הספר כרית השומן של הלחי, הצמודה לשריר המחצצר שבעומק; המחמם העליון (CA-2) נמצא גבוה יותר, מתחת לקשת הזיגומה.",
        relatedPoints: ["CA-2", "CA-3", "CA-4"]
      },
      {
        id: "zygomaticus",
        badge: "שרירי הבעה - גפה עליונה",
        nameHe: "4. שרירי הזיגומה (Zygomaticus Major & Minor)",
        nameEn: "Zygomaticus Major & Minor Muscles",
        color: "#ec4899",
        anatomy: "יוצאים מגוף עצם הלחי (Zygomatic Bone) ויורדים באלכסון קדימה ומטה אל זווית הפה והשפה העליונה (מרימים את זווית הפה בחיוך).",
        palpation: "בקש מהמטופל לחייך חיוך רחב – תרגיש את הרצועה השרירית האלכסונית שנמתחת מעצם הלחי אל זווית הפה.",
        pointsDesc: "מסלול הגפה העליונה (הנקודות הירוקות) עוקב אחרי שרירי הזיגומה: מנקודת הכתף (CA-9) ונקודת המרפק (CA-10) שעל עצם הלחי ועד לנקודת שורש כף היד (CA-11) בקפל החיוך.",
        relatedPoints: ["CA-9", "CA-10", "CA-11"]
      },
      {
        id: "orbicularis",
        badge: "שרירי השפה והאף",
        nameHe: "5. חוג הפה ומרימי השפה (Orbicularis Oris)",
        nameEn: "Orbicularis Oris & Levator Labii Superioris",
        color: "#14b8a6",
        anatomy: "שריר טבעתי המקיף את השפתיים, ואליו מתחברים מלמעלה שרירי הרמת השפה העליונה וכנף האף (לאורך קפל החיוך - Nasolabial Fold).",
        palpation: "משש את החריץ של קפל החיוך בגובה בסיס הנחיריים (בקו אופקי עם CA-3), ואת השריר השטחי שבין הנחיר לשפה העליונה.",
        pointsDesc: "נקודת שורש כף היד הירוקה (CA-11) יושבת בקפל החיוך בגובה בסיס הנחיר, ונקודת כף היד הירוקה (CA-12) יושבת מעל השפה העליונה מתחת לנחיר.",
        relatedPoints: ["CA-11", "CA-12"]
      },
      {
        id: "pterygoid",
        badge: "שריר לעיסה עמוק ומפרק הלסת",
        nameHe: "6. השריר הפטריגואידי הצידי וזיז הלסת",
        nameEn: "Lateral Pterygoid & Coronoid Process Zone",
        color: "#06b6d4",
        anatomy: "שוכן בעומק שקע הלחי מתחת לקשת הזיגומה, ומתחבר לצוואר מפרק הלסת (TMJ) ולקופסית המפרק (קדמית לטרגוס של האוזן).",
        palpation: "הנח אצבע מתחת לקשת הזיגומה ובקש מהמטופל לפתוח ולסגור את הפה: בחלק האחורי (ליד הטרגוס) תרגיש את ראש מפרק הלסת זז (CA-6), ובחלק הקדמי תרגיש את הזיז הוויי נע קדימה ואחורה (CA-2).",
        pointsDesc: "חיוני לאיתור מדויק של נקודת המחמם העליון (CA-2) מאחורי הזיז הוויי, ולנקודות הצוואר והגב העליון האדומות (CA-5, CA-6) הצמודות לקדמת האוזן ומפרק הלסת.",
        relatedPoints: ["CA-2", "CA-5", "CA-6"]
      },
      {
        id: "mentalis",
        badge: "שרירי הסנטר וקו הלסת",
        nameHe: "7. מורידי זווית הפה והסנטר (Mentalis & Depressors)",
        nameEn: "Depressor Anguli Oris, Depressor Labii & Mentalis",
        color: "#10b981",
        anatomy: "שרירים הנאחזים לאורך הגבול התחתון של גוף הלסת התחתונה (Mandibular Body) ועולים אל זווית הפה, השפה התחתונה והסנטר.",
        palpation: "משש לאורך העצם התחתונה של הלסת מאזור שריר המלעס קדימה אל צידי הסנטר מתחת לזווית הפה והשפה התחתונה.",
        pointsDesc: "לאורך אחיזת השרירים הללו ממוקמות 3 מנקודות הגפה התחתונה הכחולות: ברך (CA-14) באמצע הקו שבין זווית הלסת ל-CV-24, וקרסול (CA-15) וכף רגל (CA-16) סמוך ל-CV-24 בצד הסנטר.",
        relatedPoints: ["CA-14", "CA-15", "CA-16"]
      }
    ];

    // ==================== DATASET 2: THE 16 CHEEK ACUPUNCTURE POINTS (x/y are computed below from Table 1 — see caGeometry) ====================
    const cheekPoints = [
      {
        code: "CA-1",
        nameEn: "Head CA-1",
        nameHe: "ראש (Head)",
        nameCn: "头穴",
        pinyin: "Tóu Xué",
        category: "נקודת הראש (סגול)",
        color: "#7e22ce",
        strokeColor: "#d8b4fe",
        isLarge: true,
        callout: { type: "left", lineEndX: 280, textX: 272 },
        location: "צון אחד מעל אמצע הגבול העליון של קשת הזיגומה – באזור הרקה, על שריר הרקה (Temporalis).",
        palpation: "אתר את קשת הזיגומה (בין זווית העין החיצונית לטרגוס) וסמן את אמצע הגבול העליון שלה; עלה משם צון אחד (רוחב אגודל המטופל) כלפי מעלה. בהידוק שיניים מורגש שריר הרקה מתחת לאצבע.",
        needle: "0.16×13 מ״מ | עומק 2–4 מ״מ לפאשיה של שריר הרקה",
        sideTime: "דו-צדדי או בצד הכאב | 30 דקות",
        indications: "כאבי ראש, מיגרנות, סחרחורת צווארית, נדודי שינה, חרדה, הרגעת ה-Shen ואיזון ציר היפותלמוס-היפופיזה-שחלות (HPO) בטיפולי פריון.",
        protocols: ["cervical", "fertility"]
      },
      {
        code: "CA-2",
        nameEn: "Upper energizer CA-2",
        nameHe: "מחמם עליון (Upper Energizer)",
        nameCn: "上焦穴",
        pinyin: "Shàng Jiāo Xué",
        category: "שלושת המחממים (צהוב)",
        color: "#facc15",
        strokeColor: "#fef08a",
        isLarge: true,
        callout: { type: "left", lineEndX: 268, textX: 260 },
        location: "במפגש השפה האחורית של הזיז הקורונואידי (Coronoid Process) של הלסת התחתונה עם הגבול התחתון של קשת הזיגומה.",
        palpation: "הנח אצבע צמוד מתחת לגבול התחתון של קשת הזיגומה ובקש מהמטופל לפתוח ולסגור את הפה: הזיז הקורונואידי נע מתחת לקשת. הנקודה בשפה האחורית שלו, צמוד לקשת (קדמית לשקע שמעל חריץ הלסת).",
        needle: "0.16–0.18 מ״מ | עומק 3–5 מ״מ אנכית לעור",
        sideTime: "דו-צדדי (בוויסות מערכתי) | 30–45 דקות",
        indications: "מועקה בחזה, פלפיטציות, חרדה, קוצר נשימה, כאבים בבית החזה, וויסות ציר הלב-רחם (Bao Mai) להורדת סטרס בטיפולי פריון.",
        protocols: ["fertility"]
      },
      {
        code: "CA-3",
        nameEn: "Middle energizer CA-3",
        nameHe: "מחמם אמצעי (Middle Energizer)",
        nameCn: "中焦穴",
        pinyin: "Zhōng Jiāo Xué",
        category: "שלושת המחממים (צהוב)",
        color: "#facc15",
        strokeColor: "#fef08a",
        isLarge: true,
        callout: { type: "left", lineEndX: 268, textX: 260 },
        location: "באמצע הקו המחבר בין נקודת המחמם העליון (CA-2) לנקודת המחמם התחתון (CA-4).",
        palpation: "סמן את CA-2 ואת CA-4 ומצא את אמצע הקו ביניהן; בהידוק שיניים הנקודה נמצאת על החלק הקדמי של שריר המלעס.",
        needle: "0.16–0.18 מ״מ | עומק 3–5 מ״מ אנכית",
        sideTime: "דו-צדדי או לפי אבחנת בטן | 30–45 דקות",
        indications: "הפרעות עיכול, כאבי קיבה, נפיחות בטנית, רפלוקס, בחילות, תקיעות צ׳י הכבד ותסמונת קדם-וסתית (PMS) המלווה כאבי מחזור.",
        protocols: ["dysmenorrhea", "fertility"]
      },
      {
        code: "CA-4",
        nameEn: "Lower energizer CA-4",
        nameHe: "מחמם תחתון (Lower Energizer)",
        nameCn: "下焦穴",
        pinyin: "Xià Jiāo Xué",
        category: "שלושת המחממים (צהוב)",
        color: "#facc15",
        strokeColor: "#fef08a",
        isLarge: true,
        callout: { type: "left", lineEndX: 268, textX: 260 },
        location: "בשוליים הקדמיים של הזווית הפנימית של הלסת התחתונה – במקום שבו השפה הקדמית של ענף הלסת (Ramus) עוברת לגוף הלסת (בטבלה 1: על הקו האלכסוני הקדמי של הלסת).",
        palpation: "עקוב באצבע אחרי השפה הקדמית של ענף הלסת, מתחת לזיז הקורונואידי, כלפי מטה – עד שהיא מתעקלת קדימה אל הקו האלכסוני של גוף הלסת (בערך בגובה זווית הפה).",
        needle: "0.16–0.18 מ״מ | עומק 3–5 מ״מ (זהירות מעורק הפנים הצמוד)",
        sideTime: "בצד הרגיש בבטן התחתונה או דו-צדדי | 30–45 דקות",
        indications: "נקודת המאסטר לגינקולוגיה ופריון: כאבי מחזור (דיסמנוריאה), כאב שחלתי, ויסות רחם ושחלות, אנדומטריוזיס, שיפור זרימת דם לאגן וחיזוק הכליות.",
        protocols: ["dysmenorrhea", "fertility"]
      },
      {
        code: "CA-5",
        nameEn: "Cervical CA-5",
        nameHe: "צוואר (Cervical)",
        nameCn: "颈穴",
        pinyin: "Jǐng Xué",
        category: "עמוד השדרה (אדום)",
        color: "#ef4444",
        strokeColor: "#fecaca",
        isLarge: false,
        callout: { type: "right", lineEndX: 812, textX: 820 },
        location: "בקצה העליון של שורש קשת הזיגומה – צמוד לפני האוזן, מעל מפרק הלסת.",
        palpation: "החלק אצבע לאורך קשת הזיגומה אחורה עד שורשה, צמוד לפני האוזן ומעל מפרק הלסת, ועלה אל הקצה העליון של השורש.",
        needle: "0.16×13 מ״מ | עומק 2–3 מ״מ בהטיה שטחית על הפאשיה",
        sideTime: "בצד הכאב (איפסילטרלי) או דו-צדדי | 30 דקות",
        indications: "נקודת המאסטר לכל פתולוגיות הצוואר: צוואר תפוס חריף, בלט/פריצת דיסק צווארית, רדיקולופתיה צווארית ונוקשות בשרירי הצוואר.",
        protocols: ["cervical"]
      },
      {
        code: "CA-6",
        nameEn: "Dorsal CA-6",
        nameHe: "גב עליון (Dorsal / Thoracic)",
        nameCn: "背穴",
        pinyin: "Bèi Xué",
        category: "עמוד השדרה (אדום)",
        color: "#ef4444",
        strokeColor: "#fecaca",
        isLarge: false,
        callout: { type: "right", lineEndX: 812, textX: 820 },
        location: "מתחת לשוליים התחתונים של שורש קשת הזיגומה, מתחת למפרק הלסת-רקה (TMJ) – קדמית לטרגוס.",
        palpation: "בקש מהמטופל לפתוח ולסגור את הפה: ראש הלסת (Condyle) נע מתחת לאצבע קדמית לטרגוס. הנקודה בקצה התחתון של המפרק, מתחת לשורש הקשת.",
        needle: "0.16–0.18 מ״מ | עומק 3–4 מ״מ אנכית",
        sideTime: "בצד הכאב (נדקרת בצמד עם CA-5) | 30 דקות",
        indications: "כאבי גב עליון ושכמות, שריר הטרפז והמעוינים, נוקשות במעבר צוואר-גב (C7–T1).",
        protocols: ["cervical"]
      },
      {
        code: "CA-7",
        nameEn: "Lumbar CA-7",
        nameHe: "מותן / גב תחתון (Lumbar)",
        nameCn: "腰穴",
        pinyin: "Yāo Xué",
        category: "עמוד השדרה (אדום)",
        color: "#ef4444",
        strokeColor: "#fecaca",
        isLarge: false,
        callout: { type: "right", lineEndX: 812, textX: 820 },
        location: "באמצע הקו המחבר בין נקודת הגב (CA-6) לנקודת העצה (CA-8).",
        palpation: "סמן את CA-6 ואת CA-8 ומצא את אמצע הקו ביניהן – בערך בגובה תחתית תנוך האוזן, קדמית לשפה האחורית של ענף הלסת.",
        needle: "0.16–0.18 מ״מ | עומק 3–4 מ״מ לתוך הפאשיה של שריר המלעס האחורי",
        sideTime: "בצד הכאב או דו-צדדי | 30 דקות",
        indications: "כאבי גב תחתון חריפים וכרוניים, נקע מותני, בלט דיסק מותני (L1–L5) וכאבי גב תחתון בזמן הווסת.",
        protocols: ["dysmenorrhea", "fertility"]
      },
      {
        code: "CA-8",
        nameEn: "Sacral CA-8",
        nameHe: "עצה / סקרום (Sacral)",
        nameCn: "骶穴",
        pinyin: "Dǐ Xué",
        category: "עמוד השדרה (אדום)",
        color: "#ef4444",
        strokeColor: "#fecaca",
        isLarge: false,
        callout: { type: "right", lineEndX: 812, textX: 820 },
        location: "חצי צון קדמית ומעל לזווית הלסת התחתונה (Mandibular Angle).",
        palpation: "מצא את זווית הלסת התחתונה ועלה ממנה חצי צון באלכסון קדימה ולמעלה (לכיוון הפה).",
        needle: "0.16–0.18 מ״מ | עומק 3–4 מ״מ",
        sideTime: "דו-צדדי או בצד הכאב | 30–45 דקות",
        indications: "כאבי סקרום ועצם הזנב, אישיאס, נקודת מפתח בכאבי מחזור (מקלעת העצבים הסקראלית) ושיפור זרימת הדם לרחם בפריון.",
        protocols: ["dysmenorrhea", "fertility"]
      },
      {
        code: "CA-9",
        nameEn: "Shoulder CA-9",
        nameHe: "כתף (Shoulder)",
        nameCn: "肩穴",
        pinyin: "Jiān Xué",
        category: "גפה עליונה (ירוק)",
        color: "#22c55e",
        strokeColor: "#bbf7d0",
        isLarge: false,
        callout: { type: "top", lineEndY: 64, textY: 54 },
        location: "באמצע התפר הרקתי-זיגומטי (Temporozygomatic Suture) שעל קשת הזיגומה.",
        palpation: "החלק אצבע מגוף עצם הלחי אחורה לאורך קשת הזיגומה: התפר נמצא בשליש הקדמי של הקשת (קדמית ומעט מעל ל-CA-2). הנקודה באמצע גובה הקשת.",
        needle: "0.16×13 מ״מ | עומק 2–3 מ״מ שטחי מעל העצם",
        sideTime: "בצד הכתף הכואבת | 30 דקות",
        indications: "כתף קפואה (Frozen Shoulder), דלקות בגידי הכתף (Rotator Cuff), וכאבי צוואר המקרינים לכתף.",
        protocols: ["cervical"]
      },
      {
        code: "CA-10",
        nameEn: "Elbow CA-10",
        nameHe: "מרפק (Elbow)",
        nameCn: "肘穴",
        pinyin: "Zhǒu Xué",
        category: "גפה עליונה (ירוק)",
        color: "#22c55e",
        strokeColor: "#bbf7d0",
        isLarge: false,
        callout: { type: "top", lineEndY: 94, textY: 84 },
        location: "באמצע הקו המחבר בין זווית העין החיצונית (Lateral Canthus) לנקודה הנמוכה ביותר של עצם הלחי (Zygomatic Bone).",
        palpation: "מצא את הנקודה הנמוכה ביותר של עצם הלחי (מתחת לבליטת הלחי) ומתח קו אל זווית העין החיצונית; הנקודה באמצע הקו, על עצם הלחי.",
        needle: "0.16×13 מ״מ | עומק 2–3 מ״מ שטחי",
        sideTime: "בצד הכאב | 30 דקות",
        indications: "מרפק טניס (Lateral Epicondylitis), מרפק גולף, כאבים באמה.",
        protocols: []
      },
      {
        code: "CA-11",
        nameEn: "Wrist CA-11",
        nameHe: "שורש כף יד (Wrist)",
        nameCn: "腕穴",
        pinyin: "Wàn Xué",
        category: "גפה עליונה (ירוק)",
        color: "#22c55e",
        strokeColor: "#bbf7d0",
        isLarge: false,
        callout: { type: "top", lineEndY: 124, textY: 114 },
        location: "בקפל האף-שפה (Nasolabial Fold), בגובה הקו האופקי של הקצה התחתון של הנחיר.",
        palpation: "צא בקו אופקי מהקצה התחתון של הנחיר (כנף האף) הצידה, עד החריץ של קפל האף-שפה.",
        needle: "0.16×13 מ״מ | עומק 2–3 מ״מ בהחדרה מהירה",
        sideTime: "בצד הכאב | 30 דקות",
        indications: "תסמונת התעלה הקרפלית, דלקות גידים ונקעים בשורש כף היד.",
        protocols: []
      },
      {
        code: "CA-12",
        nameEn: "Hand CA-12",
        nameHe: "כף יד (Hand)",
        nameCn: "手穴",
        pinyin: "Shǒu Xué",
        category: "גפה עליונה (ירוק)",
        color: "#22c55e",
        strokeColor: "#bbf7d0",
        isLarge: false,
        callout: { type: "top", lineEndY: 154, textY: 144 },
        location: "באמצע הקו המחבר בין אמצע הקצה התחתון של הנחיר לבין הגבול האדום (Vermilion Border) של השפה העליונה.",
        palpation: "מתחת לאמצע הנחיר: בחצי הגובה שבין הקצה התחתון של הנחיר לגבול האדום של השפה העליונה.",
        needle: "0.16×13 מ״מ | עומק 1.5–2 מ״מ שטחי מאוד",
        sideTime: "בצד הכאב | 20–30 דקות",
        indications: "כאב, נימול או אצבע הדק (Trigger Finger) בכף היד ובאצבעות.",
        protocols: []
      },
      {
        code: "CA-13",
        nameEn: "Hip CA-13",
        nameHe: "ירך (Hip)",
        nameCn: "髋穴",
        pinyin: "Kuān Xué",
        category: "גפה תחתונה (כחול)",
        color: "#0ea5e9",
        strokeColor: "#bae6fd",
        isLarge: false,
        callout: { type: "bottom", lineEndY: 782, textY: 802 },
        location: "צון אחד קדמית ומעל לזווית הלסת התחתונה, על בליטת שריר המלעס (Masseteric Tuberosity).",
        palpation: "מצא את זווית הלסת התחתונה ועלה ממנה צון אחד באלכסון קדימה ולמעלה; בהידוק שיניים הנקודה יושבת על בליטת שריר המלעס.",
        needle: "0.16–0.18 מ״מ | עומק 3–5 מ״מ לתוך הפאשיה של שריר המלעס",
        sideTime: "בצד הכאב | 30 דקות",
        indications: "כאבי מפרק הירך, בורסיטיס טרוכנטרית, אישיאס המקרין לישבן ולירך.",
        protocols: []
      },
      {
        code: "CA-14",
        nameEn: "Knee CA-14",
        nameHe: "ברך (Knee)",
        nameCn: "膝穴",
        pinyin: "Xī Xué",
        category: "גפה תחתונה (כחול)",
        color: "#0ea5e9",
        strokeColor: "#bae6fd",
        isLarge: false,
        callout: { type: "bottom", lineEndY: 745, textY: 765 },
        location: "באמצע הקו המחבר בין זווית הלסת התחתונה לנקודת צ'נג-ג'יאנג (承浆 CV-24 – השקע במרכז החריץ שבין השפה התחתונה לסנטר).",
        palpation: "סמן את זווית הלסת ואת CV-24 (השקע במרכז החריץ שמתחת לשפה התחתונה), ומצא את אמצע הקו ביניהן על פני גוף הלסת.",
        needle: "0.16–0.18 מ״מ | עומק 2–4 מ״מ",
        sideTime: "בצד הברך הכואבת | 30 דקות",
        indications: "שחיקת סחוס בברך (אוסטיאוארתריטיס), פציעות מניסקוס ורצועות, כאבי ברכיים במדרגות.",
        protocols: []
      },
      {
        code: "CA-15",
        nameEn: "Ankle CA-15",
        nameHe: "קרסול (Ankle)",
        nameCn: "踝穴",
        pinyin: "Huái Xué",
        category: "גפה תחתונה (כחול)",
        color: "#0ea5e9",
        strokeColor: "#bae6fd",
        isLarge: false,
        callout: { type: "bottom", lineEndY: 782, textY: 802 },
        location: "על הקו המחבר בין נקודת הברך (CA-14) לנקודת צ'נג-ג'יאנג (CV-24), בשליש הקרוב ל-CV-24 (לקו האמצע).",
        palpation: "חלק את הקו שבין CV-24 ל-CA-14 לשלושה חלקים שווים; הנקודה בסוף השליש הראשון מ-CV-24 – בערך מתחת לזווית הפה.",
        needle: "0.16×13 מ״מ | עומק 2–3 מ״מ",
        sideTime: "בצד הקרסול הכואב | 30 דקות",
        indications: "נקע חריף או כרוני בקרסול, דלקת בגיד אכילס, נפיחות בקרסול.",
        protocols: []
      },
      {
        code: "CA-16",
        nameEn: "Foot CA-16",
        nameHe: "כף רגל (Foot)",
        nameCn: "足穴",
        pinyin: "Zú Xué",
        category: "גפה תחתונה (כחול)",
        color: "#0ea5e9",
        strokeColor: "#bae6fd",
        isLarge: false,
        callout: { type: "bottom", lineEndY: 745, textY: 765, textX: 318 },
        location: "חצי צון לצד נקודת צ'נג-ג'יאנג (承浆 CV-24).",
        palpation: "מ-CV-24 (השקע במרכז החריץ שמתחת לשפה התחתונה) זוז חצי צון הצידה.",
        needle: "0.16×13 מ״מ | עומק 2–3 מ״מ",
        sideTime: "בצד הכואב | 30 דקות",
        indications: "דורבן בעקב (Plantar Fasciitis), כאבים בכריות כף הרגל או נימול בבהונות.",
        protocols: []
      }
    ];


    // ==================== GEOMETRY: POINT POSITIONS DERIVED FROM TABLE 1 (Wang & Wu, "Cheek Acupuncture") ====================
    // Bony and soft-tissue landmarks traced on the 3D head model (SVG viewBox 1000×828, same pixels as the image).
    // Every point is then built from its Table 1 definition, so moving a landmark moves the points that depend on it.
    const CUN = 52; // 1 cun (patient's thumb width) ≈ 2 cm ≈ 52 px on this model (ear length ≈ 158 px ≈ 6.3 cm)
    const caLandmarks = {
      archTopMid:      { x: 551, y: 391, label: "אמצע הגבול העליון של קשת הזיגומה" },
      archRootTop:     { x: 621, y: 390, label: "קצה עליון של שורש הקשת" },
      coronoidArch:    { x: 547, y: 421, label: "שפה אחורית של הזיז הקורונואידי × גבול תחתון של הקשת" },
      obliqueLine:     { x: 530, y: 541, label: "הקו האלכסוני הקדמי של הלסת" },
      tmjInferior:     { x: 614, y: 438, label: "קופסית תחתונה של מפרק הלסת" },
      sutureMid:       { x: 519, y: 404, label: "אמצע התפר הרקתי-זיגומטי" },
      lateralCanthus:  { x: 436, y: 356, label: "זווית העין החיצונית" },
      zygomaLowest:    { x: 456, y: 444, label: "הנקודה הנמוכה של עצם הלחי" },
      nostrilMid:      { x: 348, y: 481, label: "אמצע הקצה התחתון של הנחיר" },
      nasolabialFold:  { x: 375, y: 481, label: "קפל האף-שפה" },
      vermilion:       { x: 348, y: 523, label: "גבול השפה העליונה" },
      mandibleAngle:   { x: 604, y: 568, label: "זווית הלסת" },
      chengjiang:      { x: 344, y: 590, label: "承浆 CV-24" }
    };
    // Direction "anterior & superior" from the angle of the mandible = bisector of the posterior border of the ramus and the inferior border of the body.
    const ANGLE_BISECTOR = { x: -0.8, y: -0.6 };

    const gMid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
    const gLerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    const gAlong = (a, dir, d) => ({ x: a.x + dir.x * d, y: a.y + dir.y * d });

    const caGeometry = (() => {
      const L = caLandmarks;
      const g = {};
      g["CA-1"] = { x: L.archTopMid.x, y: L.archTopMid.y - CUN };            // 1 cun above the upper edge of the middle of the zygomatic arch
      g["CA-2"] = { ...L.coronoidArch };                                     // posterior coronoid × lower edge of the zygomatic arch
      g["CA-4"] = { ...L.obliqueLine };                                      // anterior oblique line of the mandible
      g["CA-3"] = gMid(g["CA-2"], g["CA-4"]);                               // midpoint CA-2 — CA-4
      g["CA-5"] = { ...L.archRootTop };                                      // top edge of the root of the zygomatic arch
      g["CA-6"] = { ...L.tmjInferior };                                      // lower edge of the arch × inferior capsule of the TMJ
      g["CA-8"] = gAlong(L.mandibleAngle, ANGLE_BISECTOR, CUN / 2);          // 0.5 cun anterior & superior to the angle of the mandible
      g["CA-7"] = gMid(g["CA-6"], g["CA-8"]);                               // midpoint CA-6 — CA-8
      g["CA-9"] = { ...L.sutureMid };                                        // middle of the temporozygomatic suture
      g["CA-10"] = gMid(L.lateralCanthus, L.zygomaLowest);                  // midpoint lateral canthus — bottom of the zygomatic bone
      g["CA-11"] = { ...L.nasolabialFold };                                  // nasolabial fold at the level of the lower edge of the nostril
      g["CA-12"] = gMid(L.nostrilMid, L.vermilion);                         // midpoint nostril lower edge — vermilion border
      g["CA-13"] = gAlong(L.mandibleAngle, ANGLE_BISECTOR, CUN);             // 1 cun anterior & superior to the angle, on the masseteric tuberosity
      g["CA-14"] = gMid(L.mandibleAngle, L.chengjiang);                     // midpoint angle of the mandible — CV-24
      g["CA-15"] = gLerp(L.chengjiang, g["CA-14"], 1 / 3);                  // on CA-14 — CV-24, in the third next to CV-24 (midline)
      g["CA-16"] = { x: L.chengjiang.x + 12, y: L.chengjiang.y };           // 0.5 cun lateral to CV-24 (in a side view, lateral shows mostly as depth)
      Object.keys(g).forEach((k) => { g[k] = { x: Math.round(g[k].x * 10) / 10, y: Math.round(g[k].y * 10) / 10 }; });
      return g;
    })();
    cheekPoints.forEach((pt) => Object.assign(pt, caGeometry[pt.code]));

    // ==================== DATASET 3: STUDY TABLE 1 (case report: standard points, indications, use in P1/P2) ====================
    const studyTable = {
      "CA-1":  { loc: "1 צון מעל אמצע הגבול העליון של קשת הזיגומה.", ind: "כאב ראש, סחרחורת, כאב שיניים, נדודי שינה, מתח, חרדה, דיכאון, שבץ וכו'.", use: ["P1"] },
      "CA-2":  { loc: "נקודת המפגש בין השפה האחורית של הזיז הקורונואידי של הלסת התחתונה לבין הגבול התחתון של קשת הזיגומה.", ind: "כאב ראש, כאב צוואר, כאב בחזה, מועקה בחזה, נפיחות וכאב בשדיים, טכיקרדיה, הפרעות קצב, אסטמה וכו'.", use: ["P1"] },
      "CA-3":  { loc: "אמצע הקו המחבר בין נקודות המחמם העליון והמחמם התחתון.", ind: "התכווצויות בקיבה, דלקת קיבה חריפה/כרונית, צרבת וחומציות.", use: ["P1"] },
      "CA-4":  { loc: "על הקו האלכסוני הקדמי של הלסת התחתונה.", ind: "נפיחות וכאב בבטן, קוליטיס, כאבי מחזור, מחלה דלקתית של האגן (PID), אי-סדירות בווסת, הפרשות נרתיקיות, מחלות גינקולוגיות.", use: ["P1"] },
      "CA-5":  { loc: "הקצה העליון של שורש קשת הזיגומה.", ind: "כאב צוואר, צוואר תפוס לאחר שינה, ספונדילוזיס צווארי, כאב גרון, סחרחורת, מתח, התכווצות שרירי הסקלנוס, טנטון וכו'.", use: ["P1"] },
      "CA-6":  { loc: "נקודת המפגש בין הגבול התחתון של קשת הזיגומה לבין הקופסית התחתונה של מפרק הלסת (TMJ).", ind: "כאב גב, מתיחת שריר המעוין, מועקה בחזה, קוצר נשימה, כאב בטן, דפיקות לב וכו'.", use: ["P1", "P2"] },
      "CA-7":  { loc: "אמצע הקו המחבר בין הנקודה הגבית (CA-6) לנקודה הסקראלית (CA-8).", ind: "כאב גב תחתון, מתיחת שריר מותני, נקע מותני חריף, אישיאס, פריצת דיסק וכו'.", use: ["P1", "P2"] },
      "CA-8":  { loc: "0.5 צון קדמית-עליונה לזווית הלסת התחתונה.", ind: "מתיחת השריר הזוקף (Erector spinae), כאב גב תחתון בנשים, פציעות ברצועות הכסל-עצה, הרטבת לילה, דלקת ערמונית וכו'.", use: ["P1", "P2"] },
      "CA-9":  { loc: "אמצע התפר הטמפורו-זיגומטי.", ind: "כאב כתף, כתף קפואה, דלקת בגיד הדו-ראשי, סינוביטיס תת-אקרומיאלי, דלקת בגיד הסופרספינטוס וכו'.", use: ["P1"] },
      "CA-10": { loc: "אמצע הקו המחבר בין זווית העין החיצונית לתחתית עצם הלחי.", ind: "כאב מרפק, מרפק טניס, מרפק גולף, דלקת בגידי פושטי ומכופפי שורש כף היד וכו'.", use: [] },
      "CA-11": { loc: "בקפל האף-שפה (Nasolabial fold), בקו האופקי של הקצה התחתון של הנחיר.", ind: "כאב בשורש כף היד, פציעות במפרק, תסמונת התעלה הקרפלית, כאב באצבעות.", use: [] },
      "CA-12": { loc: "אמצע הקו המחבר בין אמצע הקצה התחתון של הנחיר לגבול האדום של השפה העליונה.", ind: "דלקת פרקים באצבעות, דלקת בגידים, חוסר תחושה באצבעות או בכף היד.", use: [] },
      "CA-13": { loc: "1 צון קדמית-עליונה לזווית הלסת התחתונה, על בליטת שריר המלעס.", ind: "אישיאס, דלקת מפרקים ניוונית בירך, פציעה בשריר הפיריפורמיס, כאב במפשעה.", use: ["P1", "P2"] },
      "CA-14": { loc: "אמצע הקו המחבר בין זווית הלסת התחתונה לנקודת צ'נג-ג'יאנג (承浆 CV24).", ind: "כאב ברך, כאב לאורך העצב הפרונאלי, דלקת מפרקים, פציעה בשרירי ההמסטרינג, התכווצות שריר התאומים (Gastrocnemius) וכו'.", use: ["P1"] },
      "CA-15": { loc: "על הקו המחבר בין נקודת הברך (CA-14) לנקודת צ'נג-ג'יאנג (承浆 CV24), בשליש הקרוב ל-CV24 (\"1/3 proximity\" – הקרוב לקו האמצע, כמו בספר).", ind: "נקע בקרסול, נפיחות וכאב, דלקת מפרקים בקרסול, דלקת בגיד אכילס, כאב בעקב.", use: [] },
      "CA-16": { loc: "0.5 צון לצד נקודת צ'נג-ג'יאנג (承浆 CV24).", ind: "גאוט (שיגדון), מתיחת הפאשיה הפלנטרית, דורבן, כאב בעקב, כאב בבוהן.", use: ["P1"] }
    };

    const protocolConfigs = {
      all: null,
      cervical: {
        title: "פרוטוקול קליני: בעיות צוואר, שכמות והקרנה לכתף",
        desc: "מתמקד בנקודות האדומות בקדמת האוזן (CA-5, CA-6), בנקודה הירוקה על קשת הזיגומה (CA-9) ובנקודה הסגולה ברקה (CA-1).",
        pointsList: "1. CA-5 (צוואר - אדום) + CA-6 (גב עליון - אדום) [ליבה] | 2. תוספת CA-9 (כתף - ירוק) בהקרנה ליד | 3. תוספת CA-1 (ראש - סגול) בסחרחורת או מתח.",
        sideRule: "בכאב צוואר חד-צדדי – דוקרים רק בלחי של אותו הצד. בנוקשות צוואר מרכזית – דוקרים דו-צדדית.",
        verification: "בדיקה דינמית בתנועה: מבקשים מהמטופל לסובב את הצוואר מיד לאחר החדרת המחטים ל-CA-5 ו-CA-6.",
        defaultPoint: "CA-5"
      },
      dysmenorrhea: {
        title: "🌸 פרוטוקול קליני מלא: כאבי מחזור (דיסמנוריאה) וכאב שחלתי",
        desc: "מבוסס על הנקודה הצהובה התחתונה בשוליים הקדמיים של הזווית הפנימית של הלסת (CA-4) והנקודות האדומות שלאורך השפה האחורית של ענף הלסת (CA-8, CA-7) בשילוב אבחנת בטן.",
        pointsList: "1. מחט ראשונה: CA-4 (מחמם תחתון - צהוב תחתון) | 2. מחט שנייה (להקרנה לאגן): CA-8 (סקרום - אדום תחתון) | 3. לכאב גב תחתון: CA-7 (מותן - אדום) | 4. לבחילות/נפיחות/PMS: CA-3 (מחמם אמצעי - צהוב אמצעי).",
        sideRule: "אם רק שחלה אחת כואבת/רגישה בבטן (למשל שמאל) – דוקרים בלחי שמאל בלבד! אם הכאב במרכז הרחם – דוקרים דו-צדדית.",
        verification: "אבחנת בטן: לוחצים על מוקד הכאב בבטן התחתונה לפני הדיקור, מחדירים את CA-4, ולוחצים שוב על הבטן – הרגישות צריכה לצנוח מיד.",
        defaultPoint: "CA-4"
      },
      fertility: {
        title: "🤰 פרוטוקול קליני מלא: פריון ואיזון ציר הורמונלי (HPO Axis)",
        desc: "טיפול מערכתי המשלב את הנקודה הסגולה ברקה (CA-1), שלוש הנקודות הצהובות של המחממים (CA-2, CA-3, CA-4) ונקודות האגן האדומות (CA-8, CA-7).",
        pointsList: "1. ליבת רבייה: CA-4 (מחמם תחתון - צהוב) + CA-8 (סקרום - אדום) | 2. ציר מוח-הורמונים והרגעת Shen: CA-1 (ראש - סגול) + CA-2 (מחמם עליון - צהוב) | 3. ויסות צ'י הכבד והעיכול: CA-3 (מחמם אמצעי - צהוב) + CA-7 (מותן - אדום).",
        sideRule: "בפריון נהוג לדקור דו-צדדית (בשתי הלחיים) לאיזון מערכתי מלא של ציר ההורמונים וזרימת הדם לאגן.",
        verification: "מישוש השוואתי של מתח דופן הבטן סביב הטבור ובבטן התחתונה (CV4/CV6/ST29) לפני ואחרי החדרת מחטי שלושת המחממים (CA-2..CA-4).",
        defaultPoint: "CA-4"
      }
    };

