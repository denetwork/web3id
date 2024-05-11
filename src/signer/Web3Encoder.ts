import _ from "lodash";

/**
 * 	@class Web3Encoder
 */
export class Web3Encoder
{
	/**
	 *	@param obj		{Record<string, any>}
	 *	@param exceptedKeys	{Array<string>}
	 *	@returns {Promise<string>}
	 */
	public static encode( obj : Record<string, any>, exceptedKeys ? : Array<string> ) : Promise<string>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! obj )
				{
					return reject( `invalid obj` );
				}

				let keysToRemove : Array<string> = [ 'sig', 'hash', 'createdAt', 'updatedAt' ];
				if ( Array.isArray( exceptedKeys ) && exceptedKeys.length > 0 )
				{
					keysToRemove = Array.from( new Set( [ ...keysToRemove, ...exceptedKeys ] ) );
				}

				const cleanedUpObj : Record<string, any> = this.removeObjectKeys( obj, keysToRemove );
				const sortedObj : Record<string, any> = this.sortObjectByKeys( cleanedUpObj );
				const encodedMessage : string = JSON.stringify( sortedObj );

				resolve( encodedMessage );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 *	@param encodedMessage	{string}
	 *	@returns {Promise<Record<string, any>>}
	 */
	public static decode( encodedMessage : string ) : Promise<Record<string, any>>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				resolve( JSON.parse( encodedMessage ) );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 * 	determine whether the key of an object is of string type
	 *	@param obj
	 *	@param key
	 *	@returns {boolean}
	 */
	public static isStringKey( obj : object, key : string ) : obj is Record<string, any>
	{
		return key in obj;
	}

	/**
	 *	@param obj		{ Record<string, any> }
	 *	@param keysToRemove	{ Array<string> }
	 *	@returns { Record<string, any> }
	 */
	public static removeObjectKeys( obj : Record<string, any>, keysToRemove : Array<string> ) : Record<string, any>
	{
		if ( ! _.isObject( obj ) || null === obj )
		{
			return obj;
		}
		if ( ! Array.isArray( keysToRemove ) || 0 === keysToRemove.length )
		{
			return obj;
		}

		return Object.fromEntries( Object.entries( obj ).filter( ( [ key ] ) => ! keysToRemove.includes( key ) ) );
	}

	/**
	 *	@param obj		{Record<string, any>}
	 *	@param reservedKeys	{Array<string>}
	 *	@returns {Record<string, any>}
	 */
	public static reserveObjectKeys( obj : Record<string, any>, reservedKeys : Array<string> ) : Record<string, any>
	{
		if ( ! _.isObject( obj ) || null === obj )
		{
			return obj;
		}
		if ( ! Array.isArray( reservedKeys ) || 0 === reservedKeys.length )
		{
			return obj;
		}

		return Object.fromEntries( Object.entries( obj ).filter( ( [ key ] ) => reservedKeys.includes( key ) ) );
	}


	/**
	 *	@param obj	{*}
	 *	@returns {*}
	 */
	public static sortObjectByKeys<T extends object>( obj : T ) : T | Array<any>
	{
		try
		{
			if ( 'object' !== typeof obj || null === obj )
			{
				return obj;
			}
			if ( Array.isArray( obj ) )
			{
				return obj.map( this.sortObjectByKeys<T> );
			}

			const stringKeysObj : { [ key : string ] : any } = obj as { [ key : string ] : any };
			const sortedObject : any = {};

			//	Get the keys and sort them alphabetically
			const keys : Array<string> = Object.keys( stringKeysObj ).sort();
			for ( const key of keys )
			{
				if ( ! this.isStringKey( stringKeysObj, key ) )
				{
					continue;
				}

				//	recursively sort nested objects
				sortedObject[ key ] = this.sortObjectByKeys<T>( stringKeysObj[ key ] );
			}

			return sortedObject as T;
		}
		catch ( err )
		{
			return obj;
		}
	}
}
