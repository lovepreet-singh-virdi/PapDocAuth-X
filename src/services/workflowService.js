import { Workflow } from "../models/sql/Workflow.js";
import  Document  from "../models/mongo/Document.js";

export async function changeWorkflowState({ docId, userId, toState, reason }) {
  const doc = await Document.findOne({ docId });
  if (!doc) throw new Error("Document not found");

  const fromState = doc.currentState;

  const wf = await Workflow.create({
    docId,
    userId,
    fromState,
    toState,
    reason
  });

  doc.currentState = toState;
  await doc.save();

  return wf;
}
