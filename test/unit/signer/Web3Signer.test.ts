import { describe, expect } from '@jest/globals';
import { EtherWallet, Web3Validator } from "../../../src";
import { ethers } from "ethers";
import { Web3Signer } from "../../../src";
import { TWalletBaseItem } from "../../../src";



/**
 *	unit test
 */
describe( "Signer", () =>
{
	beforeAll( async () =>
	{
	} );
	afterAll( async () =>
	{
	} );

	describe( "Sign and validate", () =>
	{
		it( "should sign a object and validate it", async () =>
		{
			//
			//	create a wallet by mnemonic
			//
			const mnemonic : string = 'olympic cradle tragic crucial exit annual silly cloth scale fine gesture ancient';
			const walletObj : TWalletBaseItem = EtherWallet.createWalletFromMnemonic( mnemonic );

			//	assert ...
			expect( walletObj ).not.toBeNull();
			expect( walletObj.mnemonic ).toBe( mnemonic );
			expect( walletObj.privateKey.startsWith( '0x' ) ).toBe( true );
			expect( walletObj.address.startsWith( '0x' ) ).toBe( true );
			expect( walletObj.index ).toBe( 0 );
			expect( walletObj.path ).toBe( ethers.defaultPath );

			//
			//	create a new contact with ether signature
			//
			let toBeSignedObject = {
				version : '1.0.0',
				deleted : 0,
				wallet : walletObj.address,
				address : '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
				sig : ``,
				name : `Sam`,
				avatar : 'https://avatars.githubusercontent.com/u/142800322?v=4',
				remark : 'no remark',
				createdAt: new Date(),
				updatedAt: new Date()
			};
			toBeSignedObject.sig = await Web3Signer.signObject( walletObj.privateKey, toBeSignedObject );
			expect( toBeSignedObject.sig ).toBeDefined();
			expect( typeof toBeSignedObject.sig ).toBe( 'string' );
			expect( toBeSignedObject.sig.length ).toBeGreaterThanOrEqual( 0 );
			// console.log( toBeSignedObject.sig );
			// 0xa52c1d36c2528a2f460ea5a344481d38455f78c0bd046802a51aefafc275ef1678a09aa8151e49cc2880131ad247fd6d469e1367b16ff08eff3ccfa9d654679f1c

			//
			//	validate it
			//
			const valid = await Web3Validator.validateObject( walletObj.address, toBeSignedObject, toBeSignedObject.sig );
			expect( valid ).toBeTruthy();

		}, 60 * 10e3 );


		it( "should sign a object with excepted keys, and then validate it", async () =>
		{
			//
			//	create a wallet by mnemonic
			//
			const mnemonic : string = 'olympic cradle tragic crucial exit annual silly cloth scale fine gesture ancient';
			const walletObj : TWalletBaseItem = EtherWallet.createWalletFromMnemonic( mnemonic );

			//	assert ...
			expect( walletObj ).not.toBeNull();
			expect( walletObj.mnemonic ).toBe( mnemonic );
			expect( walletObj.privateKey.startsWith( '0x' ) ).toBe( true );
			expect( walletObj.address.startsWith( '0x' ) ).toBe( true );
			expect( walletObj.index ).toBe( 0 );
			expect( walletObj.path ).toBe( ethers.defaultPath );

			//
			//	create a new contact with ether signature
			//
			let toBeSignedObject = {
				version : '1.0.0',
				deleted : 0,
				wallet : walletObj.address,
				address : '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
				sig : ``,
				name : `Sam`,
				avatar : 'https://avatars.githubusercontent.com/u/142800322?v=4',
				remark : 'no remark',
				createdAt: new Date(),
				updatedAt: new Date()
			};
			const exceptedKeys : Array<string> = [ 'remark' ];

			//	...
			toBeSignedObject.sig = await Web3Signer.signObject( walletObj.privateKey, toBeSignedObject, exceptedKeys );
			expect( toBeSignedObject.sig ).toBeDefined();
			expect( typeof toBeSignedObject.sig ).toBe( 'string' );
			expect( toBeSignedObject.sig.length ).toBeGreaterThanOrEqual( 0 );
			// console.log( toBeSignedObject.sig );
			// 0xa52c1d36c2528a2f460ea5a344481d38455f78c0bd046802a51aefafc275ef1678a09aa8151e49cc2880131ad247fd6d469e1367b16ff08eff3ccfa9d654679f1c

			//
			//	validate it
			//
			const valid = await Web3Validator.validateObject( walletObj.address, toBeSignedObject, toBeSignedObject.sig, exceptedKeys );
			expect( valid ).toBeTruthy();

		}, 60 * 10e3 );
	} );
} );
