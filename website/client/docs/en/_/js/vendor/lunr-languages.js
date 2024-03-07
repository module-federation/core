/*!
 * Snowball JavaScript Library v0.3
 * http://code.google.com/p/urim/
 * http://snowball.tartarus.org/
 *
 * Copyright 2010, Oleg Mazko
 * http://www.mozilla.org/MPL/
 */

/**
 * export the module via AMD, CommonJS or as a browser global
 * Export code from https://github.com/umdjs/umd/blob/master/returnExports.js
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else if (typeof exports === 'object') {
    /**
     * Node. Does not work with strict CommonJS, but
     * only CommonJS-like environments that support module.exports,
     * like Node.
     */
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    factory()(root.lunr);
  }
})(this, function () {
  /**
   * Just return a value to define the module export.
   * This example returns an object, but the module
   * can return a function as the exported value.
   */
  return function (lunr) {
    /* provides utilities for the included stemmers */
    lunr.stemmerSupport = {
      Among: function (s, substring_i, result, method) {
        this.toCharArray = function (s) {
          var sLength = s.length,
            charArr = new Array(sLength);
          for (var i = 0; i < sLength; i++) charArr[i] = s.charCodeAt(i);
          return charArr;
        };

        if ((!s && s != '') || (!substring_i && substring_i != 0) || !result)
          throw (
            'Bad Among initialisation: s:' +
            s +
            ', substring_i: ' +
            substring_i +
            ', result: ' +
            result
          );
        this.s_size = s.length;
        this.s = this.toCharArray(s);
        this.substring_i = substring_i;
        this.result = result;
        this.method = method;
      },
      SnowballProgram: function () {
        var current;
        return {
          bra: 0,
          ket: 0,
          limit: 0,
          cursor: 0,
          limit_backward: 0,
          setCurrent: function (word) {
            current = word;
            this.cursor = 0;
            this.limit = word.length;
            this.limit_backward = 0;
            this.bra = this.cursor;
            this.ket = this.limit;
          },
          getCurrent: function () {
            var result = current;
            current = null;
            return result;
          },
          in_grouping: function (s, min, max) {
            if (this.cursor < this.limit) {
              var ch = current.charCodeAt(this.cursor);
              if (ch <= max && ch >= min) {
                ch -= min;
                if (s[ch >> 3] & (0x1 << (ch & 0x7))) {
                  this.cursor++;
                  return true;
                }
              }
            }
            return false;
          },
          in_grouping_b: function (s, min, max) {
            if (this.cursor > this.limit_backward) {
              var ch = current.charCodeAt(this.cursor - 1);
              if (ch <= max && ch >= min) {
                ch -= min;
                if (s[ch >> 3] & (0x1 << (ch & 0x7))) {
                  this.cursor--;
                  return true;
                }
              }
            }
            return false;
          },
          out_grouping: function (s, min, max) {
            if (this.cursor < this.limit) {
              var ch = current.charCodeAt(this.cursor);
              if (ch > max || ch < min) {
                this.cursor++;
                return true;
              }
              ch -= min;
              if (!(s[ch >> 3] & (0x1 << (ch & 0x7)))) {
                this.cursor++;
                return true;
              }
            }
            return false;
          },
          out_grouping_b: function (s, min, max) {
            if (this.cursor > this.limit_backward) {
              var ch = current.charCodeAt(this.cursor - 1);
              if (ch > max || ch < min) {
                this.cursor--;
                return true;
              }
              ch -= min;
              if (!(s[ch >> 3] & (0x1 << (ch & 0x7)))) {
                this.cursor--;
                return true;
              }
            }
            return false;
          },
          eq_s: function (s_size, s) {
            if (this.limit - this.cursor < s_size) return false;
            for (var i = 0; i < s_size; i++)
              if (current.charCodeAt(this.cursor + i) != s.charCodeAt(i))
                return false;
            this.cursor += s_size;
            return true;
          },
          eq_s_b: function (s_size, s) {
            if (this.cursor - this.limit_backward < s_size) return false;
            for (var i = 0; i < s_size; i++)
              if (
                current.charCodeAt(this.cursor - s_size + i) != s.charCodeAt(i)
              )
                return false;
            this.cursor -= s_size;
            return true;
          },
          find_among: function (v, v_size) {
            var i = 0,
              j = v_size,
              c = this.cursor,
              l = this.limit,
              common_i = 0,
              common_j = 0,
              first_key_inspected = false;
            while (true) {
              var k = i + ((j - i) >> 1),
                diff = 0,
                common = common_i < common_j ? common_i : common_j,
                w = v[k];
              for (var i2 = common; i2 < w.s_size; i2++) {
                if (c + common == l) {
                  diff = -1;
                  break;
                }
                diff = current.charCodeAt(c + common) - w.s[i2];
                if (diff) break;
                common++;
              }
              if (diff < 0) {
                j = k;
                common_j = common;
              } else {
                i = k;
                common_i = common;
              }
              if (j - i <= 1) {
                if (i > 0 || j == i || first_key_inspected) break;
                first_key_inspected = true;
              }
            }
            while (true) {
              var w = v[i];
              if (common_i >= w.s_size) {
                this.cursor = c + w.s_size;
                if (!w.method) return w.result;
                var res = w.method();
                this.cursor = c + w.s_size;
                if (res) return w.result;
              }
              i = w.substring_i;
              if (i < 0) return 0;
            }
          },
          find_among_b: function (v, v_size) {
            var i = 0,
              j = v_size,
              c = this.cursor,
              lb = this.limit_backward,
              common_i = 0,
              common_j = 0,
              first_key_inspected = false;
            while (true) {
              var k = i + ((j - i) >> 1),
                diff = 0,
                common = common_i < common_j ? common_i : common_j,
                w = v[k];
              for (var i2 = w.s_size - 1 - common; i2 >= 0; i2--) {
                if (c - common == lb) {
                  diff = -1;
                  break;
                }
                diff = current.charCodeAt(c - 1 - common) - w.s[i2];
                if (diff) break;
                common++;
              }
              if (diff < 0) {
                j = k;
                common_j = common;
              } else {
                i = k;
                common_i = common;
              }
              if (j - i <= 1) {
                if (i > 0 || j == i || first_key_inspected) break;
                first_key_inspected = true;
              }
            }
            while (true) {
              var w = v[i];
              if (common_i >= w.s_size) {
                this.cursor = c - w.s_size;
                if (!w.method) return w.result;
                var res = w.method();
                this.cursor = c - w.s_size;
                if (res) return w.result;
              }
              i = w.substring_i;
              if (i < 0) return 0;
            }
          },
          replace_s: function (c_bra, c_ket, s) {
            var adjustment = s.length - (c_ket - c_bra),
              left = current.substring(0, c_bra),
              right = current.substring(c_ket);
            current = left + s + right;
            this.limit += adjustment;
            if (this.cursor >= c_ket) this.cursor += adjustment;
            else if (this.cursor > c_bra) this.cursor = c_bra;
            return adjustment;
          },
          slice_check: function () {
            if (
              this.bra < 0 ||
              this.bra > this.ket ||
              this.ket > this.limit ||
              this.limit > current.length
            )
              throw 'faulty slice operation';
          },
          slice_from: function (s) {
            this.slice_check();
            this.replace_s(this.bra, this.ket, s);
          },
          slice_del: function () {
            this.slice_from('');
          },
          insert: function (c_bra, c_ket, s) {
            var adjustment = this.replace_s(c_bra, c_ket, s);
            if (c_bra <= this.bra) this.bra += adjustment;
            if (c_bra <= this.ket) this.ket += adjustment;
          },
          slice_to: function () {
            this.slice_check();
            return current.substring(this.bra, this.ket);
          },
          eq_v_b: function (s) {
            return this.eq_s_b(s.length, s);
          },
        };
      },
    };

    lunr.trimmerSupport = {
      generateTrimmer: function (wordCharacters) {
        var startRegex = new RegExp('^[^' + wordCharacters + ']+');
        var endRegex = new RegExp('[^' + wordCharacters + ']+$');

        return function (token) {
          // for lunr version 2
          if (typeof token.update === 'function') {
            return token.update(function (s) {
              return s.replace(startRegex, '').replace(endRegex, '');
            });
          } else {
            // for lunr version 1
            return token.replace(startRegex, '').replace(endRegex, '');
          }
        };
      },
    };
  };
});
/*!
 * Lunr languages, `Spanish` language
 * https://github.com/MihaiValentin/lunr-languages
 *
 * Copyright 2014, Mihai Valentin
 * http://www.mozilla.org/MPL/
 */
/*!
 * based on
 * Snowball JavaScript Library v0.3
 * http://code.google.com/p/urim/
 * http://snowball.tartarus.org/
 *
 * Copyright 2010, Oleg Mazko
 * http://www.mozilla.org/MPL/
 */

/**
 * export the module via AMD, CommonJS or as a browser global
 * Export code from https://github.com/umdjs/umd/blob/master/returnExports.js
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else if (typeof exports === 'object') {
    /**
     * Node. Does not work with strict CommonJS, but
     * only CommonJS-like environments that support module.exports,
     * like Node.
     */
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    factory()(root.lunr);
  }
})(this, function () {
  /**
   * Just return a value to define the module export.
   * This example returns an object, but the module
   * can return a function as the exported value.
   */
  return function (lunr) {
    /* throw error if lunr is not yet included */
    if ('undefined' === typeof lunr) {
      throw new Error(
        'Lunr is not present. Please include / require Lunr before this script.'
      );
    }

    /* throw error if lunr stemmer support is not yet included */
    if ('undefined' === typeof lunr.stemmerSupport) {
      throw new Error(
        'Lunr stemmer support is not present. Please include / require Lunr stemmer support before this script.'
      );
    }

    /* register specific locale function */
    lunr.es = function () {
      this.pipeline.reset();
      this.pipeline.add(
        lunr.es.trimmer,
        lunr.es.stopWordFilter,
        lunr.es.stemmer
      );

      // for lunr version 2
      // this is necessary so that every searched word is also stemmed before
      // in lunr <= 1 this is not needed, as it is done using the normal pipeline
      if (this.searchPipeline) {
        this.searchPipeline.reset();
        this.searchPipeline.add(lunr.es.stemmer);
      }
    };

    /* lunr trimmer function */
    lunr.es.wordCharacters =
      'A-Za-z\xAA\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02B8\u02E0-\u02E4\u1D00-\u1D25\u1D2C-\u1D5C\u1D62-\u1D65\u1D6B-\u1D77\u1D79-\u1DBE\u1E00-\u1EFF\u2071\u207F\u2090-\u209C\u212A\u212B\u2132\u214E\u2160-\u2188\u2C60-\u2C7F\uA722-\uA787\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA7FF\uAB30-\uAB5A\uAB5C-\uAB64\uFB00-\uFB06\uFF21-\uFF3A\uFF41-\uFF5A';
    lunr.es.trimmer = lunr.trimmerSupport.generateTrimmer(
      lunr.es.wordCharacters
    );

    lunr.Pipeline.registerFunction(lunr.es.trimmer, 'trimmer-es');

    /* lunr stemmer function */
    lunr.es.stemmer = (function () {
      /* create the wrapped stemmer object */
      var Among = lunr.stemmerSupport.Among,
        SnowballProgram = lunr.stemmerSupport.SnowballProgram,
        st = new (function SpanishStemmer() {
          var a_0 = [
              new Among('', -1, 6),
              new Among('\u00E1', 0, 1),
              new Among('\u00E9', 0, 2),
              new Among('\u00ED', 0, 3),
              new Among('\u00F3', 0, 4),
              new Among('\u00FA', 0, 5),
            ],
            a_1 = [
              new Among('la', -1, -1),
              new Among('sela', 0, -1),
              new Among('le', -1, -1),
              new Among('me', -1, -1),
              new Among('se', -1, -1),
              new Among('lo', -1, -1),
              new Among('selo', 5, -1),
              new Among('las', -1, -1),
              new Among('selas', 7, -1),
              new Among('les', -1, -1),
              new Among('los', -1, -1),
              new Among('selos', 10, -1),
              new Among('nos', -1, -1),
            ],
            a_2 = [
              new Among('ando', -1, 6),
              new Among('iendo', -1, 6),
              new Among('yendo', -1, 7),
              new Among('\u00E1ndo', -1, 2),
              new Among('i\u00E9ndo', -1, 1),
              new Among('ar', -1, 6),
              new Among('er', -1, 6),
              new Among('ir', -1, 6),
              new Among('\u00E1r', -1, 3),
              new Among('\u00E9r', -1, 4),
              new Among('\u00EDr', -1, 5),
            ],
            a_3 = [
              new Among('ic', -1, -1),
              new Among('ad', -1, -1),
              new Among('os', -1, -1),
              new Among('iv', -1, 1),
            ],
            a_4 = [
              new Among('able', -1, 1),
              new Among('ible', -1, 1),
              new Among('ante', -1, 1),
            ],
            a_5 = [
              new Among('ic', -1, 1),
              new Among('abil', -1, 1),
              new Among('iv', -1, 1),
            ],
            a_6 = [
              new Among('ica', -1, 1),
              new Among('ancia', -1, 2),
              new Among('encia', -1, 5),
              new Among('adora', -1, 2),
              new Among('osa', -1, 1),
              new Among('ista', -1, 1),
              new Among('iva', -1, 9),
              new Among('anza', -1, 1),
              new Among('log\u00EDa', -1, 3),
              new Among('idad', -1, 8),
              new Among('able', -1, 1),
              new Among('ible', -1, 1),
              new Among('ante', -1, 2),
              new Among('mente', -1, 7),
              new Among('amente', 13, 6),
              new Among('aci\u00F3n', -1, 2),
              new Among('uci\u00F3n', -1, 4),
              new Among('ico', -1, 1),
              new Among('ismo', -1, 1),
              new Among('oso', -1, 1),
              new Among('amiento', -1, 1),
              new Among('imiento', -1, 1),
              new Among('ivo', -1, 9),
              new Among('ador', -1, 2),
              new Among('icas', -1, 1),
              new Among('ancias', -1, 2),
              new Among('encias', -1, 5),
              new Among('adoras', -1, 2),
              new Among('osas', -1, 1),
              new Among('istas', -1, 1),
              new Among('ivas', -1, 9),
              new Among('anzas', -1, 1),
              new Among('log\u00EDas', -1, 3),
              new Among('idades', -1, 8),
              new Among('ables', -1, 1),
              new Among('ibles', -1, 1),
              new Among('aciones', -1, 2),
              new Among('uciones', -1, 4),
              new Among('adores', -1, 2),
              new Among('antes', -1, 2),
              new Among('icos', -1, 1),
              new Among('ismos', -1, 1),
              new Among('osos', -1, 1),
              new Among('amientos', -1, 1),
              new Among('imientos', -1, 1),
              new Among('ivos', -1, 9),
            ],
            a_7 = [
              new Among('ya', -1, 1),
              new Among('ye', -1, 1),
              new Among('yan', -1, 1),
              new Among('yen', -1, 1),
              new Among('yeron', -1, 1),
              new Among('yendo', -1, 1),
              new Among('yo', -1, 1),
              new Among('yas', -1, 1),
              new Among('yes', -1, 1),
              new Among('yais', -1, 1),
              new Among('yamos', -1, 1),
              new Among('y\u00F3', -1, 1),
            ],
            a_8 = [
              new Among('aba', -1, 2),
              new Among('ada', -1, 2),
              new Among('ida', -1, 2),
              new Among('ara', -1, 2),
              new Among('iera', -1, 2),
              new Among('\u00EDa', -1, 2),
              new Among('ar\u00EDa', 5, 2),
              new Among('er\u00EDa', 5, 2),
              new Among('ir\u00EDa', 5, 2),
              new Among('ad', -1, 2),
              new Among('ed', -1, 2),
              new Among('id', -1, 2),
              new Among('ase', -1, 2),
              new Among('iese', -1, 2),
              new Among('aste', -1, 2),
              new Among('iste', -1, 2),
              new Among('an', -1, 2),
              new Among('aban', 16, 2),
              new Among('aran', 16, 2),
              new Among('ieran', 16, 2),
              new Among('\u00EDan', 16, 2),
              new Among('ar\u00EDan', 20, 2),
              new Among('er\u00EDan', 20, 2),
              new Among('ir\u00EDan', 20, 2),
              new Among('en', -1, 1),
              new Among('asen', 24, 2),
              new Among('iesen', 24, 2),
              new Among('aron', -1, 2),
              new Among('ieron', -1, 2),
              new Among('ar\u00E1n', -1, 2),
              new Among('er\u00E1n', -1, 2),
              new Among('ir\u00E1n', -1, 2),
              new Among('ado', -1, 2),
              new Among('ido', -1, 2),
              new Among('ando', -1, 2),
              new Among('iendo', -1, 2),
              new Among('ar', -1, 2),
              new Among('er', -1, 2),
              new Among('ir', -1, 2),
              new Among('as', -1, 2),
              new Among('abas', 39, 2),
              new Among('adas', 39, 2),
              new Among('idas', 39, 2),
              new Among('aras', 39, 2),
              new Among('ieras', 39, 2),
              new Among('\u00EDas', 39, 2),
              new Among('ar\u00EDas', 45, 2),
              new Among('er\u00EDas', 45, 2),
              new Among('ir\u00EDas', 45, 2),
              new Among('es', -1, 1),
              new Among('ases', 49, 2),
              new Among('ieses', 49, 2),
              new Among('abais', -1, 2),
              new Among('arais', -1, 2),
              new Among('ierais', -1, 2),
              new Among('\u00EDais', -1, 2),
              new Among('ar\u00EDais', 55, 2),
              new Among('er\u00EDais', 55, 2),
              new Among('ir\u00EDais', 55, 2),
              new Among('aseis', -1, 2),
              new Among('ieseis', -1, 2),
              new Among('asteis', -1, 2),
              new Among('isteis', -1, 2),
              new Among('\u00E1is', -1, 2),
              new Among('\u00E9is', -1, 1),
              new Among('ar\u00E9is', 64, 2),
              new Among('er\u00E9is', 64, 2),
              new Among('ir\u00E9is', 64, 2),
              new Among('ados', -1, 2),
              new Among('idos', -1, 2),
              new Among('amos', -1, 2),
              new Among('\u00E1bamos', 70, 2),
              new Among('\u00E1ramos', 70, 2),
              new Among('i\u00E9ramos', 70, 2),
              new Among('\u00EDamos', 70, 2),
              new Among('ar\u00EDamos', 74, 2),
              new Among('er\u00EDamos', 74, 2),
              new Among('ir\u00EDamos', 74, 2),
              new Among('emos', -1, 1),
              new Among('aremos', 78, 2),
              new Among('eremos', 78, 2),
              new Among('iremos', 78, 2),
              new Among('\u00E1semos', 78, 2),
              new Among('i\u00E9semos', 78, 2),
              new Among('imos', -1, 2),
              new Among('ar\u00E1s', -1, 2),
              new Among('er\u00E1s', -1, 2),
              new Among('ir\u00E1s', -1, 2),
              new Among('\u00EDs', -1, 2),
              new Among('ar\u00E1', -1, 2),
              new Among('er\u00E1', -1, 2),
              new Among('ir\u00E1', -1, 2),
              new Among('ar\u00E9', -1, 2),
              new Among('er\u00E9', -1, 2),
              new Among('ir\u00E9', -1, 2),
              new Among('i\u00F3', -1, 2),
            ],
            a_9 = [
              new Among('a', -1, 1),
              new Among('e', -1, 2),
              new Among('o', -1, 1),
              new Among('os', -1, 1),
              new Among('\u00E1', -1, 1),
              new Among('\u00E9', -1, 2),
              new Among('\u00ED', -1, 1),
              new Among('\u00F3', -1, 1),
            ],
            g_v = [
              17, 65, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 17, 4, 10,
            ],
            I_p2,
            I_p1,
            I_pV,
            sbp = new SnowballProgram();
          this.setCurrent = function (word) {
            sbp.setCurrent(word);
          };
          this.getCurrent = function () {
            return sbp.getCurrent();
          };

          function habr1() {
            if (sbp.out_grouping(g_v, 97, 252)) {
              while (!sbp.in_grouping(g_v, 97, 252)) {
                if (sbp.cursor >= sbp.limit) return true;
                sbp.cursor++;
              }
              return false;
            }
            return true;
          }

          function habr2() {
            if (sbp.in_grouping(g_v, 97, 252)) {
              var v_1 = sbp.cursor;
              if (habr1()) {
                sbp.cursor = v_1;
                if (!sbp.in_grouping(g_v, 97, 252)) return true;
                while (!sbp.out_grouping(g_v, 97, 252)) {
                  if (sbp.cursor >= sbp.limit) return true;
                  sbp.cursor++;
                }
              }
              return false;
            }
            return true;
          }

          function habr3() {
            var v_1 = sbp.cursor,
              v_2;
            if (habr2()) {
              sbp.cursor = v_1;
              if (!sbp.out_grouping(g_v, 97, 252)) return;
              v_2 = sbp.cursor;
              if (habr1()) {
                sbp.cursor = v_2;
                if (!sbp.in_grouping(g_v, 97, 252) || sbp.cursor >= sbp.limit)
                  return;
                sbp.cursor++;
              }
            }
            I_pV = sbp.cursor;
          }

          function habr4() {
            while (!sbp.in_grouping(g_v, 97, 252)) {
              if (sbp.cursor >= sbp.limit) return false;
              sbp.cursor++;
            }
            while (!sbp.out_grouping(g_v, 97, 252)) {
              if (sbp.cursor >= sbp.limit) return false;
              sbp.cursor++;
            }
            return true;
          }

          function r_mark_regions() {
            var v_1 = sbp.cursor;
            I_pV = sbp.limit;
            I_p1 = I_pV;
            I_p2 = I_pV;
            habr3();
            sbp.cursor = v_1;
            if (habr4()) {
              I_p1 = sbp.cursor;
              if (habr4()) I_p2 = sbp.cursor;
            }
          }

          function r_postlude() {
            var among_var;
            while (true) {
              sbp.bra = sbp.cursor;
              among_var = sbp.find_among(a_0, 6);
              if (among_var) {
                sbp.ket = sbp.cursor;
                switch (among_var) {
                  case 1:
                    sbp.slice_from('a');
                    continue;
                  case 2:
                    sbp.slice_from('e');
                    continue;
                  case 3:
                    sbp.slice_from('i');
                    continue;
                  case 4:
                    sbp.slice_from('o');
                    continue;
                  case 5:
                    sbp.slice_from('u');
                    continue;
                  case 6:
                    if (sbp.cursor >= sbp.limit) break;
                    sbp.cursor++;
                    continue;
                }
              }
              break;
            }
          }

          function r_RV() {
            return I_pV <= sbp.cursor;
          }

          function r_R1() {
            return I_p1 <= sbp.cursor;
          }

          function r_R2() {
            return I_p2 <= sbp.cursor;
          }

          function r_attached_pronoun() {
            var among_var;
            sbp.ket = sbp.cursor;
            if (sbp.find_among_b(a_1, 13)) {
              sbp.bra = sbp.cursor;
              among_var = sbp.find_among_b(a_2, 11);
              if (among_var && r_RV())
                switch (among_var) {
                  case 1:
                    sbp.bra = sbp.cursor;
                    sbp.slice_from('iendo');
                    break;
                  case 2:
                    sbp.bra = sbp.cursor;
                    sbp.slice_from('ando');
                    break;
                  case 3:
                    sbp.bra = sbp.cursor;
                    sbp.slice_from('ar');
                    break;
                  case 4:
                    sbp.bra = sbp.cursor;
                    sbp.slice_from('er');
                    break;
                  case 5:
                    sbp.bra = sbp.cursor;
                    sbp.slice_from('ir');
                    break;
                  case 6:
                    sbp.slice_del();
                    break;
                  case 7:
                    if (sbp.eq_s_b(1, 'u')) sbp.slice_del();
                    break;
                }
            }
          }

          function habr5(a, n) {
            if (!r_R2()) return true;
            sbp.slice_del();
            sbp.ket = sbp.cursor;
            var among_var = sbp.find_among_b(a, n);
            if (among_var) {
              sbp.bra = sbp.cursor;
              if (among_var == 1 && r_R2()) sbp.slice_del();
            }
            return false;
          }

          function habr6(c1) {
            if (!r_R2()) return true;
            sbp.slice_del();
            sbp.ket = sbp.cursor;
            if (sbp.eq_s_b(2, c1)) {
              sbp.bra = sbp.cursor;
              if (r_R2()) sbp.slice_del();
            }
            return false;
          }

          function r_standard_suffix() {
            var among_var;
            sbp.ket = sbp.cursor;
            among_var = sbp.find_among_b(a_6, 46);
            if (among_var) {
              sbp.bra = sbp.cursor;
              switch (among_var) {
                case 1:
                  if (!r_R2()) return false;
                  sbp.slice_del();
                  break;
                case 2:
                  if (habr6('ic')) return false;
                  break;
                case 3:
                  if (!r_R2()) return false;
                  sbp.slice_from('log');
                  break;
                case 4:
                  if (!r_R2()) return false;
                  sbp.slice_from('u');
                  break;
                case 5:
                  if (!r_R2()) return false;
                  sbp.slice_from('ente');
                  break;
                case 6:
                  if (!r_R1()) return false;
                  sbp.slice_del();
                  sbp.ket = sbp.cursor;
                  among_var = sbp.find_among_b(a_3, 4);
                  if (among_var) {
                    sbp.bra = sbp.cursor;
                    if (r_R2()) {
                      sbp.slice_del();
                      if (among_var == 1) {
                        sbp.ket = sbp.cursor;
                        if (sbp.eq_s_b(2, 'at')) {
                          sbp.bra = sbp.cursor;
                          if (r_R2()) sbp.slice_del();
                        }
                      }
                    }
                  }
                  break;
                case 7:
                  if (habr5(a_4, 3)) return false;
                  break;
                case 8:
                  if (habr5(a_5, 3)) return false;
                  break;
                case 9:
                  if (habr6('at')) return false;
                  break;
              }
              return true;
            }
            return false;
          }

          function r_y_verb_suffix() {
            var among_var, v_1;
            if (sbp.cursor >= I_pV) {
              v_1 = sbp.limit_backward;
              sbp.limit_backward = I_pV;
              sbp.ket = sbp.cursor;
              among_var = sbp.find_among_b(a_7, 12);
              sbp.limit_backward = v_1;
              if (among_var) {
                sbp.bra = sbp.cursor;
                if (among_var == 1) {
                  if (!sbp.eq_s_b(1, 'u')) return false;
                  sbp.slice_del();
                }
                return true;
              }
            }
            return false;
          }

          function r_verb_suffix() {
            var among_var, v_1, v_2, v_3;
            if (sbp.cursor >= I_pV) {
              v_1 = sbp.limit_backward;
              sbp.limit_backward = I_pV;
              sbp.ket = sbp.cursor;
              among_var = sbp.find_among_b(a_8, 96);
              sbp.limit_backward = v_1;
              if (among_var) {
                sbp.bra = sbp.cursor;
                switch (among_var) {
                  case 1:
                    v_2 = sbp.limit - sbp.cursor;
                    if (sbp.eq_s_b(1, 'u')) {
                      v_3 = sbp.limit - sbp.cursor;
                      if (sbp.eq_s_b(1, 'g')) sbp.cursor = sbp.limit - v_3;
                      else sbp.cursor = sbp.limit - v_2;
                    } else sbp.cursor = sbp.limit - v_2;
                    sbp.bra = sbp.cursor;
                  case 2:
                    sbp.slice_del();
                    break;
                }
              }
            }
          }

          function r_residual_suffix() {
            var among_var, v_1;
            sbp.ket = sbp.cursor;
            among_var = sbp.find_among_b(a_9, 8);
            if (among_var) {
              sbp.bra = sbp.cursor;
              switch (among_var) {
                case 1:
                  if (r_RV()) sbp.slice_del();
                  break;
                case 2:
                  if (r_RV()) {
                    sbp.slice_del();
                    sbp.ket = sbp.cursor;
                    if (sbp.eq_s_b(1, 'u')) {
                      sbp.bra = sbp.cursor;
                      v_1 = sbp.limit - sbp.cursor;
                      if (sbp.eq_s_b(1, 'g')) {
                        sbp.cursor = sbp.limit - v_1;
                        if (r_RV()) sbp.slice_del();
                      }
                    }
                  }
                  break;
              }
            }
          }
          this.stem = function () {
            var v_1 = sbp.cursor;
            r_mark_regions();
            sbp.limit_backward = v_1;
            sbp.cursor = sbp.limit;
            r_attached_pronoun();
            sbp.cursor = sbp.limit;
            if (!r_standard_suffix()) {
              sbp.cursor = sbp.limit;
              if (!r_y_verb_suffix()) {
                sbp.cursor = sbp.limit;
                r_verb_suffix();
              }
            }
            sbp.cursor = sbp.limit;
            r_residual_suffix();
            sbp.cursor = sbp.limit_backward;
            r_postlude();
            return true;
          };
        })();

      /* and return a function that stems a word for the current locale */
      return function (token) {
        // for lunr version 2
        if (typeof token.update === 'function') {
          return token.update(function (word) {
            st.setCurrent(word);
            st.stem();
            return st.getCurrent();
          });
        } else {
          // for lunr version <= 1
          st.setCurrent(token);
          st.stem();
          return st.getCurrent();
        }
      };
    })();

    lunr.Pipeline.registerFunction(lunr.es.stemmer, 'stemmer-es');

    lunr.es.stopWordFilter = lunr.generateStopWordFilter(
      'a al algo algunas algunos ante antes como con contra cual cuando de del desde donde durante e el ella ellas ellos en entre era erais eran eras eres es esa esas ese eso esos esta estaba estabais estaban estabas estad estada estadas estado estados estamos estando estar estaremos estará estarán estarás estaré estaréis estaría estaríais estaríamos estarían estarías estas este estemos esto estos estoy estuve estuviera estuvierais estuvieran estuvieras estuvieron estuviese estuvieseis estuviesen estuvieses estuvimos estuviste estuvisteis estuviéramos estuviésemos estuvo está estábamos estáis están estás esté estéis estén estés fue fuera fuerais fueran fueras fueron fuese fueseis fuesen fueses fui fuimos fuiste fuisteis fuéramos fuésemos ha habida habidas habido habidos habiendo habremos habrá habrán habrás habré habréis habría habríais habríamos habrían habrías habéis había habíais habíamos habían habías han has hasta hay haya hayamos hayan hayas hayáis he hemos hube hubiera hubierais hubieran hubieras hubieron hubiese hubieseis hubiesen hubieses hubimos hubiste hubisteis hubiéramos hubiésemos hubo la las le les lo los me mi mis mucho muchos muy más mí mía mías mío míos nada ni no nos nosotras nosotros nuestra nuestras nuestro nuestros o os otra otras otro otros para pero poco por porque que quien quienes qué se sea seamos sean seas seremos será serán serás seré seréis sería seríais seríamos serían serías seáis sido siendo sin sobre sois somos son soy su sus suya suyas suyo suyos sí también tanto te tendremos tendrá tendrán tendrás tendré tendréis tendría tendríais tendríamos tendrían tendrías tened tenemos tenga tengamos tengan tengas tengo tengáis tenida tenidas tenido tenidos teniendo tenéis tenía teníais teníamos tenían tenías ti tiene tienen tienes todo todos tu tus tuve tuviera tuvierais tuvieran tuvieras tuvieron tuviese tuvieseis tuviesen tuvieses tuvimos tuviste tuvisteis tuviéramos tuviésemos tuvo tuya tuyas tuyo tuyos tú un una uno unos vosotras vosotros vuestra vuestras vuestro vuestros y ya yo él éramos'.split(
        ' '
      )
    );

    lunr.Pipeline.registerFunction(lunr.es.stopWordFilter, 'stopWordFilter-es');
  };
});
/*!
 * Lunr languages, `Chinese` language
 * https://github.com/MihaiValentin/lunr-languages
 *
 * Copyright 2019, Felix Lian (repairearth)
 * http://www.mozilla.org/MPL/
 */
/*!
 * based on
 * Snowball zhvaScript Library v0.3
 * http://code.google.com/p/urim/
 * http://snowball.tartarus.org/
 *
 * Copyright 2010, Oleg Mazko
 * http://www.mozilla.org/MPL/
 */

/**
 * export the module via AMD, CommonJS or as a browser global
 * Export code from https://github.com/umdjs/umd/blob/master/returnExports.js
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else if (typeof exports === 'object') {
    /**
     * Node. Does not work with strict CommonJS, but
     * only CommonJS-like environments that support module.exports,
     * like Node.
     */
    module.exports = factory(require('nodejieba'));
  } else {
    // Browser globals (root is window)
    factory()(root.lunr);
  }
})(this, function (nodejieba) {
  /**
   * Just return a value to define the module export.
   * This example returns an object, but the module
   * can return a function as the exported value.
   */
  return function (lunr, nodejiebaDictJson) {
    /* throw error if lunr is not yet included */
    if ('undefined' === typeof lunr) {
      throw new Error(
        'Lunr is not present. Please include / require Lunr before this script.'
      );
    }

    /* throw error if lunr stemmer support is not yet included */
    if ('undefined' === typeof lunr.stemmerSupport) {
      throw new Error(
        'Lunr stemmer support is not present. Please include / require Lunr stemmer support before this script.'
      );
    }

    /*
    Chinese tokenization is trickier, since it does not
    take into account spaces.
    Since the tokenization function is represented different
    internally for each of the Lunr versions, this had to be done
    in order to try to try to pick the best way of doing this based
    on the Lunr version
     */
    var isLunr2 = lunr.version[0] == '2';

    /* register specific locale function */
    lunr.zh = function () {
      this.pipeline.reset();
      this.pipeline.add(
        lunr.zh.trimmer,
        lunr.zh.stopWordFilter,
        lunr.zh.stemmer
      );

      // change the tokenizer for Chinese one
      if (isLunr2) {
        // for lunr version 2.0.0
        this.tokenizer = lunr.zh.tokenizer;
      } else {
        if (lunr.tokenizer) {
          // for lunr version 0.6.0
          lunr.tokenizer = lunr.zh.tokenizer;
        }
        if (this.tokenizerFn) {
          // for lunr version 0.7.0 -> 1.0.0
          this.tokenizerFn = lunr.zh.tokenizer;
        }
      }
    };

    lunr.zh.tokenizer = function (obj) {
      if (!arguments.length || obj == null || obj == undefined) return [];
      if (Array.isArray(obj))
        return obj.map(function (t) {
          return isLunr2 ? new lunr.Token(t.toLowerCase()) : t.toLowerCase();
        });

      nodejiebaDictJson && nodejieba.load(nodejiebaDictJson);

      var str = obj.toString().trim().toLowerCase();
      var tokens = [];

      nodejieba.cut(str, true).forEach(function (seg) {
        tokens = tokens.concat(seg.split(' '));
      });

      tokens = tokens.filter(function (token) {
        return !!token;
      });

      var fromIndex = 0;

      return tokens.map(function (token, index) {
        if (isLunr2) {
          var start = str.indexOf(token, fromIndex);

          var tokenMetadata = {};
          tokenMetadata['position'] = [start, token.length];
          tokenMetadata['index'] = index;

          fromIndex = start;

          return new lunr.Token(token, tokenMetadata);
        } else {
          return token;
        }
      });
    };

    /* lunr trimmer function */
    lunr.zh.wordCharacters = '\\w\u4e00-\u9fa5';
    lunr.zh.trimmer = lunr.trimmerSupport.generateTrimmer(
      lunr.zh.wordCharacters
    );
    lunr.Pipeline.registerFunction(lunr.zh.trimmer, 'trimmer-zh');

    /* lunr stemmer function */
    lunr.zh.stemmer = (function () {
      /* TODO Chinese stemmer  */
      return function (word) {
        return word;
      };
    })();
    lunr.Pipeline.registerFunction(lunr.zh.stemmer, 'stemmer-zh');

    /* lunr stop word filter. see https://www.ranks.nl/stopwords/chinese-stopwords */
    lunr.zh.stopWordFilter = lunr.generateStopWordFilter(
      '的 一 不 在 人 有 是 为 以 于 上 他 而 后 之 来 及 了 因 下 可 到 由 这 与 也 此 但 并 个 其 已 无 小 我 们 起 最 再 今 去 好 只 又 或 很 亦 某 把 那 你 乃 它 吧 被 比 别 趁 当 从 到 得 打 凡 儿 尔 该 各 给 跟 和 何 还 即 几 既 看 据 距 靠 啦 了 另 么 每 们 嘛 拿 哪 那 您 凭 且 却 让 仍 啥 如 若 使 谁 虽 随 同 所 她 哇 嗡 往 哪 些 向 沿 哟 用 于 咱 则 怎 曾 至 致 着 诸 自'.split(
        ' '
      )
    );
    lunr.Pipeline.registerFunction(lunr.zh.stopWordFilter, 'stopWordFilter-zh');
  };
});
