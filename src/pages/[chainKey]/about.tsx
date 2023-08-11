import Head from 'next/head';
import { appName } from '@configs/globalsConfig';

export default function About() {
  return (
    <>
      <Head>
        <title>{`About - ${appName}`}</title>
      </Head>

      <main className="container">
        <article className="max-w-3xl w-full mx-auto">
          <header className="mt-8 md:mt-12 lg:mt-16">
            <h1 className="headline-1 mb-2">About</h1>
          </header>

          <section className="mt-8 md:mt-12 lg:mt-16">
            <h2 className="headline-2 mb-2">Purpose</h2>
            <p className="body-1 text-neutral-200 mb-2">
              This Collection Manager is based on the project created
              by the FACINGS team. Protonnz has modified their original
              work to make it compatible with the Proton blockchain.
              We than added our own new features and tools that we
              developed over the past year.
            </p>

            <h3 className="title-1 mt-4 md:mt-8 mb-1">Source Code Forked</h3>
            <p className="body-1 text-neutral-200">
              Github:{' '}
              <a
                href="https://github.com/FACINGS/collection-manager"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                https://github.com/FACINGS/collection-manager
              </a>
            </p>

            <h3 className="title-1 mt-4 md:mt-8 mb-1">ProtonNZ modifications</h3>
            <p className="body-1 text-neutral-200">
              Github:{' '}
              <a
                href="https://github.com/protonnz/collection-manager"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                https://github.com/protonnz/collection-manager
              </a>
            </p>

            <h3 className="title-1 mt-4 md:mt-8 mb-1">Core features</h3>
            <ol className="list-decimal pl-6 body-1 text-neutral-200">
              <li className="pl-1">Login and view resource usage</li>
              <li className="pl-1">
                View/explore collections (schemas, templates, and assets)
              </li>
              <li className="pl-1">Create and edit collections</li>
              <li className="pl-1">Create and edit schemas and template</li>
              <li className="pl-1">Mass Burn/Mass Sales/Mass Auction/Mass cancel</li>
              <li className="pl-1">Dashview and abstrakts tools. WIP</li>
              <li className="pl-1">User Storefront</li>
              <li className="pl-1">Buy NFTs</li>
              <li className="pl-1">Claim balance</li>
            </ol>
          </section>

          <section className="my-8 md:my-12 lg:my-16">
            <h2 className="headline-2 mb-2">About ABSTRAKTS</h2>
            <p className="body-1 text-neutral-200 mb-2">
              Abstrakts is an imaginative and playful mixture of AI and freehand
              art. Using AI to create texture and inspire composition, we are
              able to develop our characters quicker, while maintaining a human
              feel, and 100% ORIGINAL artwork. Check out our THREE amazing
              collections; Abstrakts, Cyber Punks and Synthwave Assassins!
            </p>
            <p className="body-1 text-neutral-200">
              Social links:{' '}
              <a
                href="https://linktr.ee/abstrakts"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                https://linktr.ee/abstrakts
              </a>
            </p>
          </section>

          <section className="my-8 md:my-12 lg:my-16">
            <h2 className="headline-2 mb-2">About FACINGS</h2>
            <p className="body-1 text-neutral-200 mb-2">
              FACINGS aims to unlock the value of web3 for the masses by making
              distribution of engaging NFTs easy, affordable, and scalable. We
              serve those who aspire to launch NFTs, saving them time and money
              by providing flexible tools to model and publish high-quality,
              feature-rich NFT collections. Using FACINGS, NFT publishers can
              take their concept to market quickly and reach their audience,
              wherever they are.
            </p>
            <p className="body-1 text-neutral-200">
              Social links:{' '}
              <a
                href="https://linktr.ee/FACINGSOfficial"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                https://linktr.ee/FACINGSOfficial
              </a>
            </p>
          </section>
        </article>
      </main>
    </>
  );
}
