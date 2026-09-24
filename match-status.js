(function (root) {
  function isLiveStatus(status) {
    return /^(live|in progress|in play|1st half|2nd half|first half|second half|half time|halftime|ht|1h|2h|et|extra time|penalties|penalty shootout|break|int|bt|p)$/i.test(String(status || "").trim());
  }

  if (typeof module !== "undefined" && module.exports) module.exports = { isLiveStatus };
  else root.isLiveStatus = isLiveStatus;
})(globalThis);
