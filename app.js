const xrpl = require("xrpl");

const client = new xrpl.Client("wss://xahau-test.net");

const createWallet = async () => {
  await client.connect();
  const wallet = xrpl.Wallet.generate();
  console.log(wallet);
  const response = await client.request({
    command: "account_info",
    account: "rXieaAC3nevTKgVu2SYoShjTCS2Tfczqx",
    ledger_index: "validated",
  });
  console.log(response);

  await client.disconnect();
};

const getBalance = async (address) => {
  await client.connect();
  const balance = await client.getBalances(address);
  console.log(balance);
  await client.disconnect();
};

const sendXrp = async (secret, destinationAddress, amount) => {
  const fee = 0.1;
  await client.connect();
  const wallet = xrpl.Wallet.fromSecret(secret);
  const balance = await client.getBalances(wallet.address);
  console.log(balance);
  console.log(wallet);
  const prepared = await client.autofill({
    TransactionType: "Payment",
    Account: wallet.address,
    Amount: xrpl.xrpToDrops(5),
    Destination: destinationAddress,
    Fee: xrpl.xrpToDrops(fee),
  });
  const max_ledger = prepared.LastLedgerSequence;
  console.log("Prepared transaction instructions:", prepared);
  console.log("Transaction cost:", xrpl.dropsToXrp(prepared.Fee), "XRP");
  console.log("Transaction expires after ledger:", max_ledger);

  const signed = wallet.sign(prepared);
  console.log("Identifying hash:", signed.hash);
  console.log("Signed blob:", signed.tx_blob);

  const tx = await client.submitAndWait(signed.tx_blob);
  console.log(tx);
  console.log("Transaction result:", tx.result.meta.TransactionResult);
  console.log(
    "Balance changes:",
    JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2)
  );
  await client.disconnect();
};

sendXrp("snqt5zDTrhb7z1KxAmPB9Pnjja535", "rJyx9wZCkRopX4WX4ZMmrN5KDkU4FeEgKu");
// getBalance("rUn4kU7UAej8d8ddHc1PrRHwEzd3G9KFo2");
// createWallet();
