import React from 'react';

import { Buffer } from 'buffer';

import {
  Button,
  FormControl,
  Heading,
  NativeBaseProvider,
  ScrollView,
  Select,
  StatusBar,
  TextArea,
  VStack,
  WarningOutlineIcon,
} from 'native-base';

import {
  createAccount,
  createOperator,
  createUser,
  fromPublic,
  fromSeed,
  type KeyPair,
} from 'expo-nkeys';

type PrefixText = 'O' | 'A' | 'U';

type ValidationType = 'kind' | 'seed' | 'data';

type ValidationError = {
  type: ValidationType;
  mesagge: string | undefined;
};

export default function App() {
  const [selectedKind, setSelectedKind] = React.useState<
    PrefixText | undefined
  >();
  const [keyPair, setKeyPair] = React.useState<KeyPair | undefined>();
  const [data, setData] = React.useState<Uint8Array | undefined>();
  const [results, setResults] = React.useState<string | undefined>();
  const [inputError, setInputError] = React.useState<
    ValidationError | undefined
  >();

  const createKeyPair = React.useMemo<(kind: PrefixText) => void>(() => {
    return (kind: PrefixText) => {
      switch (kind) {
        case 'O':
          setKeyPair(createOperator());
          break;
        case 'A':
          setKeyPair(createAccount());
          break;
        case 'U':
          setKeyPair(createUser());
          break;
        default:
      }
    };
  }, [setKeyPair]);

  const validateKind = React.useMemo<
    (kind: PrefixText | undefined) => ValidationError | undefined
  >(() => {
    return (kind: PrefixText | undefined): ValidationError | undefined => {
      const eType: ValidationType = 'kind';
      if (!kind) {
        const e: ValidationError = {
          type: eType,
          mesagge: `${eType} is required`,
        };
        return e;
      }

      return undefined;
    };
  }, []);

  const validateSeed = React.useMemo<
    (seed: Uint8Array | undefined) => ValidationError | undefined
  >(() => {
    return (pseed: Uint8Array | undefined): ValidationError | undefined => {
      let e: ValidationError | undefined = validateKind(selectedKind);
      if (!e) {
        const eType: ValidationType = 'seed';
        if (!pseed) {
          e = {
            type: eType,
            mesagge: `${eType} is required`,
          };
        }
      }

      return e;
    };
  }, [selectedKind, validateKind]);

  const validateData = React.useMemo<
    (data: Uint8Array | undefined) => ValidationError | undefined
  >(() => {
    return (pdata: Uint8Array | undefined): ValidationError | undefined => {
      let e: ValidationError | undefined = validateSeed(
        (keyPair && keyPair.getSeed()) || undefined,
      );
      if (!e) {
        const eType: ValidationType = 'data';
        if (!pdata) {
          e = {
            type: eType,
            mesagge: `${eType} is required`,
          };
        }
      }

      if (e) {
        setInputError(e);
      }

      return e;
    };
  }, [keyPair, setInputError, validateSeed]);

  const setSeed = React.useMemo<(seed: string) => void>(() => {
    return (seed: string) => {
      if (seed) {
        try {
          const raw = new Uint8Array([...Buffer.from(seed)]);
          const prefixes: Array<PrefixText> = ['O', 'A', 'U'];
          if (seed.length > 1) {
            const prefix = seed.at(1) as PrefixText;
            if (prefixes.indexOf(prefix) > -1) {
              setSelectedKind(prefix);
            }
          }
          const kp = fromSeed(raw);
          if (keyPair) {
            keyPair.clear();
          }
          setKeyPair(kp);
        } catch (e) {
          setKeyPair(undefined);
          const err: ValidationError = {
            type: 'seed',
            mesagge: 'invalid seed',
          };
          setInputError(err);
        }
      }
    };
  }, [keyPair, setKeyPair, setInputError, setSelectedKind]);

  const processData = React.useMemo<(data: Uint8Array) => void>(() => {
    return (pdata: Uint8Array) => {
      const arr: Array<string> = [];

      if (!keyPair) return;
      if (!pdata) return;

      try {
        const startTime = new Date().getTime();
        arr.push(`[OK] Data: ${Buffer.from(pdata).toString()}`);
        const sig = keyPair.sign(pdata);
        arr.push(`[OK] Signature: ${Buffer.from(sig).toString('base64')}`);
        const pubKey = keyPair.getPublicKey();
        const kp = fromPublic(pubKey);
        arr.push(`[OK] Create KeyPair from Public Key: ${kp.getPublicKey()}`);
        kp.verify(pdata, sig);
        arr.push(`[OK] Signature Verified`);
        const endTime = new Date().getTime();

        const timeDiff = endTime - startTime;
        arr.push(`[OK] Ellapsed Time: ${timeDiff}ms`);
      } catch (e) {
        const err = e as Error;
        arr.push(`[ERR] ${err.message}`);
      }

      setResults(arr.join('\n'));
    };
  }, [keyPair, setResults]);

  React.useEffect(() => {
    if (selectedKind && inputError && inputError.type === 'kind') {
      setInputError(undefined);
    }
  }, [inputError, selectedKind, setInputError]);

  React.useEffect(() => {
    if (keyPair && inputError && inputError.type === 'seed') {
      setInputError(undefined);
    }
  }, [keyPair, inputError, setInputError]);

  React.useEffect(() => {
    if (data && inputError && inputError.type === 'data') {
      setInputError(undefined);
    }
  }, [data, inputError, setInputError]);

  return (
    <NativeBaseProvider>
      <StatusBar barStyle="dark-content" />
      <ScrollView>
        <VStack paddingLeft={4} paddingRight={4} safeArea>
          <Heading size="xl">NKey Demo</Heading>
          <FormControl
            isInvalid={inputError && inputError.type === 'kind'}
            isRequired
          >
            <FormControl.Label>Kind</FormControl.Label>
            <Select
              accessibilityLabel="Choose kind"
              placeholder="Choose kind"
              selectedValue={selectedKind}
              onValueChange={(v) => setSelectedKind(v as PrefixText)}
            >
              <Select.Item label="Operator" value="O" />
              <Select.Item label="Account" value="A" />
              <Select.Item label="User" value="U" />
            </Select>
            {inputError && inputError.type === 'kind' && (
              <FormControl.ErrorMessage
                leftIcon={<WarningOutlineIcon size="xs" />}
              >
                {inputError.mesagge}
              </FormControl.ErrorMessage>
            )}
          </FormControl>
          {selectedKind && (
            <Button
              marginTop={2}
              onPress={() => selectedKind && createKeyPair(selectedKind)}
            >
              Generate Seed
            </Button>
          )}
          <FormControl
            isInvalid={inputError && inputError.type === 'seed'}
            isRequired
          >
            <FormControl.Label>Seed</FormControl.Label>
            <TextArea
              autoCompleteType="off"
              fontFamily="mono"
              numberOfLines={3}
              placeholder="Input seed"
              value={
                (keyPair && String.fromCharCode(...keyPair.getSeed())) ||
                undefined
              }
              onChangeText={(v) => setSeed(v)}
            />
            {inputError && inputError.type === 'seed' && (
              <FormControl.ErrorMessage
                leftIcon={<WarningOutlineIcon size="xs" />}
              >
                {inputError.mesagge}
              </FormControl.ErrorMessage>
            )}
          </FormControl>
          <FormControl>
            <FormControl.Label>Private Key</FormControl.Label>
            <TextArea
              autoCompleteType="off"
              editable={false}
              fontFamily="mono"
              numberOfLines={3}
              value={keyPair && String.fromCharCode(...keyPair.getPrivateKey())}
              variant="filled"
            />
          </FormControl>
          <FormControl>
            <FormControl.Label>Public Key</FormControl.Label>
            <TextArea
              autoCompleteType="off"
              editable={false}
              fontFamily="mono"
              numberOfLines={3}
              value={keyPair && keyPair.getPublicKey()}
              variant="filled"
            />
          </FormControl>
          <FormControl
            isInvalid={inputError && inputError.type === 'data'}
            isRequired
          >
            <FormControl.Label>Data to Sign</FormControl.Label>
            <TextArea
              autoCompleteType="off"
              fontFamily="mono"
              numberOfLines={3}
              placeholder="Input data to sign"
              value={data && Buffer.from(data).toString()}
              onChangeText={(v) => {
                if (v) {
                  setData(new Uint8Array([...Buffer.from(v)]));
                  return;
                }

                setData(undefined);
              }}
            />
            {inputError && inputError.type === 'data' && (
              <FormControl.ErrorMessage
                leftIcon={<WarningOutlineIcon size="xs" />}
              >
                {inputError.mesagge}
              </FormControl.ErrorMessage>
            )}
          </FormControl>
          <Button
            marginTop={2}
            onPress={() => !validateData(data) && data && processData(data)}
          >
            Process Data
          </Button>
          <FormControl h={300}>
            <FormControl.Label>Results</FormControl.Label>
            <TextArea
              autoCompleteType="off"
              editable={false}
              fontFamily="mono"
              h="100%"
              value={results}
              variant="filled"
            />
          </FormControl>
        </VStack>
      </ScrollView>
    </NativeBaseProvider>
  );
}
