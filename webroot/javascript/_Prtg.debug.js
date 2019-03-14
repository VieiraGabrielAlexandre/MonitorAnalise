// _Prtg.debug.js
(function($) {
  _Prtg.debug = {
    // Print all forms and controls
    formContents: function() {
      var forms = document.querySelectorAll("form");

      for (var i = 0, len = forms.length; i < len; i++) {
        var tab = [];

        console.group("HTMLForm \"" + forms[i].name + "\": " + forms[i].action);
        console.log("Element:", forms[i], "\nName:    " + forms[i].name + "\nMethod:  " + forms[i].method.toUpperCase() + "\nAction:  " + forms[i].action || "null");

        ["input", "textarea", "select"].forEach(function(control) {
          [].forEach.call(forms[i].querySelectorAll(control), function(node) {
            tab.push({
              "Element": node,
              "Type": node.type,
              "Name": node.name,
              "Value": node.value,
              "Pretty Value": (isNaN(node.value) || node.value === "" ? node.value : parseFloat(node.value))
            });
          });
        });

        console.table(tab);
        console.groupEnd();
      }
    },
    // Print all http headers
    showHeaders: function() {
      var request = new XMLHttpRequest();
      request.open('HEAD', window.location, false);
      request.send(null);

      var headers = request.getAllResponseHeaders();
      var tab = headers.split("\n").map(function(h) {
        return {
          "Key": h.split(": ")[0],
          "Value": h.split(": ")[1]
        };
      }).filter(function(h) {
        return h.Value !== undefined;
      });

      console.group("Request Headers");
      console.log(headers);
      console.table(tab);
      console.groupEnd("Request Headers");
    },
    // Prints all Global Variables
    logGloabls: function() {
      'use strict';

      function getIframe() {
        var el = document.createElement('iframe');
        el.style.display = 'none';
        document.body.appendChild(el);
        var win = el.contentWindow;
        document.body.removeChild(el);
        return win;
      }

      function detectGlobals() {
        var iframe = getIframe();
        var ret = Object.create(null);

        for (var prop in window) {
          if (!(prop in iframe)) {
            ret[prop] = window[prop];
          }
        }

        return ret;
      }

      console.log(detectGlobals());
    },
    performance: function() {
      var t = window.performance.timing;
      var lt = window.chrome && window.chrome.loadTimes && window.chrome.loadTimes();
      var timings = [];

      timings.push({
        label: "Time Until Page Loaded",
        time: t.loadEventEnd - t.navigationStart + "ms"
      });
      timings.push({
        label: "Time Until DOMContentLoaded",
        time: t.domContentLoadedEventEnd - t.navigationStart + "ms"
      });
      timings.push({
        label: "Total Response Time",
        time: t.responseEnd - t.requestStart + "ms"
      });
      timings.push({
        label: "Connection",
        time: t.connectEnd - t.connectStart + "ms"
      });
      timings.push({
        label: "Response",
        time: t.responseEnd - t.responseStart + "ms"
      });
      timings.push({
        label: "Domain Lookup",
        time: t.domainLookupEnd - t.domainLookupStart + "ms"
      });
      timings.push({
        label: "Load Event",
        time: t.loadEventEnd - t.loadEventStart + "ms"
      });
      timings.push({
        label: "Unload Event",
        time: t.unloadEventEnd - t.unloadEventStart + "ms"
      });
      timings.push({
        label: "DOMContentLoaded Event",
        time: t.domContentLoadedEventEnd - t.domContentLoadedEventStart + "ms"
      });
      if (lt) {
        if (lt.wasNpnNegotiated) {
          timings.push({
            label: "NPN negotiation protocol",
            time: lt.npnNegotiatedProtocol
          });
        }
        timings.push({
          label: "Connection Info",
          time: lt.connectionInfo
        });
        timings.push({
          label: "First paint after Document load",
          time: Math.ceil(lt.firstPaintTime - lt.finishDocumentLoadTime) + "ms"
        });
      }

      var navigation = window.performance.navigation;
      var navigationTypes = {};
      navigationTypes[navigation.TYPE_NAVIGATENEXT || 0] = "Navigation started by clicking on a link, or entering the URL in the user agent's address bar, or form submission.", navigationTypes[navigation.TYPE_RELOAD] = "Navigation through the reload operation or the location.reload() method.", navigationTypes[navigation.TYPE_BACK_FORWARD] = "Navigation through a history traversal operation.", navigationTypes[navigation.TYPE_UNDEFINED] = "Navigation type is undefined.",

      console.group("window.performance");

      console.log(window.performance);

      console.group("Navigation Information");
      console.log(navigationTypes[navigation.type]);
      console.log("Number of redirects that have taken place: ", navigation.redirectCount)
      console.groupEnd("Navigation Information");

      console.group("Timing");
      console.log(window.performance.timing);
      console.table(timings, ["label", "time"]);
      console.groupEnd("Timing");

      console.groupEnd("window.performance");
    }


  };
})(jQuery);
