import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { MagnifyingGlass } from 'phosphor-react';
import { ipfsEndpoint, ipfsGateway } from '@configs/globalsConfig';
import {
  listCollectionsService,
  CollectionProps,
} from '@services/collection/listCollectionsService';

import { Card } from '@components/Card';
import { CardContainer } from '@components/CardContainer';
import { SeeMoreButton } from '@components/SeeMoreButton';
import { Input } from '@components/Input';
import { Loading } from '@components/Loading';
import { Header } from '@components/Header';
import { fetchSalesInventory } from '@services/inventory/salesInventoryService';

interface CollectionItemsListProps {
  chainKey: string;
  initialCollections: CollectionProps[];
}

export function CollectionItemsList({
  chainKey,
  initialCollections,
}: CollectionItemsListProps) {
  const [collections, setCollections] = useState(initialCollections);
  const [isLoading, setIsLoading] = useState(false);
  const [match, setMatch] = useState('');
  const [waitToSearch, setWaitToSearch] = useState(null);

  const limit = 12;
  const currentPage = Math.ceil(collections.length / limit);
  const offset = (currentPage - 1) * limit;
  const isEndOfList = collections.length % limit > 0;

  const [Showcases, setShowcases] = useState([]);

  const router = useRouter();

  async function handleLoadCollections() {
    setIsLoading(true);

    try {
      const { data } = await listCollectionsService(chainKey, {
        match,
        page: currentPage + 1,
        limit,
        offset,
      });

      setCollections((state) => [...state, ...data.data]);
    } catch (error) {
      console.error(error);
    }

    setIsLoading(false);
  }

  async function handleSearch(event) {
    const { value } = event.target;
    clearTimeout(waitToSearch);

    const newWaitToSearch = setTimeout(async () => {
      const { data: collections } = await listCollectionsService(chainKey, {
        match: value || '',
      });

      setMatch(value);
      setCollections(collections.data);
    }, 500);

    setWaitToSearch(newWaitToSearch);
  }

  //console.log('collections:', collections);

  useEffect(() => {
    const fetchData = async () => {
      const infoShowcases = collections.length === 1
        ? [{
          id: 1,
          name: collections[0].name,
          collection_name: collections[0].collection_name,
          author: collections[0].author,
        }]
        : [
          {
            id: 1,
            name: "Synthwave Assassins",
            collection_name: '125554242425',
            author: ["swanft", "income.xpr"],
          },
          {
            id: 2,
            name: "Battle Buddies",
            collection_name: '134552553112',
            author: "btlbuddies",
          },
          {
            id: 3,
            name: "Abstrakts",
            collection_name: '313521541535',
            author: "jamesgrill",
          },
        ];

      // use Promise.all to fetch all Showcases concurrently
      const dataShowcases = await Promise.all(
        infoShowcases.map(info =>
          fetchSalesInventory({
            chainKey: chainKey,
            collectionName: info.collection_name,
            seller: Array.isArray(info.author) ? info.author.join(',') : info.author,
            maxlimit: 3,
            fast: true
          })
        )
      );
      //console.log('dataShowcases infos:', dataShowcases);
      let Showcases = null; // Initializing Showcases to null
      if (dataShowcases[0]?.length !== 0) {
        Showcases = dataShowcases.map((assetsArray, index) => {
          const Showcase = assetsArray[0].collection;
          //console.log('assetsArray infos:', assetsArray);
          return {
            id: index + 1,
            href: `/${chainKey}/collection/${Showcase.collection_name}`,
            author: Showcase.author,
            authorImg: `${ipfsGateway}/${Showcase.img}`,
            authorHref: `/${chainKey}/author/${Showcase.author}`,
            name: Showcase.name,
            featuredImage: `${ipfsGateway}/${Showcase.img}`,
            totalItems: assetsArray.length, // Get the number of assets in the collection
            popularItems: assetsArray.map(asset => ({ // Map over all the assets in the collection
              href: `/${chainKey}/collection/${Showcase.collection_name}/asset/${asset.asset_id}`,
              tokenId: asset.asset_id,
              //tokenImage: `${ipfsGateway}/${asset.data.image}`
              //tokenImage: `${ipfsEndpoint}/${asset.data.image}?img-width=200`
              tokenImage: `${ipfsGateway}/${asset.data.image}`
            })),
          };
        });
      }

      setShowcases(Showcases);

    };

    fetchData();
  }, [collections]);


  //console.log('collection assets infos:', Showcases);

  return (
    <>
      <Header.Root border>
        <Header.Content title="Showcase" />
        <Header.Search>
          <Input
            icon={<MagnifyingGlass size={24} />}
            type="search"
            placeholder="Search collection ID"
            onChange={handleSearch}
          />
        </Header.Search>
      </Header.Root>

      {Showcases && (
        <div className="relative mx-auto py-8 px-2 w-full max-w-7xl">
          <div className="mx-auto max-w-2xl lg:max-w-5xl">
            <div className={`mt-5 sm:mt-10 grid gap-2 ${collections.length === 1 ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-3 lg:grid-cols-3'}`}>
              {Showcases.map(Showcase => (
                <div key={Showcase.id} className="col-span-1 p-5 flex flex-col rounded-md hover:shadow-custom">
                  <div className="w-full grid grid-cols-3 gap-3">
                    <div onClick={() => router.push(Showcase.href)} className="cursor-pointer col-span-full group relative w-full h-56 rounded-md overflow-hidden hover:shadow">
                      <img src={Showcase.featuredImage} alt="" className="absolute inset-0 w-full h-full object-cover transition duration-200 ease-in transform hover:scale-105" />
                    </div>
                    {Showcase.popularItems.map(item => (
                      <div onClick={() => router.push(item.href)} key={item.tokenId} className="cursor-pointer col-span-1 relative w-full h-20 rounded-md overflow-hidden hover:shadow">
                        <img src={item.tokenImage} alt="" className="absolute inset-0 w-full h-full object-cover transition duration-200 ease-in transform hover:scale-105" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-2">
                    <p className="text-lg font-bold">{Showcase.name}</p>
                    <div className="mt-0.5 flex items-center justify-between">
                      <p className="inline-flex items-center">
                        <span className="mr-2 w-8 h-8 inline-block border-2 border-gray-50 rounded-full overflow-hidden" aria-label="avatar">
                          <img src={Showcase.authorImg} alt="" className="w-full h-full" />
                        </span>
                        <span className="flex-shrink-0 w-32 text-sm text-gray-300 truncate">
                          by&#160;
                          <span onClick={() => router.push(Showcase.authorHref)} className="cursor-pointer text-yellow-500 font-bold hover:text-yellow-600">{Showcase.author}</span>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <section className="container py-8">
        {(collections.length > 1 || (collections.length === 1 && (!Showcases || Showcases.length === 0))) ? (
          <>
            <CardContainer>
              {collections.map((collection, index) => (
                <Card
                  key={index}
                  href={`/${chainKey}/collection/${collection.collection_name}`}
                  image={
                    //collection.img ? `${ipfsGateway}/375/${collection.img}` : ''
                    //collection.img ? `https://4everland.io/ipfs/${collection.img}` : ''
                    //collection.img ? `https://res.cloudinary.com/abstrakts/image/fetch/w_375,ar_1,f_auto/ipfs://${collection.img}` : ''
                    collection.img ? `${ipfsGateway}/${collection.img}` : ''
                  }
                  title={collection.name}
                  subtitle={`by ${collection.author}`}
                />
              ))}
            </CardContainer>
            {!isEndOfList && (
              <div className="flex justify-center mt-8">
                <SeeMoreButton
                  isLoading={isLoading}
                  onClick={handleLoadCollections}
                />
              </div>
            )}
          </>
        ) : (
          <>
            {isLoading && (
              <Loading />
            )}
          </>
        )}
      </section>
    </>
  );
}
