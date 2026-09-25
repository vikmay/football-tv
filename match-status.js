(function (root) {
  function isLiveStatus(status) {
    return /^(live|in progress|in play|1st half|2nd half|first half|second half|half time|halftime|ht|1h|2h|et|extra time|penalties|penalty shootout|break|int|bt|p)$/i.test(String(status || "").trim());
  }

  function getKickoffLabel(time) {
    const value = String(time || "").trim();
    // Older snapshots used midnight as a placeholder for a missing kickoff.
    return /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value) && !/^00:00(?::00)?$/.test(value)
      ? value.slice(0, 5) : "Час уточнюється";
  }

  if (typeof module !== "undefined" && module.exports) module.exports = { isLiveStatus, getKickoffLabel };
  else Object.assign(root, { isLiveStatus, getKickoffLabel });
})(globalThis);
