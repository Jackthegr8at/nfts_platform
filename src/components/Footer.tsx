import { useRouter } from 'next/router';
import { useIsApp } from '@hooks/useIsApp';
import {
  TwitterLogo,
  DiscordLogo,
  GlobeSimple,
  GithubLogo,
} from 'phosphor-react';

export function Footer() {
  const router = useRouter();
  const { isApp } = useIsApp();

  const excludedPages = ['/about'];
  const excludedPagesSpacer = ['/tools'];

  const isExcludedPage = excludedPages.some(page => router.pathname.includes(page));
  const isExcludedPageSpacer = excludedPagesSpacer.some(page => router.pathname.includes(page));

  // If it's loading or app view, don't render anything, unless the page is in the excluded pages list
  const Spacer = () => <div className="h-12"></div>;

  if (isApp && isExcludedPageSpacer) {
    return null;
  }

  if ((isApp && !isExcludedPage) || (isApp && !isExcludedPageSpacer)) {
    return <Spacer />;
  }

  return (
    <footer className="container border-t border-neutral-700 flex flex-col md:flex-row gap-4 justify-between items-center py-8 mt-8">
      <div className="flex items-center gap-1">
        <span className="body-3">Created by</span>
        <a href="https://linktr.ee/abstrakts" target="_blank" rel="noreferrer" className="font-bold">
          <div className="flex items-center">
            <img src="/abstrakts_Logo.png" alt="ABSTRAKTS Logo" className="h-7 mr-2" />
            <span className="text-white font-bold text-2xl">ABSTRAKTS</span>
          </div>
        </a>
      </div>
      <div className="flex gap-4">
        <div>
          <a
            href="https://github.com/FACINGS/collection-manager"
            target="_blank"
            className="btn btn-square btn-ghost btn-small"
            rel="noreferrer"
            aria-label="Github"
          >
            <GithubLogo size={24} />
          </a>
        </div>
        <div>
          <a
            href="https://twitter.com/abstraktsNFT"
            target="_blank"
            className="btn btn-square btn-ghost btn-small"
            rel="noreferrer"
            aria-label="Twitter"
          >
            <TwitterLogo size={24} />
          </a>
        </div>
        <div>
          <a
            href="https://discord.gg/3z8JtZZCtz"
            target="_blank"
            className="btn btn-square btn-ghost btn-small"
            rel="noreferrer"
            aria-label="Discord"
          >
            <DiscordLogo size={24} />
          </a>
        </div>
        <div>
          <a
            href="https://www.abstraktsnft.com/"
            target="_blank"
            className="btn btn-square btn-ghost btn-small"
            rel="noreferrer"
            aria-label="Facings"
          >
            <GlobeSimple size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
}
