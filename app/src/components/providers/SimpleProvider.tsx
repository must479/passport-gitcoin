// --- React Methods
import React, { useState, useContext } from "react";

// --- Identity tools
import { ProofRecord, VerifiableCredential } from "@dpopp/types";
import { fetchVerifiableCredential, verifyCredential, verifyMerkleProof, generateMerkle } from "@dpopp/identity/src";

import * as DIDKit from "@dpopp/identity/dist/didkit-browser";
// pull context
import { UserContext } from "../../App";

import { Card } from "../Card";

const iamUrl = process.env.DPOPP_IAM_URL;

export function SimpleProvider(): JSX.Element {
  const { address, signer, handleAddStamp } = useContext(UserContext);

  const [signature, setSignature] = useState<string | undefined>();
  const [record, setRecord] = useState<false | ProofRecord | undefined>();
  const [challenge, setChallenge] = useState<false | VerifiableCredential | undefined>();
  const [credential, setCredential] = useState<false | VerifiableCredential | undefined>();
  const [verifiedMerkle, setVerifiedMerkle] = useState<boolean | undefined>();
  const [verifiedCredential, setVerifiedCredential] = useState<boolean | undefined>();

  // fetch an example VC from the IAM server
  const handleFetchCredential = (): void => {
    fetchVerifiableCredential(
      iamUrl,
      {
        address: address || "",
        type: "Simple",
        version: "0.0.0",
        proofs: {
          valid: "true",
          username: "test",
        },
      },
      signer
    )
      .then((res): void => {
        setSignature(res.signature);
        setRecord(res.record);
        setChallenge(res.challenge);
        setCredential(res.credential);
        // reset verification
        setVerifiedMerkle(undefined);
        setVerifiedCredential(undefined);
        handleAddStamp({
          provider: "Simple",
          credential: res.credential,
        });
      })
      .catch((e): void => {
        throw e;
      });
  };

  // Verify the example VC returned from the IAM server
  const handleVerifyCredential = (): void => {
    if (record && credential) {
      // Recreate the merkle root
      const merkle = generateMerkle(record);
      // extract a single proof to test is a secret matches the proof in the root
      const matchingProof = merkle.proofs.username;
      const matchingSecret = record.username || "";
      const matchingRoot = credential.credentialSubject.root || "";
      // check if the proof verifies this content
      const verifiedProof = verifyMerkleProof(matchingProof, matchingSecret, matchingRoot);
      // merkle is verified
      setVerifiedMerkle(verifiedProof);
      // verify that the VC was generated by the trusted authority
      verifyCredential(DIDKit, credential)
        .then((verifiedVC): void => {
          setVerifiedCredential(verifiedVC);
        })
        .catch((e): void => {
          throw e;
        });
    }
  };

  const simpleVCData = {
    icon: "",
    verificationButton: (
      <button className="verify-btn" onClick={handleFetchCredential}>
        Issue a Verifiable Credential
      </button>
    ),
    name: "Simple",
    description: "Simple Provider",
    output: (
      <div>
        {challenge ? <p>✅ Challenged received ({challenge.credentialSubject.challenge}) </p> : null}
        {challenge ? <p>✅ Challenged signed ({signature}) </p> : null}
        {credential ? <p>✅ Credential issued: </p> : null}
        {credential ? <pre>{JSON.stringify(credential, null, 4)}</pre> : null}
        {record ? <p>✅ Provided with the following information: </p> : null}
        {record ? <pre>{JSON.stringify(record, null, 4)}</pre> : null}
        {credential ? (
          <button
            className="bg-gray-100 mb-10 min-w-full mt-10 px-20 py-4 rounded-lg text-violet-500"
            onClick={handleVerifyCredential}
          >
            Verify Credential
          </button>
        ) : null}
        {verifiedMerkle ? (
          <p>✅ MerkleProof verifiably contains the passed in username ({record && record.username})</p>
        ) : null}
        {verifiedCredential ? (
          <p>✅ Credential has verifiably been issued by {credential && credential.issuer} </p>
        ) : null}
      </div>
    ),
    isVerified: false, // TODO
  };

  return <Card vcdata={simpleVCData} />;
}