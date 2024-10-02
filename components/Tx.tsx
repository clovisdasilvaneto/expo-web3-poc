import { StyleSheet, Button, Text, View } from "react-native";
import { useState } from "react";
import {
  generatePrivateKey,
  HDAccount,
  mnemonicToAccount,
  PrivateKeyAccount,
  privateKeyToAccount,
} from "viem/accounts";
import { sepolia } from "viem/chains";
import {
  createWalletClient,
  parseUnits,
  http,
  createPublicClient,
  formatEther,
  parseGwei,
  parseEther,
} from "viem";
import { mainnet } from "viem/chains";

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});
const client = createWalletClient({
  chain: sepolia,
  transport: http(),
});

export default function Tx() {
  const [privateKeyAccount, setPrivateKeyAccount] =
    useState<PrivateKeyAccount>();
  const [mnemonicAccount, setMnemonicAccount] = useState<HDAccount>();
  const [txHash, setTxHash] = useState<string>();
  const [error, setError] = useState<string>();

  const createPrivateKeyAccount = async () => {
    try {
      const privateKey = generatePrivateKey();

      const account = privateKeyToAccount(privateKey);

      const balance = await publicClient.getBalance({
        address: account.address,
      });
      const balanceAsEther = formatEther(balance);
      console.log("balance: ", balanceAsEther);
      setPrivateKeyAccount(account);
    } catch (err) {
      console.log(err);
    }
  };

  const createMnemonicAccount = () => {
    const account = mnemonicToAccount(
      "legal winner thank year wave sausage worth useful legal winner thank yellow"
    );

    setMnemonicAccount(account);
  };

  const sendTxFromPrivateKeyAccount = async () => {
    if (!privateKeyAccount) return;

    const value = parseEther("0.18");

    try {
      const hash = await client.sendTransaction({
        account: privateKeyAccount,
        to: "0xDa5e9FA404881Ff36DDa97b41Da402dF6430EE6b",
        value,
      });

      setTxHash(hash);
    } catch (err) {
      console.log("error:", err);
      setError(`${err}`);
    }
  };

  return (
    <View>
      <Button
        title="Generate an account by random key"
        onPress={createPrivateKeyAccount}
      />

      {privateKeyAccount && (
        <Text style={{ color: "red" }}>
          PrivateKey Account: {privateKeyAccount.address}
        </Text>
      )}

      <Button
        title="Generate account by mnemonic phrase"
        onPress={createMnemonicAccount}
      />

      {mnemonicAccount && (
        <Text style={{ color: "red" }}>
          Mnemonic Account: {mnemonicAccount.address}
        </Text>
      )}

      <Button title="Send transaction" onPress={sendTxFromPrivateKeyAccount} />

      {txHash && <Text style={{ color: "red" }}>TxHash: {txHash}</Text>}
      {error && <Text style={{ color: "red" }}>error: {error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
