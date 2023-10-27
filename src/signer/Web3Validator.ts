import { TypeUtil } from "denetwork-utils";
import { verifyMessage } from "ethers";
import { Web3Encoder } from "./Web3Encoder";

/**
 * 	@class Web3Validator
 */
export class Web3Validator
{
	/**
	 *	@param signerWalletAddress	{string}
	 *	@param obj			{any}
	 *	@param sig			{string}
	 *	@param exceptedKeys		{Array<string>}
	 *	@returns {boolean}
	 */
	public static validateObject( signerWalletAddress : string, obj : any, sig : string, exceptedKeys ? : Array<string> ) : Promise<boolean>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! TypeUtil.isNotEmptyString( signerWalletAddress ) )
				{
					return reject( `invalid signerWalletAddress` );
				}
				if ( ! TypeUtil.isNotNullObject( obj ) )
				{
					return reject( `invalid obj` );
				}
				if ( ! TypeUtil.isNotEmptyString( sig ) )
				{
					return reject( `invalid sig` );
				}

				//	...
				const dataToSign : string = await Web3Encoder.encode( obj, exceptedKeys );
				const isSignatureValid = this.validateMessage( signerWalletAddress, dataToSign, sig );

				resolve( isSignatureValid );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}

	/**
	 *	@param signerWalletAddress	{string}
	 *	@param message			{Uint8Array | string}
	 *	@param sig			{string}
	 *	@returns {boolean}
	 */
	public static validateMessage( signerWalletAddress : string, message: Uint8Array | string, sig : string ) : Promise<boolean>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! TypeUtil.isNotEmptyString( signerWalletAddress ) )
				{
					return reject( `invalid signerWalletAddress` );
				}
				if ( ! message )
				{
					return reject( `invalid message` );
				}
				if ( ! TypeUtil.isNotEmptyString( sig ) )
				{
					return reject( `invalid sig` );
				}

				//	ether verify
				const verifyResult : string = verifyMessage( message, sig );
				const isSignatureValid = verifyResult.trim().toLowerCase() === signerWalletAddress.trim().toLowerCase();

				// console.log( `signerWalletAddress : `, signerWalletAddress );
				// console.log( `message : `, message );
				// console.log( `sig : `, sig );
				// console.log( `verifyResult : `, verifyResult );
				// console.log( `isSignatureValid : `, isSignatureValid );

				resolve( isSignatureValid );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}
}
