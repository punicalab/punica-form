# Punica Form yol haritası: kalan zayıflıklar

Durum (2026-11-21): Faz 1 yayınlandı (`@punica/form` ve `@punica/form-service` 2.1.1, `@punica/form-react` 0.1.1,
`@punica/form-kit` 0.2.0, `@punica/form-mcp` 0.3.1). Faz 2, 3, 4 ve 5 aday sürüm olarak `next` etiketiyle yayında:
`@punica/form` ve `@punica/form-service` 2.2.0-next.0, `@punica/form-react` 0.2.0-next.0, `@punica/form-kit` 0.3.0-next.0,
`@punica/form-json` 0.1.0-next.0, `@punica/form-mcp` 0.4.0-next.0. Depo aday sürüm modunda; kararlı 2.2.0 için
`changeset pre exit` gerekir. Dizi alanları (Faz 6) 2.3.0'a kaldı. Doküman sitesi 2.2 için henüz güncellenmedi.

## Konum

Punica Form genel amaçlı form kütüphanesi olarak değil, **iki yüzlü bir form motoru** olarak konumlanır:

- **İnsanlar ve kod yazan AI için:** sınıf + decorator (ya da decorator'sız `defineForm`), MCP ile denetlenen kod.
- **Çalışma anında form üreten AI için:** JSON tanımı, şemaya karşı denetim, kit ile hazır çizim.

Aynı motor, aynı servisler, aynı DevTools; yalnızca formun nereden geldiği değişir. Bu yüzden Faz 5 dizi alanlarının önündedir.

## İlkeler

- **Kırıcı değişiklik yok.** Her şey 2.x içinde eklemedir; yeni alanlar isteğe bağlı, varsayılan davranış bugünkü gibi kalır.
- **Önce kullanım, sonra özellik.** Faz 0 bitmeden yeni sürüm çıkmaz; Faz 0'da çıkan pürüzler aşağıdaki sıranın önüne geçer.
- **Az sürüm.** Fazlar `develop`'ta birikir; çekirdek için tek `2.2.0`, önce `next` etiketiyle aday sürüm.
- **Her faz incelenir.** `main`'e girmeden önce bağımsız kod incelemesi (`/code-review`) ve bulguların kapatılması zorunlu.
- **Çekirdek sıfır bağımlılıkla kalır.** Entegrasyonlar ayrı pakettir.

## Özet

| Faz | Konu                                                       | Kapattığı zayıflık                    | Hedef sürüm                                     | Kim       | Durum              |
| --- | ---------------------------------------------------------- | ------------------------------------- | ----------------------------------------------- | --------- | ------------------ |
| 0   | Dondurma ve gerçek kullanım                                | Gerçek kullanıcı yok, sürüm geçmişi   | sürüm yok                                       | Kullanıcı | Bekliyor           |
| 1   | İncelenmemiş kodun incelenmesi                             | İnceleme kâğıt üzerinde               | yama sürümleri                                  | Claude    | Yayınlandı (2.1.1) |
| 2   | Alan ve form durumu (dirty/touched, gönderim, form hatası) | Temel özellik eksikleri               | 2.2.0                                           | Claude    | Aday sürümde       |
| 3   | Asenkron doğrulama: gecikme ve iptal                       | Temel özellik eksikleri               | 2.2.0                                           | Claude    | Aday sürümde       |
| 4   | Decorator sürtünmesi (decorator'sız yol)                   | İlk kurulumda takılma                 | 2.2.0 + doküman                                 | Claude    | Aday sürümde       |
| 5   | AI için form motoru (veri olarak form)                     | Konum: rakiplerden ayrışma            | `@punica/form-json` 0.1.0, kit 0.3.0, mcp 0.4.0 | Claude    | Aday sürümde       |
| 6   | Dizi alanları                                              | Temel özellik eksikleri               | 2.3.0                                           | Claude    | Bekliyor           |
| 7   | Şema bağlantısı (Zod, Valibot, ArkType)                    | Temel özellik eksikleri               | `@punica/form-schema` 0.1.0                     | Claude    | Bekliyor           |
| 8   | Kit: yeni alan tipleri                                     | Kit dar                               | `@punica/form-kit` 0.4.0                        | Claude    | Bekliyor           |
| 9   | Güven ve süreç                                             | Provenance, eklenti, doküman, hosting | sürümden bağımsız                               | Karışık   | Bekliyor           |
| 10  | Diğer framework adaptörleri                                | Yalnızca React                        | talep gelirse                                   | Ertelendi | Ertelendi          |

Bağımlılıklar: Faz 2; Faz 5, 6 ve 8'in ön koşuludur (JSON formlar, dizi satırları ve kit alanları gönderim ve dirty/touched durumunu kullanır).
Faz 4, Faz 5'in ön koşuludur. Faz 3 ve 7 diğerlerinden bağımsızdır. Faz 9 her an yapılabilir.

---

## Faz 0 — Dondurma ve gerçek kullanım

**Amaç:** Kütüphaneyi gerçek bir üründe denemek; sonraki işin önceliğini tahmine değil kullanıma dayandırmak.

- PunicaLab ürünlerinden birinde kit ile en az 3 gerçek form yazılır (biri uzun, biri asenkron doğrulamalı, biri koşullu alanlı).
- Bu sürede npm'e yeni sürüm çıkmaz (yalnızca gerçek hata için yama).
- Pürüzler `punica-form` GitHub issue'larına `friction` etiketiyle yazılır: ne yapılmak istendi, nerede takıldı, nasıl aşıldı.

**Bitti sayılır:** 3 form üretimde ya da üretim adayı dalda; issue listesi gözden geçirilip bu belgenin sırası güncellendi.

## Faz 1 — İncelenmemiş kodun incelenmesi

**Amaç:** 2.0 incelemesi 10 gerçek hata buldu; aynı inceleme sonrasında yazılan koda yapılmadı.

- Kapsam: `packages/react`, `packages/kit`, `packages/mcp/src`, ve 2.1'de inceleme düzeltmesi olarak yazılan çekirdek değişiklikleri (`controller/index.ts` içinde `batch`, `#supersede`, servis örnekleme; `service/lib/validateItem.ts`).
- Yöntem: `/code-review high`; her bulgu yeniden üretilerek doğrulanır, gerçek olanlar testle birlikte düzeltilir.
- Çıktı: yama sürümleri (`form-react` 0.1.x, `form-kit` 0.1.x, gerekirse çekirdek 2.1.x).

**Bitti sayılır:** doğrulanmış bulgu kalmadı; her düzeltmenin testi var.

## Faz 2 — Alan ve form durumu

**Amaç:** "Değişti mi, dokunuldu mu, gönderiliyor mu, form düzeyinde hata var mı" sorularını çekirdek cevaplasın.

### Tasarım

- `FormItem`'a isteğe bağlı alanlar: `dirty?: boolean`, `touched?: boolean`.
  - `dirty`: `SetValue` yazarken değeri `getInitialItems()` içindeki ilk değerle derin karşılaştırır. Yeni `utils/isEqual.ts` (bağımlılık yok).
  - `touched`: yeni `Touch` servisi (`run(property)`); UI blur anında çağırır.
  - `Reset` ve `ResetItem` ikisini de temizler.
- Form düzeyi durum: `Form`'a isteğe bağlı `state?: { dirty, touched, valid, submitting, submitCount, errors }`.
  - `dirty`/`touched`/`valid` öğelerden türetilir; `#setItems` içinde tek yerde hesaplanır (ikinci bir doğruluk kaynağı olmaz).
  - `errors: ErrorDetail[]` form düzeyi hatalardır (ör. sunucudan dönen "kullanıcı adı ya da parola yanlış").
- `CommandService`'e `setState(patch)`: öğe dışı form durumunu yazan tek yol; `batch` ile aynı bildirim kuralına uyar.
- Yeni `Submit` servisi: `run(handler)` → `Validate` çalıştırır, geçerliyse `submitting: true` ile `handler(values)` çağırır, hata fırlarsa `state.errors`'a yazar, `submitCount` artar. Aynı anda ikinci gönderim yok sayılır.
- Yeni olaylar `FormEventMap`'e eklenir: `SUBMIT`, `SUBMIT_ERROR`.

### Dokunulacak yerler

- `packages/form/lib/model/**` (tipler), `controller/index.ts` (`#setItems` türetme, `setState`), `utils/isEqual.ts`.
- `packages/service/lib/{setValue,reset,resetItem}/index.ts`, yeni `touch/`, `submit/`; `ServiceRegistry` genişletmesi.
- `packages/react`: `useForm` zaten tüm formu döndürdüğü için değişmez; `useFormState(controller)` seçici hook'u (yalnızca `state` değişince yeniden çizer).
- `packages/kit`: `KitForm` gönderimi `Submit` servisine geçer; gönder düğmesi `submitting` iken kilitlenir; hata gösterimi `touched` ya da `submitCount > 0` koşuluna bağlanır (bugünkü blur mantığı sadeleşir).
- DevTools: yeni alanlar öğe ve form görünümünde zaten JSON olarak görünür; protokol değişmez.

**Bitti sayılır:** yeni birim testleri iki decorator modunda geçer; 2.1 ile yazılmış doküman örnekleri değişmeden derlenir; kit e2e testine "değişmemiş formda gönder kilitli / hata yalnızca dokunulan alanda" senaryosu eklendi.

## Faz 3 — Asenkron doğrulama: gecikme ve iptal

**Amaç:** Sunucuya giden doğrulama her tuşta çalışmasın, eskiyen istek iptal edilsin.

- Doğrulama fonksiyonuna ikinci argüman olarak isteğe bağlı bağlam: `{ signal: AbortSignal }`. Mevcut tek argümanlı fonksiyonlar aynen çalışır.
- `validateItem.ts`: her çalıştırmada `AbortController` üretir; `supersede(property)` eskiyince `abort()` çağrılır. Eskiyen sonucun yazılmaması bugün zaten var; eklenen şey gerçek iptaldir.
- Gecikme: öğe tanımında isteğe bağlı `validateDebounce?: number` (ms). `Trigger` bunu uygular; `Validate` (tüm form, gönderim) gecikmeyi atlar ve bekleyen doğrulamayı hemen çalıştırır.
- Öğeye `validating?: boolean`; form durumuna (Faz 2 varsa) `validating`.

**Bitti sayılır:** sahte zamanlayıcılı testler: art arda 5 yazmada tek istek; eskiyen istekte `signal.aborted === true`; gönderim bekleyen doğrulamayı beklemeden atlamaz.

## Faz 4 — Decorator sürtünmesi

**Amaç:** İlk kurulumda "decorator derlenmiyor" duvarına çarpmamak.

- **Decorator'sız resmi yol:** `fromForm` zaten veriyle form kabul ediyor; eksik olan tipli ve kısa bir kurucu. `defineForm<User>({ name: text({ label, validation }), ... })` yardımcıları çekirdeğe eklenir, aynı öğe tanımlarını üretir. Kit için `kitForm<User>({...})` karşılığı. Dokümanda iki yol yan yana gösterilir.
- **Erken ve anlaşılır hata:** decorator'lı sınıf metadata üretmediyse (`fromEntity` sıfır öğe bulursa) uyarı: neden olabilecek derleyici ayarını ve doküman bağlantısını söyler.
- **Hazır şablonlar:** `examples/react` ve `examples/kit` `npm create`/degit ile alınabilir hale getirilir; kurulum sayfasında Vite, Next.js, Angular CLI için birer ayar kutusu.

Bu faz Faz 5'in temelidir: decorator'sız kurucu ile JSON tanımı aynı öğe tanımlarını üretir.

**Bitti sayılır:** boş bir Vite projesinde dokümandaki adımlarla hiçbir derleyici ayarı değiştirmeden (decorator'sız yol) form çalışır; tarayıcı testi var.

## Faz 5 — AI için form motoru (veri olarak form)

**Amaç:** Bir yapay zekâ ajanı çalışma anında form üretebilsin: JSON üretir, şemaya karşı denetlenir, kit ekranda çizer,
değerler düz nesne olarak geri döner. Sınıf ve decorator yolu aynen kalır; bu ikinci yüzdür.

### Tasarım

- **Yeni paket `@punica/form-json`** (çekirdek küçük kalır; çalışma zamanı bağımlılığı yok).
- **Form tanımı biçimi (v1):** yalnızca veri, fonksiyon yok.
  ```json
  {
    "version": 1,
    "name": "Kayıt",
    "items": [
      {
        "property": "email",
        "type": "text",
        "label": "E-posta",
        "rules": [{ "rule": "required" }, { "rule": "email" }]
      },
      {
        "property": "company",
        "type": "text",
        "label": "Şirket",
        "visibleWhen": { "property": "isCorporate", "equals": true }
      }
    ]
  }
  ```
- **İsimli kural kaydı:** `defineRule(name, factory)`; hazır kurallar (`required`, `email`, `min`, `max`, `minLength`,
  `maxLength`, `pattern`) kitteki `validation.ts` ile tek kaynaktan gelir. Bilinmeyen kural yüklemede hata verir, sessizce atlanmaz.
- **Koşullar bildirimseldir:** `visibleWhen` / `disabledWhen` için `equals`, `notEquals`, `in`, `all`, `any`.
  İfade dizgisi ve `eval` yok.
- **`fromSchema(json, { register, rules })`:** tanımı doğrular, `Form` üretir ve `FormController.fromForm`'a verir;
  motorun geri kalanı (servisler, DevTools, React hook'ları) değişmeden çalışır.
- **JSON Schema girdisi:** `fromJsonSchema(schema)` düz nesne alt kümesini çevirir (`string`, `number`, `boolean`, `enum`,
  `required`, `minLength`, `maximum`, `format: email`, `pattern`). Bu alt küme MCP'nin kullanıcıdan bilgi isteme
  (elicitation) şemalarıyla uyumlu seçilir; kapsam uygulama sırasında güncel MCP belirtimine göre doğrulanır.
- **Biçimin kendi JSON Schema'sı** paketle yayınlanır (`@punica/form-json/schema.json`); modeller yapılandırılmış çıktıda
  doğrudan bunu kullanır.
- **Güvenlik:** tanım güvenilmeyen girdidir. Fonksiyon, HTML ve URL kabul edilmez; etiketler düz metin olarak çizilir;
  öğe sayısı ve derinlik sınırı vardır; yalnızca register'da kayıtlı alan tipleri kabul edilir.

### Dokunulacak yerler

- `packages/json` (yeni): `schema.ts` (tipler + doğrulayıcı), `rules.ts`, `conditions.ts`, `fromSchema.ts`, `fromJsonSchema.ts`.
- `packages/kit`: `<KitForm schema={json} onSubmit={...} />`; `validation.ts` kuralları kural kaydına taşınır (dışa açık API aynı kalır).
- `packages/mcp`: yeni `validate_form` aracı (tanımı denetler, hataları yol bilgisiyle döndürür) ve `get_form_schema`;
  kılavuza "Çalışma anında form üretimi" bölümü.
- `examples/ai` (yeni): JSON'dan çizilen form; tarayıcı testi.
- Doküman: "AI ile form üretimi" sayfası ve canlı demo (JSON yapıştır, form çizilsin).

**Bitti sayılır:** geçerli ve geçersiz tanımlar için birim testleri (bilinmeyen kural, bilinmeyen tip, fonksiyon/HTML
enjeksiyonu, sınır aşımı); JSON Schema çevirisi testleri; `validate_form` MCP testi; tarayıcı testinde JSON'dan çizilen
formun doğrulanıp gönderilmesi; dokümandaki örnek tanımlar yayınlanan şemaya karşı otomatik denetlenir.

**Sonraya bırakılan:** sınıftan JSON'a dışa aktarma (`toSchema`), dizi alanlarının JSON karşılığı (Faz 6 bittikten sonra v1'e eklenir).

## Faz 6 — Dizi alanları

**Amaç:** Tekrarlayan satırlar (fatura kalemleri, telefon listesi).

### Önce tasarım denemesi (kod yazmadan karar)

Çekirdek bugün öğeleri `keyof E` ile dizinliyor (`#itemsMap`). İki yol var:

|                      | A: Satır başına alt form                             | B: Düz yol anahtarları (`lines.0.price`)        |
| -------------------- | ---------------------------------------------------- | ----------------------------------------------- |
| Çekirdek değişikliği | Küçük: alt controller'ları tutan öğe tipi            | Büyük: `property` tipi `keyof E` olmaktan çıkar |
| Geriye uyum          | Tam                                                  | Riskli                                          |
| Satır tip güvenliği  | Satır sınıfı kendi decorator'larıyla tam tipli       | Yol string'leri, zayıf tip                      |
| Maliyet              | Satır başına controller; çok büyük listelerde bellek | Tek controller                                  |

**Öneri: A.** Mevcut mimariyle (sınıf = form) aynı dili konuşur ve kırmaz. Karar iki günlük bir denemeyle (50 ve 1000 satırda ölçüm) doğrulanır.

### A yolunun taslağı

- `@FormArray(() => LineItem)` özellik decorator'ı: öğenin `value`'su satır değerleri dizisidir; öğe ayrıca `rows: FormController<LineItem>[]` taşır.
- `FieldArray` servisi: `append(property, value?)`, `remove(property, index)`, `move(property, from, to)`, `replace(property, values)`. Her işlem üst formda tek bildirim üretir.
- Üst servisler alt formlara iner: `Validate` satırları doğrular, `GetValues` satır değerlerini toplar, `Reset` ilk satır kümesine döner. Satırdaki değişiklik üst formun `dirty`/`valid` durumuna yansır (Faz 2).
- Satırlara kararlı `key` verilir (React listeleri için).
- `packages/react`: `useFieldArray(controller, property)`.
- Kit: `ArrayField` (satır şablonu + ekle/sil düğmeleri) Faz 8'de.

**Bitti sayılır:** ekle/sil/taşı, iç içe doğrulama, sıfırlama testleri; `examples/react`'e fatura kalemleri örneği ve tarayıcı testi; 1000 satırda tek tuş vuruşu yalnızca ilgili satırı yeniden çizer.

## Faz 7 — Şema bağlantısı

**Amaç:** Zod, Valibot, ArkType kullanan ekip doğrulamayı yeniden yazmasın.

- Yeni paket `@punica/form-schema`, çalışma zamanı bağımlılığı yok: [Standard Schema](https://standardschema.dev) arayüzüne (`~standard.validate`) karşı yazılır; bu arayüzü uygulayan her kütüphane tek adaptörle çalışır.
- İki kullanım:
  - Alan düzeyi: `@Validation(schema(z.string().email()))`.
  - Form düzeyi: `@Schema(UserSchema)` sınıf decorator'ı; şema hatalarını `issue.path` üzerinden öğelere, eşleşmeyenleri form düzeyi hatalara (Faz 2) dağıtan bir reader/servis ekler.
- Yup: Standard Schema desteği uygulama sırasında sürümüne göre doğrulanır; yoksa pakete 20 satırlık `yup()` sarmalayıcısı eklenir.
- MCP kılavuzuna ve dokümana "Şema ile doğrulama" bölümü.

**Bitti sayılır:** Zod ve Valibot ile gerçek paketlere karşı testler (devDependency); tip testi: şema çıktı tipi alan tipiyle uyuşmazsa derleme hatası.

## Faz 8 — Kit: yeni alan tipleri

**Amaç:** Kurumsal formların çoğunu kit tek başına karşılasın.

- Ön koşul: her alan için `@punica/components` içinde karşılık gelen bileşen var mı kontrol edilir; yoksa önce orada eklenir (kit kendi bileşenini yazmaz).
- Eklenecekler, öncelik sırasıyla: `RadioGroupField`, `DateField`, `MultiSelectField`, `PasswordField`, `FileField`, `ArrayField` (Faz 6'ya bağlı).
- `SelectField` için asenkron seçenek kaynağı (`options: () => Promise<Option[]>`), yükleniyor durumu.
- React 18 desteği değerlendirilir: web component olayları için React 18'de `ref` + `addEventListener` gerekiyor; tek bir `useElementEvent` yardımcı fonksiyonuyla çözülebiliyorsa peer aralığı `>=18` yapılır, çözülemiyorsa 19 şartı dokümanda gerekçesiyle kalır.

**Bitti sayılır:** her alan için birim + `examples/kit` tarayıcı testi; doküman kit sayfasındaki canlı demoya yeni alanlar eklendi.

## Faz 9 — Güven ve süreç

| İş                     | Ayrıntı                                                                                                                                                                                                       | Kim                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| npm provenance         | npmjs.com'da her paket için trusted publisher tanımı; `release.yml` OIDC ile yayınlar, `NPM_TOKEN` kaldırılır                                                                                                 | Kullanıcı (npm ayarı) + Claude (workflow) |
| Gerçek inceleme        | `CODEOWNERS`'a gerçek kullanıcı adları; `main` için yönetici atlaması istisna olur, kural değil. İkinci insan yoksa her PR'da `/code-review` çıktısı PR'a eklenir                                             | Kullanıcı                                 |
| Sürüm ritmi            | Çekirdek için en fazla ayda bir minor; aday sürüm en az bir hafta `next`'te bekler. `CONTRIBUTING.md`'ye yazılır                                                                                              | Claude                                    |
| `value: any`           | `TypedFormItem` varsayılan yapılabilir mi ölçülür: doküman örneklerinin kaçı kırılıyor? Kırıyorsa 3.0'a not edilir, 2.x'te `any` kalır                                                                        | Claude                                    |
| DevTools eklentisi     | Chrome'da elle deneme, yeni ekran görüntüleri, Chrome Web Store başvurusu                                                                                                                                     | Kullanıcı                                 |
| Doküman okuması        | Bir insan tüm sayfaları baştan sona okur; düzeltmeler MR olarak gelir                                                                                                                                         | Kullanıcı                                 |
| Hosting                | `punicalab/infra/ci-cd-library`: CloudFront'ta `/docs/...` için SPA kabuğu yerine gerçek `index.html` (CloudFront Function ile `uri + '/index.html'`); React #418 ve arama motoru görünürlüğü bununla kapanır | Kullanıcı / altyapı                       |
| Doküman bağımlılıkları | `npm audit` 23 bulgu: yalnızca derleme zamanı mı doğrulanır, yükseltilebilenler yükseltilir                                                                                                                   | Claude                                    |
| Küçükler               | MCP `search_api` özetindeki baştaki `*`; `punica-form` `develop`'un `main`'e eşitlenmesi; `punica-request` `NPM_TOKEN`                                                                                        | Claude / Kullanıcı                        |

## Faz 10 — Diğer framework adaptörleri (ertelendi)

`@punica/form-vue` (composable, `shallowRef` + `subscribe`) ve `@punica/form-angular` (signal) teknik olarak
küçük işlerdir (React paketi ~100 satır). Somut bir kullanıcı talebi gelmeden yapılmaz: bakım yükü her
çekirdek sürümünde üçe katlanır. O zamana kadar dokümanda "kendi adaptörünü yaz" sayfası (20 satırlık örnek) yeterli.

---

## Yayın planı

1. Faz 1 yamaları hemen çıkabilir (hata düzeltmesi).
2. Faz 2, 3, 4, 6 `develop`'ta birikir → `2.2.0-next.0` → en az bir hafta gerçek üründe (Faz 0'daki formlar) → `2.2.0`.
3. Faz 5 (`@punica/form-json` 0.1.0, `@punica/form-kit` 0.2.0, `@punica/form-mcp` 0.4.0) 2.2.0'a bağlıdır ve onunla birlikte çıkar; dizi alanları gecikirse 2.2.0 onlarsız çıkar, diziler 2.3.0'a kalır.
4. `@punica/form-schema` 0.1.0 ve `@punica/form-kit` 0.3.0, 2.2.0'ın ardından.
5. Her yayında: `@punica/form-mcp` kılavuzu ve doküman sitesi aynı PR/MR dalgasında güncellenir.

## Her fazda doğrulama

- `pnpm lint && pnpm build && pnpm typecheck && pnpm test` (iki decorator modu) ve `pnpm e2e`.
- Geriye uyum kanıtı: doküman sitesindeki örnekler yeni tiplere karşı değişmeden derlenir.
- Tarball'dan `import` ve `require` ile yükleme; `npx @punica/form-mcp` duman testi.
- Bağımsız kod incelemesi, `main`'e girmeden önce.

## Kapsam dışı

- 3.0 / kırıcı değişiklik.
- Görsel form tasarlayıcı; sınıftan JSON'a dışa aktarma (`toSchema`).
- Kit için `@punica/components` dışında bir bileşen kütüphanesi.
