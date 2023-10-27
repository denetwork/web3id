import { ethers, SigningKey } from "ethers"
import { Web3Encoder } from "./Web3Encoder";
import { EtherWallet } from "./EtherWallet";


/**
 * 	@class Web3Signer
 */
export class Web3Signer
{
	/**
	 *	@param privateKey	{ string | SigningKey }
	 *	@param obj		{ any }
	 *	@param exceptedKeys	{ Array<string> }
	 *	@returns {Promise<string>}
	 */
	public static signObject( privateKey : string | SigningKey, obj : any, exceptedKeys ? : Array<string> ) : Promise<string>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! privateKey )
				{
					return reject( `invalid privateKey` );
				}
				if ( ! obj )
				{
					return reject( `invalid obj` );
				}
				if ( ! EtherWallet.isValidAddress( obj.wallet ) )
				{
					return reject( `invalid obj.wallet` );
				}

				const message : string = await Web3Encoder.encode( obj, exceptedKeys );
				const sig : string = await this.signMessage( privateKey, message );

				//	...
				resolve( sig );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}


	/**
	 *	@param privateKey	{ string | SigningKey }
	 *	@param message		{ string | Uint8Array }
	 *	@returns {Promise<string>}
	 */
	public static signMessage( privateKey : string | SigningKey, message : string | Uint8Array ) : Promise<string>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! privateKey )
				{
					return reject( `invalid privateKey` );
				}
				if ( ! message )
				{
					return reject( `invalid message` );
				}

				const signWallet = new ethers.Wallet( privateKey );
				const sig : string = await signWallet.signMessage( message );

				//	...
				resolve( sig.trim().toLowerCase() );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}
}
