import Link from 'next/link';
import { collectionTabs } from '@utils/collectionTabs';
import { collectionPlugins } from '@plugins/toolsConfig';
import { ipfsEndpoint, ipfsGateway, chainKeyDefault, appName } from '@configs/globalsConfig';
import { useRouter } from 'next/router';

export default function CollectionPlugins() {
  const router = useRouter();
  const chainKey = (router.query.chainKey ?? chainKeyDefault) as string;

  return (
    <section className="container">
      <div className="flex flex-col py-8 gap-12">
        <h2 className="headline-2">TOOLS</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 sm:gap-8">
        {collectionPlugins &&
          Object.keys(collectionPlugins).map((plugin) => (
            <Link
              key={plugin}
              href={`/${chainKey}/tools/${plugin}`}
              className="flex flex-row justify-center items-center gap-md bg-neutral-800 rounded-xl cursor-pointer hover:scale-105 duration-300 py-8 px-16"
            >
              <span className="title-1">{collectionPlugins[plugin].name}</span>
            </Link>
          ))}
      </div>
    </section>
  );
}
