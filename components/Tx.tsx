import { StyleSheet, Button, Text, View } from "react-native";
import { useState } from "react";
import {
  generatePrivateKey,
  HDAccount,
  mnemonicToAccount,
  PrivateKeyAccount,
  privateKeyToAccount,
} from "viem/accounts";
import { mainnet } from "viem/chains";
import { createWalletClient, parseUnits, http } from "viem";

const client = createWalletClient({
  chain: mainnet,
  transport: http(),
});

export default function Tx() {
  const [privateKeyAccount, setPrivateKeyAccount] =
    useState<PrivateKeyAccount>();
  const [mnemonicAccount, setMnemonicAccount] = useState<HDAccount>();
  const [txHash, setTxHash] = useState<string>();
  const [error, setError] = useState<string>();

  const createPrivateKeyAccount = () => {
    try {
      const privateKey = generatePrivateKey();

      const account = privateKeyToAccount(privateKey);

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

    const value = parseUnits("1", 18);

    try {
      const hash = await client.sendTransaction({
        account: privateKeyAccount,
        to: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
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
        <Text style={{ color: "#fff" }}>
          PrivateKey Account: {privateKeyAccount.address}
        </Text>
      )}

      <Button
        title="Generate account by mnemonic phrase"
        onPress={createMnemonicAccount}
      />

      {mnemonicAccount && (
        <Text style={{ color: "#fff" }}>
          Mnemonic Account: {mnemonicAccount.address}
        </Text>
      )}

      <Button title="Send transaction" onPress={sendTxFromPrivateKeyAccount} />

      {txHash && <Text style={{ color: "#fff" }}>TxHash: {txHash}</Text>}
      {error && <Text style={{ color: "#fff" }}>error: {error}</Text>}
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
