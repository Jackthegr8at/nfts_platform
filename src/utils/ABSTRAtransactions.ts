export type TransactionData = {
  timestamp: string;
  amount: string;
};

export async function fetchTransactions(userAccount: string, fromDate: Date): Promise<boolean> {
  const dateString = fromDate.toISOString();
  const encodedDate = encodeURIComponent(dateString);
  const url = `https://proton.cryptolions.io/v2/history/get_actions?limit=1000&account=bot.xpr&act.name=transfer&after=${encodedDate}&act.authorization.actor=${userAccount}`;
  const storageKey = `transactionsData_${userAccount}`;

  function processTransactions(jsonData: any): TransactionData[] {
    // Filter the transactions based on your requirements and extract the necessary information.
    // This is just a basic example; you should modify this function to match the actual API response structure.
    return jsonData.actions
      .filter(
        (action: any) =>
          action.act.data.memo === "ABSTRA" && action.act.data.symbol === "FOOBAR"
      )
      .map((action: any) => ({
        timestamp: action.timestamp,
        amount: action.act.data.amount,
      }));
  }

  try {
    const storedData = localStorage.getItem(storageKey);
    let shouldFetch = true;
    console.log(storedData);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      const lastUpdate = new Date(parsedData.timestamp);
      const now = new Date();

      if (now.getTime() - lastUpdate.getTime() > 86400000 || !parsedData.authorized) {
        shouldFetch = true;
      } else {
        shouldFetch = false;
        console.log(parsedData.authorized);
      }
    }

    if (shouldFetch) {
      const response = await fetch(url);
      const jsonData = await response.json();

      const filteredTransactions = processTransactions(jsonData);
      const now = new Date();
      const cutoffDate = new Date(now.getTime() - 32 * 86400000);
      let totalReceived = 0;

      for (const transaction of filteredTransactions) {
        const transactionDate = new Date(transaction.timestamp);

        if (transactionDate >= cutoffDate) {
          console.log(transaction.amount);
          totalReceived += parseFloat(transaction.amount);
        }
      }
      console.log(totalReceived);
      const authorized = totalReceived >= 5;

      localStorage.setItem(
        storageKey,
        JSON.stringify({ timestamp: now.toISOString(), authorized: authorized })
      );
      console.log(authorized);
      return authorized;
    } else {
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        return parsedData.authorized;
      } else {
        return false;
      }
    }

  } catch (error) {
    console.error("Error fetching data:", error);
    return false;
  }
}