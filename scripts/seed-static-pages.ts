import { Client, Databases, ID, Permission, Role, Query } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const endpoint = process.env.APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID || '69580ea2002ecc4ff8e1';
const apiKey = process.env.APPWRITE_API_KEY || '';
const databaseId = process.env.APPWRITE_DATABASE_ID || process.env.VITE_APPWRITE_DATABASE_ID || 'anacan';

if (!apiKey) {
  console.error('❌ APPWRITE_API_KEY is required in .env.local');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

interface StaticPage {
  slug: string;
  title_az: string;
  title_ru: string;
  content_az: string;
  content_ru: string;
  meta_title_az?: string;
  meta_title_ru?: string;
  meta_description_az?: string;
  meta_description_ru?: string;
  order: number;
}

const staticPages: StaticPage[] = [
  {
    slug: 'haqqimizda',
    title_az: 'Haqqımızda',
    title_ru: 'О нас',
    content_az: `
      <div class="prose prose-lg max-w-none">
        <h1>Haqqımızda</h1>
        <p>Anacan.az - Azərbaycanda analıq və uşaq baxımı mövzusunda ən böyük və etibarlı online platformadır.</p>
        
        <h2>Bizim Missiyamız</h2>
        <p>Bizim missiyamız hər bir ananın və ailənin həyatını asanlaşdırmaq, peşəkar məsləhətlər və dəstək təmin etməkdir. Platformamız hamiləlikdən uşaq tərbiyəsinə qədər bütün mərhələlərdə sizə kömək edir.</p>
        
        <h2>Bizim Dəyərlərimiz</h2>
        <ul>
          <li><strong>Etibarlılıq:</strong> Bütün məzmunumuz peşəkar mütəxəssislər tərəfindən yoxlanılır</li>
          <li><strong>Müasirlik:</strong> Ən son elmi tədqiqatlar və tövsiyələrlə işləyirik</li>
          <li><strong>İnkluzivlik:</strong> Hər kəs üçün əlçatan və faydalı məzmun yaradırıq</li>
          <li><strong>Dəstək:</strong> 24/7 sizə kömək etməyə hazırıq</li>
        </ul>
        
        <h2>Komandamız</h2>
        <p>Komandamız təcrübəli həkimlər, psixoloqlar, tərbiyəçilər və məzmun yaradıcılarından ibarətdir. Hər birimiz analıq və uşaq baxımı sahəsində ən yüksək keyfiyyətli məzmun təqdim etmək üçün çalışırıq.</p>
        
        <h2>Bizimlə Əlaqə</h2>
        <p>Suallarınız və təklifləriniz üçün bizimlə əlaqə saxlayın:</p>
        <ul>
          <li>Email: info@anacan.az</li>
          <li>Telefon: +994 XX XXX XX XX</li>
        </ul>
      </div>
    `,
    content_ru: `
      <div class="prose prose-lg max-w-none">
        <h1>О нас</h1>
        <p>Anacan.az - крупнейшая и надежная онлайн-платформа по материнству и уходу за детьми в Азербайджане.</p>
        
        <h2>Наша Миссия</h2>
        <p>Наша миссия - облегчить жизнь каждой мамы и семьи, предоставляя профессиональные советы и поддержку. Наша платформа помогает вам на всех этапах - от беременности до воспитания детей.</p>
        
        <h2>Наши Ценности</h2>
        <ul>
          <li><strong>Надежность:</strong> Весь наш контент проверяется профессиональными экспертами</li>
          <li><strong>Современность:</strong> Мы работаем с последними научными исследованиями и рекомендациями</li>
          <li><strong>Инклюзивность:</strong> Мы создаем доступный и полезный контент для всех</li>
          <li><strong>Поддержка:</strong> Мы готовы помочь вам 24/7</li>
        </ul>
        
        <h2>Наша Команда</h2>
        <p>Наша команда состоит из опытных врачей, психологов, педагогов и создателей контента. Каждый из нас работает над предоставлением контента высочайшего качества в области материнства и ухода за детьми.</p>
        
        <h2>Свяжитесь с нами</h2>
        <p>Для вопросов и предложений свяжитесь с нами:</p>
        <ul>
          <li>Email: info@anacan.az</li>
          <li>Телефон: +994 XX XXX XX XX</li>
        </ul>
      </div>
    `,
    meta_title_az: 'Haqqımızda - Anacan.az',
    meta_title_ru: 'О нас - Anacan.az',
    meta_description_az: 'Anacan.az haqqında məlumat. Azərbaycanda analıq və uşaq baxımı platforması.',
    meta_description_ru: 'Информация о Anacan.az. Платформа по материнству и уходу за детьми в Азербайджане.',
    order: 1,
  },
  {
    slug: 'elaqe',
    title_az: 'Əlaqə',
    title_ru: 'Контакты',
    content_az: `
      <div class="prose prose-lg max-w-none">
        <h1>Bizimlə Əlaqə</h1>
        <p>Bizimlə əlaqə saxlayın. Suallarınız, təklifləriniz və ya şikayətləriniz üçün bizə yazın.</p>
        
        <h2>Əlaqə Məlumatları</h2>
        <ul>
          <li><strong>Email:</strong> info@anacan.az</li>
          <li><strong>Telefon:</strong> +994 XX XXX XX XX</li>
          <li><strong>Ünvan:</strong> Bakı, Azərbaycan</li>
        </ul>
        
        <h2>İş Saatları</h2>
        <p>Bazar ertəsidən Cümə axşamına qədər: 09:00 - 18:00</p>
        <p>Şənbə və Bazar: Qapalı</p>
        
        <h2>Bizə Yazın</h2>
        <p>Email göndərmək üçün: info@anacan.az</p>
        <p>Biz adətən 24 saat ərzində cavab veririk.</p>
      </div>
    `,
    content_ru: `
      <div class="prose prose-lg max-w-none">
        <h1>Свяжитесь с нами</h1>
        <p>Свяжитесь с нами. Напишите нам для вопросов, предложений или жалоб.</p>
        
        <h2>Контактная Информация</h2>
        <ul>
          <li><strong>Email:</strong> info@anacan.az</li>
          <li><strong>Телефон:</strong> +994 XX XXX XX XX</li>
          <li><strong>Адрес:</strong> Баку, Азербайджан</li>
        </ul>
        
        <h2>Часы Работы</h2>
        <p>С понедельника по пятницу: 09:00 - 18:00</p>
        <p>Суббота и Воскресенье: Закрыто</p>
        
        <h2>Напишите нам</h2>
        <p>Для отправки email: info@anacan.az</p>
        <p>Обычно мы отвечаем в течение 24 часов.</p>
      </div>
    `,
    meta_title_az: 'Əlaqə - Anacan.az',
    meta_title_ru: 'Контакты - Anacan.az',
    meta_description_az: 'Anacan.az ilə əlaqə saxlayın. Email, telefon və ünvan məlumatları.',
    meta_description_ru: 'Свяжитесь с Anacan.az. Информация об email, телефоне и адресе.',
    order: 2,
  },
  {
    slug: 'mexfilik',
    title_az: 'Məxfilik Siyasəti',
    title_ru: 'Политика Конфиденциальности',
    content_az: `
      <div class="prose prose-lg max-w-none">
        <h1>Məxfilik Siyasəti</h1>
        <p>Son yenilənmə: ${new Date().toLocaleDateString('az-AZ')}</p>
        
        <h2>1. Ümumi Məlumat</h2>
        <p>Anacan.az istifadəçilərinin məxfiliyyətinə hörmət edir və şəxsi məlumatların qorunmasına ciddi yanaşır.</p>
        
        <h2>2. Toplanan Məlumatlar</h2>
        <p>Biz aşağıdakı məlumatları toplaya bilərik:</p>
        <ul>
          <li>Ad, soyad, email ünvanı</li>
          <li>İstifadə məlumatları (IP ünvanı, brauzer növü)</li>
          <li>Məzmunla qarşılıqlı əlaqə məlumatları</li>
        </ul>
        
        <h2>3. Məlumatların İstifadəsi</h2>
        <p>Toplanan məlumatlar aşağıdakı məqsədlər üçün istifadə olunur:</p>
        <ul>
          <li>Xidmətlərimizi təkmilləşdirmək</li>
          <li>İstifadəçilərə fərdiləşdirilmiş məzmun təqdim etmək</li>
          <li>Texniki dəstək göstərmək</li>
        </ul>
        
        <h2>4. Məlumatların Paylaşılması</h2>
        <p>Biz şəxsi məlumatlarınızı üçüncü tərəflərlə paylaşmırıq, istisna olaraq qanuni tələblər olduqda.</p>
        
        <h2>5. Cookie-lər</h2>
        <p>Saytımız istifadəçi təcrübəsini yaxşılaşdırmaq üçün cookie-lərdən istifadə edir.</p>
        
        <h2>6. Məlumatların Qorunması</h2>
        <p>Biz məlumatlarınızı qorumaq üçün müasir təhlükəsizlik tədbirləri tətbiq edirik.</p>
        
        <h2>7. Hüquqlarınız</h2>
        <p>İstifadəçilər öz məlumatlarına daxil olmaq, dəyişdirmək və ya silmək hüququna malikdirlər.</p>
        
        <h2>8. Bizimlə Əlaqə</h2>
        <p>Məxfilik məsələləri ilə bağlı suallarınız üçün: info@anacan.az</p>
      </div>
    `,
    content_ru: `
      <div class="prose prose-lg max-w-none">
        <h1>Политика Конфиденциальности</h1>
        <p>Последнее обновление: ${new Date().toLocaleDateString('ru-RU')}</p>
        
        <h2>1. Общая Информация</h2>
        <p>Anacan.az уважает конфиденциальность пользователей и серьезно относится к защите личных данных.</p>
        
        <h2>2. Собираемая Информация</h2>
        <p>Мы можем собирать следующую информацию:</p>
        <ul>
          <li>Имя, фамилия, email адрес</li>
          <li>Данные об использовании (IP адрес, тип браузера)</li>
          <li>Данные о взаимодействии с контентом</li>
        </ul>
        
        <h2>3. Использование Данных</h2>
        <p>Собранные данные используются для следующих целей:</p>
        <ul>
          <li>Улучшение наших услуг</li>
          <li>Предоставление персонализированного контента пользователям</li>
          <li>Оказание технической поддержки</li>
        </ul>
        
        <h2>4. Передача Данных</h2>
        <p>Мы не передаем ваши личные данные третьим лицам, за исключением случаев, когда это требуется по закону.</p>
        
        <h2>5. Cookie</h2>
        <p>Наш сайт использует cookie для улучшения пользовательского опыта.</p>
        
        <h2>6. Защита Данных</h2>
        <p>Мы применяем современные меры безопасности для защиты ваших данных.</p>
        
        <h2>7. Ваши Права</h2>
        <p>Пользователи имеют право на доступ, изменение или удаление своих данных.</p>
        
        <h2>8. Свяжитесь с нами</h2>
        <p>По вопросам конфиденциальности: info@anacan.az</p>
      </div>
    `,
    meta_title_az: 'Məxfilik Siyasəti - Anacan.az',
    meta_title_ru: 'Политика Конфиденциальности - Anacan.az',
    meta_description_az: 'Anacan.az məxfilik siyasəti. Şəxsi məlumatların qorunması və istifadəsi.',
    meta_description_ru: 'Политика конфиденциальности Anacan.az. Защита и использование личных данных.',
    order: 3,
  },
  {
    slug: 'istifade-qaydalari',
    title_az: 'İstifadə Qaydaları',
    title_ru: 'Условия Использования',
    content_az: `
      <div class="prose prose-lg max-w-none">
        <h1>İstifadə Qaydaları</h1>
        <p>Son yenilənmə: ${new Date().toLocaleDateString('az-AZ')}</p>
        
        <h2>1. Qəbul</h2>
        <p>Anacan.az saytından istifadə etməklə siz bu istifadə qaydalarını qəbul etmiş olursunuz.</p>
        
        <h2>2. Xidmətlərdən İstifadə</h2>
        <p>Saytımızın məzmunu yalnız məlumat məqsədi ilə təqdim olunur. Məzmun peşəkar məsləhət yerinə keçmir.</p>
        
        <h2>3. İstifadəçi Məsuliyyəti</h2>
        <p>İstifadəçilər məzmunu düzgün və qanuni məqsədlər üçün istifadə etməyə məsuldurlar.</p>
        
        <h2>4. Məzmun Hüquqları</h2>
        <p>Saytda yerləşdirilən bütün məzmun Anacan.az-ın mülkiyyətidir və müəllif hüquqları ilə qorunur.</p>
        
        <h2>5. Məhdudiyyətlər</h2>
        <p>Saytın məzmununu kopyalamaq, paylaşmaq və ya ticarət məqsədi ilə istifadə etmək qadağandır.</p>
        
        <h2>6. Dəyişikliklər</h2>
        <p>Biz istənilən vaxt istifadə qaydalarını dəyişdirmək hüququnu özümüzdə saxlayırıq.</p>
        
        <h2>7. Əlaqə</h2>
        <p>Suallarınız üçün: info@anacan.az</p>
      </div>
    `,
    content_ru: `
      <div class="prose prose-lg max-w-none">
        <h1>Условия Использования</h1>
        <p>Последнее обновление: ${new Date().toLocaleDateString('ru-RU')}</p>
        
        <h2>1. Принятие</h2>
        <p>Используя сайт Anacan.az, вы принимаете эти условия использования.</p>
        
        <h2>2. Использование Услуг</h2>
        <p>Контент нашего сайта предоставляется только в информационных целях. Контент не заменяет профессиональную консультацию.</p>
        
        <h2>3. Ответственность Пользователя</h2>
        <p>Пользователи несут ответственность за использование контента в правильных и законных целях.</p>
        
        <h2>4. Права на Контент</h2>
        <p>Весь контент, размещенный на сайте, является собственностью Anacan.az и защищен авторским правом.</p>
        
        <h2>5. Ограничения</h2>
        <p>Запрещается копировать, распространять или использовать контент сайта в коммерческих целях.</p>
        
        <h2>6. Изменения</h2>
        <p>Мы оставляем за собой право изменять условия использования в любое время.</p>
        
        <h2>7. Контакты</h2>
        <p>По вопросам: info@anacan.az</p>
      </div>
    `,
    meta_title_az: 'İstifadə Qaydaları - Anacan.az',
    meta_title_ru: 'Условия Использования - Anacan.az',
    meta_description_az: 'Anacan.az istifadə qaydaları. Saytın istifadəsi və məsuliyyət.',
    meta_description_ru: 'Условия использования Anacan.az. Использование сайта и ответственность.',
    order: 4,
  },
  {
    slug: 'gizlilik',
    title_az: 'Gizlilik Siyasəti',
    title_ru: 'Политика Безопасности',
    content_az: `
      <div class="prose prose-lg max-w-none">
        <h1>Gizlilik Siyasəti</h1>
        <p>Son yenilənmə: ${new Date().toLocaleDateString('az-AZ')}</p>
        
        <h2>1. Məlumatların Toplanması</h2>
        <p>Biz yalnız xidmətlərimizi təkmilləşdirmək üçün lazım olan məlumatları toplayırıq.</p>
        
        <h2>2. Məlumatların Qorunması</h2>
        <p>Bütün məlumatlar şifrələnmiş formada saxlanılır və qorunur.</p>
        
        <h2>3. Cookie Siyasəti</h2>
        <p>Saytımız istifadəçi təcrübəsini yaxşılaşdırmaq üçün cookie-lərdən istifadə edir.</p>
        
        <h2>4. Üçüncü Tərəf Xidmətləri</h2>
        <p>Biz etibarlı üçüncü tərəf xidmətlərindən istifadə edirik və onların məxfilik siyasətlərinə riayət edirik.</p>
        
        <h2>5. Uşaqların Məxfilik</h2>
        <p>Biz 13 yaşdan kiçik uşaqlardan məlumat toplamırıq.</p>
        
        <h2>6. Dəyişikliklər</h2>
        <p>Bu siyasətdə dəyişikliklər saytda dərc olunacaq.</p>
        
        <h2>7. Əlaqə</h2>
        <p>Suallarınız üçün: info@anacan.az</p>
      </div>
    `,
    content_ru: `
      <div class="prose prose-lg max-w-none">
        <h1>Политика Безопасности</h1>
        <p>Последнее обновление: ${new Date().toLocaleDateString('ru-RU')}</p>
        
        <h2>1. Сбор Информации</h2>
        <p>Мы собираем только ту информацию, которая необходима для улучшения наших услуг.</p>
        
        <h2>2. Защита Данных</h2>
        <p>Все данные хранятся и защищаются в зашифрованном виде.</p>
        
        <h2>3. Политика Cookie</h2>
        <p>Наш сайт использует cookie для улучшения пользовательского опыта.</p>
        
        <h2>4. Сторонние Сервисы</h2>
        <p>Мы используем надежные сторонние сервисы и соблюдаем их политику конфиденциальности.</p>
        
        <h2>5. Конфиденциальность Детей</h2>
        <p>Мы не собираем информацию от детей младше 13 лет.</p>
        
        <h2>6. Изменения</h2>
        <p>Изменения в этой политике будут опубликованы на сайте.</p>
        
        <h2>7. Контакты</h2>
        <p>По вопросам: info@anacan.az</p>
      </div>
    `,
    meta_title_az: 'Gizlilik Siyasəti - Anacan.az',
    meta_title_ru: 'Политика Безопасности - Anacan.az',
    meta_description_az: 'Anacan.az gizlilik siyasəti. Məlumatların qorunması və təhlükəsizlik.',
    meta_description_ru: 'Политика безопасности Anacan.az. Защита данных и безопасность.',
    order: 5,
  },
];

async function ensurePageAttributes() {
  try {
    // Try to get collection attributes to check if is_published exists
    const attributes = await databases.listAttributes(databaseId, 'pages');
    const hasIsPublished = attributes.attributes.some((attr: any) => attr.key === 'is_published');
    
    if (!hasIsPublished) {
      console.log('⚠️  Creating missing is_published attribute...');
      try {
        await databases.createBooleanAttribute(
          databaseId,
          'pages',
          'is_published',
          false, // optional (not required)
          undefined // no default value
        );
        console.log('✅ Created is_published attribute');
        // Wait a bit for attribute to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (createError: any) {
        if (createError.code === 409) {
          console.log('⚠️  Attribute already exists');
        } else {
          console.error('⚠️  Could not create is_published attribute:', createError.message);
        }
      }
      
      // Also check/create order attribute
      const hasOrder = attributes.attributes.some((attr: any) => attr.key === 'order');
      if (!hasOrder) {
        try {
          await databases.createIntegerAttribute(
            databaseId,
            'pages',
            'order',
            false, // optional
            undefined, // default
            undefined, // min
            undefined  // max
          );
          console.log('✅ Created order attribute');
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (createError: any) {
          if (createError.code === 409) {
            console.log('⚠️  Order attribute already exists');
          } else {
            console.error('⚠️  Could not create order attribute:', createError.message);
          }
        }
      }
    }
  } catch (error: any) {
    // Collection might not exist or other error
    console.error('⚠️  Could not check is_published attribute:', error.message);
    console.log('⚠️  Will try to create pages without is_published attribute');
  }
}

async function seedStaticPages() {
  console.log('🚀 Seeding static pages...\n');

  // Ensure required attributes exist
  await ensurePageAttributes();

  for (const page of staticPages) {
    try {
      // Check if page already exists
      const existing = await databases.listDocuments(
        databaseId,
        'pages',
        [Query.equal('slug', page.slug)]
      );

      if (existing.documents.length > 0) {
        console.log(`⚠️  Page '${page.slug}' already exists, skipping...`);
        continue;
      }

      // Create page document - check which attributes exist
      const pageData: any = {
        slug: page.slug,
        title_az: page.title_az,
        title_ru: page.title_ru,
        content_az: page.content_az,
        content_ru: page.content_ru,
      };

      // Add optional meta fields
      if (page.meta_title_az) pageData.meta_title_az = page.meta_title_az;
      if (page.meta_title_ru) pageData.meta_title_ru = page.meta_title_ru;
      if (page.meta_description_az) pageData.meta_description_az = page.meta_description_az;
      if (page.meta_description_ru) pageData.meta_description_ru = page.meta_description_ru;

      // Check which optional attributes exist before adding them
      try {
        const attributes = await databases.listAttributes(databaseId, 'pages');
        const attrKeys = attributes.attributes.map((attr: any) => attr.key);
        
        if (attrKeys.includes('is_published')) {
          pageData.is_published = true;
        }
        
        if (attrKeys.includes('order')) {
          pageData.order = page.order || 0;
        }
      } catch {
        // If we can't check, skip optional attributes
      }

      await databases.createDocument(
        databaseId,
        'pages',
        ID.unique(),
        pageData,
        [
          Permission.read(Role.any()),
          Permission.write(Role.users()),
          Permission.delete(Role.users()),
        ]
      );

      console.log(`✅ Created page: ${page.title_az} (${page.slug})`);
    } catch (error: any) {
      if (error.code === 409) {
        console.log(`⚠️  Page '${page.slug}' already exists`);
      } else {
        console.error(`❌ Error creating page '${page.slug}':`, error.message);
      }
    }
  }

  console.log('\n✨ Static pages seeding completed!');
}

seedStaticPages().catch(console.error);

