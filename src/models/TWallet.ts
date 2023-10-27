/**
 * 	https://github.com/jakearchibald/idb
 */
export interface TWalletBaseItem
{
	/**
	 * 	HD wallet?
	 */
	isHD : boolean;

	/**
	 * 	mnemonic phrase, a word list
	 */
	mnemonic ?: string;

	/**
	 * 	The password of the wallet, used to encrypt mnemonic and privateKey.
	 * 	If password is not empty, mnemonic and privateKey should be ciphertext
	 */
	password : string;

	/**
	 * 	address of wallet. this, wallet address is the globally unique stored key for storage
	 */
	address : string;

	/**
	 * 	private key and public key
	 */
	privateKey : string;
	publicKey : string;

	/**
	 * 	The index of the generated wallet address. For non-HD wallets, the index will always be 0
	 */
	index : number;

	/**
	 * 	Wallet path. For non-HD wallets, the path is empty
	 */
	path ?: string | null;

	/**
	 *	The depth of this wallet, which is the number of components in its path.
	 */
	depth ?: number;

	/**
	 * 	The fingerprint.
	 *
	 *	A fingerprint allows quick qay to detect parent and child nodes,
	 *	but developers should be prepared to deal with collisions as it is only 4 bytes.
	 */
	fingerprint ?: string;

	/**
	 *	The parent fingerprint.
	 */
	parentFingerprint ?: string;

	/**
	 *	The chaincode, which is effectively a public key used to derive children.
	 */
	chainCode ?: string;
}

export interface TWalletItem extends TWalletBaseItem
{
	name: string;
	chainId : number;		//	network changed to chainId
//	network: string;
	pinCode: string;		//	password for encrypting local database storage
	remark?: string;		//	remark
	avatar?: string;		//	wallet avatar
	freePayment ?: boolean;		//
}
