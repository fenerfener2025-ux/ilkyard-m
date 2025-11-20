
import { Question, Topic, Difficulty } from './types';

// COMPREHENSIVE EXAM DATASET
// Note: In a full production app, this would be fetched from a database.
// Here we provide a robust set of starting questions.
export const INITIAL_QUESTIONS: Question[] = [
  // --- GENEL İLKYARDIM ---
  {
    id: 'gen_1',
    text: 'Olay yerinde ilkyardımcının yapması gereken "KBK" uygulamasının açılımı nedir?',
    options: ['Koruma - Bildirme - Kurtarma', 'Kurtarma - Bakım - Koruma', 'Kontrol - Bildirme - Kayıt', 'Koruma - Bakım - Kurtarma'],
    correctAnswer: 0,
    topic: Topic.GENERAL,
    difficulty: Difficulty.EASY,
    explanation: 'KBK: Koruma (Güvenlik önlemleri), Bildirme (112), Kurtarma (Müdahale).'
  },
  {
    id: 'gen_2',
    text: '112 arandığında adres tarif edilirken nelere dikkat edilmelidir?',
    options: ['Tahmini adres verilir', 'Bilinen noktalar referans gösterilir', 'Hızlı konuşulur', 'Sadece telefon no verilir'],
    correctAnswer: 1,
    topic: Topic.GENERAL,
    difficulty: Difficulty.MEDIUM,
    explanation: 'Adres tarifinde okul, cami, karakol gibi herkesçe bilinen sabit noktalar referans gösterilmelidir.'
  },
  {
    id: 'gen_3',
    text: 'Çok sayıda yaralının olduğu kazalarda, en ağır ve acil hastaların belirlenerek öncelik sırasına konulmasına ne ad verilir?',
    options: ['Turnike', 'Triyaj', 'Renal', 'Entübasyon'],
    correctAnswer: 1,
    topic: Topic.GENERAL,
    difficulty: Difficulty.HARD,
    explanation: 'Triyaj, çok sayıda yaralının olduğu durumlarda hayati tehlikesi olanlara öncelik vermek için yapılan sınıflandırma işlemidir.'
  },
  {
    id: 'gen_4',
    text: 'İlkyardım ile Acil Tedavi arasındaki fark nedir?',
    options: ['Fark yoktur', 'İlkyardım ilaçlıdır', 'İlkyardım olay yerinde ilaçsız yapılır, Acil Tedavi hastanede doktor tarafından yapılır', 'Acil tedavi ilkyardımcı tarafından yapılır'],
    correctAnswer: 2,
    topic: Topic.GENERAL,
    difficulty: Difficulty.EASY,
    explanation: 'İlkyardım olay yerindeki imkanlarla ilaçsız yapılır. Acil tedavi, sağlık personeli tarafından tıbbi donanımla yapılır.'
  },

  // --- ANATOMİ ---
  {
    id: 'anat_1',
    text: 'Yetişkin bir insanda normal nabız sayısı dakikada kaçtır?',
    options: ['50-80', '60-100', '100-120', '40-60'],
    correctAnswer: 1,
    topic: Topic.ANATOMY,
    difficulty: Difficulty.EASY,
    explanation: 'Yetişkinlerde dinlenme halindeki normal nabız hızı dakikada 60-100 atımdır.'
  },
  {
    id: 'anat_2',
    text: 'Bilinç kontrolü (AVPU) yapılırken ilkyardımcı yetişkin hastaya nasıl hitap eder?',
    options: ['Tokat atarak', 'Omuzlarına hafifçe dokunup "İyi misiniz?" diye seslenerek', 'Ayak tabanına vurarak', 'Yüzüne su serperek'],
    correctAnswer: 1,
    topic: Topic.ANATOMY,
    difficulty: Difficulty.EASY,
    explanation: 'Yetişkinlerde bilinç kontrolü, omuzlara dokunup yüksek sesle "İyi misiniz?" diye sorularak yapılır.'
  },
  {
    id: 'anat_3',
    text: 'Hücre ve dokuların oksijenlenmesini sağlayan sistem hangisidir?',
    options: ['Hareket sistemi', 'Sinir sistemi', 'Solunum sistemi', 'Sindirim sistemi'],
    correctAnswer: 2,
    topic: Topic.ANATOMY,
    difficulty: Difficulty.MEDIUM,
    explanation: 'Solunum sistemi (Akciğerler), kandaki karbondioksiti atıp oksijen alarak dokuların oksijenlenmesini sağlar.'
  },
  {
    id: 'anat_4',
    text: 'Solunum merkezinin bulunduğu ve hayati fonksiyonların kontrol edildiği organ hangisidir?',
    options: ['Omurilik soğanı (Beyin sapı)', 'Karaciğer', 'Kalp', 'Böbrek'],
    correctAnswer: 0,
    topic: Topic.ANATOMY,
    difficulty: Difficulty.HARD,
    explanation: 'Solunum ve dolaşım gibi istemsiz çalışan hayati fonksiyonların merkezi beyin sapıdır (omurilik soğanı).'
  },

  // --- CPR (TEMEL YAŞAM DESTEĞİ) ---
  {
    id: 'cpr_1',
    text: 'Yetişkinlerde Temel Yaşam Desteği döngüsü nasıldır?',
    options: ['15 Kalp Masajı - 2 Solunum', '30 Kalp Masajı - 2 Solunum', '5 Kalp Masajı - 1 Solunum', '30 Kalp Masajı - 5 Solunum'],
    correctAnswer: 1,
    topic: Topic.CPR,
    difficulty: Difficulty.EASY,
    explanation: 'Standart protokol: 30 kalp masajı (göğüs basısı) ve ardından 2 kurtarıcı soluktur.'
  },
  {
    id: 'cpr_2',
    text: 'Kalp masajı hızı dakikada kaç bası olacak şekilde ayarlanmalıdır?',
    options: ['60 bası/dk', '80 bası/dk', '100-120 bası/dk', '150 bası/dk'],
    correctAnswer: 2,
    topic: Topic.CPR,
    difficulty: Difficulty.MEDIUM,
    explanation: 'Kalp masajı ritmi dakikada 100-120 bası olacak tempoda yapılmalıdır.'
  },
  {
    id: 'cpr_3',
    text: 'Bebeklerde (0-1 yaş) kalp masajı nereye ve nasıl yapılır?',
    options: ['İman tahtası ortasına 2 elle', 'Meme uçlarını birleştiren hattın hemen altına 2 parmakla', 'Göbek deliğine', 'Sırta vurarak'],
    correctAnswer: 1,
    topic: Topic.CPR,
    difficulty: Difficulty.HARD,
    explanation: 'Bebeklerde meme uçları hattının hemen altına, orta ve yüzük parmakları kullanılarak bası uygulanır.'
  },
  {
    id: 'cpr_4',
    text: 'Suni solunum sırasında havanın mideye gitmesini önlemek için hangi pozisyon verilir?',
    options: ['Baş-Çene Pozisyonu', 'Şok Pozisyonu', 'Koma Pozisyonu', 'Yüzüstü Pozisyon'],
    correctAnswer: 0,
    topic: Topic.CPR,
    difficulty: Difficulty.EASY,
    explanation: 'Baş-Çene pozisyonu (baş geriye, çene yukarı) dil kökünün kalkmasını ve soluk borusunun açılmasını sağlar.'
  },
  {
    id: 'cpr_5',
    text: 'Çocuklarda (1-8 yaş) kalp masajı derinliği ne kadar olmalıdır?',
    options: ['1 cm', '2.5 cm', '5 cm', '7 cm'],
    correctAnswer: 2,
    topic: Topic.CPR,
    difficulty: Difficulty.HARD,
    explanation: 'Çocuklarda göğüs kemiği yaklaşık 5 cm çökecek şekilde bası uygulanır. (Bebeklerde 4 cm, Yetişkinlerde 5-6 cm).'
  },

  // --- HAVA YOLU TIKANIKLIĞI ---
  {
    id: 'choking_1',
    text: 'Bilinci açık, tam tıkanıklık yaşayan (nefes alamayan, elleri boynunda) bir kişiye ne yapılır?',
    options: ['Sırtına vurulur', 'Heimlich Manevrası yapılır', 'Su içirilir', 'Yatırılır'],
    correctAnswer: 1,
    topic: Topic.CHOKING,
    difficulty: Difficulty.EASY,
    explanation: 'Tam tıkanıklıkta en etkili yöntem Heimlich (karına bası) manevrasıdır. Sırta vurmak cismi daha aşağı itebilir.'
  },
  {
    id: 'choking_2',
    text: 'Kısmi tıkanıklık yaşayan (öksürebilen, konuşabilen) hastaya ne yapılır?',
    options: ['Sırtına vurulur', 'Su verilir', 'Öksürmeye teşvik edilir, dokunulmaz', 'Heimlich yapılır'],
    correctAnswer: 2,
    topic: Topic.CHOKING,
    difficulty: Difficulty.MEDIUM,
    explanation: 'Kısmi tıkanıklıkta hasta öksürebiliyorsa en etkili yöntem kendi öksürüğüdür. Dokunulmaz, teşvik edilir.'
  },

  // --- KANAMALAR VE ŞOK ---
  {
    id: 'bleed_1',
    text: 'Hangi kanama hayati tehlike açısından en risklidir?',
    options: ['Kılcal damar', 'Toplardamar', 'Atardamar', 'Dış kanama'],
    correctAnswer: 2,
    topic: Topic.BLEEDING,
    difficulty: Difficulty.EASY,
    explanation: 'Atardamar kanamaları yüksek basınçlıdır, kalp atımıyla fışkırır tarzdadır ve kısa sürede çok kan kaybına yol açar.'
  },
  {
    id: 'bleed_2',
    text: 'Şok pozisyonunda ayaklar ne kadar yukarı kaldırılır?',
    options: ['10 cm', '30 cm', '60 cm', '90 cm'],
    correctAnswer: 1,
    topic: Topic.BLEEDING,
    difficulty: Difficulty.EASY,
    explanation: 'Şok pozisyonunda beyne kan gitmesi için ayaklar 30 cm (yaklaşık bir karış veya destekle) yukarı kaldırılır.'
  },
  {
    id: 'bleed_3',
    text: 'Uzuv kopması durumunda kopan parça nasıl taşınmalıdır?',
    options: ['Doğrudan buzun içine konularak', 'Su dolu poşette', 'Temiz bir poşete konup, o poşet buzlu su dolu ikinci bir poşete konularak', 'Kuru bir bezle sarılarak'],
    correctAnswer: 2,
    topic: Topic.BLEEDING,
    difficulty: Difficulty.HARD,
    explanation: 'Kopan parça direkt buza temas etmemelidir (donma yanığı olur). Soğuk ortamda (buzlu su dolu ikinci kapta) taşınmalıdır.'
  },
  {
    id: 'bleed_4',
    text: 'Turnike uygulaması en fazla kaç dakikada bir gevşetilmelidir?',
    options: ['5-10 dakika', '15-20 dakika', '40-50 dakika', 'Gevşetilmez'],
    correctAnswer: 1,
    topic: Topic.BLEEDING,
    difficulty: Difficulty.HARD,
    explanation: 'Doku gangrenini önlemek için turnike 15-20 dakikada bir 5-10 saniyeliğine gevşetilerek o bölgeye kan gitmesi sağlanır.'
  },

  // --- KIRIK ÇIKIK BURKULMA ---
  {
    id: 'frac_1',
    text: 'Kırık tespitinde atel (sert cisim) boyu ne kadar olmalıdır?',
    options: ['Sadece kırık bölgeyi kaplamalı', 'Kırık kemiğin alt ve üst eklemini içine alacak uzunlukta olmalı', 'Tüm vücudu kaplamalı', 'Yaranın üzerini kapatacak kadar olmalı'],
    correctAnswer: 1,
    topic: Topic.FRACTURES,
    difficulty: Difficulty.MEDIUM,
    explanation: 'Tespitte amaç hareketsizliktir. Bu yüzden kırılan kemiğin her iki ucundaki eklemler de sabitlenmelidir.'
  },
  {
    id: 'frac_2',
    text: 'Burkulmalarda ilkyardım uygulaması nasıldır?',
    options: ['Sıcak uygulama yapılır', 'Bölge aşağı sarkıtılır', 'Elastik bandajla tespit, soğuk uygulama ve yukarı kaldırma (elevasyon)', 'Hareket ettirilir'],
    correctAnswer: 2,
    topic: Topic.FRACTURES,
    difficulty: Difficulty.MEDIUM,
    explanation: 'Burkulmalarda ödemi önlemek için soğuk uygulama yapılır, bandajlanır ve kalp seviyesinden yukarıda tutulur.'
  },

  // --- YANIKLAR ---
  {
    id: 'burn_1',
    text: 'Kimyasal yanıklarda (asit/baz) ilk müdahale ne olmalıdır?',
    options: ['Merhem sürülür', 'Bol su ile en az 15-20 dakika yıkanır', 'Sargı bezi ile kapatılır', 'Hiçbir şey yapılmaz'],
    correctAnswer: 1,
    topic: Topic.BURNS,
    difficulty: Difficulty.EASY,
    explanation: 'Kimyasal maddenin deriden uzaklaştırılması için tazyiksiz bol su ile uzun süre yıkanmalıdır.'
  },
  {
    id: 'burn_2',
    text: 'Elektrik yanıklarında ilkyardımda ilk adım nedir?',
    options: ['Hastaya dokunarak kontrol etmek', 'Su dökmek', 'Sigortayı indirip akımı kesmek', 'Hemen suni solunum yapmak'],
    correctAnswer: 2,
    topic: Topic.BURNS,
    difficulty: Difficulty.EASY,
    explanation: 'Elektrik çarpmalarında akım kesilmeden hastaya dokunulmaz. İlk iş sigortayı kapatmak veya iletken olmayan cisimle kabloyu uzaklaştırmaktır.'
  },

  // --- ZEHİRLENME VE ÇEVRESEL ---
  {
    id: 'env_1',
    text: 'Bilinci kapalı bir hasta kusuyorsa hangi pozisyona getirilir?',
    options: ['Sırtüstü', 'Yarı oturur', 'Koma pozisyonu (Yan yatış)', 'Şok pozisyonu'],
    correctAnswer: 2,
    topic: Topic.ENV_EMERGENCIES,
    difficulty: Difficulty.MEDIUM,
    explanation: 'Kusan ve bilinci kapalı hasta sırtüstü yatarsa kusmuğu akciğerine kaçar (aspirasyon). Yan yatış (koma) pozisyonu hava yolunu açık tutar.'
  },
  {
    id: 'env_2',
    text: 'Karbonmonoksit (soba/şofben) zehirlenmesinde ilk ne yapılır?',
    options: ['Yoğurt yedirilir', 'Hasta temiz havaya çıkarılır', 'Kusturulur', 'Su içirilir'],
    correctAnswer: 1,
    topic: Topic.ENV_EMERGENCIES,
    difficulty: Difficulty.EASY,
    explanation: 'Gaz zehirlenmelerinde en öncelikli işlem ortamdan uzaklaştırıp temiz havaya çıkarmaktır.'
  },

  // --- HASTA TAŞIMA ---
  {
    id: 'trans_1',
    text: 'Rentek manevrası hangi durumda kullanılır?',
    options: ['Kolda kırık varsa', 'Sadece omurga yaralanmasında', 'Araç içindeki yaralıda patlama/yangın riski varsa ve solunumu durmuşsa', 'Her trafik kazasında'],
    correctAnswer: 2,
    topic: Topic.TRANSPORT,
    difficulty: Difficulty.HARD,
    explanation: 'Rentek manevrası acil durumlarda (yangın tehlikesi veya solunum durması) yaralıyı araçtan omuriliğe zarar vermeden tek hamlede çıkarmak içindir.'
  },
  {
    id: 'trans_2',
    text: 'Şüpheli omurga yaralanması olan hasta nasıl taşınmalıdır?',
    options: ['Kucakta', 'Sırtta', 'Baş-Boyun-Gövde ekseni korunarak en az 3 kişiyle', 'Oturarak'],
    correctAnswer: 2,
    topic: Topic.TRANSPORT,
    difficulty: Difficulty.MEDIUM,
    explanation: 'Omurga yaralanmalarında felç riskini önlemek için vücut ekseni asla bozulmamalı, düz bir zeminde sabitlenerek taşınmalıdır.'
  }
];
