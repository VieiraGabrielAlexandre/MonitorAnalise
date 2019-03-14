(function($) {
  window._Prtg = window._Prtg || {};
  _Prtg.Util = {
    createNamespace: function() {
      var obj, ns;
      $.each(arguments, function(num) { ns = arguments[1].split(".");
        obj = window[ns[0]] = window[ns[0]] || {};
        $.each(ns.slice(1), function(num2) { obj = obj[arguments[1]] = obj[arguments[1]] || {} }) });
      return obj },
    getUrlParameters: function(url) {
      var vars = {},
        hash, temp;
      var hashes = url.slice(url.indexOf("?") + 1).split("&");
      for (var i = 0; i < hashes.length; i++) {
        if (hashes[i] === "") continue;
        hash = hashes[i].split("=");
        if (hash[0] === "") continue;
        if (vars[hash[0]] !==
          undefined)
          if (vars[hash[0]] instanceof Array) vars[hash[0]].push(unescape(hash[1]));
          else { temp = vars[hash[0]];
            vars[hash[0]] = [temp, unescape(hash[1])] }
        else vars[hash[0]] = unescape(hash[1])
      }
      return vars
    },
    getFormData: function(form, data) {
      var $form = !(form instanceof jQuery) ? $(form) : form;
      var o = data || {};
      var valid = false;
      $form.each(function() {
      	valid = $(this).valid();
      });
      if (valid) {
        $form.each(function(i, elm) {
          jQuery.each(
            $(this).serializeArray(), 
            function(){
              if (o[this.name] !== undefined) {
                if (!o[this.name].push) 
                  o[this.name] = [o[this.name]];
                o[this.name].push(this.value || "");
              } else o[this.name] = this.value || "";
            }
          );
          $(this).find('.dataTable').each(function(i, table){
            jQuery.each(
              $('input.checkbox:checked, select', $(table).DataTable().rows().nodes()).serializeArray(),
              function(){
                var value=this.value.replace(/\r?\n/g, "\r\n");
                if (o[this.name] !== undefined) {
                  if (!o[this.name].push) 
                    o[this.name] = [o[this.name]];
                  if(!~o[this.name].indexOf(value))
                    o[this.name].push(value || "");
                } else o[this.name] = value || "";
              }
            );
          });
        });
      } else o = null;
      return o;
    },
    getUrlVars: function() {
      return this.getUrlParameters(window.location.href) },
    getTimeString: function() {
      var curtime = new Date;
      return curtime.getHours() + ":" + curtime.getMinutes() + ":" + curtime.getSeconds() },
    GetPropertyByString: function(stringRepresentation) {
      var properties = stringRepresentation.split("."),
        myTempObject = window[properties[0]];
      for (var i = 1, length = properties.length; i < length; i++) myTempObject =
        myTempObject[properties[i]];
      return myTempObject
    },
    urlDecodeString: function(string) {
      return unescape(decodeURI(string.replace(/\+/g, " "))) },
    endsWithSuffix: function(str, suffix) {
      return str.indexOf(suffix, str.length - suffix.length) !== -1 },
    padNumber: function(num, size) {
      var r = "" + num;
      while (r.length < size) r = "0" + r;
      return r },
    daysInMonth: function(month, year) {
      return 32 - (new Date(year, month, 32)).getDate() },
    secondsAsTime: function(sec) {
      var sec_num = parseInt(sec, 10);
      var hours = _Prtg.Util.padNumber(Math.floor(sec_num / 3600), 2);
      var minutes =
        _Prtg.Util.padNumber(Math.floor((sec_num - hours * 3600) / 60), 2);
      var seconds = _Prtg.Util.padNumber(sec_num - hours * 3600 - minutes * 60, 2);
      if (hours > 0) return hours + ":" + minutes + ":" + seconds;
      else return minutes + ":" + seconds
    },
    calcLimit: function(x, min, max, percentage) {
      var p = percentage || 1,
        w = Math.round(x * p);
      w = w < min ? min : w;
      return w > max ? max : w },
    uniqueIdCounter: 0,
    uniqueId: function(prefix) {
      var id = ++this.uniqueIdCounter + "";
      return prefix ? prefix + id : id },
    b64ToUint6: function(nChr) {
      return nChr > 64 && nChr < 91 ? nChr - 65 : nChr > 96 && nChr < 123 ?
        nChr - 71 : nChr > 47 && nChr < 58 ? nChr + 4 : nChr === 43 ? 62 : nChr === 47 ? 63 : 0
    },
    base64DecToArr: function(sBase64, nBlocksSize) {
      var sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""),
        nInLen = sB64Enc.length,
        nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2,
        taBytes = new Uint8Array(nOutLen);
      for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
        nMod4 = nInIdx & 3;
        nUint24 |= this.b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
        if (nMod4 === 3 || nInLen - nInIdx === 1) {
          for (nMod3 = 0; nMod3 <
            3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
          nUint24 = 0
        }
      }
      return taBytes
    },
    uint6ToB64: function(nUint6) {
      return nUint6 < 26 ? nUint6 + 65 : nUint6 < 52 ? nUint6 + 71 : nUint6 < 62 ? nUint6 - 4 : nUint6 === 62 ? 43 : nUint6 === 63 ? 47 : 65 },
    base64EncArr: function(aBytes) {
      var nMod3 = 2,
        sB64Enc = "";
      for (var nLen = aBytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
        nMod3 = nIdx % 3;
        if (nIdx > 0 && nIdx * 4 / 3 % 76 === 0) sB64Enc += "\r\n";
        nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24);
        if (nMod3 === 2 || aBytes.length - nIdx === 1) {
          sB64Enc += String.fromCharCode(this.uint6ToB64(nUint24 >>>
            18 & 63), this.uint6ToB64(nUint24 >>> 12 & 63), this.uint6ToB64(nUint24 >>> 6 & 63), this.uint6ToB64(nUint24 & 63));
          nUint24 = 0
        }
      }
      return sB64Enc.substr(0, sB64Enc.length - 2 + nMod3) + (nMod3 === 2 ? "" : nMod3 === 1 ? "=" : "==")
    },
    UTF8ArrToStr: function(aBytes) {
      var sView = "";
      for (var nPart, nLen = aBytes.length, nIdx = 0; nIdx < nLen; nIdx++) {
        nPart = aBytes[nIdx];
        sView += String.fromCharCode(nPart > 251 && nPart < 254 && nIdx + 5 < nLen ? (nPart - 252) * 1073741824 + (aBytes[++nIdx] - 128 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] -
          128 : nPart > 247 && nPart < 252 && nIdx + 4 < nLen ? (nPart - 248 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128 : nPart > 239 && nPart < 248 && nIdx + 3 < nLen ? (nPart - 240 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128 : nPart > 223 && nPart < 240 && nIdx + 2 < nLen ? (nPart - 224 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128 : nPart > 191 && nPart < 224 && nIdx + 1 < nLen ? (nPart - 192 << 6) + aBytes[++nIdx] - 128 : nPart)
      }
      return sView
    },
    strToUTF8Arr: function(sDOMStr) {
      var aBytes, nChr, nStrLen =
        sDOMStr.length,
        nArrLen = 0;
      for (var nMapIdx = 0; nMapIdx < nStrLen; nMapIdx++) { nChr = sDOMStr.charCodeAt(nMapIdx);
        nArrLen += nChr < 128 ? 1 : nChr < 2048 ? 2 : nChr < 65536 ? 3 : nChr < 2097152 ? 4 : nChr < 67108864 ? 5 : 6 }
      aBytes = new Uint8Array(nArrLen);
      for (var nIdx = 0, nChrIdx = 0; nIdx < nArrLen; nChrIdx++) {
        nChr = sDOMStr.charCodeAt(nChrIdx);
        if (nChr < 128) aBytes[nIdx++] = nChr;
        else if (nChr < 2048) { aBytes[nIdx++] = 192 + (nChr >>> 6);
          aBytes[nIdx++] = 128 + (nChr & 63) } else if (nChr < 65536) {
          aBytes[nIdx++] = 224 + (nChr >>> 12);
          aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
          aBytes[nIdx++] =
            128 + (nChr & 63)
        } else if (nChr < 2097152) { aBytes[nIdx++] = 240 + (nChr >>> 18);
          aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
          aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
          aBytes[nIdx++] = 128 + (nChr & 63) } else if (nChr < 67108864) { aBytes[nIdx++] = 248 + (nChr >>> 24);
          aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
          aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
          aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
          aBytes[nIdx++] = 128 + (nChr & 63) } else {
          aBytes[nIdx++] = 252 + nChr / 1073741824;
          aBytes[nIdx++] = 128 + (nChr >>> 24 & 63);
          aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
          aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
          aBytes[nIdx++] =
            128 + (nChr >>> 6 & 63);
          aBytes[nIdx++] = 128 + (nChr & 63)
        }
      }
      return aBytes
    }
  }
})(jQuery);
