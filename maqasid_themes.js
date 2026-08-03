(function(){
  function parseRange(r){
    if(!r) return [];
    r = String(r).trim();
    if(r.indexOf('-')!==-1){
      var parts = r.split('-').map(function(x){return parseInt(x,10);} );
      var start = parts[0], end = parts[1];
      if(isNaN(start) || isNaN(end)) return [];
      var out = [];
      for(var i=start;i<=end;i++) out.push(i);
      return out;
    }
    var n = parseInt(r,10);
    return isNaN(n)?[]:[n];
  }

  function expand(){
    if(!window.QURAN_MAP_DATA || !Array.isArray(window.QURAN_MAP_DATA)) return;
    window.QURAN_MAP_BY_SURAH = {};
    window.QURAN_THEMATIC_BY_AYAT = {};

    window.QURAN_MAP_DATA.forEach(function(surah){
      var sid = String(surah.surah_id);
      window.QURAN_MAP_BY_SURAH[sid] = surah;
      var map = {};
      if(Array.isArray(surah.thematic_ayat)){
        surah.thematic_ayat.forEach(function(t){
          var ayats = parseRange(t.ayat_range);
          ayats.forEach(function(a){
            if(!map[a]) map[a] = [];
            map[a].push({
              ayat_range: t.ayat_range,
              theme: t.theme,
              theme_en: t.theme_en,
              theme_ms: t.theme_ms
            });
          });
        });
      }
      surah.thematic_ayat_by_ayat = map;
      window.QURAN_THEMATIC_BY_AYAT[sid] = map;
    });

    window.getAyatThemes = function(surahId, ayatNum, lang){
      if(typeof surahId === 'number') surahId = String(surahId);
      var s = window.QURAN_MAP_BY_SURAH[String(surahId)];
      if(!s) return [];
      var arr = s.thematic_ayat_by_ayat && s.thematic_ayat_by_ayat[Number(ayatNum)] || [];
      // Build display text and append ayat_range
      return arr.map(function(x){
        var text = x.theme || '';
        if(lang === 'en') text = x.theme_en || x.theme || '';
        if(lang === 'ms') text = x.theme_ms || x.theme || '';
        // append range if available and not already present
        var range = x.ayat_range ? String(x.ayat_range) : '';
        if(range) text = text + ' (' + range + ')';
        return text;
      });
    };
  }

  expand();
  if(typeof module !== 'undefined' && module.exports) module.exports = { expand: expand };
})();
