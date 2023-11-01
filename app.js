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
  await client.connect();

  const fee = 0.1;
  const minimumBalance = 1;
  const wallet = xrpl.Wallet.fromSecret(secret);
  const walletBalance = await client.getBalances(wallet.address);
  const balance = walletBalance[0].value;
  const transmissible_balance =
    xrpl.xrpToDrops(balance) -
    xrpl.xrpToDrops(fee) -
    xrpl.xrpToDrops(minimumBalance);
  // we can't decrease balance more than 1 xrp

  const amount_xrp = xrpl.dropsToXrp(transmissible_balance);
  if (amount_xrp < 1.5) {
    console.log("not enought balance");
    return null;
  }

  const memo =
    wallet.classicAddress + Math.floor(100000000 + Math.random() * 900000000);
  const prepared = await client.autofill({
    TransactionType: "Payment",
    Account: wallet.address,
    Amount: xrpl.xrpToDrops(amount_xrp),
    Destination: destinationAddress,
    Fee: xrpl.xrpToDrops(fee),
    Memos: [
      {
        Memo: {
          MemoData: Buffer.from(memo, "utf8").toString("hex").toUpperCase(),
        },
      },
    ],
  });

  // const max_ledger = prepared.LastLedgerSequence;
  console.log("Prepared transaction instructions:", prepared);
  // console.log("Transaction cost:", xrpl.dropsToXrp(prepared.Fee), "XRP");
  // console.log("Transaction expires after ledger:", max_ledger);

  const signed = wallet.sign(prepared);
  console.log("Transaction Id", signed.hash);
  // console.log("Signed blob:", signed.tx_blob);

  const tx = await client.submitAndWait(signed.tx_blob);
  // const output = Buffer.from(tx.result.Memos[0].Memo.MemoData, "hex");
  // console.log("test", output.toString());
  console.log(tx);
  console.log(`transaction result ${tx.result.meta.TransactionResult}`);
  console.log(`Transaction amount deliver ${tx.result.meta.delivered_amount}`);

  await client.disconnect();
};

const testClient = async function () {
  await client.connect();
  console.log(client.isConnected());
  await client.disconnect();
};

// testClient();

// sendXrp("snZBfy5ovwe48fgZAzePihkSjVEFF", "rUn4kU7UAej8d8ddHc1PrRHwEzd3G9KFo2");

// getBalance("rUn4kU7UAej8d8ddHc1PrRHwEzd3G9KFo2");
// createWallet();
