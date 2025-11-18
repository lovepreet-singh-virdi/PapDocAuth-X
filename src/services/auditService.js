// Temporary stub to avoid server crash.
// Full audit logging will be implemented in Step 11.

export async function addAuditEntry({
  userId,
  orgId,
  docId,
  versionNumber,
  action,
  details
}) {
  console.log(
    `Audit log stub: action=${action}, docId=${docId}, version=${versionNumber}`
  );
  return true;
}
