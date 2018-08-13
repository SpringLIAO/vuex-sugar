import Vapi from '../src/index';
var expect = chai.expect;

describe('Index', function() {
    it('should be a function.', function() {
        expect(Vapi).to.be.a('function')
    });
});