# Akins Shop Assistant — Etsy Satıcı MCP'si

**Dil:** [English](README.md) · Türkçe

Etsy mağazanızı, uzaktan MCP ve OAuth bağlantısını destekleyen ChatGPT veya Claude gibi bir asistan üzerinden yönetin. Her satıcı **kendi Etsy hesabıyla** giriş yaparak mağaza verilerini inceleyebilir, taslak ilan oluşturup düzenleyebilir, desteklenen dosyaları yükleyebilir ve temel satış özetlerini görebilir. Bu depo, bağlantıyı sağlayan Cloudflare Worker'ın kaynak kodunu içerir. Etsy, OpenAI veya Anthropic'in resmî ürünü değildir.

> **Kaynak kod ile çalışan hizmet farklıdır:** Bu GitHub deposu yazılımın kodudur; `etsy.akins.app` adresindeki MCP sunucusu ise çalışan hizmettir. Kodun paylaşılması hizmeti, Etsy hesabınızı veya siparişlerinizi herkese açık hâle getirmez. Depoda canlı ortamın gizli anahtarları, OAuth kayıtları, alıcı bilgileri, demo ürün görselleri veya tamamlanmamış herkese açık eklenti başvuru paketi bulunmaz.

## Barındırılan MCP sunucusuna bağlanma

Kimlik doğrulamalı sunucu adresi **`https://etsy.akins.app/seller/mcp`**. HTTPS üzerinden standart uzaktan MCP ve OAuth kullanır; sunucu tek bir yapay zekâ şirketine özel değildir. İstemcilerin araçları sunma biçimi, dosya desteği ve OAuth davranışı farklılaşabilir. ChatGPT bağlantısı satıcı işlemlerinde kullanılmıştır; **Claude ile tam giriş ve araç akışı henüz doğrulanmamıştır**.

### ChatGPT

ChatGPT hesabınız veya çalışma alanınız özel MCP eklentilerini destekliyorsa:

1. [ChatGPT Plugins](https://chatgpt.com/plugins) sayfasında **Add custom MCP server** seçeneğini açın.
2. Ad olarak **Akins Shop Assistant**, sunucu adresi olarak `https://etsy.akins.app/seller/mcp` girin.
3. Sunulan OAuth bağlantısını seçin, izinleri inceleyin ve **kendi Etsy satıcı hesabınızla** giriş yapın. Etsy şifrenizi, API anahtarınızı veya shared secret'ınızı sohbete yazmayın.
4. Oluşan kişisel eklentiyi yükleyin. Yeni bir Work sohbetinde `@` ile seçip örneğin “Taslak ilanlarımı göster” diye sorun.

Ekranlar ve erişim, ChatGPT hesabınıza veya çalışma alanı politikasına göre değişebilir. Güncel akış için [OpenAI'nin bağlantı rehberine](https://developers.openai.com/plugins/deploy/connect-chatgpt) bakın. Bu kişisel bağlantı, eklentinin herkese açık dizinde yayımlandığı anlamına gelmez.

### Claude

Anthropic, özel bağlayıcılar yoluyla uzaktan MCP'yi destekler. Uygun bir Claude hesabında:

1. **Customize → Connectors → + Add → Add custom connector** yolunu açın. Team veya Enterprise hesabında önce kurum sahibi ya da yetkili yönetici **Organization settings → Connectors** üzerinden bağlayıcıyı eklemelidir.
2. Ad olarak **Akins Shop Assistant**, uzaktan MCP adresi olarak `https://etsy.akins.app/seller/mcp` girin.
3. Algılanan kimlik doğrulama ayarlarını inceleyin, satıcı araçları için “No sign in” yerine OAuth ile giriş seçin ve **kendi** Etsy satıcı hesabınızı yetkilendirin. Etsy bilgilerinizi sabit istek başlığına veya sohbete yazmayın.
4. Bağlayıcıyı sohbet için etkinleştirip önce “Bağlı Etsy mağazam hangisi?” gibi salt okunur bir istekle başlayın.

Ekranlar farklıysa [Anthropic'in güncel özel bağlayıcı rehberini](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp) izleyin. Claude'un uzaktan bağlayıcısı, yerel Claude Desktop MCP yapılandırmasından farklıdır. **Bu sunucunun Claude'a özgü OAuth, araç çağrısı ve dosya yükleme akışı henüz uçtan uca test edilmemiştir.**

Önce yalnızca okuma gerektiren isteklerle başlayın. Değişiklik yapmadan önce `get_connected_shop` sonucundaki mağazanın size ait olduğunu doğrulayın. Örnek sorular:

- “Hangi Etsy mağazam bağlı ve hangi taslak ilanlarım var?”
- “Bugün kaç ücretli sipariş oluştu? Benim saat dilimimi kullan, satış uydurma.”
- “Bu taslağı incele; ben yayımlamadan önce neler eksik, söyle.”
- “Bir taslak ilan hazırlamama yardım et; eksik ürün bilgilerini önce bana sor.”
- “Onayladığım taslağa eklediğim görseli yükle.”

Bağlantıyı kaldırmak için bağlı mağaza kimliğini doğrulayıp `disconnect_shop` aracını kullanabilirsiniz. Ayrıca kullandığınız MCP istemcisindeki (ChatGPT veya Claude) bağlantıyı kaldırın ve Etsy'nin bağlı uygulama ayarlarından erişimi iptal edin. Ayrıntılar için [destek](https://etsy.akins.app/support) ve [gizlilik](https://etsy.akins.app/privacy) sayfalarına bakın.

## Yapabildikleri ve sınırları

Kimlik doğrulamalı satıcı sunucusunda **38 araç** bulunur. Ayrı bir uç nokta olan `https://etsy.akins.app/mcp` yalnızca herkese açık ilan araması ve tek ilan görüntüleme sunar; özel satıcı verilerine erişemez.

| Alan | Desteklenen işlemler | Önemli sınır |
| --- | --- | --- |
| Mağaza | Mağaza bilgileri, yorumlar, kargo/işleme profilleri, iade politikaları ve bölümleri okuma; tanıtım metni ve bölümleri düzenleme | Metin/bölüm değişiklikleri Etsy'nin `shops_w` iznini gerektirir |
| Siparişler | Bağlı satıcının siparişlerini ve kalemlerini listeleme/inceleme | Alıcı ve sipariş içeriği özeldir; güvenilmeyen veri olarak ele alınmalıdır |
| İlanlar | İlanları, kategori ağacını, özellikleri, stok/varyasyonları, kişiselleştirmeyi, görselleri ve dijital dosyaları inceleme | İlan okuma ve yazma işlemlerinde bağlı mağaza sahipliği kontrol edilir |
| Taslaklar | Taslak oluşturma; desteklenen alanları, etiketleri ve malzemeleri düzenleme; görsel veya dijital ürün dosyası yükleme; temel taslak kontrolü | Taslak **yayımlanmaz**; kontrol listesi Etsy'nin son doğrulamasının yerini tutmaz |
| Satış ve araştırma | Temel ücretli sipariş toplamları, ilan satış özetleri, herkese açık ilan araştırması ve pazarlama kontrolleri | Kâr, reklam katkısı, trafik, anahtar kelime hacmi veya dönüşüm oranı sonucu üretmez |

İlan yayımlama, ilanı kalıcı silme, siparişi “gönderildi” işaretleme, alıcılara mesaj gönderme, reklam yönetimi ve Etsy kupon/kampanya oluşturma **bu MCP üzerinden yapılamaz**. Bu işlemleri Etsy Shop Manager'da tamamlayın. Desteklenen bazı yazma araçları tüm stok veya kişiselleştirme listesini değiştirebilir: onaylamadan önce mevcut değerleri okuyup yeni listenin tamamını gözden geçirin.

Dosya yükleme **istemciye özgüdür**. ChatGPT'de oluşturulan veya eklenen görseller için `upload_listing_image_file` kullanılabilir: `openai/fileParams` meta verisi ve indirme alan adı izin listesi ChatGPT'nin verdiği **dosya referansını** bekler; yerel dosya yolu veya rastgele internet adresi kabul etmez. Claude bu ChatGPT dosya referansı biçimini sağlamaz; bu araçla Claude'dan doğrudan görsel/dosya yüklenebileceğini varsaymayın. MCP istemcisi kodlanmış baytları gönderebiliyorsa `upload_listing_image` base64 yedek yoludur; Claude'da uçtan uca doğrulanmamıştır. Sunucu dosya içeriği/boyutunu kontrol eder; Etsy yüklemeyi yine reddedebilir.

Uygulama şu Etsy izinlerini ister: `shops_r shops_w listings_r listings_w transactions_r`. Her satıcı kendi Etsy OAuth akışıyla ayrıca izin verir. Barındırılan hizmete verilmiş Commercial/API erişimi, başka birinin kuracağı sunucuya **aktarılmaz**.

## Cloudflare Workers üzerinde kendiniz kurun

Bu bölüm **kendi** Etsy uygulamasını ve alan adını kullanan geliştiriciler içindir; Akins'in barındırdığı hizmeti değiştirmez. Cloudflare hesabı, özel Worker alan adı için Cloudflare üzerindeki bir alan adı, gerekli erişime sahip Etsy Developer uygulaması ve Wrangler ile uyumlu Node.js/npm ortamı gerekir. Gerçek satıcıları bağlamadan önce [Etsy OAuth belgelerini](https://developers.etsy.com/documentation/essentials/authentication/) okuyun.

1. Bağımlılıkları kurup Cloudflare hesabınıza giriş yapın:

   ```sh
   npm ci
   npx wrangler login
   ```

2. `wrangler.example.jsonc` dosyasını `wrangler.jsonc` adıyla kopyalayın. İkinci dosya bilerek Git dışında tutulur. **Yeni** Worker adı, kendi alan adınız ve tam `ETSY_REDIRECT_URI` adresinizi girin. `OAUTH_KV` bağlaması için Cloudflare Workers KV alanı oluşturup `REPLACE_WITH_YOUR_KV_NAMESPACE_ID` yerine onun kimliğini yazın. Limit sayaçlarını başka Worker'larla paylaşmak istemiyorsanız her hız sınırı bağlamasına Cloudflare hesabınızda benzersiz, pozitif tamsayı niteliğinde bir `namespace_id` verin. Örnek kimlikler bu deponun sahip olduğu kaynaklar değildir. Bkz. [Cloudflare KV komutları](https://developers.cloudflare.com/workers/wrangler/commands/kv/) ve [hız sınırı bağlamaları](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).

3. `src/seller.ts` içindeki Akins'e özgü OAuth kaynak ve yetkilendirme sunucusu adreslerini kendi adreslerinizle değiştirin. `src/site.ts` içindeki yayıncı kimliğini, iletişim adresini, gizlilik politikasını ve şartları **gerçek hizmet ve veri uygulamalarınıza** göre düzenleyin. Akins'in hukuki/iletişim metinlerini kendinize aitmiş gibi kopyalamayın. `https://ALAN_ADINIZ/etsy/callback` adresini Etsy Developer uygulamanıza tam eşleşecek şekilde kaydedin.

4. Dağıtımdan önce doğrulayın:

   ```sh
   npm run typecheck
   npm test
   npx wrangler deploy --dry-run
   ```

   `npm run typecheck`, yerel Worker yapılandırmanızdan `worker-configuration.d.ts` dosyasını üretir; bu dosya Git'e alınmaz. Mevcut testler sahiplik kontrolünü ve herkese açık uç noktanın hız sınırı ret yollarını kapsar. İki satıcıyla uçtan uca OAuth veya bütün yazma araçları için test yerine geçmez.

5. Worker'ı dağıtın. Ardından Etsy uygulama bilgilerini Wrangler'ın **etkileşimli istemiyle** Cloudflare Worker secret olarak kaydedin:

   ```sh
   npm run deploy
   npx wrangler secret put ETSY_KEYSTRING
   npx wrangler secret put ETSY_SHARED_SECRET
   ```

   Gizli değerleri komut argümanına, README'ye, ekran görüntüsüne, commit'e, MCP istemcisinin bağlantı formuna veya `wrangler.jsonc` içine yazmayın. Secret değişiklikleri yeni Worker sürümü oluşturabilir. Kurulumdan sonra `https://ALAN_ADINIZ/health`, bilgi sayfaları, OAuth keşfi ve bir satıcı bağlantısını doğrulayın. Fork'unuzu `etsy.akins.app` adresine yönlendirmeyin veya onun Worker/KV kaynaklarını kullanmayın.

6. `https://ALAN_ADINIZ/seller/mcp` adresini OAuth destekleyen bir MCP istemcisine bağlayın. Önce okuma araçlarını deneyin; taslak yazma işlemleri için ayrı bir test mağazası kullanın. Her satıcı kendi hesabını ayrı ayrı yetkilendirmelidir.

Herkese açık bilgi sayfaları `/about`, `/support`, `/privacy` ve `/terms` yollarındadır. Salt okunur açık arama MCP'si `/mcp`, kimlik doğrulamalı satıcı MCP'si `/seller/mcp`, Etsy OAuth dönüş yolu `/etsy/callback` adresindedir.

## Güvenlik, gizlilik ve geliştirme durumu

- Satıcı MCP'si `etsy:manage` kapsamlı OAuth gerektirir. Satıcı/mağaza kimliği modelin verdiği mağaza numarasından değil, yetkilendirilmiş Etsy oturumundan alınır. İlan ve sipariş sahipliği kontrolleri ilgili okuma/yazma işlemlerini korur.
- Etsy açıklamaları, yorumlar, sipariş notları ve alıcı metinleri komut gibi görünen içerik barındırabilir. Bunlar asistana talimat değil, **veridir**. Sunucu yalnızca sabit Etsy API yollarını kullanır ve bu içerikten rastgele URL indirmez.
- Araç açıklamaları ve sohbet içi onay, **kesin bir insan onayı güvenlik sınırı değildir**. Desteklenen yazma araçları mağaza içeriğini değiştirebilir. Yayımlama, kalıcı silme ve gönderim işaretleme özellikle MCP dışında bırakılmıştır. Önerilen her değişikliği kendiniz inceleyin.
- OAuth belirteçleri Cloudflare OAuth sağlayıcısının KV destekli akışıyla tutulur; bu depo canlı belirteç deposunu içermez. Barındırılan hizmetin veri uygulamaları [gizlilik politikasında](https://etsy.akins.app/privacy) anlatılır. Kendi sunucusunu işletenler doğru bir politika yayımlamalıdır.
- Açık arama IP ve Cloudflare konumu bazında sınırlandırılır. Bu, kötüye kullanımı azaltır ancak dünya genelinde kesin bir Etsy API kotası değildir.
- Otomatik kontroller: `npm test` ve `npm run typecheck`. İkinci satıcıyla tam giriş, Claude OAuth/araç akışı ve tüm yazma araçları **henüz uçtan uca doğrulanmadı**. Bu, aktif geliştirilen bir entegrasyondur; her Etsy mağazası veya MCP istemcisi yapılandırmasının çalışacağı garantisi yoktur.

Bir güvenlik açığı bulursanız [SECURITY.md](SECURITY.md) dosyasındaki özel bildirim yolunu kullanın; belirteç veya alıcı verisi göndermeyin.

## Depo yapısı

| Yol | Görev |
| --- | --- |
| `src/seller.ts` | Satıcı OAuth akışı, Etsy API çağrıları ve kimlik doğrulamalı MCP araçları |
| `src/index.ts` | Salt okunur açık MCP ve sağlık denetimi |
| `src/site.ts` | Barındırılan bilgi ve hukuki sayfalar |
| `src/ownership.ts` | Mağaza ve sipariş sahipliği kontrolleri |
| `tests/` | Mevcut otomatik testler |
| `wrangler.example.jsonc` | Kopyalanıp özelleştirilecek Worker yapılandırması |
| `LICENSE`, `SECURITY.md` | MIT lisansı ve özel güvenlik bildirimi |

## Sorun giderme

- **OAuth dönüş adresi hatası:** Etsy'ye kaydettiğiniz adresi `ETSY_REDIRECT_URI` ile karakter karakter karşılaştırın. Worker alan adını ve `src/seller.ts` içindeki kaynak/yetkilendirme adreslerini kontrol edin.
- **Bağlama veya secret eksik:** Yerel `wrangler.jsonc` dosyanızda `OAUTH_KV` ve iki hız sınırı bağlamasının bulunduğunu kontrol edin. İki Etsy bilgisinin de doğru Worker için secret olarak kaydedildiğini doğrulayın; değerleri ekrana basmayın.
- **Görsel yükleme reddedildi:** ChatGPT'de `upload_listing_image_file` aracına yerel dosya yolu değil, ChatGPT dosya referansı verin. Claude'da bu araca özel ChatGPT referansı desteklenmez; istemcinin sağladığı base64 verisiyle `upload_listing_image` olası bir yoldur ancak doğrulanmamıştır. Görsel türünü, boyutu ve Etsy yanıtını kontrol edin.
- **Araç yetki eksik diyor:** Satıcının yeniden bağlanıp istenen Etsy izinlerini onaylaması gerekebilir. Somut ihtiyaç olmadan daha geniş izin eklemeyin.

## Lisans

[MIT Lisansı](LICENSE) altında yayımlanır. Etsy, ChatGPT, OpenAI, Claude, Anthropic ve Cloudflare adları ilgili sahiplerinin ticari markalarıdır.
