  const createToken = async (params: TokenCreationParams) => {
    if (!client || !address) {
      throw new Error("Wallet not connected");
    }

    setIsCreating(true);
    try {
      let contractAddress = null;
      let transactionHash = null;

      if (CONTRACTS.tokenFactory !== "sei1...") {
        const msg = {
          create_token: {
            name: params.name,
            symbol: params.symbol,
            total_supply: params.supply,
            logo_url: params.imageUrl,
          },
        };

        // --- START OF THE FIX ---

        // 1. Manually define the entire fee object.
        // This is the fee that goes to the network validators.
        const networkFee = {
          amount: [{ denom: "usei", amount: "2000000" }], // 2 SEI
          gas: "500000",
        };

        // 2. Manually define the funds object.
        // This is the fee that goes to our factory contract.
        const factoryFunds = [{ denom: "usei", amount: TOKEN_CREATION_FEE }]; // 10 SEI

        // 3. Add a log to see exactly what is being sent.
        console.log("Attempting to execute with...");
        console.log("Network Fee:", JSON.stringify(networkFee));
        console.log("Factory Funds:", JSON.stringify(factoryFunds));

        // 4. Pass these exact objects to the execute function.
        const result = await client.execute(
          address,
          CONTRACTS.tokenFactory,
          msg,
          networkFee,    // Use the manually created networkFee object
          undefined,     // Memo
          factoryFunds   // Use the manually created factoryFunds object
        );
        
        // --- END OF THE FIX ---

        contractAddress = result.logs[0]?.events
          .find((e) => e.type === "wasm")
          ?.attributes.find((a) => a.key === "new_token_contract")?.value || null;
        
        transactionHash = result.transactionHash;
        
        console.log("Token created:", { contractAddress, transactionHash });
      }

      // ... (rest of the function is the same)
      // ...
    } catch (error: any) {
      // ...
    } finally {
      // ...
    }
  };