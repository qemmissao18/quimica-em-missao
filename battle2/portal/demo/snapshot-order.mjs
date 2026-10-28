// Reject delayed responses without letting a previous match replace its replay.
export function createSnapshotGate() {
  let current = null;
  const retired = new Set();
  return next => {
    if (!next?.match_id || retired.has(next.match_id)) return false;
    if (current?.match_id === next.match_id) {
      if (next.revision < current.revision) return false;
      const previousTime = Date.parse(current.server_now);
      const nextTime = Date.parse(next.server_now);
      if (next.revision === current.revision && Number.isFinite(previousTime) &&
          Number.isFinite(nextTime) && nextTime < previousTime) return false;
    } else if (current) {
      retired.add(current.match_id);
    }
    current = next;
    return true;
  };
}
