'use stricts'

let chai = require('chai');
let chaiHttp = require('chai-http');
const expect = require('chai').expect;

chai.use(chaiHttp);
const url = 'http://localhost:3000/api/v1';


describe('[GET] Accounts: ',()=>{

	it('should get all accounts', (done) => {
		chai.request(url)
			.get('/accounts')
			.end( function(err,res){
				expect(res).to.have.status(200);
				done();
			});
	});

});

describe('[GET] Latest: ',()=>{

	it('should get last 10 blocks and txs', (done) => {
		chai.request(url)
			.get('/latest')
			.end( function(err,res){
				expect(res).to.have.status(200);
				done();
			});
	});

});

describe('[GET] Transfer: ', ()=>{

	it('should generate a new tx', (done) => {
        const max = 10000000000000000000;
        const min = 1000000000000000000;
        const randomAmount = Math.floor(Math.random() * (max - min + 1)) + min;
		chai.request(url)
			.get('/transfer/0x0329E548530B9B0E1ab61A394cb32c83e3D5b46f/0x20F4120C8E68C06aD611BC1E71EB0cb425d6Ac2c/'+randomAmount)
			.end( function(err,res){
				expect(res).to.have.status(200);
				done();
			});
	});
});

describe('[GET] TX: ', ()=>{

	it('should return a tx', (done) => {
		chai.request(url)
			.get('/transaction/0x3e6830aab46f0cd0d201ab0230fb57072827f3c2dfe732c7916f54cddfcd5747')
			.end( function(err,res){
				expect(res).to.have.status(200);
                expect(res.body.tx).to.have.own.property('hash');
				done();
			});
	});
});

describe('[GET] Block', ()=>{

	it('should return a block', (done) => {
		chai.request(url)
			.get('/block/0xe29bfa1e4b0709d1286a8069bba8d2ec8acf27e952d59ba5e4e773d4c0b444b4')
			.end( function(err,res){
				expect(res).to.have.status(200);
                expect(res.body.block).to.have.own.property('hash');
				done();
			});
	});
});