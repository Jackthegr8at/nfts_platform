import { api } from '@libs/api';
import chainsConfig from '@configs/chainsConfig';
import { AxiosResponse } from 'axios';

export interface SaleAssetProps {
  assets_contract: string;
  sale_id: string;
  seller: string;
  buyer: string | null;
  price: {
    token_contract: string;
    token_symbol: string;
    token_precision: number;
    amount: string;
  };
  assets: {
    asset_id: string;
    owner: string;
    collection: {
      collection_name: string;
      name: string;
      img: string;
      author: string;
    };
    template: {
      template_id: string;
      immutable_data: {
        [key: string]: string;
      };
    };
    immutable_data: {
      [key: string]: any;
    };
    data: {
      [key: string]: string;
    };
    name: string;
  }[];
}

interface ParamsProps {
  collectionName?: string;
  asset_id?: string;
}

interface DataProps {
  data: SaleAssetProps[];
}

export async function collectionSalesAssetsService(
  chainKey: string,
  { collectionName, asset_id }: ParamsProps
): Promise<AxiosResponse<DataProps>> {
  const url = `${chainsConfig[chainKey].aaEndpoint}/atomicmarket/v2/sales`;

  const response = await api.get(url, {
    params: {
      collection_name: collectionName,
      asset_id: asset_id,
      order: 'desc',
      sort: 'sale_id',
      state: 1,
    },
  });

  return response;
}
