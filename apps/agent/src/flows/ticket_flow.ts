import { StateGraph, END } from "@langchain/langgraph";
import { z } from "zod";
import { logger } from "../logger";
// Placeholder imports for tools; adapt as implemented
// import { applyGitDiff, runTests } from "../tools";

const Ticket = z.object({ id: z.string(), title: z.string(), description: z.string(), repo: z.string(), branch: z.string().default("pf/ticket-" + Date.now()), priority: z.enum(["low","standard","urgent"]).default("standard") });

type AgentState = {
  ticket: z.infer<typeof Ticket> | null;
  plan: string;
  diff: string;
  testOutput: string;
  prUrl: string;
};

const initialState: AgentState = { ticket: null, plan: "", diff: "", testOutput: "", prUrl: "" };

const graph = new StateGraph({ channels: { state: { value: initialState }}})
  .addNode("plan", async (ctx: any) => {
    const t = (ctx.state as AgentState).ticket!;
    await logger.event(t.id, "plan", "info", "Planning changes");
    // call LLM to plan (omitted) -> ctx.state.plan
  })
  .addNode("diff", async (ctx: any) => {
    const t = (ctx.state as AgentState).ticket!;
    await logger.event(t.id, "diff", "info", "Generating diff");
    // call LLM to produce patch (unified diff) -> ctx.state.diff
  })
  .addNode("apply", async (ctx: any) => {
    const t = (ctx.state as AgentState).ticket!;
    // await applyGitDiff(t.repo, (ctx.state as AgentState).diff, t.branch);
    await logger.event(t.id, "apply", "info", "Diff applied");
  })
  .addNode("test", async (ctx: any) => {
    const t = (ctx.state as AgentState).ticket!;
    // (ctx.state as AgentState).testOutput = await runTests(t.repo);
    await logger.event(t.id, "test", "info", "Tests executed");
  })
  .addNode("pr", async (ctx: any) => {
    const t = (ctx.state as AgentState).ticket!;
    // open PR, set ctx.state.prUrl
    await logger.event(t.id, "pr", "info", `PR opened`);
  })
  .addEdge("plan","diff")
  .addEdge("diff","apply")
  .addEdge("apply","test")
  .addEdge("test","pr")
  .addEdge("pr", END);

export async function runTicket(ticketInput: z.infer<typeof Ticket>) {
  // persist agent_runs row, stream agent_events per step
  await (graph as any).invoke({ state: { ticket: ticketInput, plan: "", diff: "", testOutput: "", prUrl: "" }});
}
