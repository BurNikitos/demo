const ZH = document.documentElement.lang === 'zh-Hans';
const pick = (ru, zh) => ZH ? zh : ru;
const ALL = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const TOURS = {
  aurora: { name: pick('Охота за сиянием', '追北极光'), page: 'siyanie.html', price: 5500, months: [8, 9, 10, 11, 0, 1, 2], season: pick('с сентября по март', '9月至次年3月') },
  teriberka: { name: pick('Териберка за день', '捷里别尔卡一日游'), page: 'teriberka.html', price: 7000, months: ALL },
  sea: { name: pick('Выход в море к китам', '出海寻鲸'), page: 'more.html', price: 12000, months: [5, 6, 7, 8], season: pick('с июня по сентябрь', '6月至9月') },
  husky: { name: pick('Олени и хаски', '驯鹿与哈士奇'), page: 'haski.html', price: 6500, months: [10, 11, 0, 1, 2, 3], season: pick('с ноября по апрель', '11月至次年4月') },
  khibiny: { name: pick('Хибины за день', '希比内山一日游'), page: 'hibiny.html', price: 8500, months: ALL }
};
const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MONTHS = ZH ? [
  ['1月', '极夜在 1 月 11 日结束。每天只有一两个小时的天光，傍晚六点起就开始找极光。'],
  ['2月', '严寒，夜晚又长又黑。白天的光线已经够去捷里别尔卡和坐雪橇。'],
  ['3月', '最方便的月份：白天够亮，可以去海边和山里；夜晚够黑，可以看极光。'],
  ['4月', '夜晚已经太亮，看不到极光。雪还在，狗拉雪橇照常。'],
  ['5月', '5 月 22 日进入极昼。积雪融化，苔原一片褐色，海边很冷。'],
  ['6月', '太阳完全不落。没有极光，但半夜也能出海。'],
  ['7月', '极昼持续到 7 月 22 日。一年中最暖和的时候，苔原开满了花。'],
  ['8月', '黑夜回来了。苔原上有浆果和蘑菇，快艇还在出海。'],
  ['9月', '苔原红黄相间，只有两三周。不用挨冻就能看到极光。'],
  ['10月', '天黑得早，下第一场雪。云多，要比平时开得更远才能找到晴空。'],
  ['11月', '开始积雪，狗拉雪橇开始运营。白天很短，去捷里别尔卡要摸黑出发。'],
  ['12月', '12 月 2 日起进入极夜。正午前后有两三个小时的蓝色暮光。']
] : [
  ['Январь', 'Полярная ночь заканчивается 11 января. Светает на пару часов, сияние начинаем искать с шести вечера.'],
  ['Февраль', 'Морозы и длинные тёмные вечера. Днём уже хватает света на Териберку и упряжки.'],
  ['Март', 'Самый удобный месяц: светлый день для моря и гор, тёмная ночь для сияния.'],
  ['Апрель', 'Ночи уже слишком светлые для сияния. Снег лежит, упряжки ещё ездят.'],
  ['Май', '22 мая начинается полярный день. Снег сходит, тундра бурая, на берегу холодно.'],
  ['Июнь', 'Солнце не заходит совсем. Сияния нет, зато в море можно выйти хоть в полночь.'],
  ['Июль', 'Полярный день длится до 22 июля. Самое тёплое время, тундра цветёт.'],
  ['Август', 'Возвращаются ночи. В тундре ягоды и грибы, в море ещё ходят катера.'],
  ['Сентябрь', 'Тундра красная и жёлтая две-три недели. Сияние можно увидеть без мороза.'],
  ['Октябрь', 'Темнеет рано, выпадает первый снег. Облаков много, за ясным небом ездим дальше обычного.'],
  ['Ноябрь', 'Ложится снег, начинают ездить упряжки. День короткий, едем в Териберку затемно.'],
  ['Декабрь', 'Со 2 декабря полярная ночь. Около полудня на два-три часа наступают синие сумерки.']
];
const SVG_MONTH = 60;
const SVG_HOUR = 10;

const calc = document.getElementById('calc');
const people = document.getElementById('people');
const year = document.getElementById('year');
const rub = n => n.toLocaleString('ru-RU') + ' ₽';
/* Курс сборщик кладёт в data-cny, юани округляем до десятков. В калькуляторе они показаны, пока стоит галочка «¥» */
const cny = document.getElementById('cny');
const inYuan = () => cny && cny.checked;
const yuan = n => '¥' + (Math.round(n / document.documentElement.dataset.cny / 10) * 10).toLocaleString('en-US');
const price = n => inYuan() ? rub(n) + ' ≈ ' + yuan(n) : rub(n);
const peopleWord = n => ZH ? n + ' 人' : n + (n >= 2 && n <= 4 ? ' человека' : ' человек');

/* Сколько часов солнце над горизонтом на широте Мурманска в n-й день года */
function dayLength(n) {
  const lat = 68.97 * Math.PI / 180;
  const g = 2 * Math.PI * (n - 1) / 365;
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g)
    - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g)
    - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const c = (Math.sin(-0.833 * Math.PI / 180) - Math.sin(lat) * Math.sin(decl)) / (Math.cos(lat) * Math.cos(decl));
  if (c >= 1) return 0;
  if (c <= -1) return 24;
  return Math.acos(c) * 24 / Math.PI;
}

const dayOfYear = (m, d) => DAYS.slice(0, m).reduce((a, b) => a + b, 0) + d;

function lightText(m) {
  const h = dayLength(dayOfYear(m, 15));
  if (h === 0) return pick('В середине месяца солнце не восходит', '月中太阳不升起');
  if (h === 24) return pick('В середине месяца солнце не заходит', '月中太阳不落');
  const min = Math.round(h * 6) * 10;
  if (ZH) return '月中白昼约 ' + Math.floor(min / 60) + ' 小时' + (min % 60 ? ' ' + min % 60 + ' 分' : '');
  return 'В середине месяца день длится около ' + Math.floor(min / 60) + ' ч' + (min % 60 ? ' ' + min % 60 + ' мин' : '');
}

/* Год слева направо, сутки сверху вниз. Жёлтая фигура: время, когда солнце над горизонтом */
function drawYear() {
  const top = [];
  const bottom = [];
  let n = 0;
  DAYS.forEach((len, m) => {
    for (let d = 1; d <= len; d++) {
      n++;
      const x = ((m + (d - 0.5) / len) * SVG_MONTH).toFixed(1);
      const half = dayLength(n) / 2 * SVG_HOUR;
      top.push(x + ',' + (120 - half).toFixed(1));
      bottom.unshift(x + ',' + (120 + half).toFixed(1));
    }
  });
  let s = '<rect class="sky" width="720" height="240"/>';
  s += '<polygon class="sunlit" points="' + top.concat(bottom).join(' ') + '"/>';
  for (let m = 1; m < 12; m++) s += '<path class="tick" d="M' + m * SVG_MONTH + ' 0V240"/>';
  s += '<path class="noon" d="M0 120H720"/>';
  TOURS.aurora.months.forEach(m => { s += '<rect class="season" x="' + m * SVG_MONTH + '" width="' + SVG_MONTH + '" height="6"/>'; });
  s += '<rect class="pick" id="pick" y="1" width="' + SVG_MONTH + '" height="238"/>';
  year.innerHTML = s;
}

/* На главной в форме есть месяц, тур и число людей, на странице тура только люди, на «Когда ехать» только месяц */
function update() {
  let chosen = [];

  if (year) {
    const m = Number(calc.elements.month.value);
    document.getElementById('pick').setAttribute('x', m * SVG_MONTH);
    document.getElementById('month-name').textContent = MONTHS[m][0];
    document.getElementById('month-light').textContent = lightText(m);
    document.getElementById('month-note').textContent = MONTHS[m][1];
    chosen.push(MONTHS[m][0].toLowerCase());

    const links = document.getElementById('month-tours');
    if (links) {
      links.innerHTML = pick('В этом месяце идут: ', '本月开放：') + Object.values(TOURS).filter(t => t.months.includes(m))
        .map(t => '<a href="' + t.page + '">' + t.name + '</a>').join('');
    }

    calc.querySelectorAll('input[name="tour"]').forEach(input => {
      const tour = TOURS[input.value];
      const runs = tour.months.includes(m);
      input.disabled = !runs;
      input.nextElementSibling.querySelector('small').textContent = runs ? price(tour.price) : tour.season;
    });
    /* Териберка идёт круглый год, на неё и переключаем, если выбранный тур в этом месяце не идёт */
    const checked = calc.querySelector('input[name="tour"]:checked');
    if (checked && checked.disabled) calc.elements.tour.value = 'teriberka';
  }

  if (!people) return;
  const tour = TOURS[calc.dataset.tour || calc.elements.tour.value];
  const n = Number(people.value);
  const sum = tour.price * n;
  chosen = [pick('«' + tour.name + '»', '“' + tour.name + '”')].concat(chosen, peopleWord(n), price(sum));
  document.getElementById('people-out').textContent = peopleWord(n);
  document.getElementById('sum').innerHTML = rub(sum) + (inYuan() ? '<small>≈ ' + yuan(sum) + '</small>' : '');
  document.getElementById('summary').textContent = pick('Ваш выбор: ' + chosen.join(', ') + '.', '您的选择：' + chosen.join('，') + '。');
}

if (year) {
  calc.elements.month.value = new Date().getMonth();
  drawYear();
  year.addEventListener('click', e => {
    const box = year.getBoundingClientRect();
    calc.elements.month.value = Math.min(11, Math.floor((e.clientX - box.left) / box.width * 12));
    update();
  });
}
if (calc) {
  update();
  calc.addEventListener('input', update);
}

const form = document.getElementById('request-form');
form.addEventListener('submit', e => {
  e.preventDefault();
  const done = document.createElement('p');
  done.className = 'done';
  done.setAttribute('role', 'status');
  done.textContent = pick('Заявка принята. Перезвоним в течение часа.', '预订已收到。我们将在一小时内联系您。');
  form.replaceWith(done);
});
