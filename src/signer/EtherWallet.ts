import {
	ethers,
	KeystoreAccount, EncryptOptions, ProgressCallback,
	isKeystoreJson, decryptKeystoreJson, encryptKeystoreJson, isAddress, isHexString
} from "ethers";
import { TWalletBaseItem } from "../models/TWallet";
import _ from "lodash";

/**
 * 	@class
 */
export class EtherWallet
{
	/**
	 *	@param wallet	{any} wallet object
	 *	@returns {boolean}
	 */
	public static isValidWalletFactoryData( wallet : any ) : boolean
	{
		return _.isObject( wallet ) &&
			_.has( wallet, 'isHD' ) &&
			_.has( wallet, 'mnemonic' ) &&
			_.has( wallet, 'password' ) &&
			_.has( wallet, 'address' ) &&
			_.has( wallet, 'publicKey' ) &&
			_.has( wallet, 'privateKey' ) &&
			_.has( wallet, 'index' ) &&
			_.has( wallet, 'path' );
	}

	// public static createDerivedWalletObject( walletItem : TWalletBaseItem, derivePath ?: string )
	// {
	// 	const walletObject = this.createWalletObject( walletItem );
	// 	if ( walletObject )
	// 	{
	// 		const derivedWalletObject = walletObject.derivePath( derivePath );
	// 	}
	// }

	/**
	 *	@param walletItem	{TWalletBaseItem}
	 *	@returns { ethers.HDNodeWallet | ethers.Wallet | null }
	 */
	public static createWalletObject( walletItem : TWalletBaseItem ) : ethers.HDNodeWallet | ethers.HDNodeVoidWallet | ethers.Wallet | null
	{
		if ( null === walletItem )
		{
			throw new Error( `invalid walletItem` );
		}

		let walletObject = null;
		if ( walletItem.mnemonic &&
			ethers.Mnemonic.isValidMnemonic( walletItem.mnemonic ) )
		{
			const mnemonicObj = ethers.Mnemonic.fromPhrase( walletItem.mnemonic );
			if ( ! mnemonicObj || ! mnemonicObj.phrase )
			{
				throw new Error( `failed to create mnemonic object` );
			}

			walletObject = ethers.HDNodeWallet.fromMnemonic( mnemonicObj );
		}
		else if ( _.isString( walletItem.privateKey ) && ! _.isEmpty( walletItem.privateKey ) )
		{
			let privateKeyObj;
			try
			{
				if ( ! walletItem.privateKey.startsWith( '0x' ) )
				{
					walletItem.privateKey = '0x' + walletItem.privateKey;
				}
				privateKeyObj = new ethers.SigningKey( walletItem.privateKey );
			}
			catch ( error )
			{
				throw new Error( 'invalid format of private key' );
			}

			walletObject = new ethers.Wallet( privateKeyObj );
		}

		return walletObject;
	}

	/**
	 * 	Create a wallet from a mnemonic phrase.
	 *	@param mnemonic	- string
	 *	@returns {TWalletBaseItem}
	 */
	public static createWalletFromMnemonic( mnemonic? : string ) : TWalletBaseItem
	{
		//
		//	TODO
		//	should add parameter password
		//
		let mnemonicObj;
		if ( ! mnemonic )
		{
			//	If the user does not specify a mnemonic phrase,
			//	a random one will be created.
			mnemonicObj = ethers.Wallet.createRandom().mnemonic;
			//	console.log(mnemonicObj.phrase);
		}
		else
		{
			if ( ! ethers.Mnemonic.isValidMnemonic( mnemonic ) )
			{
				throw new Error( 'invalid mnemonic' );
			}

			mnemonicObj = ethers.Mnemonic.fromPhrase( mnemonic )
			// console.log(mnemonicObj.phrase);
		}
		if ( ! mnemonicObj || ! mnemonicObj.phrase )
		{
			throw new Error( `failed to create mnemonic object` );
		}

		const walletObj = ethers.HDNodeWallet.fromMnemonic( mnemonicObj )
		return this.decorateResult({
			isHD : true,
			mnemonic : walletObj?.mnemonic?.phrase,
			password : '',
			address : walletObj?.address,
			publicKey : walletObj?.publicKey,
			privateKey : walletObj?.privateKey,
			index : walletObj?.index,
			path : walletObj?.path
		});
	}

	/**
	 * 	Returns the wallet details for the JSON Keystore Wallet json using {password}.
	 * 	https://docs.ethers.org/v6/api/wallet/
	 *	https://docs.ethers.org/v6/api/wallet/#KeystoreAccount
	 *	@param keystoreJson	{string} Wallet keystore JSON string
	 *	@param password		{string} decrypt keystoreJson using {password}
	 *	@returns {Promise<TWalletBaseItem>}
	 */
	public static createWalletFromKeystore( keystoreJson : string, password: string = '' ) : Promise<TWalletBaseItem>
	{
		return new Promise( async ( resolve, reject) =>
		{
			try
			{
				if ( ! isKeystoreJson( keystoreJson ) )
				{
					return reject( `invalid keystoreJson` );
				}

				const progressCallback : ProgressCallback = ( _percent: number ) =>
				{
					//	A callback during long-running operations to update any UI or
					//	provide programmatic access to the progress.
					//
					// 	The percent is a value between 0 and 1.
				};

				//	Returns the account details for the JSON Keystore Wallet json using password.
				const keystoreAccount : KeystoreAccount = await decryptKeystoreJson( keystoreJson, password, progressCallback );
				if ( ! keystoreAccount )
				{
					return reject( `error in decryptKeystoreJson` );
				}

				const wallet : TWalletBaseItem = this.createWalletFromPrivateKey( keystoreAccount.privateKey );
				if ( ! this.isValidWalletFactoryData( wallet ) )
				{
					return reject( `error in createWalletFromPrivateKey` );
				}

				resolve( wallet );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}

	/**
	 * 	Resolved to the JSON Keystore Wallet for {wallet} encrypted with {password}.
	 *	@param wallet	{TWalletBaseItem}
	 *	@param password	{string}		encrypt {wallet} with {password}
	 *	@returns {Promise<string>}
	 */
	public static getKeystoreOfWallet( wallet : TWalletBaseItem, password: string = '' ) : Promise<string>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! this.isValidWalletFactoryData( wallet ) )
				{
					return reject( `invalid wallet` );
				}
				if ( ! _.isString( wallet.address ) || _.isEmpty( wallet.address ) )
				{
					return reject( `invalid wallet.address` );
				}
				if ( ! _.isString( wallet.privateKey ) || _.isEmpty( wallet.privateKey ) )
				{
					return reject( `invalid wallet.privateKey` );
				}

				const account : KeystoreAccount = {
					address: wallet.address,
					mnemonic: undefined,
					privateKey: wallet.privateKey,
				};
				const encryptOptions : EncryptOptions = {
					progressCallback : ( _percent: number ) =>
					{
						//	A callback during long-running operations to update any UI or
						//	provide programmatic access to the progress.
						//
						// 	The percent is a value between 0 and 1.
					}
				};

				//	Resolved to the JSON Keystore Wallet for account encrypted with password.
				const keystore : string = await encryptKeystoreJson( account, password, encryptOptions );
				resolve( keystore );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}

	/**
	 * 	https://iancoleman.io/bip39/
	 * 	扩展私钥不是钱包的私钥，是助记词
	 * 	m/44'/60'/0'/0
	 * 	Derivation Path  BIP44
	 *
	 * 	Create a wallet from an extended private key.
	 *	supported BIP32 Root Key | Account Extended Private Key | BIP32 Extended Private Key
	 *	@param {*} extendedKey	- BIP32 Extended Private Key
	 *	@returns {TWalletBaseItem}
	 */
	public static createWalletFromExtendedKey( extendedKey : string ) : TWalletBaseItem
	{
		if ( !extendedKey )
		{
			throw new Error( 'no extended private key specified.' );
		}

		const walletObj = ethers.HDNodeWallet.fromExtendedKey( extendedKey )
		let wallet = {} as TWalletBaseItem;
		wallet.isHD = true;
		wallet.mnemonic = '';
		wallet.password = '';

		let deriveWallet;
		switch ( walletObj.depth )
		{
			case 0:
				//	Mnemonic
				//	给出衍生路径，补齐五层衍生路径为 "m/44'/60'/0'/0/0"
				deriveWallet = walletObj.derivePath( ethers.defaultPath );
				wallet = {
					...wallet,
					address : deriveWallet.address,
					publicKey : deriveWallet.publicKey,
					// privateKey : deriveWallet.privateKey,
					index : deriveWallet.index,
					path : ethers.defaultPath,
				};
				break;

			case 3:
				//	m/44'/60'/0'/0
				//	给出衍生路径，补齐五层衍生路径为 "m/44'/60'/0'/0/0"，补的就是最后的 "/0/0"
				deriveWallet = walletObj.derivePath( 'm/0/0' );
				wallet = {
					...wallet,
					address : deriveWallet.address,
					publicKey : deriveWallet.publicKey,
					// privateKey : deriveWallet.privateKey,
					index : deriveWallet.index,
					path : ethers.defaultPath
				};
				break;
			case 4:
				//	给出衍生路径，补齐五层衍生路径为 "m/44'/60'/0'/0/0"，补的就是最后的 "/0"
				deriveWallet = walletObj.derivePath( 'm/0' );
				wallet = {
					...wallet,
					address : deriveWallet.address,
					publicKey : deriveWallet.publicKey,
					// privateKey : deriveWallet.privateKey,
					index : deriveWallet.index,
					path : ethers.defaultPath
				};
				break
			default:
				throw new Error( 'Unsupported type of extended private key' );
		}

		return this.decorateResult( wallet );
	}


	/**
	 *	Create a wallet from a wallet private key
	 *	@param {*} privateKey
	 *	@returns {TWalletBaseItem}
	 */
	public static createWalletFromPrivateKey( privateKey : any = null ) : TWalletBaseItem
	{
		if ( ! privateKey )
		{
			//	If the private key does not exist,
			//	create a random private key.
			privateKey = ethers.Wallet.createRandom().privateKey
		}

		let privateKeyObj;
		try
		{
			if ( typeof privateKey == 'string' && ! privateKey.startsWith( '0x' ) )
			{
				privateKey = '0x' + privateKey
			}
			privateKeyObj = new ethers.SigningKey( privateKey )
		}
		catch ( error )
		{
			throw new Error( 'invalid format of private key' )
		}

		//
		//	walletObj output:
		//	{
		//		"provider":null,
		//		"address":"0x7b65aBA47A1575879A1f28734e1386bf47D01700"
		//	}
		//
		const walletObj = new ethers.Wallet( privateKeyObj )
		//console.log( `🧲`, JSON.stringify( walletObj ) );

		return this.decorateResult({
			isHD : false,
			mnemonic : '',
			password : '',
			address : walletObj.address,
			publicKey : ethers.SigningKey.computePublicKey( walletObj.privateKey, true ),
			privateKey : walletObj.privateKey,
			index : 0,	//	walletObj.index,
			path : null,	//	walletObj.path
		});
	}

	/**
	 *	Create a watch wallet from a wallet address
	 *	@param {*} address
	 *	@returns {TWalletBaseItem}
	 */
	public static createWalletFromAddress( address : string ) : TWalletBaseItem
	{
		if ( ! this.isValidAddress( address ) )
		{
			throw new Error( 'invalid address' )
		}

		return this.decorateResult({
			isHD : false,
			mnemonic : '',
			password : '',
			address : address,
			publicKey : '',
			privateKey : '',
			index : 0,	//	walletObj.index,
			path : null,	//	walletObj.path
		});
	}

	/**
	 * 	@param address	{string} wallet address
	 * 	@returns {TWalletBaseItem}
	 */
	public static createWatchWallet( address : string ) : TWalletBaseItem
	{
		return this.createWalletFromAddress( address );
	}

	/**
	 *	@param address	{string} wallet address
	 *	@return {boolean}
	 */
	public static isValidAddress( address : any ) : boolean
	{
		return _.isString( address ) && ! _.isEmpty( address ) && isAddress( address );
	}

	/**
	 *	@param privateKey	{any}
	 *	@returns {boolean}
	 */
	public static isValidPrivateKey( privateKey : any ) : boolean
	{
		return _.isString( privateKey ) && ! _.isEmpty( privateKey ) && isHexString( privateKey, 32 );
	}

	/**
	 *	@param publicKey	{any}
	 *	@returns {boolean}
	 */
	public static isValidPublicKey( publicKey : any ) : boolean
	{
		return _.isString( publicKey ) && ! _.isEmpty( publicKey ) && isHexString( publicKey, 33 );
	}

	/**
	 *	@param input	{any}
	 *	@returns {boolean}
	 */
	public static isValidLowercaseHex( input : any ): boolean
	{
		const hexPattern = /^(0x)?[0-9a-f]+$/;
		return _.isString( input ) && ! _.isEmpty( input ) && hexPattern.test( input );
	}

	/**
	 *	Generate a new address for the specified wallet
	 *	@param wallet	{any}
	 *	@returns {TWalletBaseItem}
	 */
	public static createNewAddress( wallet : any ) : TWalletBaseItem
	{
		if ( ! wallet )
		{
			throw new Error( 'wallet not specified' )
		}

		const mnemonicObj = ethers.Mnemonic.fromPhrase( wallet.mnemonic )
		const nextPath = ethers.getIndexedAccountPath( wallet.index + 1 )
		const walletObj = ethers.HDNodeWallet.fromMnemonic( mnemonicObj, nextPath )

		return this.decorateResult({
			isHD : true,
			mnemonic : walletObj?.mnemonic?.phrase,
			password : '',
			address : walletObj.address,
			publicKey : walletObj.publicKey,
			privateKey : walletObj.privateKey,
			index : walletObj.index,
			path : walletObj.path
		});
	}

	/**
	 *	@param walletItem	{TWalletBaseItem}
	 *	@returns {TWalletBaseItem}
	 *	@private
	 */
	private static decorateResult( walletItem : TWalletBaseItem ) : TWalletBaseItem
	{
		if ( ! walletItem )
		{
			throw new Error( `invalid walletItem` );
		}

		return {
			...walletItem,
			address : _.isString( walletItem.address ) ? walletItem.address.trim().toLowerCase() : walletItem.address,
			publicKey : _.isString( walletItem.publicKey ) ? walletItem.publicKey.trim().toLowerCase() : walletItem.publicKey,
			privateKey : _.isString( walletItem.privateKey ) ? walletItem.privateKey.trim().toLowerCase() : walletItem.privateKey,
		};
	}
}
