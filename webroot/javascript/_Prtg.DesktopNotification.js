//_Prtg.DesktopNotifications.js
(function($) {
  var desktopNotification = function() {
    var showAlarmsNotifi = function(count) {
      var alarms;
      try {
        alarms = window.localStorage.getItem("newalarmcount");
      } catch (err) {
        alarms = 0;
      }
      if (alarms >= 0 && count > 0 && alarms < count) {
        if ("Notification" in window) {
          if (Notification.permission === "granted") {
            PrintAlarmStringAsDesktopNotification();
          }
        }
      }
      try {
        window.localStorage.setItem("newalarmcount", count);
      } catch (err) {}
    };

    var requestPermission = function() {
      if ("Notification" in window && Notification.permission == "default") {
        Notification.requestPermission(function(permission) {});
      }
    };

    return {
      showAlarms: showAlarmsNotifi,
      requestPermission: requestPermission,
      ___: "_Prtg.desktopNotification"
    };
  };

  $.extend(true, window, {
    _Prtg: {
      desktopNotification: desktopNotification()
    }
  });

  function PrintAlarmStringAsDesktopNotification() {
    var notificationText;
    $.getJSON("/api/getstatus.htm?id=0").done(function(response) {
      if (response.Alarms !== "") {
        notificationText =
          _Prtg.Lang.desktopNotifications.strings.down + ": " + response.Alarms;
      }
      if (response.PartialAlarms !== "") {
        if (notificationText.length > 0)
          notificationText = notificationText + " / ";
        notificationText =
          notificationText +
          _Prtg.Lang.desktopNotifications.strings.downPartial +
          ": " +
          response.PartialAlarms;
      }
      if (response.WarnSens !== "") {
        if (notificationText.length > 0)
          notificationText = notificationText + " / ";
        notificationText =
          notificationText +
          _Prtg.Lang.desktopNotifications.strings.warning +
          ": " +
          response.WarnSens;
      }
      if (response.AckAlarms !== "") {
        if (notificationText.length > 0)
          notificationText = notificationText + " / ";
        notificationText =
          notificationText +
          _Prtg.Lang.desktopNotifications.strings.downAck +
          ": " +
          response.AckAlarms;
      }
      if (response.UpSens !== "") {
        if (notificationText.length > 0)
          notificationText = notificationText + " / ";
        notificationText =
          notificationText +
          _Prtg.Lang.desktopNotifications.strings.up +
          ": " +
          response.UpSens;
      }
      if (response.PausedSens !== "") {
        if (notificationText.length > 0)
          notificationText = notificationText + " / ";
        notificationText =
          notificationText +
          _Prtg.Lang.desktopNotifications.strings.paused +
          ": " +
          response.PausedSens;
      }
      if (response.UnusualSens !== "") {
        if (notificationText.length > 0)
          notificationText = notificationText + " / ";
        notificationText =
          notificationText +
          _Prtg.Lang.desktopNotifications.strings.unusual +
          ": " +
          response.UnusualSens;
      }
      if (response.UnknownSens !== "") {
        if (notificationText.length > 0)
          notificationText = notificationText + " / ";
        notificationText =
          notificationText +
          _Prtg.Lang.desktopNotifications.strings.unknown +
          ": " +
          response.UnknownSens;
      }

      var date = new Date();
      var dateString = date.toLocaleTimeString();

      var options = {
        body: notificationText,
        tag: dateString,
        icon: "/icons/led_red_big.png"
      };

      var notification = new Notification(
        "(" + dateString + ") " + "PRTG - New Alarms: " + response.NewAlarms,
        options
      );
      notification.onclick = function() {
        window.location.href =
          "alarms.htm?filter_status=5&filter_status=4&filter_status=10&filter_status=13&filter_status=14";
        $.ajax({
          url: "/api/resetnewmessagestimestamp.htm",
          dataType: "text",
          type: "GET",
          beforeSend: function(jqXHR) {
            jqXHR.ignoreManager = true;
          },
          success: function() {
            try {
              window.localStorage.setItem("newalarmcount", 0);
            } catch (err) {}
          }
        });
        notification.close();
      };
    });
  }
})(jQuery);
