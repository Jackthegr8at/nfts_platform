interface CreateTemplateServiceProps {
  activeUser: any;
  authorized_creator: string;
  collectionName: string;
  schemaName: string;
  transferable: boolean;
  burnable: boolean;
  maxSupply: number;
  immutableData: {
    key: string;
    value: any[];
  }[];
}
export async function createSpecialMintService({
  activeUser,
  authorized_creator,
  collectionName,
  schemaName,
  transferable,
  burnable,
  maxSupply,
  immutableData,
}: CreateTemplateServiceProps) {
  const response = await activeUser.signTransaction(
    {
      actions: [
        {
          account: 'atomicassets',
          name: 'addcolauth',
          authorization: [
            {
              actor: activeUser.accountName,
              permission: activeUser.requestPermission,
            },
          ],
          data: {
            collection_name: collectionName,
            account_to_add: 'specialmint',
          },
        },
        {
          account: 'xtokens',
          name: 'transfer',
          authorization: [
            {
              actor: activeUser.accountName,
              permission: activeUser.requestPermission,
            },
          ],
          data: {
            from: activeUser.accountName,
            to: 'specialmint',
            memo: 'account',
            quantity: '0.010000 XUSDC',
          },
        },
        {
          account: 'specialmint',
          name: 'initstorage',
          authorization: [
            {
              actor: activeUser.accountName,
              permission: activeUser.requestPermission,
            },
          ],
          data: {
            account: activeUser.accountName,
          },
        },
        {
          account: 'atomicassets',
          name: 'createtempl',
          authorization: [
            {
              actor: activeUser.accountName,
              permission: activeUser.requestPermission,
            },
          ],
          data: {
            authorized_creator,
            collection_name: collectionName,
            schema_name: schemaName,
            transferable,
            burnable,
            max_supply: maxSupply,
            immutable_data: immutableData,
          },
        },
        {
          account: 'specialmint',
          name: 'mintlasttemp',
          authorization: [
            {
              actor: activeUser.accountName,
              permission: activeUser.requestPermission,
            },
          ],
          data: {
            creator: activeUser.accountName,
            collection_name: collectionName,
            schema_name: schemaName,
            new_asset_owner: activeUser.accountName,
            immutable_data: [],
            mutable_data: [],
            count: '1',
          },
        },
        {
          account: 'atomicassets',
          name: 'remcolauth',
          authorization: [
            {
              actor: activeUser.accountName,
              permission: activeUser.requestPermission,
            },
          ],
          data: {
            collection_name: collectionName,
            account_to_remove: 'specialmint',
          },
        },
      ],
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    }
  );

  return response;
}
