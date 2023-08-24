interface editStorefrontServiceProps {
  activeUser: any;
  values: any[];
}

export async function editStorefrontService({
  activeUser,
  values,
}: editStorefrontServiceProps) {
  const response = await activeUser.signTransaction(
    {
      actions: [
        {
          account: 'storefront',
          name: 'removekeys',
          authorization: [
            {
              actor: activeUser.accountName,
              permission: activeUser.requestPermission,
            },
          ],
          data: {
            actor: activeUser.accountName,
            values,
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
