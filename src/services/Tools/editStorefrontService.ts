export interface EditStorefrontProps {
  activeUser: any;
  actions: any[];
}

export async function editStorefrontService({
  activeUser,
  actions,
}) {
  //console.log(actions);

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
