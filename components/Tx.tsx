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
  http,
  createPublicClient,
  formatEther,
  parseEther,
} from "viem";
import DeviceCrypto from "react-native-device-crypto";
import * as Keychain from "react-native-keychain";
import {
  GestureHandlerRootView,
  TouchableOpacity,
} from "react-native-gesture-handler";

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
  const [iv, setIv] = useState<string>();
  const [reveleadKey, setReveleadKey] = useState<string>();
  const [error, setError] = useState<string>();

  const createPrivateKeyAccount = async () => {
    try {
      const privateKey = generatePrivateKey();
      const account = privateKeyToAccount(privateKey);

      await DeviceCrypto.getOrCreateAsymmetricKey("safe", {
        accessLevel: 2,
        invalidateOnNewBiometry: true,
      });

      const encryptyedPrivateKey = await DeviceCrypto.encrypt(
        "safe",
        privateKey,
        {
          biometryTitle: "Authenticate",
          biometrySubTitle: "Signing",
          biometryDescription: "Authenticate your self to sign the text",
        }
      );

      await Keychain.setGenericPassword(
        "safeuser",
        encryptyedPrivateKey.encryptedText
      );

      // TODO: check where we are going to store it
      setIv(encryptyedPrivateKey.iv);
      setPrivateKeyAccount(account);

      const balance = await publicClient.getBalance({
        address: account.address,
      });
      const balanceAsEther = formatEther(balance);

      console.log("balance: ", balanceAsEther);
    } catch (err) {
      console.log(err);
    }
  };

  const createMnemonicAccount = async () => {
    try {
      if (!privateKeyAccount) return;
      const account = mnemonicToAccount(
        "legal winner thank year wave sausage worth useful legal winner thank yellow"
      );

      setMnemonicAccount(account);
    } catch (err) {
      console.log(err);
    }
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

  const revealPrivateKey = async () => {
    const user = await Keychain.getGenericPassword();

    if (!iv) throw "iv does not exists";
    if (!user) throw "user password not found";

    try {
      const decryptedKey = await DeviceCrypto.decrypt(
        "safe",
        user.password,
        iv,
        {
          biometryTitle: "Authenticate",
          biometrySubTitle: "Signing",
          biometryDescription: "Authenticate your self to sign the text",
        }
      );

      setReveleadKey(decryptedKey);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View>
      <Button
        title="Generate an account by random key"
        onPress={createPrivateKeyAccount}
      />

      {privateKeyAccount && (
        <>
          <Text style={{ color: "yellow" }}>
            Account Address: {privateKeyAccount.address}
          </Text>

          {reveleadKey && (
            <Text style={{ color: "red", marginTop: 10 }}>
              Account Private key: {reveleadKey}
            </Text>
          )}

          <GestureHandlerRootView>
            <TouchableOpacity
              style={{
                backgroundColor: "red",
                padding: 32,
                paddingTop: 16,
                paddingBottom: 16,
                borderRadius: 10,
                marginTop: 10,
              }}
              onPress={revealPrivateKey}
            >
              <Text
                style={{
                  color: "#fff",
                }}
              >
                Reveal private key
              </Text>
            </TouchableOpacity>
          </GestureHandlerRootView>
        </>
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
