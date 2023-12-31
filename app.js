const xrpl = require("xrpl");
const client = new xrpl.Client("wss://xahau-test.net", {
  timeout: 9990000,
  connectionTimeout: 9990000,
});
// const client = new xrpl.Client("wss://s.altnet.rppletest.net:51233/");
const { setTimeout } = require("timers/promises");

let test = 0;
const stablishConnection = async function () {
  try {
    while (!client.isConnected()) {
      test += 1;
      console.log(test, "  talash");
      await client.connect();
      if (client.isConnected()) {
        return true;
      } else {
        return false;
      }
    }
  } catch (err) {
    // await setTimeout(5000, stablishConnection);
    console.log(err);
    return false;
  }
};

const createWallet = async () => {
  const wallet = xrpl.Wallet.generate();
  console.log(wallet);
  const response = await client.request({
    command: "account_info",
    account: "rXieaAC3nevTKgVu2SYoShjTCS2Tfczqx",
    ledger_index: "validated",
  });
  console.log(response);
};

const sendXrp = async (secret, destinationAddress, amount) => {
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
};

const balance = async (address) => {
  try {
    const result = await stablishConnection();
    if (result) {
      const balance = await client.getBalances(address);
      console.log(balance);
    }
  } catch (err) {
    console.log(err);
  }
};

// sendXrp("snZBfy5ovwe48fgZAzePihkSjVEFF", "rUn4kU7UAej8d8ddHc1PrRHwEzd3G9KFo2");
balance("rEDA5KNDLMFN9xdTFLUkHmosPbGxS3UsPj");

// createWallet();
