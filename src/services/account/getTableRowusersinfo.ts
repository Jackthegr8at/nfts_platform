import { JsonRpc } from 'eosjs';
import chainsConfig from '@configs/chainsConfig';

interface AccountNameProps {
  accountName: string;
}

export async function getTableRowusersinfo(
  chainKey: string,
  { accountName }: AccountNameProps
) {

  const rpcEndpoint = `${chainsConfig[chainKey].protocol}://${chainsConfig[chainKey].host}`;

  const rpc = new JsonRpc(rpcEndpoint, { fetch });

  const response = await rpc.get_table_rows({
    code: "eosio.proton",
    table: "usersinfo",
    scope: "eosio.proton",
    index_position: 1,
    key_type: "i64",
    upper_bound: "",
    json: true,
    limit: 1,
    lower_bound: accountName,
  });

  return response;
}
