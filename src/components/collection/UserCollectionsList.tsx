import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { withUAL } from 'ual-reactjs-renderer';
import { MagnifyingGlass } from 'phosphor-react';

import { ipfsEndpoint, ipfsGateway } from '@configs/globalsConfig';
import { listCollectionsService } from '@services/collection/listCollectionsService';

import { Card } from '@components/Card';
import { CardContainer } from '@components/CardContainer';
import { SeeMoreButton } from '@components/SeeMoreButton';
import { Input } from '@components/Input';
import { CreateNewItem } from '@components/collection/CreateNewItem';
import { Loading } from '@components/Loading';
import { Header } from '@components/Header';

interface UserCollectionsListComponentProps {
  chainKey: string;
  ual: {
    activeUser: {
      accountName: string;
    };
    showModal: () => void;
  };
}

function UserCollectionsListComponent({
  chainKey,
  ual,
}: UserCollectionsListComponentProps) {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [match, setMatch] = useState('');
  const [waitToSearch, setWaitToSearch] = useState(null);

  const limit = 12;
  const currentPage = Math.ceil(collections.length / limit) || 1;
  const offset = (currentPage - 1) * limit;
  const isEndOfList = collections.length % limit > 0;

  const authorized_account = ual?.activeUser?.accountName;

  const handleLoadCollections = useCallback(
    async (page) => {
      setIsLoading(true);

      try {
        const { data } = await listCollectionsService(chainKey, {
          match,
          page,
          offset,
          authorized_account,
        });

        setCollections((state) => [...state, ...data.data]);
      } catch (error) {
        console.error(error);
      }

      setIsLoading(false);
    },
    [match, authorized_account, offset, chainKey]
  );

  useEffect(() => {
    if (authorized_account && currentPage === 1 && collections.length === 0 && isLoading) {
      handleLoadCollections(currentPage);
    }
  }, [authorized_account, currentPage, collections, isLoading, handleLoadCollections]);

  function handleLogin() {
    ual?.showModal();
  }

  async function handleSearch(event) {
    const { value } = event.target;
    clearTimeout(waitToSearch);

    const newWaitToSearch = setTimeout(async () => {
      const { data: collections } = await listCollectionsService(chainKey, {
        authorized_account,
      });

      // Filter collections based on the search value (either collection_name or name)
      const filteredCollections = collections.data.filter(
        (collection) =>
          collection.collection_name.toLowerCase().includes(value.toLowerCase()) ||
          collection.name.toLowerCase().includes(value.toLowerCase())
      );

      setMatch(value);
      setCollections(filteredCollections);
    }, 500);

    setWaitToSearch(newWaitToSearch);
  }

  //console.log(collections);

  if (authorized_account) {
    return (
      <>
        <Header.Root border>
          <Header.Content title="Authorized Collections" />
          <Header.Search>
            <Input
              icon={<MagnifyingGlass size={24} />}
              type="search"
              placeholder="Search collection"
              onChange={handleSearch}
            />
          </Header.Search>
        </Header.Root>

        <section className="container py-8">
          {collections.length > 0 ? (
            <>
              <CardContainer>
                <CreateNewItem
                  href={`/${chainKey}/collection/new`}
                  label="Create Collection"
                />
                {collections.map((collection, index) => (
                  <Card
                    key={index}
                    href={`/${chainKey}/collection/${collection.collection_name}`}
                    image={
                      collection.img ? `${ipfsGateway}/${collection.img}` : ''
                    }
                    title={collection.name}
                    subtitle={`Created by ${collection.author}`}
                  />
                ))}
              </CardContainer>

              {!isEndOfList && (
                <div className="flex justify-center mt-8">
                  <SeeMoreButton
                    isLoading={isLoading}
                    onClick={() => handleLoadCollections(currentPage + 1)}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              {isLoading ? (
                <Loading />
              ) : (
                <CreateNewItem
                  href={`/${chainKey}/collection/new`}
                  label="Create your first collection"
                />
              )}
            </>
          )}
        </section>
      </>
    );
  }

  return (
    <div className="h-[calc(100vh-5.5rem-5.5rem-5.25rem)] md:h-[calc(100vh-5.5rem-5.375rem)] flex items-center justify-center">
      <div className="md:max-w-lg lg:max-w-3xl text-center px-4">
        <h2 className="headline-1">Explore, manage, and engage with NFT Collections</h2>
        <p className="body-1 mt-4 mb-8">
          Connect your wallet to buy, sell, transfer, auction, or burn NFTs. Utilize our suite of tools to enhance your collection management experience.
        </p>
        <div className="flex flex-col md:flex-row items-center gap-4 justify-center">
          <button type="button" className="btn" onClick={handleLogin}>
            Connect Wallet
          </button>
          <Link href={`/${chainKey}/explorer`} className="btn border-0">
            Explorer
          </Link>
        </div>
      </div>
    </div>
  );
}

export const UserCollectionsList = withUAL(UserCollectionsListComponent);
