import { JsonRpc } from 'eosjs';
import chainsConfig from '@configs/chainsConfig';

interface AccountNameProps {
  accountName: string;
}

export async function getTableRowProtonLink(
  chainKey: string,
  { accountName }: AccountNameProps
) {
  const rpcEndpoint = `${chainsConfig[chainKey].protocol}://${chainsConfig[chainKey].host}`;

  const rpc = new JsonRpc(rpcEndpoint, { fetch });

  const response = await rpc.get_table_rows({
    code: "protonlink",
    table: "kvs",
    scope: "protonlink",
    index_position: 1,
    key_type: "",
    upper_bound: accountName,
    json: true,
    limit: 1,
    lower_bound: accountName,
    reverse: false,
    show_payer: false,
  });

  return response;
}
