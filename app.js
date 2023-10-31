const xrpl = require("xrpl");

const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233/");

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

const sendXrp = async (secret, destinationAddress, amount) => {
  await client.connect();
  const wallet = xrpl.Wallet.fromSecret(secret);
  console.log(wallet);
  const prepared = await client.autofill({
    TransactionType: "Payment",
    Account: wallet.address,
    Amount: xrpl.xrpToDrops(amount),
    Destination: destinationAddress,
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
  await client.disconnect();
};

sendXrp(
  "sEdS2943KzpEua3hfkmUh7kNPrmVWSq",
  "rD8bHVhMb3oEPSp4dwy1UQ9Ch2By5Gp8P3",
  22222
);
// createWallet();
