import { isHexString, keccak256 } from "ethers";
import { Web3Encoder } from "./Web3Encoder";
import { EtherWallet } from "./EtherWallet";
import _ from "lodash";

/**
 * 	@class Web3Digester
 */
export class Web3Digester
{
	/**
	 *	@param obj		{ any }
	 *	@param exceptedKeys	{ Array<string> }
	 *	@returns {Promise<string>}
	 */
	public static hashObject( obj : any, exceptedKeys ? : Array<string> ) : Promise<string>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! obj )
				{
					return reject( `invalid obj` );
				}
				if ( ! EtherWallet.isValidAddress( obj.wallet ) )
				{
					return reject( `invalid obj.wallet` );
				}
				if ( ! _.isNumber( obj.timestamp ) || obj.timestamp <= 0 )
				{
					return reject( `invalid obj.timestamp` );
				}

				const message : string = await Web3Encoder.encode( obj, exceptedKeys );
				const arrayBuffer : Uint8Array = new TextEncoder().encode( message );
				const keccakHash : string = keccak256( arrayBuffer );

				//	will return a string starting with 0x and having a length of 66
				resolve( keccakHash.trim().toLowerCase() );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}

	/**
	 *	@param hash	{any}
	 *	@returns {boolean}
	 */
	public static isValidHash( hash : any ) : boolean
	{
		return _.isString( hash ) && ! _.isEmpty( hash ) && isHexString( hash, 32 );
	}
}
