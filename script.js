(function() {
  'use strict';

  // Core Data
  var TH = window.QURAN_TRANSLATION_DATA || {};
  var EN = window.QURAN_ENGLISH_TRANSLATION_DATA || {};
  var RAW = window.QURAN_ARABIC_DATA || {};
  var AR = RAW.quran || [];
  var SURAH = window.QURAN_SURAH_DATA || [];

  var SURAH_TH = ['','อัลฟาติฮะห์','อัลบะเกาะเราะห์','อาลิอิมรอน','อันนิซาอ์','อัลมาอิดะห์','อัลอันอาม','อัลอะอฺรอฟ','อัลอันฟาล','อัตเตาบะห์','ยูนุส','ฮูด','ยูซุฟ','อัรเราะอฺด','อิบรอฮีม','อัลฮิจญร์','อันนะห์ล','อัลอิสรออ์','อัลกะฮ์ฟ','มัรยัม','ฏอฮา','อัลอันบิยาอ์','อัลฮัจญ์','อัลมุอ์มินูน','อันนูร','อัลฟุรกอน','อัชชุอะรออ์','อันนัมล์','อัลเกาะศ็อศ','อัลอังกะบูต','อัรรูม','ลุกมาน','อัสสัจญดะห์','อัลอะห์ซาบ','สะบะอ์','ฟาฏิร','ยาซีน','อัศศ็อฟฟาต','ศอด','อัซซุมัร','ฆอฟิร','ฟุศศิลัต','อัชชูรอ','อัซซุครุฟ','อัดดุคอน','อัลญาซิยะห์','อัลอะห์กอฟ','มุฮัมมัด','อัลฟัตห์','อัลหุญุรอต','กอฟ','อัซซาริยาต','อัฏฏูร','อันนัจญ์ม','อัลกอมัร','อัรเราะห์มาน','อัลวากิอะห์','อัลฮะดีด','อัลมุญาดะละห์','อัลฮัชร์','อัลมุมตะหะนะห์','อัศศ็อฟ','อัลญุมุอะห์','อัลมุนาฟิกูน','อัตตะฆอบุน','อัฏฏอลาก','อัตตัห์รีม','อัลมุลก์','อัลกอลัม','อัลฮากกะห์','อัลมะอาริจญ์','นูห์','อัลญิน','อัลมุซซัมมิล','อัลมุดดัษษิร','อัลกิยามะห์','อัลอินซาน','อัลมุรซาลาต','อันนะบะอ์','อันนาซิอาต','อะบะสะ','อัตตักวีร','อัลอินฟิตอร','อัลมุฏ็อฟฟิฟีน','อัลอินชิก็อค','อัลบุรูจญ์','อัฏฏอริก','อัลอะอ์ลา','อัลฆอชิยะห์','อัลฟัจญ์ร','อัลบะลัด','อัชชัมส์','อัลลัยล์','อัฎฎุฮา','อัชชัรห์','อัตตีน','อัลอะลัก','อัลก็อเดร','อัลบัยยินะห์','อัซซัลซะละห์','อัลอาดิยาต','อัลกอริอะห์','อัตตะกาซุร','อัลอัศร์','อัลฮุมะซะห์','อัลฟีล','กุร็อยช์','อัลมาอูน','อัลเกาซัร','อัลกาฟิรูน','อันนัศร์','อัลมะซัด','อัลอิคลาศ','อัลฟะลัก','อันนาส'];

  // State Variables
  var currentSurah = 1;
  var showArabic = true;
  var showThai = true;
  var showEnglish = false;
  var isMushafMode = false;
  var arabicFontSize = 32;
  var translationFontSize = 15;
  var currentAudio = null;
  var currentPlayingKey = null;
  var isAutoPlayingSurah = false;
  var bookmarks = JSON.parse(localStorage.getItem('quran_bookmarks') || '[]');
  var appSettings = JSON.parse(localStorage.getItem('quran_settings') || '{}');

  if(!appSettings.arabicFont) {
    appSettings.arabicFont = 'KFGQPC Nastaleeq';
  }

  // Helper Elements
  function $(s) { return document.querySelector(s); }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if(cls) e.className = cls;
    if(html !== undefined) e.innerHTML = html;
    return e;
  }

  // Pre-build Ayah maps & Global Index mapping for audio
  var AYAH_MAP = {};
  var GLOBAL_AYAH_INDEX = {};
  for(var i = 0; i < AR.length; i++) {
    var item = AR[i];
    var c = item.chapter;
    if(!AYAH_MAP[c]) AYAH_MAP[c] = [];
    AYAH_MAP[c].push(item);
    var key = c + ':' + item.verse;
    GLOBAL_AYAH_INDEX[key] = i + 1; // 1 to 6236
  }

  function showToast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function() { t.classList.remove('show'); }, 2600);
  }

  function getSurahInfo(num) {
    for(var i = 0; i < SURAH.length; i++) {
      if(SURAH[i].id === num) return SURAH[i];
    }
    return null;
  }

  function getThaiText(key) {
    var item = TH[key];
    if(!item) return '';
    if(typeof item === 'string') {
      var ref = TH[item];
      return ref ? (ref.text || '') : '';
    }
    return item.text || '';
  }

  function getEnglishText(key) {
    var item = EN[key];
    if(!item) return '';
    if(typeof item === 'string') {
      var ref = EN[item];
      return ref ? (ref.text || '') : '';
    }
    return item.text || '';
  }

  function renderSurahGrid(filter) {
    var grid = $('#surahGrid');
    grid.innerHTML = '';
    var filterLower = (filter || '').toLowerCase().trim();
    var items = [];

    for(var i = 0; i < SURAH.length; i++) {
      var s = SURAH[i];
      if(filterLower) {
        var th = (SURAH_TH[s.id] || '').toLowerCase();
        var en = (s.ns || '').toLowerCase();
        var ar = (s.ar || '').toLowerCase();
        var num = String(s.id);
        if(th.indexOf(filterLower) === -1 && 
           en.indexOf(filterLower) === -1 && 
           ar.indexOf(filterLower) === -1 && 
           num.indexOf(filterLower) === -1) {
          continue;
        }
      }
      items.push(s);
    }

    if(!items.length) {
      grid.innerHTML = '<div class="no-results">ไม่พบซูเราะห์ที่ค้นหา</div>';
      return;
    }

    for(var i = 0; i < items.length; i++) {
      var s = items[i];
      var typeStr = s.rp === 'makkah' ? 'มักกียะฮ์' : 'มะดีนียะฮ์';
      var card = el('div', 'surah-grid-item');
      card.innerHTML = 
        '<div class="sg-left">' +
          '<div class="sg-number-box">' + s.id + '</div>' +
          '<div class="sg-info">' +
            '<div class="sg-name-th">' + (SURAH_TH[s.id] || s.ns) + '</div>' +
            '<div class="sg-name-en">' + s.ns + '</div>' +
            '<div class="sg-meta-text">' + s.vc + ' อายะฮ์ • ' + typeStr + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="sg-name-ar">' + s.ar + '</div>';

      card.addEventListener('click', (function(n) {
        return function() { selectSurah(n); };
      })(s.id));

      grid.appendChild(card);
    }
  }

  function openSurahModal() {
    $('#surahModal').classList.add('active');
    document.body.style.overflow = 'hidden';
    $('#surahSearch').value = '';
    renderSurahGrid('');
    setTimeout(function() { $('#surahSearch').focus(); }, 100);
  }

  function closeSurahModal() {
    $('#surahModal').classList.remove('active');
    document.body.style.overflow = '';
  }

  function selectSurah(num) {
    closeSurahModal();
    if(num < 1 || num > 114) return;
    currentSurah = num;
    stopAudio();
    renderSurah();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateSurahInfo(s) {
    $('#surahNameEn').textContent = s.ns;
    $('#surahAyahCount').textContent = s.vc + ' อายะฮ์';
  }

  function stopAudio() {
    if(currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    currentPlayingKey = null;
    isAutoPlayingSurah = false;
    updateAudioUI();
  }

  function updateAudioUI() {
    var btnPlaySurah = $('#btnPlaySurah');
    if(btnPlaySurah) {
      if(isAutoPlayingSurah) {
        btnPlaySurah.innerHTML = '⏹ หยุดเล่น';
        btnPlaySurah.classList.add('btn-gold');
      } else {
        btnPlaySurah.innerHTML = '▶ ฟังซูเราะห์';
        btnPlaySurah.classList.remove('btn-gold');
      }
    }

    var btns = document.querySelectorAll('.icon-btn.play-verse-btn');
    for(var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      var key = btn.getAttribute('data-key');
      if(key === currentPlayingKey) {
        btn.innerHTML = '⏸';
        btn.classList.add('playing-btn');
      } else {
        btn.innerHTML = '▶';
        btn.classList.remove('playing-btn');
      }
    }

    var cards = document.querySelectorAll('.ayah-card');
    for(var i = 0; i < cards.length; i++) {
      var card = cards[i];
      if(card.getAttribute('data-key') === currentPlayingKey) {
        card.classList.add('playing');
      } else {
        card.classList.remove('playing');
      }
    }
  }

  function playAyahAudio(surahNum, verseNum, autoNext) {
    var key = surahNum + ':' + verseNum;
    if(currentPlayingKey === key && currentAudio && !currentAudio.paused) {
      stopAudio();
      return;
    }

    if(currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }

    var globalIdx = GLOBAL_AYAH_INDEX[key];
    if(!globalIdx) return;

    currentPlayingKey = key;
    updateAudioUI();

    var audioUrl = 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/' + globalIdx + '.mp3';
    currentAudio = new Audio(audioUrl);
    currentAudio.play().catch(function(err) {
      showToast('ไม่สามารถเล่นเสียงได้ กรุณาตรวจสอบอินเทอร์เน็ต');
      stopAudio();
    });

    var targetCard = document.querySelector('.ayah-card[data-key="' + key + '"]');
    if(targetCard) {
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    currentAudio.onended = function() {
      if(autoNext && isAutoPlayingSurah) {
        var info = getSurahInfo(surahNum);
        if(info && verseNum < info.vc) {
          playAyahAudio(surahNum, verseNum + 1, true);
        } else {
          stopAudio();
          showToast('เล่นเสียงจบซูเราะห์แล้ว');
        }
      } else {
        stopAudio();
      }
    };
  }

  function isBookmarked(key) {
    return bookmarks.indexOf(key) !== -1;
  }

  function toggleBookmark(key) {
    var idx = bookmarks.indexOf(key);
    if(idx === -1) {
      bookmarks.push(key);
      showToast('บันทึกอายะฮ์ ' + key + ' ลงรายการโปรดแล้ว');
    } else {
      bookmarks.splice(idx, 1);
      showToast('ลบอายะฮ์ ' + key + ' ออกจากรายการโปรดแล้ว');
    }
    localStorage.setItem('quran_bookmarks', JSON.stringify(bookmarks));
    renderSurah();
  }

  function renderBookmarksModal() {
    var list = $('#bookmarksList');
    list.innerHTML = '';
    if(!bookmarks.length) {
      list.innerHTML = '<div class="no-results">ยังไม่มีรายการโปรดที่บันทึกไว้</div>';
      return;
    }

    for(var i = 0; i < bookmarks.length; i++) {
      var key = bookmarks[i];
      var parts = key.split(':');
      var sId = parseInt(parts[0], 10);
      var vId = parseInt(parts[1], 10);
      var thTxt = getThaiText(key);

      var itemDiv = el('div', 'ayah-card');
      itemDiv.style.marginBottom = '12px';
      itemDiv.innerHTML = 
        '<div class="ayah-card-header">' +
          '<div class="ayah-badge">ซูเราะห์ ' + (SURAH_TH[sId] || sId) + ' (อายะฮ์ ' + vId + ')</div>' +
          '<button class="btn-action" style="padding:4px 10px;font-size:12px">ไปที่อายะฮ์นี้</button>' +
        '</div>' +
        '<div class="ayah-translation thai" style="font-size:14px">' + thTxt + '</div>';

      (function(s, v, elem) {
        elem.querySelector('button').addEventListener('click', function() {
          $('#bookmarksModal').classList.remove('active');
          document.body.style.overflow = '';
          currentSurah = s;
          renderSurah();
          setTimeout(function() {
            var target = document.querySelector('.ayah-card[data-key="' + s + ':' + v + '"]');
            if(target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 200);
        });
      })(sId, vId, itemDiv);

      list.appendChild(itemDiv);
    }
  }

  // Settings handling
  function loadAppSettings() {
    appSettings = JSON.parse(localStorage.getItem('quran_settings') || '{}');
    // apply language visibility settings if present
    if(appSettings && typeof appSettings.arabicEnabled !== 'undefined') showArabic = !!appSettings.arabicEnabled;
    if(appSettings && typeof appSettings.thaiEnabled !== 'undefined') showThai = !!appSettings.thaiEnabled;
    if(appSettings && typeof appSettings.englishEnabled !== 'undefined') showEnglish = !!appSettings.englishEnabled;
  }

  function saveAppSettings() {
    localStorage.setItem('quran_settings', JSON.stringify(appSettings || {}));
  }

  function openSettingsModal() {
    renderSettingsModal();
    $('#settingsModal').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSettingsModal() {
    $('#settingsModal').classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderSettingsModal() {
    loadAppSettings();
    var sSelect = $('#settingsSurahSelect');
    var aInput = $('#settingsAyahInput');
    if(sSelect) {
      if(sSelect.options.length <= 1) {
        sSelect.innerHTML = '<option value="">เลือกซูเราะห์</option>';
        for(var i = 0; i < SURAH.length; i++) {
          var option = document.createElement('option');
          var surah = SURAH[i];
          var surahNumber = surah.id;
          var thaiName = SURAH_TH[surah.id] || surah.ns;
          var arabicName = surah.ns;
          var label = surahNumber + '. ' + thaiName + ' (' + arabicName + ')';
          option.value = surahNumber;
          option.textContent = label;
          sSelect.appendChild(option);
        }
      }
      sSelect.value = appSettings.defaultSurah || '';
    }
    if(aInput) aInput.value = appSettings.defaultAyah || '';
    var fontSelect = $('#settingsArabicFontSelect');
    var arabicSize = $('#settingsArabicSizeInput');
    var transSize = $('#settingsTranslationSizeInput');
    if(fontSelect) fontSelect.value = appSettings.arabicFont || '';
    if(arabicSize) arabicSize.value = appSettings.arabicFontSize || arabicFontSize;
    if(transSize) transSize.value = appSettings.translationFontSize || translationFontSize;
    // language toggles
    var tArabic = $('#toggleArabic');
    var tThai = $('#toggleThai');
    var tEnglish = $('#toggleEnglish');
    if(tArabic) tArabic.checked = (typeof appSettings.arabicEnabled !== 'undefined') ? !!appSettings.arabicEnabled : showArabic;
    if(tThai) tThai.checked = (typeof appSettings.thaiEnabled !== 'undefined') ? !!appSettings.thaiEnabled : showThai;
    if(tEnglish) tEnglish.checked = (typeof appSettings.englishEnabled !== 'undefined') ? !!appSettings.englishEnabled : showEnglish;
  }

  function saveSettingsFromUI() {
    var s = parseInt($('#settingsSurahSelect').value, 10);
    var a = parseInt($('#settingsAyahInput').value, 10);
    if(s && s >= 1 && s <= 114) {
      appSettings.defaultSurah = s;
    } else {
      delete appSettings.defaultSurah;
    }
    if(a && a > 0) appSettings.defaultAyah = a; else delete appSettings.defaultAyah;
    var fontSel = $('#settingsArabicFontSelect');
    var aSize = parseInt($('#settingsArabicSizeInput').value, 10);
    var tSize = parseInt($('#settingsTranslationSizeInput').value, 10);
    if(fontSel && fontSel.value) {
      appSettings.arabicFont = fontSel.value;
      document.documentElement.style.setProperty('--font-arabic', "'" + fontSel.value + "'");
    } else {
      delete appSettings.arabicFont;
    }
    if(aSize && aSize > 0) { appSettings.arabicFontSize = aSize; arabicFontSize = aSize; }
    else delete appSettings.arabicFontSize;
    if(tSize && tSize > 0) { appSettings.translationFontSize = tSize; translationFontSize = tSize; }
    else delete appSettings.translationFontSize;
    applyFontSizes();
    // save language visibility choices
    var tArabic = $('#toggleArabic');
    var tThai = $('#toggleThai');
    var tEnglish = $('#toggleEnglish');
    if(tArabic) { appSettings.arabicEnabled = !!tArabic.checked; showArabic = !!tArabic.checked; }
    if(tThai) { appSettings.thaiEnabled = !!tThai.checked; showThai = !!tThai.checked; }
    if(tEnglish) { appSettings.englishEnabled = !!tEnglish.checked; showEnglish = !!tEnglish.checked; }
    renderSurah();
    saveAppSettings();
    showToast('บันทึกการตั้งค่าแล้ว');
    closeSettingsModal();
    if(appSettings.defaultSurah) {
      currentSurah = appSettings.defaultSurah;
      renderSurah();
      if(appSettings.defaultAyah) {
        setTimeout(function() {
          var target = document.querySelector('.ayah-card[data-key="' + currentSurah + ':' + appSettings.defaultAyah + '"]');
          if(target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 220);
      }
    }
  }

  function saveCurrentAsDefault() {
    appSettings.defaultSurah = currentSurah;
    var ay = getVisibleAyah();
    if(ay && ay > 0) appSettings.defaultAyah = ay; else delete appSettings.defaultAyah;
    saveAppSettings();
    showToast('ตั้งค่าตำแหน่งปัจจุบันเป็นค่าเริ่มต้นแล้ว');
    closeSettingsModal();
  }

  // Find the ayah card nearest to the viewport center
  function getVisibleAyah() {
    var cards = document.querySelectorAll('.ayah-card');
    if(!cards || !cards.length) return null;
    var best = null; var bestDist = Infinity;
    var vpCenter = window.innerHeight / 2;
    for(var i = 0; i < cards.length; i++) {
      var r = cards[i].getBoundingClientRect();
      var cardCenter = r.top + (r.height / 2);
      var d = Math.abs(cardCenter - vpCenter);
      if(d < bestDist) { bestDist = d; best = cards[i]; }
    }
    if(best) {
      var key = best.getAttribute('data-key');
      if(!key) return null;
      var parts = key.split(':');
      return parseInt(parts[1], 10) || null;
    }
    return null;
  }

  function clearDefaultPosition() {
    delete appSettings.defaultSurah;
    delete appSettings.defaultAyah;
    saveAppSettings();
    showToast('ล้างค่าตำแหน่งเริ่มต้นแล้ว');
    closeSettingsModal();
  }

  function renderSurah() {
    var info = getSurahInfo(currentSurah);
    if(info) updateSurahInfo(info);

    var container = $('#ayahs-container');
    var mushafContainer = $('#mushaf-container');
    container.innerHTML = '';
    mushafContainer.innerHTML = '';

    var ayahs = AYAH_MAP[currentSurah] || [];
    var searchInput = $('#searchInSurah');
    var filterTerm = searchInput ? (searchInput.value || '').toLowerCase().trim() : '';

    if(currentSurah !== 9 && currentSurah !== 1) {
      var bismillahBanner = el('div', 'surah-bismillah-banner', '<div class="bismillah-text">بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</div>');
      container.appendChild(bismillahBanner);
    }

    var mushafHTML = '';

    for(var i = 0; i < ayahs.length; i++) {
      var ayah = ayahs[i];
      var v = ayah.verse;
      var key = currentSurah + ':' + v;
      var arabicTxt = ayah.text || '';
      var thTxt = getThaiText(key);
      var enTxt = getEnglishText(key);

      if(filterTerm) {
        if(arabicTxt.toLowerCase().indexOf(filterTerm) === -1 &&
           thTxt.toLowerCase().indexOf(filterTerm) === -1 &&
           enTxt.toLowerCase().indexOf(filterTerm) === -1) {
          continue;
        }
      }

      var card = el('div', 'ayah-card');
      card.setAttribute('data-key', key);
      card.id = 'ayah-' + v;

      var header = el('div', 'ayah-card-header');
      header.innerHTML = 
        '<div class="ayah-badge">อายะฮ์ ' + v + '</div>' +
        '<div class="ayah-actions">' +
          '<button class="icon-btn play-verse-btn" data-key="' + key + '" title="ฟังเสียงอ่าน">▶</button>' +
          '<button class="icon-btn copy-btn" title="คัดลอกอายะฮ์">📋</button>' +
          '<button class="icon-btn bkm-btn ' + (isBookmarked(key) ? 'active' : '') + '" title="บันทึกรายการโปรด">⭐</button>' +
        '</div>';

      (function(s, vNum, keyStr, ar, th, en, headerDiv) {
        headerDiv.querySelector('.play-verse-btn').addEventListener('click', function() {
          playAyahAudio(s, vNum, false);
        });

        headerDiv.querySelector('.copy-btn').addEventListener('click', function() {
          var copyText = '[' + (SURAH_TH[s] || s) + ' ' + s + ':' + vNum + ']\n\n' +
                         ar + '\n\n' +
                         (th ? '🇹🇭 ' + th + '\n\n' : '') +
                         (en ? '🇬🇧 ' + en : '');
          navigator.clipboard.writeText(copyText).then(function() {
            showToast('คัดลอกอายะฮ์ ' + keyStr + ' เรียบร้อยแล้ว');
          });
        });

        headerDiv.querySelector('.bkm-btn').addEventListener('click', function() {
          toggleBookmark(keyStr);
        });
      })(currentSurah, v, key, arabicTxt, thTxt, enTxt, header);

      card.appendChild(header);

      if(showArabic) {
        var arDiv = el('div', 'ayah-arabic', arabicTxt);
        card.appendChild(arDiv);
      }

      if((thTxt && showThai) || (enTxt && showEnglish)) {
        card.appendChild(el('div', 'ayah-sep'));
      }

      if(thTxt && showThai) {
        var thBlock = el('div', 'translation-block');
        thBlock.innerHTML = '<div class="lang-label">🇹🇭 ภาษาไทย (Mukhtasar)</div><div class="ayah-translation thai">' + thTxt + '</div>';
        card.appendChild(thBlock);
      }

      if(enTxt && showEnglish) {
        var enBlock = el('div', 'translation-block');
        enBlock.innerHTML = '<div class="lang-label">🇬🇧 ENGLISH (Mukhtasar)</div><div class="ayah-translation english">' + enTxt + '</div>';
        card.appendChild(enBlock);
      }

      // Insert thematic pill into header center (if helper exists)
      try {
        if(typeof getAyatThemes === 'function') {
          var themes = getAyatThemes(currentSurah, v, 'th') || [];
          if(themes && themes.length) {
            var headerCenter = header.querySelector('.ayah-header-center');
            if(!headerCenter) {
              headerCenter = el('div', 'ayah-header-center');
              header.insertBefore(headerCenter, header.querySelector('.ayah-actions'));
            }
            var pill = el('div', 'ayah-theme');
            pill.textContent = themes.join(', ');
            headerCenter.appendChild(pill);
          }
        }
      } catch(e) {
        console.warn('Error getting themes for', currentSurah + ':' + v, e);
      }

      container.appendChild(card);
      mushafHTML += '<span class="mushaf-word">' + arabicTxt + '</span> <span class="mushaf-ayah-num">' + v + '</span> ';
    }

    mushafContainer.innerHTML = mushafHTML;
    updateAudioUI();
    applyFontSizes();
  }

  function applyFontSizes() {
    document.documentElement.style.setProperty('--arabic-size', arabicFontSize + 'px');
    document.documentElement.style.setProperty('--translation-size', translationFontSize + 'px');
  }

  function initEvents() {
    var prevEl = $('#prevSurah');
    if(prevEl) prevEl.addEventListener('click', function() {
      if(currentSurah > 1) selectSurah(currentSurah - 1);
    });

    var nextEl = $('#nextSurah');
    if(nextEl) nextEl.addEventListener('click', function() {
      if(currentSurah < 114) selectSurah(currentSurah + 1);
    });

    $('#openSurahSel').addEventListener('click', openSurahModal);
    $('#closeModal').addEventListener('click', closeSurahModal);
    $('#surahModal').addEventListener('click', function(e) {
      if(e.target === this) closeSurahModal();
    });

    $('#surahSearch').addEventListener('input', function() {
      renderSurahGrid(this.value);
    });

    $('#toggleArabic').addEventListener('change', function() {
      showArabic = this.checked;
      appSettings.arabicEnabled = !!this.checked;
      saveAppSettings();
      renderSurah();
    });
    $('#toggleThai').addEventListener('change', function() {
      showThai = this.checked;
      appSettings.thaiEnabled = !!this.checked;
      saveAppSettings();
      renderSurah();
    });
    $('#toggleEnglish').addEventListener('change', function() {
      showEnglish = this.checked;
      appSettings.englishEnabled = !!this.checked;
      saveAppSettings();
      renderSurah();
    });

    // font selection moved into Settings modal

    $('#btnToggleMode').addEventListener('click', function() {
      isMushafMode = !isMushafMode;
      if(isMushafMode) {
        this.innerHTML = '📖 มุศหัฟ';
        $('#ayahs-container').style.display = 'none';
        $('#mushaf-container').style.display = 'block';
      } else {
        this.innerHTML = '🎴 การ์ด';
        $('#ayahs-container').style.display = 'flex';
        $('#mushaf-container').style.display = 'none';
      }
    });

    $('#btnPlaySurah').addEventListener('click', function() {
      if(isAutoPlayingSurah) {
        stopAudio();
      } else {
        isAutoPlayingSurah = true;
        playAyahAudio(currentSurah, 1, true);
      }
    });

    var btnToggleNav = $('#btnToggleNav');
    if(btnToggleNav) {
      btnToggleNav.addEventListener('click', function() {
        var navCard = document.querySelector('.surah-nav-card');
        if(navCard) navCard.classList.toggle('nav-open');
      });
    }

    // Font size and jump-to-ayah controls moved into Settings modal.

    var searchInSurahInput = $('#searchInSurah');
    if (searchInSurahInput) {
      searchInSurahInput.addEventListener('input', function() {
        renderSurah();
      });
    }

    $('#btnOpenBookmarks').addEventListener('click', function() {
      renderBookmarksModal();
      $('#bookmarksModal').classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    // Settings button
    var btnOpenSettings = $('#btnOpenSettings');
    if(btnOpenSettings) {
      btnOpenSettings.addEventListener('click', function() {
        openSettingsModal();
      });
    }

    $('#closeSettingsModal').addEventListener('click', function() {
      closeSettingsModal();
    });

    $('#settingsModal').addEventListener('click', function(e) {
      if(e.target === this) closeSettingsModal();
    });

    $('#btnSaveSettings').addEventListener('click', function() { saveSettingsFromUI(); });
    $('#btnSaveCurrentAsDefault').addEventListener('click', function() { saveCurrentAsDefault(); });
    $('#btnClearDefault').addEventListener('click', function() { clearDefaultPosition(); });

    $('#closeBookmarksModal').addEventListener('click', function() {
      $('#bookmarksModal').classList.remove('active');
      document.body.style.overflow = '';
    });

    $('#bookmarksModal').addEventListener('click', function(e) {
      if(e.target === this) {
        $('#bookmarksModal').classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    document.addEventListener('keydown', function(e) {
      if(e.key === 'Escape') {
        closeSurahModal();
        $('#bookmarksModal').classList.remove('active');
        document.body.style.overflow = '';
      }
      if(e.target.tagName !== 'INPUT') {
        if(e.key === 'ArrowLeft' && currentSurah > 1) {
          selectSurah(currentSurah - 1);
        }
        if(e.key === 'ArrowRight' && currentSurah < 114) {
          selectSurah(currentSurah + 1);
        }
      }
    });
  }

  try {
    loadAppSettings();
    if(appSettings && appSettings.defaultSurah) {
      currentSurah = parseInt(appSettings.defaultSurah, 10) || currentSurah;
    }
    // apply saved font settings
    if(appSettings && appSettings.arabicFont) {
      document.documentElement.style.setProperty('--font-arabic', "'" + appSettings.arabicFont + "'");
    }
    if(appSettings && appSettings.arabicFontSize) {
      arabicFontSize = parseInt(appSettings.arabicFontSize, 10) || arabicFontSize;
    }
    if(appSettings && appSettings.translationFontSize) {
      translationFontSize = parseInt(appSettings.translationFontSize, 10) || translationFontSize;
    }
    initEvents();
    renderSurahGrid('');
    renderSurah();
    // If default ayah set, scroll to it after render
    if(appSettings && appSettings.defaultAyah) {
      setTimeout(function() {
        var target = document.querySelector('.ayah-card[data-key="' + currentSurah + ':' + appSettings.defaultAyah + '"]');
        if(target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 220);
    }
    $('#loading-msg').style.display = 'none';
  } catch(e) {
    $('#loading-msg').innerHTML = '<div style="color:#ef4444">เกิดข้อผิดพลาดในการโหลด: ' + e.message + '</div>';
    console.error(e);
  }
})();
