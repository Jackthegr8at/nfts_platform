interface transferServiceProps {
  activeUser: any;
  amount: string;
  receiver: string;
  memo: string;
}
export async function transferService({
  activeUser,
  amount,
  receiver,
  memo,
}: transferServiceProps) {
  const response = await activeUser.signTransaction(
    {
      actions: [
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
            to: receiver,
            memo: memo,
            quantity: amount,
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
