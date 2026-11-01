import { SearchIcon } from '@/components/EditorIcons';
import shell from '@/components/StudioDashboard.module.css';

export function DocsSearch({ query }: { query?: string }) {
  return (
    <form action="/studio/docs" className={shell.search} role="search">
      <SearchIcon size={15} />
      <label htmlFor="docs-search" className={shell.srOnly}>
        Search docs
      </label>
      <input id="docs-search" type="search" name="q" placeholder="Search docs..." defaultValue={query} />
    </form>
  );
}
