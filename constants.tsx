
import { BlogPost } from './types';

// Changed to string[] as these are just names/keys used for display or filtering in some contexts
export const CATEGORIES: string[] = ['Hamiləlik', 'Körpə', 'Tərbiyə', 'Sağlamlıq', 'Özünə Qulluq'];

export const VISUAL_CATEGORIES = [
  { id: 'pregnancy', name: 'Hamiləlik', icon: '🤰', color: 'bg-pink-100 text-pink-600', filter: 'Hamiləlik' },
  { id: 'baby', name: 'Körpə', icon: '👶', color: 'bg-blue-100 text-blue-600', filter: 'Körpə' },
  { id: 'parenting', name: 'Tərbiyə', icon: '👨‍👩‍👧', color: 'bg-green-100 text-green-600', filter: 'Tərbiyə' },
  { id: 'health', name: 'Sağlamlıq', icon: '🩺', color: 'bg-red-100 text-red-600', filter: 'Sağlamlıq' },
  { id: 'selfcare', name: 'Özünə Qulluq', icon: '🧘‍♀️', color: 'bg-purple-100 text-purple-600', filter: 'Özünə Qulluq' },
];

export const FEATURES = [
  {
    title: 'Elmi yanaşma',
    desc: 'Bütün məqalələr pediatr və psixoloqlar tərəfindən yoxlanılır.',
    icon: '🧬'
  },
  {
    title: 'Səmimi icma',
    desc: 'Minlərlə ana bir-birinə dəstək olur və təcrübə bölüşür.',
    icon: '❤️'
  },
  {
    title: '24/7 Dəstək',
    desc: 'Süni zəka köməkçimiz hər zaman suallarınızı cavablayır.',
    icon: '🤖'
  }
];

export const SAMPLE_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'first-trimester-tips',
    title: {
      az: 'Hamiləliyin ilk trimestrində nələrə diqqət etməli?',
      ru: 'На что обратить внимание в первом триместре беременности?'
    },
    excerpt: {
      az: 'Hamiləliyin ilk aylarında bədəndə baş verən dəyişikliklər və qidalanma qaydaları haqqında ətraflı məlumat.',
      ru: 'Подробная информация об изменениях в организме и правилах питания в первые месяцы беременности.'
    },
    content: {
      az: `Hamiləliyin ilk trimestri (1-13-cü həftələr) həm həyəcanlı, həm də çətin bir dövrdür. Bu müddət ərzində bədəninizdə böyük dəyişikliklər baş verir.\n\n### Qidalanma\nFol turşusu qəbuluna başlamaq ən vacib addımlardan biridir. Həmçinin, kifayət qədər su içmək və az-az, amma tez-tez yemək ürəkbulanmaları azaltmağa kömək edə bilər.\n\n### İstirahət\nBu dövrdə bədəniniz bir insan böyütmək üçün çox enerji sərf edir. Özünüzü yorğun hiss etməyiniz normaldır. Gündəlik yuxu rejiminizə diqqət yetirin.\n\n### Həkim Nəzarəti\nHamiləliyin təsdiqlənməsindən dərhal sonra həkim müayinəsindən keçmək və lazımi analizləri vermək vacibdir.`,
      ru: `Первый триместр (1-13 недели) — это волнительный и сложный период.\n\n### Питание\nПрием фолиевой кислоты очень важен. Пейте достаточно воды.\n\n### Отдых\nВаш организм тратит много энергии. Отдыхайте чаще.`
    },
    categoryId: '1', // Matches 'pregnancy' in db
    author: 'Dr. Sevinc Əliyeva',
    published_at: '2024-03-15T10:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1518104593124-ac2e82a5eb9d?auto=format&fit=crop&q=80&w=800',
    readTime: 5,
    tags: [],
    isFeatured: true,
    status: 'published'
  },
  {
    id: '2',
    slug: 'newborn-sleep',
    title: {
      az: 'Yeni doğulmuş körpələrdə yuxu rejimi',
      ru: 'Режим сна у новорожденных'
    },
    excerpt: {
      az: 'Körpənizin sağlam böyüməsi üçün yuxu rejiminin düzgün qurulması çox vakibdir. Faydalı məsləhətlər burada.',
      ru: 'Правильный режим сна очень важен для здорового роста вашего ребенка.'
    },
    content: {
      az: `Körpələr ilk aylarda günün böyük hissəsini (təxminən 16-18 saat) yataraq keçirirlər. Lakin bu yuxu adətən qısa fasilələrlə olur.\n\n### Yuxu Mühiti\nOtağın temperaturu 20-22 dərəcə olmalıdır. Beşikdə artıq oyuncaq və ya qalın yorğan olmamasına diqqət edin.\n\n### Gecə və Gündüz Fərqi\nGündüzlər otağın işıqlı olmasına, gecələr isə qaranlıq və sakit olmasına çalışın. Bu, körpənin bioloji saatının qurulmasına kömək edir.`,
      ru: `В первые месяцы младенцы спят большую часть дня (около 16-18 часов)...\n\n### Среда для сна\nТемпература в комнате должна быть 20-22 градуса.`
    },
    categoryId: '2', // Matches 'baby' in db
    author: 'Günay Məmmədova',
    published_at: '2024-03-12T10:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800',
    readTime: 7,
    tags: [],
    isFeatured: false,
    status: 'published'
  },
  {
    id: '3',
    slug: 'emotional-intelligence',
    title: {
      az: 'Uşaqlarda emosional zəkanın inkişafı',
      ru: 'Развитие эмоционального интеллекта у детей'
    },
    excerpt: {
      az: 'Uşağınızın hisslərini anlaması və onları idarə etməsi üçün valideynlər nə etməlidir?',
      ru: 'Что должны делать родители, чтобы ребенок понимал свои чувства?'
    },
    content: {
      az: `Emosional zəka (EQ) uşağın gələcək həyatındakı uğurunun təməlidir. Hisslərini tanıyan uşaqlar daha özünəinamlı olurlar.\n\n### Hissləri Adlandırın\nUşağınız kədərli olanda "Sən indi kədərlisən, çünki oyuncağın qırıldı" deyərək onun hissini adlandırmağa kömək edin.\n\n### Empatiya\nOnun hisslərini kiçiltməyin. "Buna görə ağlamağa dəyməz" demək əvəzinə, onu anladığınızı hiss etdirin.`,
      ru: `Эмоциональный интеллект (EQ) — основа будущего успеха ребенка...`
    },
    categoryId: '3', // Matches 'parenting' in db
    author: 'Psixoloq Leyla Həsənova',
    published_at: '2024-03-10T10:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=800',
    readTime: 6,
    tags: [],
    isFeatured: false,
    status: 'published'
  },
  {
    id: '4',
    slug: 'mom-workout-15min',
    title: {
      az: 'Analar üçün 15 dəqiqəlik sürətli idman hərəkətləri',
      ru: '15-минутная тренировка для мам'
    },
    excerpt: {
      az: 'Günün sıx qrafikində özünüzə vaxt ayırmağın ən asan yolu. Ev şəraitində məşq.',
      ru: 'Самый простой способ найти время для себя в плотном графике.'
    },
    content: {
      az: `Bir ana üçün vaxt ən dəyərli resursdur. Lakin öz sağlamlığınız körpənizin sağlamlığı qədər vacibdir.\n\n### İsinmə (2 dəqiqə)\nYerində yürüş və qolların fırladılması.\n\n### Əsas Hərəkətlər (10 dəqiqə)\n- Squat (çömçəlmə)\n- Plank (dayaq duruşu)\n- Lunges (addımlama)\n\n### Soyuma (3 dəqiqə)\nNəfəs hərəkətləri və əzələlərin dartılması.`,
      ru: `Время — самый ценный ресурс для мамы...`
    },
    categoryId: '5', // Matches 'selfcare' in db
    author: 'Aysel Rzayeva',
    published_at: '2024-03-08T10:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
    readTime: 4,
    tags: [],
    isFeatured: false,
    status: 'published'
  },
  {
    id: '5',
    slug: 'healthy-kids-snacks',
    title: {
      az: 'Uşaq menyusu: Sağlam qəlyanaltı ideyaları',
      ru: 'Детское меню: Идеи здоровых перекусов'
    },
    excerpt: {
      az: 'Məktəb və bağça üçün həm ləzzətli, həm də vitaminlərlə zəngin 5 fərqli resept.',
      ru: '5 вкусных и богатых витаминами рецептов для школы и сада.'
    },
    content: {
      az: `Uşaqların enerji səviyyəsini sabit saxlamaq üçün düzgün qəlyanaltılar şərtdir.\n\n1. Meyvə qurusu və çərəz qarışığı.\n2. Ev üsulu yulaf barları.\n3. Yoqurt və təzə meyvə salatı.\n4. Pendirli tam buğda sendviçləri.`,
      ru: `Правильные перекусы необходимы для поддержания уровня энергии детей...`
    },
    categoryId: '4', // Matches 'health' in db
    author: 'Dr. Nigar Qasımova',
    published_at: '2024-03-05T10:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800',
    readTime: 8,
    tags: [],
    isFeatured: false,
    status: 'published'
  }
];

export const TESTIMONIALS = [
  {
    id: '1',
    name: 'Fidan Əliyeva',
    role: '2 uşaq anası',
    text: 'Anacan.az mənim üçün sadəcə bir blog deyil, hər gün yeni nəsə öyrəndiyim bir məktəbdir. AI məsləhətçisi isə inanılmaz dərəcədə faydalıdır!',
    avatar: 'https://i.pravatar.cc/150?u=fidan'
  },
  {
    id: '2',
    name: 'Nərmin Məmmədova',
    role: 'Gənc ana',
    text: 'Hamiləliyimin ilk günündən bəri bütün suallarıma cavabı burada tapıram. Məqalələr çox asan oxunur və peşəkar səviyyədədir.',
    avatar: 'https://i.pravatar.cc/150?u=nermin'
  }
];

export const UI_STRINGS = {
  heroTitle: 'Anacan.az — Səninlə bu yolda birgəyik',
  heroSubtitle: 'Azərbaycanın ən müasir ana platforması. Hamiləlikdən uşaq tərbiyəsinə qədər hər şey burada.',
  readMore: 'Oxumağa davam et',
  categories: 'Kateqoriyalar',
  latestPosts: 'Son Yazılar',
  featuredPost: 'Günün Seçimi',
  aiAdvisorTitle: 'Süni Zəka "Ana Məsləhəti"',
  aiAdvisorPlaceholder: 'Uşağınızın qidalanması və ya tərbiyəsi haqqında sual verin...',
  askAi: 'Məsləhət al',
  footerText: 'Anacan.az — Analıq yolculuğunda ən yaxın köməkçin. Tezliklə mobil tətbiqimizdə!',
  comingSoon: 'Mobil tətbiqimiz çox yaxında!',
  subscribe: 'Abunə ol',
  newsletterTitle: 'Yeniliklərdən xəbərdar olun',
  newsletterSubtitle: 'Hər həftə ən yaxşı məqalələri birbaşa e-poçtunuza göndərək.',
  searchPlaceholder: 'Mövzu və ya açar söz axtarın...',
  testimonialsTitle: 'Analarımız nə deyir?',
  backToBlog: 'Bloqa qayıt',
  downloadApp: 'Tətbiqi Yüklə',
  allCategories: 'Hamısı'
};
