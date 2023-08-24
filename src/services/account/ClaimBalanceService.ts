interface ActionProps {
  account: string;
  name: string;
  authorization: {
    actor: string;
    permission: string;
  }[];
  data: {
    owner: string;
    token_to_withdraw: string;
  };
}

interface claimBalanceServiceProps {
  activeUser: any;
  actions: ActionProps[];
}

export async function ClaimBalanceService({
  activeUser,
  actions,
}: claimBalanceServiceProps) {
  const response = await activeUser.signTransaction(
    {
      actions,
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    }
  );

  return response;
}
