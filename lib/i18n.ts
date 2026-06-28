// ═══════════════════════ INTERNATIONALIZATION ═══════════════════════
// UI chrome, schema labels, and the guided tour are translatable. The scholarly
// per-point readings in atlas.json stay in their original English by design.

export interface LangMeta {
  code: string;
  name: string;
}

export interface TourStep {
  title: string;
  body: string;
}

export interface StatusEntry {
  label: string;
  desc: string;
}

export interface LangPack {
  ui: Record<string, string>;
  values: Record<string, string>;
  epochs: Record<string, string>;
  threads: Record<string, string>;
  drivers: Record<string, string>;
  status: Record<string, StatusEntry>;
  evidence: Record<string, string>;
  // Aspect-type headings (schemaVersion 2). English-only for now; other
  // languages fall back to English gracefully (translated in a later phase).
  aspects?: Record<string, string>;
  tour: TourStep[];
}

export const LANGS: LangMeta[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'pt', name: 'Português' },
  { code: 'it', name: 'Italiano' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ru', name: 'Русский' },
];

const RTL_LANGS = new Set(['ar']);

const DICT: Record<string, LangPack> = {
  // ─────────────────────────── ENGLISH ───────────────────────────
  en: {
    ui: {
      subtitle: 'Multi-spine civilizational continuity',
      lens_moral: 'Moral', lens_ecological: 'Ecological', lens_institutional: 'Institutional',
      followThread: 'Follow a Thread',
      followThreadDesc: 'Highlight a continuous civilization across all epochs to see how its values mutated.',
      followThreadDescShort: 'Highlight a civilization across all epochs.',
      values: 'Values', epochs: 'Epochs',
      banner: 'Values are adaptive technologies — click a marker to read its ecology',
      pointsInEpoch: 'points in this epoch',
      controls: 'Controls', language: 'Language',
      lensMoralTitle: 'Lens: Moral',
      lensMoralDesc: 'Markers colored by primary value and stamped with its glyph. Click a point to see its coupled and counter values.',
      lensEcoTitle: 'Lens: Ecological',
      lensEcoDesc: 'Colored by ecological & material pressure. Watch which values bloom in response.',
      lensInstTitle: 'Lens: Institutional',
      lensInstDesc: 'Colored by institutional structure. Reveals how values shift inside weak vs. strong systems.',
      markerHint: 'Click marker to open full reading →',
      secValueStructure: 'Value Structure', secCompass: 'Ideological Compass', lineage: 'Lineage',
      secDrivers: 'Ecological & Institutional Drivers', secStatus: 'Persistence Status',
      secEvidence: 'Evidence Quality', secReadings: 'Readings',
      readingPrimary: 'Primary Reading', readingAlt: 'Counter-Reading / Alt perspective',
      readingCost: 'The Shadow / Cost', secSources: 'Sources',
      role_primary: 'primary', role_coupled: 'coupled', role_counter: 'counter',
      conf: 'conf', contestedTitle: 'Contested Reading',
      tourStart: 'Take the tour', tourReplay: 'Tour',
      next: 'Next', back: 'Back', skip: 'Skip', done: 'Got it',
    },
    values: { generosity:'Generosity', hospitality:'Hospitality', solidarity:'Solidarity', aggression:'Aggression', honor:'Honor', piety:'Piety', curiosity:'Curiosity', individualism:'Individualism', collectivism:'Collectivism', egalitarianism:'Egalitarianism', order:'Law & Order', hierarchy:'Hierarchy' },
    epochs: { hunter:'Hunter-Gatherer', 'early-agr':'Early Agriculture', bronze:'Bronze Age', iron:'Iron Age', axial:'Axial Age', imperial:'Classical Empires', medieval:'Medieval', 'early-mod':'Early Modern', industrial:'Industrial Age', modern:'Modern Era', now:'Present' },
    threads: { all:'All Regions', arabia:'Arabia / Islamic', china:'China', india:'South Asia', europe:'Europe / Atlantic', steppe:'Eurasian Steppe', africa:'Sub-Saharan Africa', americas:'Americas' },
    drivers: { resource_scarcity:'Resource scarcity', pathogen_load:'Pathogen pressure', open_frontier:'Open frontier', resource_competition:'Resource competition', metallurgy:'Metallurgy / iron', maritime_expansion:'Maritime expansion', nomadic_mobility:'Nomadic mobility', weak_institutions:'Weak institutions', kinship_intensity:'Kinship intensity', hydraulic_coordination:'Hydraulic coordination', institutional_scale:'Institutional scale', trade_networks:'Trade networks', literacy:'Literacy / writing', monumental_religion:'Monumental religion', military_revolution:'Military revolution', colonial_pressure:'Colonial pressure', industrialization:'Industrialization', secularism_threat:'Secularism threat', technological_surplus:'Tech surplus' },
    status: { adaptive:{label:'Adaptive',desc:'Currently driven by a live ecological or institutional pressure.'}, residual:{label:'Residual',desc:'The original driver is gone; the value persists as culture, etiquette, identity, or law.'}, reactive:{label:'Reactive',desc:'Emerged in opposition to another value or as a corrective to a dominant norm.'}, reactivated:{label:'Reactivated',desc:'Deliberately revived as an identity marker, often in response to an external threat.'} },
    evidence: { ethnographic:'ethnographic', textual:'textual', archaeological:'archaeological', inferred:'inferred', speculative:'speculative' },
    aspects: { 'values-synthesis':'Values Synthesis', gender:'Gender', myth:'Myth & Cosmology', religion:'Religion', commerce:'Commerce', law:'Law', governance:'Governance', 'daily-life':'Daily Life', architecture:'Architecture', dress:'Dress & Adornment', script:'Script & Writing', art:'Art' },
    tour: [
      { title:'Welcome to Values Atlas', body:'An interactive map of how human values — generosity, honor, piety, curiosity — emerge and shift across civilizations and deep time. Here is a quick tour.' },
      { title:'The map', body:'Each marker is a human value taking root in a specific place and era. Bigger, brighter markers mean the value burned hotter there.' },
      { title:'Three lenses', body:'Recolor the whole map by what shaped values: Moral (the values themselves), Ecological (environmental pressure), or Institutional (social structure).' },
      { title:'Travel through time', body:'Drag the timeline or press play to move across epochs — from hunter-gatherers to today — and watch values rise and fade.' },
      { title:'Filter values', body:'Toggle individual values on or off to focus the map on the ones you care about.' },
      { title:'Follow a civilization', body:'Pick a thread to highlight one civilization across every epoch and trace how its values mutated over millennia.' },
      { title:'Open a reading', body:'Click any marker for a deep panel: its value structure, ideological compass, lineage timeline, and the scholarly reading behind it.' },
      { title:'In your language', body:'Switch the interface to your language anytime from here. Welcome aboard — start exploring.' },
    ],
  },
  // ─────────────────────────── SPANISH ───────────────────────────
  es: {
    ui: {
      subtitle: 'Continuidad civilizatoria de múltiples ejes',
      lens_moral: 'Moral', lens_ecological: 'Ecológico', lens_institutional: 'Institucional',
      followThread: 'Seguir un hilo',
      followThreadDesc: 'Resalta una civilización continua a través de todas las épocas para ver cómo mutaron sus valores.',
      followThreadDescShort: 'Resalta una civilización a través de todas las épocas.',
      values: 'Valores', epochs: 'Épocas',
      banner: 'Los valores son tecnologías adaptativas — haz clic en un marcador para leer su ecología',
      pointsInEpoch: 'puntos en esta época',
      controls: 'Controles', language: 'Idioma',
      lensMoralTitle: 'Lente: Moral',
      lensMoralDesc: 'Marcadores coloreados por su valor principal y marcados con su glifo. Haz clic en un punto para ver sus valores acoplados y opuestos.',
      lensEcoTitle: 'Lente: Ecológico',
      lensEcoDesc: 'Coloreado por la presión ecológica y material. Observa qué valores florecen en respuesta.',
      lensInstTitle: 'Lente: Institucional',
      lensInstDesc: 'Coloreado por la estructura institucional. Revela cómo cambian los valores en sistemas débiles frente a fuertes.',
      markerHint: 'Haz clic en el marcador para abrir la lectura completa →',
      secValueStructure: 'Estructura de valores', secCompass: 'Brújula ideológica', lineage: 'Linaje',
      secDrivers: 'Impulsores ecológicos e institucionales', secStatus: 'Estado de persistencia',
      secEvidence: 'Calidad de la evidencia', secReadings: 'Lecturas',
      readingPrimary: 'Lectura principal', readingAlt: 'Contralectura / perspectiva alternativa',
      readingCost: 'La sombra / El costo', secSources: 'Fuentes',
      role_primary: 'principal', role_coupled: 'acoplado', role_counter: 'opuesto',
      conf: 'conf.', contestedTitle: 'Lectura disputada',
      tourStart: 'Hacer el recorrido', tourReplay: 'Recorrido',
      next: 'Siguiente', back: 'Atrás', skip: 'Omitir', done: 'Entendido',
    },
    values: { generosity:'Generosidad', hospitality:'Hospitalidad', solidarity:'Solidaridad', aggression:'Agresión', honor:'Honor', piety:'Piedad', curiosity:'Curiosidad', individualism:'Individualismo', collectivism:'Colectivismo', egalitarianism:'Igualitarismo', order:'Ley y orden', hierarchy:'Jerarquía' },
    epochs: { hunter:'Cazadores-recolectores', 'early-agr':'Agricultura temprana', bronze:'Edad del Bronce', iron:'Edad del Hierro', axial:'Era axial', imperial:'Imperios clásicos', medieval:'Medieval', 'early-mod':'Edad Moderna temprana', industrial:'Era industrial', modern:'Era moderna', now:'Presente' },
    threads: { all:'Todas las regiones', arabia:'Arabia / Islámico', china:'China', india:'Asia del Sur', europe:'Europa / Atlántico', steppe:'Estepa euroasiática', africa:'África subsahariana', americas:'Américas' },
    drivers: { resource_scarcity:'Escasez de recursos', pathogen_load:'Presión de patógenos', open_frontier:'Frontera abierta', resource_competition:'Competencia por recursos', metallurgy:'Metalurgia / hierro', maritime_expansion:'Expansión marítima', nomadic_mobility:'Movilidad nómada', weak_institutions:'Instituciones débiles', kinship_intensity:'Intensidad de parentesco', hydraulic_coordination:'Coordinación hidráulica', institutional_scale:'Escala institucional', trade_networks:'Redes comerciales', literacy:'Alfabetización / escritura', monumental_religion:'Religión monumental', military_revolution:'Revolución militar', colonial_pressure:'Presión colonial', industrialization:'Industrialización', secularism_threat:'Amenaza del secularismo', technological_surplus:'Excedente tecnológico' },
    status: { adaptive:{label:'Adaptativo',desc:'Actualmente impulsado por una presión ecológica o institucional activa.'}, residual:{label:'Residual',desc:'El impulsor original desapareció; el valor persiste como cultura, etiqueta, identidad o ley.'}, reactive:{label:'Reactivo',desc:'Surgió en oposición a otro valor o como corrección de una norma dominante.'}, reactivated:{label:'Reactivado',desc:'Revivido deliberadamente como marca de identidad, a menudo ante una amenaza externa.'} },
    evidence: { ethnographic:'etnográfica', textual:'textual', archaeological:'arqueológica', inferred:'inferida', speculative:'especulativa' },
    tour: [
      { title:'Bienvenido a Values Atlas', body:'Un mapa interactivo de cómo los valores humanos —generosidad, honor, piedad, curiosidad— surgen y cambian a través de las civilizaciones y el tiempo profundo. Aquí tienes un breve recorrido.' },
      { title:'El mapa', body:'Cada marcador es un valor humano arraigándose en un lugar y una época concretos. Los marcadores más grandes y brillantes indican que el valor ardió con más fuerza allí.' },
      { title:'Tres lentes', body:'Recolorea todo el mapa según lo que dio forma a los valores: Moral (los valores en sí), Ecológico (presión ambiental) o Institucional (estructura social).' },
      { title:'Viaja en el tiempo', body:'Arrastra la línea de tiempo o pulsa reproducir para recorrer las épocas —de los cazadores-recolectores a hoy— y ver cómo los valores surgen y se desvanecen.' },
      { title:'Filtra los valores', body:'Activa o desactiva valores individuales para centrar el mapa en los que te interesan.' },
      { title:'Sigue una civilización', body:'Elige un hilo para resaltar una civilización en todas las épocas y rastrear cómo mutaron sus valores a lo largo de milenios.' },
      { title:'Abre una lectura', body:'Haz clic en cualquier marcador para un panel profundo: su estructura de valores, brújula ideológica, línea de linaje y la lectura académica que hay detrás.' },
      { title:'En tu idioma', body:'Cambia la interfaz a tu idioma cuando quieras desde aquí. Bienvenido a bordo — empieza a explorar.' },
    ],
  },

  // ─────────────────────────── FRENCH ───────────────────────────
  fr: {
    ui: {
      subtitle: 'Continuité civilisationnelle à axes multiples',
      lens_moral: 'Moral', lens_ecological: 'Écologique', lens_institutional: 'Institutionnel',
      followThread: 'Suivre un fil',
      followThreadDesc: 'Mettez en valeur une civilisation continue à travers toutes les époques pour voir comment ses valeurs ont muté.',
      followThreadDescShort: 'Mettez en valeur une civilisation à travers toutes les époques.',
      values: 'Valeurs', epochs: 'Époques',
      banner: 'Les valeurs sont des technologies adaptatives — cliquez sur un marqueur pour lire son écologie',
      pointsInEpoch: 'points dans cette époque',
      controls: 'Commandes', language: 'Langue',
      lensMoralTitle: 'Optique : Moral',
      lensMoralDesc: 'Marqueurs colorés selon la valeur principale et marqués de son glyphe. Cliquez sur un point pour voir ses valeurs couplées et opposées.',
      lensEcoTitle: 'Optique : Écologique',
      lensEcoDesc: 'Coloré selon la pression écologique et matérielle. Observez quelles valeurs éclosent en réponse.',
      lensInstTitle: 'Optique : Institutionnel',
      lensInstDesc: 'Coloré selon la structure institutionnelle. Révèle comment les valeurs évoluent dans des systèmes faibles ou forts.',
      markerHint: 'Cliquez sur le marqueur pour ouvrir la lecture complète →',
      secValueStructure: 'Structure des valeurs', secCompass: 'Boussole idéologique', lineage: 'Lignée',
      secDrivers: 'Moteurs écologiques et institutionnels', secStatus: 'Statut de persistance',
      secEvidence: 'Qualité des preuves', secReadings: 'Lectures',
      readingPrimary: 'Lecture principale', readingAlt: 'Contre-lecture / autre perspective',
      readingCost: "L'ombre / Le coût", secSources: 'Sources',
      role_primary: 'principale', role_coupled: 'couplée', role_counter: 'opposée',
      conf: 'conf.', contestedTitle: 'Lecture contestée',
      tourStart: 'Faire la visite', tourReplay: 'Visite',
      next: 'Suivant', back: 'Retour', skip: 'Passer', done: 'Compris',
    },
    values: { generosity:'Générosité', hospitality:'Hospitalité', solidarity:'Solidarité', aggression:'Agression', honor:'Honneur', piety:'Piété', curiosity:'Curiosité', individualism:'Individualisme', collectivism:'Collectivisme', egalitarianism:'Égalitarisme', order:'Loi et ordre', hierarchy:'Hiérarchie' },
    epochs: { hunter:'Chasseurs-cueilleurs', 'early-agr':'Agriculture ancienne', bronze:'Âge du bronze', iron:'Âge du fer', axial:'Période axiale', imperial:'Empires classiques', medieval:'Médiéval', 'early-mod':'Début de l’époque moderne', industrial:'Ère industrielle', modern:'Ère moderne', now:'Présent' },
    threads: { all:'Toutes les régions', arabia:'Arabie / Islamique', china:'Chine', india:'Asie du Sud', europe:'Europe / Atlantique', steppe:'Steppe eurasienne', africa:'Afrique subsaharienne', americas:'Amériques' },
    drivers: { resource_scarcity:'Pénurie de ressources', pathogen_load:'Pression des pathogènes', open_frontier:'Frontière ouverte', resource_competition:'Compétition pour les ressources', metallurgy:'Métallurgie / fer', maritime_expansion:'Expansion maritime', nomadic_mobility:'Mobilité nomade', weak_institutions:'Institutions faibles', kinship_intensity:'Intensité de la parenté', hydraulic_coordination:'Coordination hydraulique', institutional_scale:'Échelle institutionnelle', trade_networks:'Réseaux commerciaux', literacy:'Alphabétisation / écriture', monumental_religion:'Religion monumentale', military_revolution:'Révolution militaire', colonial_pressure:'Pression coloniale', industrialization:'Industrialisation', secularism_threat:'Menace de la laïcité', technological_surplus:'Surplus technologique' },
    status: { adaptive:{label:'Adaptatif',desc:'Actuellement porté par une pression écologique ou institutionnelle active.'}, residual:{label:'Résiduel',desc:'Le moteur initial a disparu ; la valeur persiste comme culture, étiquette, identité ou loi.'}, reactive:{label:'Réactif',desc:'Apparu en opposition à une autre valeur ou comme correctif d’une norme dominante.'}, reactivated:{label:'Réactivé',desc:'Délibérément ravivé comme marqueur identitaire, souvent face à une menace extérieure.'} },
    evidence: { ethnographic:'ethnographique', textual:'textuelle', archaeological:'archéologique', inferred:'déduite', speculative:'spéculative' },
    tour: [
      { title:'Bienvenue dans Values Atlas', body:'Une carte interactive de la façon dont les valeurs humaines — générosité, honneur, piété, curiosité — émergent et évoluent à travers les civilisations et le temps profond. Voici une brève visite.' },
      { title:'La carte', body:'Chaque marqueur est une valeur humaine prenant racine en un lieu et une époque précis. Plus le marqueur est grand et lumineux, plus la valeur y brûlait fort.' },
      { title:'Trois optiques', body:'Recolorez toute la carte selon ce qui a façonné les valeurs : Moral (les valeurs elles-mêmes), Écologique (pression environnementale) ou Institutionnel (structure sociale).' },
      { title:'Voyagez dans le temps', body:'Faites glisser la frise ou appuyez sur lecture pour parcourir les époques — des chasseurs-cueilleurs à aujourd’hui — et voir les valeurs naître et s’éteindre.' },
      { title:'Filtrez les valeurs', body:'Activez ou désactivez des valeurs individuelles pour concentrer la carte sur celles qui vous intéressent.' },
      { title:'Suivez une civilisation', body:'Choisissez un fil pour mettre en valeur une civilisation à travers chaque époque et retracer la mutation de ses valeurs sur des millénaires.' },
      { title:'Ouvrez une lecture', body:'Cliquez sur n’importe quel marqueur pour un panneau approfondi : sa structure de valeurs, sa boussole idéologique, sa frise de lignée et la lecture savante qui la sous-tend.' },
      { title:'Dans votre langue', body:'Changez l’interface dans votre langue à tout moment ici. Bienvenue à bord — commencez à explorer.' },
    ],
  },

  // ─────────────────────────── GERMAN ───────────────────────────
  de: {
    ui: {
      subtitle: 'Mehrsträngige Zivilisationskontinuität',
      lens_moral: 'Moralisch', lens_ecological: 'Ökologisch', lens_institutional: 'Institutionell',
      followThread: 'Einem Strang folgen',
      followThreadDesc: 'Heben Sie eine durchgehende Zivilisation über alle Epochen hervor, um zu sehen, wie sich ihre Werte wandelten.',
      followThreadDescShort: 'Eine Zivilisation über alle Epochen hervorheben.',
      values: 'Werte', epochs: 'Epochen',
      banner: 'Werte sind adaptive Technologien — klicken Sie auf einen Marker, um seine Ökologie zu lesen',
      pointsInEpoch: 'Punkte in dieser Epoche',
      controls: 'Steuerung', language: 'Sprache',
      lensMoralTitle: 'Linse: Moralisch',
      lensMoralDesc: 'Marker eingefärbt nach dem Primärwert und mit dessen Symbol versehen. Klicken Sie auf einen Punkt für gekoppelte und gegensätzliche Werte.',
      lensEcoTitle: 'Linse: Ökologisch',
      lensEcoDesc: 'Eingefärbt nach ökologischem und materiellem Druck. Beobachten Sie, welche Werte daraufhin aufblühen.',
      lensInstTitle: 'Linse: Institutionell',
      lensInstDesc: 'Eingefärbt nach institutioneller Struktur. Zeigt, wie sich Werte in schwachen vs. starken Systemen verschieben.',
      markerHint: 'Marker anklicken, um die vollständige Lesart zu öffnen →',
      secValueStructure: 'Wertestruktur', secCompass: 'Ideologischer Kompass', lineage: 'Abstammung',
      secDrivers: 'Ökologische & institutionelle Treiber', secStatus: 'Persistenzstatus',
      secEvidence: 'Beleglage', secReadings: 'Lesarten',
      readingPrimary: 'Primäre Lesart', readingAlt: 'Gegenlesart / Alternativperspektive',
      readingCost: 'Der Schatten / Die Kosten', secSources: 'Quellen',
      role_primary: 'primär', role_coupled: 'gekoppelt', role_counter: 'gegensätzlich',
      conf: 'Konf.', contestedTitle: 'Umstrittene Lesart',
      tourStart: 'Tour starten', tourReplay: 'Tour',
      next: 'Weiter', back: 'Zurück', skip: 'Überspringen', done: 'Verstanden',
    },
    values: { generosity:'Großzügigkeit', hospitality:'Gastfreundschaft', solidarity:'Solidarität', aggression:'Aggression', honor:'Ehre', piety:'Frömmigkeit', curiosity:'Neugier', individualism:'Individualismus', collectivism:'Kollektivismus', egalitarianism:'Egalitarismus', order:'Recht & Ordnung', hierarchy:'Hierarchie' },
    epochs: { hunter:'Jäger und Sammler', 'early-agr':'Frühe Landwirtschaft', bronze:'Bronzezeit', iron:'Eisenzeit', axial:'Achsenzeit', imperial:'Klassische Reiche', medieval:'Mittelalter', 'early-mod':'Frühe Neuzeit', industrial:'Industriezeitalter', modern:'Moderne', now:'Gegenwart' },
    threads: { all:'Alle Regionen', arabia:'Arabien / Islamisch', china:'China', india:'Südasien', europe:'Europa / Atlantik', steppe:'Eurasische Steppe', africa:'Subsahara-Afrika', americas:'Amerika' },
    drivers: { resource_scarcity:'Ressourcenknappheit', pathogen_load:'Krankheitsdruck', open_frontier:'Offene Grenze', resource_competition:'Ressourcenkonkurrenz', metallurgy:'Metallurgie / Eisen', maritime_expansion:'Maritime Expansion', nomadic_mobility:'Nomadische Mobilität', weak_institutions:'Schwache Institutionen', kinship_intensity:'Verwandtschaftsdichte', hydraulic_coordination:'Hydraulische Koordination', institutional_scale:'Institutionelle Skalierung', trade_networks:'Handelsnetzwerke', literacy:'Alphabetisierung / Schrift', monumental_religion:'Monumentalreligion', military_revolution:'Militärrevolution', colonial_pressure:'Kolonialer Druck', industrialization:'Industrialisierung', secularism_threat:'Bedrohung durch Säkularismus', technological_surplus:'Technologischer Überschuss' },
    status: { adaptive:{label:'Adaptiv',desc:'Derzeit von einem aktiven ökologischen oder institutionellen Druck getragen.'}, residual:{label:'Residual',desc:'Der ursprüngliche Treiber ist verschwunden; der Wert besteht als Kultur, Etikette, Identität oder Gesetz fort.'}, reactive:{label:'Reaktiv',desc:'Entstand im Gegensatz zu einem anderen Wert oder als Korrektiv einer dominanten Norm.'}, reactivated:{label:'Reaktiviert',desc:'Bewusst als Identitätsmerkmal wiederbelebt, oft als Reaktion auf eine äußere Bedrohung.'} },
    evidence: { ethnographic:'ethnografisch', textual:'textuell', archaeological:'archäologisch', inferred:'erschlossen', speculative:'spekulativ' },
    tour: [
      { title:'Willkommen bei Values Atlas', body:'Eine interaktive Karte, wie menschliche Werte — Großzügigkeit, Ehre, Frömmigkeit, Neugier — über Zivilisationen und tiefe Zeit hinweg entstehen und sich wandeln. Hier eine kurze Tour.' },
      { title:'Die Karte', body:'Jeder Marker ist ein menschlicher Wert, der an einem bestimmten Ort und in einer bestimmten Epoche Wurzeln schlägt. Größere, hellere Marker bedeuten, dass der Wert dort stärker brannte.' },
      { title:'Drei Linsen', body:'Färben Sie die ganze Karte danach um, was Werte prägte: Moralisch (die Werte selbst), Ökologisch (Umweltdruck) oder Institutionell (soziale Struktur).' },
      { title:'Durch die Zeit reisen', body:'Ziehen Sie die Zeitleiste oder drücken Sie Abspielen, um durch die Epochen zu wandern — von Jägern und Sammlern bis heute — und Werte aufsteigen und vergehen zu sehen.' },
      { title:'Werte filtern', body:'Schalten Sie einzelne Werte ein oder aus, um die Karte auf die für Sie wichtigen zu fokussieren.' },
      { title:'Einer Zivilisation folgen', body:'Wählen Sie einen Strang, um eine Zivilisation über jede Epoche hervorzuheben und nachzuverfolgen, wie sich ihre Werte über Jahrtausende wandelten.' },
      { title:'Eine Lesart öffnen', body:'Klicken Sie auf einen Marker für ein tiefes Panel: Wertestruktur, ideologischer Kompass, Abstammungs-Zeitleiste und die wissenschaftliche Lesart dahinter.' },
      { title:'In Ihrer Sprache', body:'Stellen Sie die Oberfläche jederzeit hier auf Ihre Sprache um. Willkommen an Bord — auf zur Erkundung.' },
    ],
  },

  // ─────────────────────────── PORTUGUESE ───────────────────────────
  pt: {
    ui: {
      subtitle: 'Continuidade civilizacional de múltiplos eixos',
      lens_moral: 'Moral', lens_ecological: 'Ecológico', lens_institutional: 'Institucional',
      followThread: 'Seguir um fio',
      followThreadDesc: 'Destaque uma civilização contínua por todas as épocas para ver como seus valores se transformaram.',
      followThreadDescShort: 'Destaque uma civilização por todas as épocas.',
      values: 'Valores', epochs: 'Épocas',
      banner: 'Valores são tecnologias adaptativas — clique num marcador para ler sua ecologia',
      pointsInEpoch: 'pontos nesta época',
      controls: 'Controles', language: 'Idioma',
      lensMoralTitle: 'Lente: Moral',
      lensMoralDesc: 'Marcadores coloridos pelo valor principal e marcados com seu glifo. Clique num ponto para ver seus valores acoplados e opostos.',
      lensEcoTitle: 'Lente: Ecológico',
      lensEcoDesc: 'Colorido pela pressão ecológica e material. Observe quais valores florescem em resposta.',
      lensInstTitle: 'Lente: Institucional',
      lensInstDesc: 'Colorido pela estrutura institucional. Revela como os valores mudam em sistemas fracos vs. fortes.',
      markerHint: 'Clique no marcador para abrir a leitura completa →',
      secValueStructure: 'Estrutura de valores', secCompass: 'Bússola ideológica', lineage: 'Linhagem',
      secDrivers: 'Motores ecológicos e institucionais', secStatus: 'Estado de persistência',
      secEvidence: 'Qualidade da evidência', secReadings: 'Leituras',
      readingPrimary: 'Leitura principal', readingAlt: 'Contraleitura / perspectiva alternativa',
      readingCost: 'A sombra / O custo', secSources: 'Fontes',
      role_primary: 'principal', role_coupled: 'acoplado', role_counter: 'oposto',
      conf: 'conf.', contestedTitle: 'Leitura contestada',
      tourStart: 'Fazer o tour', tourReplay: 'Tour',
      next: 'Próximo', back: 'Voltar', skip: 'Pular', done: 'Entendi',
    },
    values: { generosity:'Generosidade', hospitality:'Hospitalidade', solidarity:'Solidariedade', aggression:'Agressão', honor:'Honra', piety:'Piedade', curiosity:'Curiosidade', individualism:'Individualismo', collectivism:'Coletivismo', egalitarianism:'Igualitarismo', order:'Lei e ordem', hierarchy:'Hierarquia' },
    epochs: { hunter:'Caçadores-coletores', 'early-agr':'Agricultura inicial', bronze:'Idade do Bronze', iron:'Idade do Ferro', axial:'Era axial', imperial:'Impérios clássicos', medieval:'Medieval', 'early-mod':'Início da Era Moderna', industrial:'Era industrial', modern:'Era moderna', now:'Presente' },
    threads: { all:'Todas as regiões', arabia:'Arábia / Islâmico', china:'China', india:'Sul da Ásia', europe:'Europa / Atlântico', steppe:'Estepe euroasiática', africa:'África subsaariana', americas:'Américas' },
    drivers: { resource_scarcity:'Escassez de recursos', pathogen_load:'Pressão de patógenos', open_frontier:'Fronteira aberta', resource_competition:'Competição por recursos', metallurgy:'Metalurgia / ferro', maritime_expansion:'Expansão marítima', nomadic_mobility:'Mobilidade nômade', weak_institutions:'Instituições fracas', kinship_intensity:'Intensidade de parentesco', hydraulic_coordination:'Coordenação hidráulica', institutional_scale:'Escala institucional', trade_networks:'Redes comerciais', literacy:'Alfabetização / escrita', monumental_religion:'Religião monumental', military_revolution:'Revolução militar', colonial_pressure:'Pressão colonial', industrialization:'Industrialização', secularism_threat:'Ameaça do secularismo', technological_surplus:'Excedente tecnológico' },
    status: { adaptive:{label:'Adaptativo',desc:'Atualmente impulsionado por uma pressão ecológica ou institucional ativa.'}, residual:{label:'Residual',desc:'O motor original desapareceu; o valor persiste como cultura, etiqueta, identidade ou lei.'}, reactive:{label:'Reativo',desc:'Surgiu em oposição a outro valor ou como corretivo de uma norma dominante.'}, reactivated:{label:'Reativado',desc:'Deliberadamente revivido como marca de identidade, muitas vezes em resposta a uma ameaça externa.'} },
    evidence: { ethnographic:'etnográfica', textual:'textual', archaeological:'arqueológica', inferred:'inferida', speculative:'especulativa' },
    tour: [
      { title:'Bem-vindo ao Values Atlas', body:'Um mapa interativo de como os valores humanos — generosidade, honra, piedade, curiosidade — surgem e mudam através das civilizações e do tempo profundo. Aqui está um tour rápido.' },
      { title:'O mapa', body:'Cada marcador é um valor humano criando raízes num lugar e numa época específicos. Marcadores maiores e mais brilhantes indicam que o valor ardeu com mais força ali.' },
      { title:'Três lentes', body:'Recolora todo o mapa pelo que moldou os valores: Moral (os próprios valores), Ecológico (pressão ambiental) ou Institucional (estrutura social).' },
      { title:'Viaje no tempo', body:'Arraste a linha do tempo ou pressione reproduzir para percorrer as épocas — dos caçadores-coletores até hoje — e ver os valores surgirem e se apagarem.' },
      { title:'Filtre os valores', body:'Ative ou desative valores individuais para focar o mapa nos que lhe interessam.' },
      { title:'Siga uma civilização', body:'Escolha um fio para destacar uma civilização em todas as épocas e rastrear como seus valores se transformaram ao longo de milênios.' },
      { title:'Abra uma leitura', body:'Clique em qualquer marcador para um painel profundo: sua estrutura de valores, bússola ideológica, linha de linhagem e a leitura acadêmica por trás dela.' },
      { title:'No seu idioma', body:'Mude a interface para o seu idioma a qualquer momento aqui. Bem-vindo a bordo — comece a explorar.' },
    ],
  },

  // ─────────────────────────── ITALIAN ───────────────────────────
  it: {
    ui: {
      subtitle: 'Continuità civilizzazionale a più assi',
      lens_moral: 'Morale', lens_ecological: 'Ecologico', lens_institutional: 'Istituzionale',
      followThread: 'Segui un filo',
      followThreadDesc: 'Evidenzia una civiltà continua attraverso tutte le epoche per vedere come sono mutati i suoi valori.',
      followThreadDescShort: 'Evidenzia una civiltà attraverso tutte le epoche.',
      values: 'Valori', epochs: 'Epoche',
      banner: 'I valori sono tecnologie adattive — clicca un marcatore per leggerne l’ecologia',
      pointsInEpoch: 'punti in questa epoca',
      controls: 'Comandi', language: 'Lingua',
      lensMoralTitle: 'Lente: Morale',
      lensMoralDesc: 'Marcatori colorati in base al valore primario e contrassegnati dal suo glifo. Clicca un punto per i valori accoppiati e opposti.',
      lensEcoTitle: 'Lente: Ecologico',
      lensEcoDesc: 'Colorato in base alla pressione ecologica e materiale. Osserva quali valori sbocciano in risposta.',
      lensInstTitle: 'Lente: Istituzionale',
      lensInstDesc: 'Colorato in base alla struttura istituzionale. Rivela come i valori cambiano in sistemi deboli o forti.',
      markerHint: 'Clicca il marcatore per aprire la lettura completa →',
      secValueStructure: 'Struttura dei valori', secCompass: 'Bussola ideologica', lineage: 'Lignaggio',
      secDrivers: 'Motori ecologici e istituzionali', secStatus: 'Stato di persistenza',
      secEvidence: 'Qualità delle prove', secReadings: 'Letture',
      readingPrimary: 'Lettura principale', readingAlt: 'Controlettura / prospettiva alternativa',
      readingCost: "L'ombra / Il costo", secSources: 'Fonti',
      role_primary: 'primario', role_coupled: 'accoppiato', role_counter: 'opposto',
      conf: 'conf.', contestedTitle: 'Lettura contestata',
      tourStart: 'Fai il tour', tourReplay: 'Tour',
      next: 'Avanti', back: 'Indietro', skip: 'Salta', done: 'Capito',
    },
    values: { generosity:'Generosità', hospitality:'Ospitalità', solidarity:'Solidarietà', aggression:'Aggressività', honor:'Onore', piety:'Devozione', curiosity:'Curiosità', individualism:'Individualismo', collectivism:'Collettivismo', egalitarianism:'Egualitarismo', order:'Legge e ordine', hierarchy:'Gerarchia' },
    epochs: { hunter:'Cacciatori-raccoglitori', 'early-agr':'Agricoltura antica', bronze:'Età del bronzo', iron:'Età del ferro', axial:'Età assiale', imperial:'Imperi classici', medieval:'Medioevo', 'early-mod':'Prima età moderna', industrial:'Età industriale', modern:'Era moderna', now:'Presente' },
    threads: { all:'Tutte le regioni', arabia:'Arabia / Islamico', china:'Cina', india:'Asia meridionale', europe:'Europa / Atlantico', steppe:'Steppa eurasiatica', africa:'Africa subsahariana', americas:'Americhe' },
    drivers: { resource_scarcity:'Scarsità di risorse', pathogen_load:'Pressione dei patogeni', open_frontier:'Frontiera aperta', resource_competition:'Competizione per le risorse', metallurgy:'Metallurgia / ferro', maritime_expansion:'Espansione marittima', nomadic_mobility:'Mobilità nomade', weak_institutions:'Istituzioni deboli', kinship_intensity:'Intensità di parentela', hydraulic_coordination:'Coordinamento idraulico', institutional_scale:'Scala istituzionale', trade_networks:'Reti commerciali', literacy:'Alfabetizzazione / scrittura', monumental_religion:'Religione monumentale', military_revolution:'Rivoluzione militare', colonial_pressure:'Pressione coloniale', industrialization:'Industrializzazione', secularism_threat:'Minaccia del secolarismo', technological_surplus:'Surplus tecnologico' },
    status: { adaptive:{label:'Adattivo',desc:'Attualmente sostenuto da una pressione ecologica o istituzionale attiva.'}, residual:{label:'Residuo',desc:'Il motore originario è scomparso; il valore persiste come cultura, etichetta, identità o legge.'}, reactive:{label:'Reattivo',desc:'Emerso in opposizione a un altro valore o come correttivo di una norma dominante.'}, reactivated:{label:'Riattivato',desc:'Deliberatamente rianimato come marcatore identitario, spesso in risposta a una minaccia esterna.'} },
    evidence: { ethnographic:'etnografica', textual:'testuale', archaeological:'archeologica', inferred:'dedotta', speculative:'speculativa' },
    tour: [
      { title:'Benvenuto in Values Atlas', body:'Una mappa interattiva di come i valori umani — generosità, onore, devozione, curiosità — emergono e cambiano attraverso le civiltà e il tempo profondo. Ecco un breve tour.' },
      { title:'La mappa', body:'Ogni marcatore è un valore umano che mette radici in un luogo e un’epoca precisi. Marcatori più grandi e luminosi indicano che il valore ardeva più intenso lì.' },
      { title:'Tre lenti', body:'Ricolora l’intera mappa in base a ciò che ha plasmato i valori: Morale (i valori stessi), Ecologico (pressione ambientale) o Istituzionale (struttura sociale).' },
      { title:'Viaggia nel tempo', body:'Trascina la linea temporale o premi play per attraversare le epoche — dai cacciatori-raccoglitori a oggi — e vedere i valori sorgere e svanire.' },
      { title:'Filtra i valori', body:'Attiva o disattiva i singoli valori per concentrare la mappa su quelli che ti interessano.' },
      { title:'Segui una civiltà', body:'Scegli un filo per evidenziare una civiltà in ogni epoca e tracciare come i suoi valori sono mutati nei millenni.' },
      { title:'Apri una lettura', body:'Clicca un marcatore per un pannello approfondito: struttura dei valori, bussola ideologica, linea del lignaggio e la lettura accademica che vi sta dietro.' },
      { title:'Nella tua lingua', body:'Cambia l’interfaccia nella tua lingua in qualsiasi momento da qui. Benvenuto a bordo — inizia a esplorare.' },
    ],
  },

  // ─────────────────────────── CHINESE (SIMPLIFIED) ───────────────────────────
  zh: {
    ui: {
      subtitle: '多脉络文明连续性',
      lens_moral: '道德', lens_ecological: '生态', lens_institutional: '制度',
      followThread: '追踪一条脉络',
      followThreadDesc: '高亮一个跨越所有时代的连续文明，看它的价值观如何演变。',
      followThreadDescShort: '高亮一个跨越所有时代的文明。',
      values: '价值观', epochs: '时代',
      banner: '价值观是适应性技术 — 点击标记以阅读其生态背景',
      pointsInEpoch: '个本时代的点',
      controls: '控制', language: '语言',
      lensMoralTitle: '透镜：道德',
      lensMoralDesc: '标记按主要价值观着色并印有其符号。点击某个点查看其耦合与对立的价值观。',
      lensEcoTitle: '透镜：生态',
      lensEcoDesc: '按生态与物质压力着色。观察哪些价值观随之兴起。',
      lensInstTitle: '透镜：制度',
      lensInstDesc: '按制度结构着色。揭示价值观在弱体系与强体系中的不同变化。',
      markerHint: '点击标记以打开完整解读 →',
      secValueStructure: '价值结构', secCompass: '意识形态罗盘', lineage: '谱系',
      secDrivers: '生态与制度驱动因素', secStatus: '存续状态',
      secEvidence: '证据质量', secReadings: '解读',
      readingPrimary: '主要解读', readingAlt: '反向解读 / 另一视角',
      readingCost: '阴影 / 代价', secSources: '来源',
      role_primary: '主要', role_coupled: '耦合', role_counter: '对立',
      conf: '置信度', contestedTitle: '有争议的解读',
      tourStart: '开始导览', tourReplay: '导览',
      next: '下一步', back: '上一步', skip: '跳过', done: '明白了',
    },
    values: { generosity:'慷慨', hospitality:'好客', solidarity:'团结', aggression:'侵略', honor:'荣誉', piety:'虔诚', curiosity:'好奇', individualism:'个人主义', collectivism:'集体主义', egalitarianism:'平等主义', order:'法律与秩序', hierarchy:'等级制' },
    epochs: { hunter:'狩猎采集', 'early-agr':'早期农业', bronze:'青铜时代', iron:'铁器时代', axial:'轴心时代', imperial:'古典帝国', medieval:'中世纪', 'early-mod':'近代早期', industrial:'工业时代', modern:'现代', now:'当代' },
    threads: { all:'所有地区', arabia:'阿拉伯 / 伊斯兰', china:'中国', india:'南亚', europe:'欧洲 / 大西洋', steppe:'欧亚草原', africa:'撒哈拉以南非洲', americas:'美洲' },
    drivers: { resource_scarcity:'资源稀缺', pathogen_load:'病原体压力', open_frontier:'开放边疆', resource_competition:'资源竞争', metallurgy:'冶金 / 铁器', maritime_expansion:'海上扩张', nomadic_mobility:'游牧流动性', weak_institutions:'制度薄弱', kinship_intensity:'亲属关系强度', hydraulic_coordination:'水利协调', institutional_scale:'制度规模', trade_networks:'贸易网络', literacy:'识字 / 书写', monumental_religion:'纪念性宗教', military_revolution:'军事革命', colonial_pressure:'殖民压力', industrialization:'工业化', secularism_threat:'世俗化威胁', technological_surplus:'技术盈余' },
    status: { adaptive:{label:'适应性',desc:'目前由活跃的生态或制度压力驱动。'}, residual:{label:'残留',desc:'最初的驱动因素已消失；该价值观作为文化、礼仪、身份或法律而延续。'}, reactive:{label:'反应性',desc:'作为对另一价值观的对抗，或对主导规范的纠正而出现。'}, reactivated:{label:'再激活',desc:'被刻意复兴为身份标志，常常是为应对外部威胁。'} },
    evidence: { ethnographic:'民族志', textual:'文献', archaeological:'考古', inferred:'推断', speculative:'推测' },
    tour: [
      { title:'欢迎来到 Values Atlas', body:'一张互动地图，展示人类价值观——慷慨、荣誉、虔诚、好奇——如何跨越文明与漫长岁月而兴起与演变。这是一个简短的导览。' },
      { title:'地图', body:'每个标记都是一种人类价值观在特定地点与时代扎根。标记越大、越亮，表示该价值观在那里燃烧得越炽烈。' },
      { title:'三个透镜', body:'按塑造价值观的因素为整张地图重新着色：道德（价值观本身）、生态（环境压力）或制度（社会结构）。' },
      { title:'穿越时间', body:'拖动时间轴或点击播放，在各时代之间穿行——从狩猎采集者到今天——观看价值观的兴衰。' },
      { title:'筛选价值观', body:'开启或关闭单个价值观，让地图聚焦于你关心的那些。' },
      { title:'追踪一个文明', body:'选择一条脉络，高亮某一文明跨越每个时代，追溯其价值观在数千年间的演变。' },
      { title:'打开解读', body:'点击任意标记打开深度面板：价值结构、意识形态罗盘、谱系时间线以及背后的学术解读。' },
      { title:'用你的语言', body:'随时在此将界面切换为你的语言。欢迎加入——开始探索吧。' },
    ],
  },

  // ─────────────────────────── JAPANESE ───────────────────────────
  ja: {
    ui: {
      subtitle: '多系統的な文明の連続性',
      lens_moral: '道徳', lens_ecological: '生態', lens_institutional: '制度',
      followThread: '系統をたどる',
      followThreadDesc: 'すべての時代にわたる連続した文明を強調し、その価値観がどう変化したかを見る。',
      followThreadDescShort: 'すべての時代にわたる文明を強調する。',
      values: '価値観', epochs: '時代',
      banner: '価値観は適応的な技術です — マーカーをクリックしてその生態を読む',
      pointsInEpoch: 'この時代の地点',
      controls: 'コントロール', language: '言語',
      lensMoralTitle: 'レンズ：道徳',
      lensMoralDesc: 'マーカーは主要な価値観で色分けされ、その記号が刻まれています。点をクリックすると連動する価値観と対立する価値観が見られます。',
      lensEcoTitle: 'レンズ：生態',
      lensEcoDesc: '生態的・物質的な圧力で色分け。どの価値観がそれに応じて花開くかを観察します。',
      lensInstTitle: 'レンズ：制度',
      lensInstDesc: '制度構造で色分け。弱い体制と強い体制で価値観がどう変わるかを明らかにします。',
      markerHint: 'マーカーをクリックして全文を開く →',
      secValueStructure: '価値構造', secCompass: 'イデオロギーの羅針盤', lineage: '系譜',
      secDrivers: '生態的・制度的な要因', secStatus: '存続状態',
      secEvidence: '証拠の質', secReadings: '読み解き',
      readingPrimary: '主要な読み解き', readingAlt: '反対の読み / 別の視点',
      readingCost: '影 / 代償', secSources: '出典',
      role_primary: '主要', role_coupled: '連動', role_counter: '対立',
      conf: '信頼度', contestedTitle: '議論のある読み解き',
      tourStart: 'ツアーを始める', tourReplay: 'ツアー',
      next: '次へ', back: '戻る', skip: 'スキップ', done: '了解',
    },
    values: { generosity:'寛大さ', hospitality:'もてなし', solidarity:'連帯', aggression:'攻撃性', honor:'名誉', piety:'敬虔', curiosity:'好奇心', individualism:'個人主義', collectivism:'集団主義', egalitarianism:'平等主義', order:'法と秩序', hierarchy:'階層' },
    epochs: { hunter:'狩猟採集', 'early-agr':'初期農耕', bronze:'青銅器時代', iron:'鉄器時代', axial:'枢軸時代', imperial:'古典帝国', medieval:'中世', 'early-mod':'近世', industrial:'産業時代', modern:'近代', now:'現代' },
    threads: { all:'すべての地域', arabia:'アラビア / イスラム', china:'中国', india:'南アジア', europe:'ヨーロッパ / 大西洋', steppe:'ユーラシア草原', africa:'サハラ以南アフリカ', americas:'南北アメリカ' },
    drivers: { resource_scarcity:'資源の希少性', pathogen_load:'病原体の圧力', open_frontier:'開かれた辺境', resource_competition:'資源競争', metallurgy:'冶金 / 鉄', maritime_expansion:'海洋進出', nomadic_mobility:'遊牧の移動性', weak_institutions:'弱い制度', kinship_intensity:'親族関係の強さ', hydraulic_coordination:'治水の調整', institutional_scale:'制度の規模', trade_networks:'交易網', literacy:'識字 / 文字', monumental_religion:'記念碑的宗教', military_revolution:'軍事革命', colonial_pressure:'植民地の圧力', industrialization:'工業化', secularism_threat:'世俗主義の脅威', technological_surplus:'技術の余剰' },
    status: { adaptive:{label:'適応的',desc:'現在、生きた生態的または制度的な圧力によって駆動されている。'}, residual:{label:'残存',desc:'本来の要因は消えたが、価値観は文化・礼儀・アイデンティティ・法として残る。'}, reactive:{label:'反応的',desc:'別の価値観への対抗、または支配的な規範への是正として現れた。'}, reactivated:{label:'再活性化',desc:'しばしば外部の脅威への対応として、アイデンティティの印として意図的に復活した。'} },
    evidence: { ethnographic:'民族誌的', textual:'文献的', archaeological:'考古学的', inferred:'推測的', speculative:'臆測的' },
    tour: [
      { title:'Values Atlas へようこそ', body:'人間の価値観——寛大さ、名誉、敬虔、好奇心——が文明と深い時間を超えてどう生まれ変化するかを示すインタラクティブな地図です。簡単なツアーをどうぞ。' },
      { title:'地図', body:'各マーカーは、特定の場所と時代に根づいた人間の価値観です。大きく明るいマーカーほど、その価値観がそこで強く燃えていたことを意味します。' },
      { title:'3つのレンズ', body:'価値観を形づくったものに応じて地図全体を塗り替えます：道徳（価値観そのもの）、生態（環境の圧力）、制度（社会構造）。' },
      { title:'時間を旅する', body:'タイムラインをドラッグするか再生を押して、狩猟採集者から今日まで各時代を移動し、価値観の興亡を見ましょう。' },
      { title:'価値観を絞り込む', body:'個々の価値観をオン・オフして、気になるものに地図を集中させます。' },
      { title:'文明をたどる', body:'系統を選んで、ある文明をすべての時代で強調し、その価値観が数千年でどう変化したかを追います。' },
      { title:'読み解きを開く', body:'どのマーカーでもクリックすると、価値構造、イデオロギーの羅針盤、系譜のタイムライン、背後の学術的な読み解きの詳細パネルが開きます。' },
      { title:'あなたの言語で', body:'ここからいつでもインターフェースをあなたの言語に切り替えられます。ようこそ——さあ探索を始めましょう。' },
    ],
  },

  // ─────────────────────────── ARABIC ───────────────────────────
  ar: {
    ui: {
      subtitle: 'استمرارية حضارية متعددة المسارات',
      lens_moral: 'أخلاقي', lens_ecological: 'بيئي', lens_institutional: 'مؤسسي',
      followThread: 'تتبّع مسارًا',
      followThreadDesc: 'أبرِز حضارة متصلة عبر كل العصور لترى كيف تحوّلت قيمها.',
      followThreadDescShort: 'أبرِز حضارة عبر كل العصور.',
      values: 'القيم', epochs: 'العصور',
      banner: 'القيم تقنيات تكيّفية — انقر على علامة لقراءة بيئتها',
      pointsInEpoch: 'نقطة في هذا العصر',
      controls: 'التحكّم', language: 'اللغة',
      lensMoralTitle: 'العدسة: أخلاقي',
      lensMoralDesc: 'العلامات ملوّنة حسب القيمة الأساسية ومطبوعة برمزها. انقر على نقطة لرؤية قيمها المقترنة والمضادة.',
      lensEcoTitle: 'العدسة: بيئي',
      lensEcoDesc: 'ملوّنة حسب الضغط البيئي والمادي. راقب أي القيم تزدهر استجابةً لذلك.',
      lensInstTitle: 'العدسة: مؤسسي',
      lensInstDesc: 'ملوّنة حسب البنية المؤسسية. تكشف كيف تتغيّر القيم في الأنظمة الضعيفة مقابل القوية.',
      markerHint: 'انقر على العلامة لفتح القراءة الكاملة ←',
      secValueStructure: 'بنية القيم', secCompass: 'البوصلة الأيديولوجية', lineage: 'النسب',
      secDrivers: 'المحرّكات البيئية والمؤسسية', secStatus: 'حالة الاستمرار',
      secEvidence: 'جودة الأدلة', secReadings: 'القراءات',
      readingPrimary: 'القراءة الأساسية', readingAlt: 'قراءة مضادة / منظور بديل',
      readingCost: 'الظل / الكلفة', secSources: 'المصادر',
      role_primary: 'أساسية', role_coupled: 'مقترنة', role_counter: 'مضادة',
      conf: 'ثقة', contestedTitle: 'قراءة متنازَع عليها',
      tourStart: 'ابدأ الجولة', tourReplay: 'الجولة',
      next: 'التالي', back: 'السابق', skip: 'تخطّي', done: 'فهمت',
    },
    values: { generosity:'الكرم', hospitality:'الضيافة', solidarity:'التضامن', aggression:'العدوانية', honor:'الشرف', piety:'التقوى', curiosity:'الفضول', individualism:'الفردانية', collectivism:'الجماعية', egalitarianism:'المساواتية', order:'القانون والنظام', hierarchy:'التراتبية' },
    epochs: { hunter:'الصيد والجمع', 'early-agr':'الزراعة المبكرة', bronze:'العصر البرونزي', iron:'العصر الحديدي', axial:'العصر المحوري', imperial:'الإمبراطوريات الكلاسيكية', medieval:'العصور الوسطى', 'early-mod':'بداية العصر الحديث', industrial:'العصر الصناعي', modern:'العصر الحديث', now:'الحاضر' },
    threads: { all:'كل المناطق', arabia:'العرب / الإسلامي', china:'الصين', india:'جنوب آسيا', europe:'أوروبا / الأطلسي', steppe:'السهوب الأوراسية', africa:'أفريقيا جنوب الصحراء', americas:'الأمريكتان' },
    drivers: { resource_scarcity:'ندرة الموارد', pathogen_load:'ضغط الأمراض', open_frontier:'حدود مفتوحة', resource_competition:'التنافس على الموارد', metallurgy:'التعدين / الحديد', maritime_expansion:'التوسّع البحري', nomadic_mobility:'التنقّل البدوي', weak_institutions:'مؤسسات ضعيفة', kinship_intensity:'كثافة القرابة', hydraulic_coordination:'التنسيق المائي', institutional_scale:'الحجم المؤسسي', trade_networks:'شبكات التجارة', literacy:'القراءة / الكتابة', monumental_religion:'الدين الضخم', military_revolution:'الثورة العسكرية', colonial_pressure:'الضغط الاستعماري', industrialization:'التصنيع', secularism_threat:'تهديد العلمانية', technological_surplus:'الفائض التقني' },
    status: { adaptive:{label:'تكيّفي',desc:'مدفوع حاليًا بضغط بيئي أو مؤسسي حي.'}, residual:{label:'متبقٍّ',desc:'اختفى المحرّك الأصلي؛ وتستمر القيمة كثقافة أو آداب أو هوية أو قانون.'}, reactive:{label:'تفاعلي',desc:'نشأ في مواجهة قيمة أخرى أو كتصحيح لعُرف مهيمن.'}, reactivated:{label:'مُعاد تنشيطه',desc:'أُحيي عمدًا كعلامة هوية، غالبًا ردًّا على تهديد خارجي.'} },
    evidence: { ethnographic:'إثنوغرافي', textual:'نصّي', archaeological:'أثري', inferred:'مُستنتَج', speculative:'تخميني' },
    tour: [
      { title:'مرحبًا بك في Values Atlas', body:'خريطة تفاعلية لكيفية نشوء القيم الإنسانية — الكرم والشرف والتقوى والفضول — وتحوّلها عبر الحضارات والزمن العميق. إليك جولة سريعة.' },
      { title:'الخريطة', body:'كل علامة هي قيمة إنسانية تتجذّر في مكان وعصر محدّدين. العلامات الأكبر والأكثر سطوعًا تعني أن القيمة اشتعلت هناك بقوة أكبر.' },
      { title:'ثلاث عدسات', body:'أعد تلوين الخريطة كلها وفق ما شكّل القيم: أخلاقي (القيم ذاتها) أو بيئي (الضغط البيئي) أو مؤسسي (البنية الاجتماعية).' },
      { title:'سافر عبر الزمن', body:'اسحب الخط الزمني أو اضغط تشغيل للتنقّل بين العصور — من الصيّادين الجامعين إلى اليوم — وشاهد القيم تنهض وتخبو.' },
      { title:'صفِّ القيم', body:'فعّل أو عطّل قيمًا مفردة لتركيز الخريطة على ما يهمّك.' },
      { title:'تتبّع حضارة', body:'اختر مسارًا لإبراز حضارة عبر كل عصر وتتبّع كيف تحوّلت قيمها عبر آلاف السنين.' },
      { title:'افتح قراءة', body:'انقر على أي علامة للوحة عميقة: بنية القيم والبوصلة الأيديولوجية وخط النسب والقراءة العلمية وراءها.' },
      { title:'بلغتك', body:'بدّل الواجهة إلى لغتك في أي وقت من هنا. أهلًا بك — ابدأ الاستكشاف.' },
    ],
  },

  // ─────────────────────────── HINDI ───────────────────────────
  hi: {
    ui: {
      subtitle: 'बहु-धारा सभ्यतागत निरंतरता',
      lens_moral: 'नैतिक', lens_ecological: 'पारिस्थितिक', lens_institutional: 'संस्थागत',
      followThread: 'एक धारा का अनुसरण करें',
      followThreadDesc: 'सभी युगों में एक सतत सभ्यता को उजागर करें और देखें कि उसके मूल्य कैसे बदले।',
      followThreadDescShort: 'सभी युगों में एक सभ्यता को उजागर करें।',
      values: 'मूल्य', epochs: 'युग',
      banner: 'मूल्य अनुकूली तकनीकें हैं — किसी चिह्न पर क्लिक करके उसकी पारिस्थितिकी पढ़ें',
      pointsInEpoch: 'इस युग में बिंदु',
      controls: 'नियंत्रण', language: 'भाषा',
      lensMoralTitle: 'लेंस: नैतिक',
      lensMoralDesc: 'चिह्न प्राथमिक मूल्य के अनुसार रंगे और उसके प्रतीक से अंकित हैं। युग्मित और विरोधी मूल्य देखने के लिए किसी बिंदु पर क्लिक करें।',
      lensEcoTitle: 'लेंस: पारिस्थितिक',
      lensEcoDesc: 'पारिस्थितिक और भौतिक दबाव के अनुसार रंगा गया। देखें कि प्रतिक्रिया में कौन-से मूल्य फलते-फूलते हैं।',
      lensInstTitle: 'लेंस: संस्थागत',
      lensInstDesc: 'संस्थागत संरचना के अनुसार रंगा गया। दर्शाता है कि कमज़ोर बनाम मज़बूत व्यवस्थाओं में मूल्य कैसे बदलते हैं।',
      markerHint: 'पूरी व्याख्या खोलने के लिए चिह्न पर क्लिक करें →',
      secValueStructure: 'मूल्य संरचना', secCompass: 'वैचारिक दिक्सूचक', lineage: 'वंशक्रम',
      secDrivers: 'पारिस्थितिक और संस्थागत चालक', secStatus: 'निरंतरता स्थिति',
      secEvidence: 'साक्ष्य की गुणवत्ता', secReadings: 'व्याख्याएँ',
      readingPrimary: 'प्राथमिक व्याख्या', readingAlt: 'विपरीत व्याख्या / वैकल्पिक दृष्टिकोण',
      readingCost: 'छाया / कीमत', secSources: 'स्रोत',
      role_primary: 'प्राथमिक', role_coupled: 'युग्मित', role_counter: 'विरोधी',
      conf: 'विश्वास', contestedTitle: 'विवादित व्याख्या',
      tourStart: 'भ्रमण शुरू करें', tourReplay: 'भ्रमण',
      next: 'अगला', back: 'पीछे', skip: 'छोड़ें', done: 'समझ गया',
    },
    values: { generosity:'उदारता', hospitality:'आतिथ्य', solidarity:'एकजुटता', aggression:'आक्रामकता', honor:'सम्मान', piety:'भक्ति', curiosity:'जिज्ञासा', individualism:'व्यक्तिवाद', collectivism:'सामूहिकता', egalitarianism:'समतावाद', order:'कानून और व्यवस्था', hierarchy:'पदानुक्रम' },
    epochs: { hunter:'शिकारी-संग्राहक', 'early-agr':'आरंभिक कृषि', bronze:'कांस्य युग', iron:'लौह युग', axial:'अक्षीय युग', imperial:'शास्त्रीय साम्राज्य', medieval:'मध्यकालीन', 'early-mod':'आरंभिक आधुनिक', industrial:'औद्योगिक युग', modern:'आधुनिक युग', now:'वर्तमान' },
    threads: { all:'सभी क्षेत्र', arabia:'अरब / इस्लामी', china:'चीन', india:'दक्षिण एशिया', europe:'यूरोप / अटलांटिक', steppe:'यूरेशियाई स्तेपी', africa:'उप-सहारा अफ्रीका', americas:'अमेरिका' },
    drivers: { resource_scarcity:'संसाधन की कमी', pathogen_load:'रोगाणु दबाव', open_frontier:'खुली सीमा', resource_competition:'संसाधन प्रतिस्पर्धा', metallurgy:'धातुकर्म / लोहा', maritime_expansion:'समुद्री विस्तार', nomadic_mobility:'खानाबदोश गतिशीलता', weak_institutions:'कमज़ोर संस्थाएँ', kinship_intensity:'नातेदारी की सघनता', hydraulic_coordination:'जल समन्वय', institutional_scale:'संस्थागत पैमाना', trade_networks:'व्यापार नेटवर्क', literacy:'साक्षरता / लेखन', monumental_religion:'स्मारकीय धर्म', military_revolution:'सैन्य क्रांति', colonial_pressure:'औपनिवेशिक दबाव', industrialization:'औद्योगीकरण', secularism_threat:'धर्मनिरपेक्षता का खतरा', technological_surplus:'तकनीकी अधिशेष' },
    status: { adaptive:{label:'अनुकूली',desc:'वर्तमान में किसी सक्रिय पारिस्थितिक या संस्थागत दबाव से संचालित।'}, residual:{label:'अवशिष्ट',desc:'मूल चालक समाप्त हो गया; मूल्य संस्कृति, शिष्टाचार, पहचान या कानून के रूप में बना रहता है।'}, reactive:{label:'प्रतिक्रियात्मक',desc:'किसी अन्य मूल्य के विरोध में या प्रमुख मानक के सुधार के रूप में उभरा।'}, reactivated:{label:'पुनः सक्रिय',desc:'अक्सर किसी बाहरी खतरे के जवाब में, पहचान के प्रतीक के रूप में जानबूझकर पुनर्जीवित।'} },
    evidence: { ethnographic:'नृवंशवैज्ञानिक', textual:'पाठ्य', archaeological:'पुरातात्विक', inferred:'अनुमानित', speculative:'काल्पनिक' },
    tour: [
      { title:'Values Atlas में आपका स्वागत है', body:'यह एक इंटरैक्टिव मानचित्र है कि मानवीय मूल्य — उदारता, सम्मान, भक्ति, जिज्ञासा — सभ्यताओं और गहन समय में कैसे उभरते और बदलते हैं। यह एक संक्षिप्त भ्रमण है।' },
      { title:'मानचित्र', body:'हर चिह्न एक मानवीय मूल्य है जो किसी विशिष्ट स्थान और युग में जड़ें जमा रहा है। बड़े, चमकीले चिह्न दर्शाते हैं कि वहाँ वह मूल्य अधिक प्रबल था।' },
      { title:'तीन लेंस', body:'पूरे मानचित्र को इस आधार पर पुनः रंगें कि मूल्यों को किसने आकार दिया: नैतिक (स्वयं मूल्य), पारिस्थितिक (पर्यावरणीय दबाव) या संस्थागत (सामाजिक संरचना)।' },
      { title:'समय में यात्रा करें', body:'समयरेखा खींचें या प्ले दबाएँ ताकि युगों के बीच — शिकारी-संग्राहकों से लेकर आज तक — घूम सकें और मूल्यों का उदय व पतन देख सकें।' },
      { title:'मूल्यों को छाँटें', body:'मानचित्र को अपने पसंदीदा मूल्यों पर केंद्रित करने के लिए अलग-अलग मूल्यों को चालू या बंद करें।' },
      { title:'किसी सभ्यता का अनुसरण करें', body:'एक धारा चुनें ताकि किसी सभ्यता को हर युग में उजागर कर सकें और सहस्राब्दियों में उसके मूल्यों का बदलाव देख सकें।' },
      { title:'एक व्याख्या खोलें', body:'किसी भी चिह्न पर क्लिक करें — मूल्य संरचना, वैचारिक दिक्सूचक, वंशक्रम समयरेखा और उसके पीछे की विद्वत्तापूर्ण व्याख्या वाला विस्तृत पैनल।' },
      { title:'आपकी भाषा में', body:'यहाँ से कभी भी इंटरफ़ेस को अपनी भाषा में बदलें। स्वागत है — अन्वेषण शुरू करें।' },
    ],
  },

  // ─────────────────────────── RUSSIAN ───────────────────────────
  ru: {
    ui: {
      subtitle: 'Многолинейная цивилизационная преемственность',
      lens_moral: 'Моральная', lens_ecological: 'Экологическая', lens_institutional: 'Институциональная',
      followThread: 'Проследить линию',
      followThreadDesc: 'Выделите непрерывную цивилизацию через все эпохи, чтобы увидеть, как менялись её ценности.',
      followThreadDescShort: 'Выделите цивилизацию через все эпохи.',
      values: 'Ценности', epochs: 'Эпохи',
      banner: 'Ценности — это адаптивные технологии. Нажмите на маркер, чтобы прочитать его экологию',
      pointsInEpoch: 'точек в этой эпохе',
      controls: 'Управление', language: 'Язык',
      lensMoralTitle: 'Линза: Моральная',
      lensMoralDesc: 'Маркеры окрашены по основной ценности и помечены её символом. Нажмите на точку, чтобы увидеть связанные и противоположные ценности.',
      lensEcoTitle: 'Линза: Экологическая',
      lensEcoDesc: 'Окрашено по экологическому и материальному давлению. Смотрите, какие ценности расцветают в ответ.',
      lensInstTitle: 'Линза: Институциональная',
      lensInstDesc: 'Окрашено по институциональной структуре. Показывает, как ценности меняются в слабых и сильных системах.',
      markerHint: 'Нажмите на маркер, чтобы открыть полное прочтение →',
      secValueStructure: 'Структура ценностей', secCompass: 'Идеологический компас', lineage: 'Родословная',
      secDrivers: 'Экологические и институциональные факторы', secStatus: 'Статус сохранения',
      secEvidence: 'Качество свидетельств', secReadings: 'Прочтения',
      readingPrimary: 'Основное прочтение', readingAlt: 'Контр-прочтение / иной взгляд',
      readingCost: 'Тень / Цена', secSources: 'Источники',
      role_primary: 'основная', role_coupled: 'связанная', role_counter: 'противоположная',
      conf: 'увер.', contestedTitle: 'Спорное прочтение',
      tourStart: 'Пройти тур', tourReplay: 'Тур',
      next: 'Далее', back: 'Назад', skip: 'Пропустить', done: 'Понятно',
    },
    values: { generosity:'Щедрость', hospitality:'Гостеприимство', solidarity:'Солидарность', aggression:'Агрессия', honor:'Честь', piety:'Благочестие', curiosity:'Любопытство', individualism:'Индивидуализм', collectivism:'Коллективизм', egalitarianism:'Эгалитаризм', order:'Закон и порядок', hierarchy:'Иерархия' },
    epochs: { hunter:'Охотники-собиратели', 'early-agr':'Раннее земледелие', bronze:'Бронзовый век', iron:'Железный век', axial:'Осевое время', imperial:'Классические империи', medieval:'Средневековье', 'early-mod':'Раннее Новое время', industrial:'Индустриальная эпоха', modern:'Новейшее время', now:'Настоящее' },
    threads: { all:'Все регионы', arabia:'Аравия / Исламский мир', china:'Китай', india:'Южная Азия', europe:'Европа / Атлантика', steppe:'Евразийская степь', africa:'Африка южнее Сахары', americas:'Америки' },
    drivers: { resource_scarcity:'Нехватка ресурсов', pathogen_load:'Давление патогенов', open_frontier:'Открытый фронтир', resource_competition:'Конкуренция за ресурсы', metallurgy:'Металлургия / железо', maritime_expansion:'Морская экспансия', nomadic_mobility:'Кочевая мобильность', weak_institutions:'Слабые институты', kinship_intensity:'Интенсивность родства', hydraulic_coordination:'Гидравлическая координация', institutional_scale:'Институциональный масштаб', trade_networks:'Торговые сети', literacy:'Грамотность / письмо', monumental_religion:'Монументальная религия', military_revolution:'Военная революция', colonial_pressure:'Колониальное давление', industrialization:'Индустриализация', secularism_threat:'Угроза секуляризма', technological_surplus:'Технологический избыток' },
    status: { adaptive:{label:'Адаптивная',desc:'В настоящее время поддерживается живым экологическим или институциональным давлением.'}, residual:{label:'Остаточная',desc:'Исходный фактор исчез; ценность сохраняется как культура, этикет, идентичность или закон.'}, reactive:{label:'Реактивная',desc:'Возникла в противовес другой ценности или как поправка к господствующей норме.'}, reactivated:{label:'Реактивированная',desc:'Намеренно возрождена как маркер идентичности, часто в ответ на внешнюю угрозу.'} },
    evidence: { ethnographic:'этнографическое', textual:'текстуальное', archaeological:'археологическое', inferred:'предполагаемое', speculative:'спекулятивное' },
    tour: [
      { title:'Добро пожаловать в Values Atlas', body:'Интерактивная карта того, как человеческие ценности — щедрость, честь, благочестие, любопытство — возникают и меняются сквозь цивилизации и глубокое время. Вот краткий тур.' },
      { title:'Карта', body:'Каждый маркер — это человеческая ценность, укореняющаяся в конкретном месте и эпохе. Чем крупнее и ярче маркер, тем сильнее там горела эта ценность.' },
      { title:'Три линзы', body:'Перекрасьте всю карту по тому, что формировало ценности: Моральная (сами ценности), Экологическая (давление среды) или Институциональная (социальная структура).' },
      { title:'Путешествие во времени', body:'Перетаскивайте шкалу времени или нажмите воспроизведение, чтобы двигаться по эпохам — от охотников-собирателей до наших дней — и видеть взлёт и угасание ценностей.' },
      { title:'Фильтр ценностей', body:'Включайте и выключайте отдельные ценности, чтобы сосредоточить карту на тех, что важны вам.' },
      { title:'Проследить цивилизацию', body:'Выберите линию, чтобы выделить одну цивилизацию во все эпохи и проследить, как её ценности менялись на протяжении тысячелетий.' },
      { title:'Открыть прочтение', body:'Нажмите на любой маркер для подробной панели: структура ценностей, идеологический компас, шкала родословной и научное прочтение за ней.' },
      { title:'На вашем языке', body:'Переключайте интерфейс на свой язык в любой момент отсюда. Добро пожаловать — начните исследование.' },
    ],
  },
};

// ───────────────────────────── RUNTIME ─────────────────────────────
let lang = 'en';

export function getLang(): string { return lang; }
export function isRTL(): boolean { return RTL_LANGS.has(lang); }

export function setLang(code: string): string {
  lang = DICT[code] ? code : 'en';
  try { localStorage.setItem('va_lang', lang); } catch { /* ignore */ }
  document.documentElement.lang = lang;
  document.documentElement.dir = isRTL() ? 'rtl' : 'ltr';
  return lang;
}

export function initLang(): string {
  let saved: string | null = null;
  try { saved = localStorage.getItem('va_lang'); } catch { /* ignore */ }
  if (!saved) {
    const nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    saved = DICT[nav] ? nav : 'en';
  }
  return setLang(saved);
}

function pick(group: keyof LangPack, id: string): string {
  const grp = DICT[lang] && (DICT[lang][group] as Record<string, string> | undefined);
  const cur = grp && grp[id];
  if (cur != null) return cur as string;
  const enGrp = DICT.en[group] as Record<string, string> | undefined;
  const en = enGrp && enGrp[id];
  return en != null ? (en as string) : id;
}

export function t(key: string): string { return pick('ui', key); }
export function tValue(id: string): string { return pick('values', id); }
export function tDriver(id: string): string { return pick('drivers', id); }
export function tEpoch(id: string): string { return pick('epochs', id); }
export function tThread(id: string): string { return pick('threads', id); }
export function tEvidence(id: string): string { return pick('evidence', id); }
export function tAspect(id: string): string { return pick('aspects', id); }
export function tStatus(id: string): StatusEntry {
  const cur = DICT[lang] && DICT[lang].status && DICT[lang].status[id];
  return cur || DICT.en.status[id] || { label: id, desc: '' };
}
export function getTour(): TourStep[] { return (DICT[lang] && DICT[lang].tour) || DICT.en.tour; }
