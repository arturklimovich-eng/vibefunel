import { redirect } from 'next/navigation';
import { StudioShell } from '@/components/StudioShell';
import { AgentTokensPanel } from '@/components/AgentTokensPanel';
import { agentAccessConfigured, agentAccessEnabled } from '@/server/agent-auth';
import { appUrl } from '@/server/capabilities';
import { getStudioContext } from '@/server/repository';
import { studioShellProps } from '../shell-props';
import { uiFont } from '../ui-font';
import styles from './agents.module.css';

export const dynamic = 'force-dynamic';

export default async function AgentsPage() {
  const context = await getStudioContext();
  if (!context) redirect('/login?next=%2Fstudio%2Fagents');
  const [tokens, shellProps] = await Promise.all([
    context.tokens.list(),
    studioShellProps(context),
  ]);
  const origin = appUrl();
  const state = !agentAccessEnabled() ? 'off' : agentAccessConfigured() ? 'on' : 'misconfigured';
  return (
    <div className={uiFont.variable}>
      <StudioShell active="agents" {...shellProps}>
        <main className={styles.page}>
          <h1 className={styles.title}>Agents</h1>
          <p className={styles.subtitle}>
            Let AI agents read, edit and publish your funnels over MCP. Each token acts as you, with
            the scopes you pick, and sees only what you see in the studio.
          </p>
          <AgentTokensPanel
            initialTokens={tokens}
            endpoint={origin ? `${origin}/api/mcp` : null}
            state={state}
          />
        </main>
      </StudioShell>
    </div>
  );
}
