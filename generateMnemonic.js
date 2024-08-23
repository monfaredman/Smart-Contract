const bip39 = require("bip39");

// Generate a random mnemonic (12 words)
const mnemonic = bip39.generateMnemonic();

console.log("Your new mnemonic is:", mnemonic);
