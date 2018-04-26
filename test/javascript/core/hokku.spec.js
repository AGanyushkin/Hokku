import chai from 'chai';
const expect = chai.expect;

import HokkuModule from '../../../lib/core/javascript/hokku';

describe('HokkuModule', () => {
    it('should export hokku constructor', () => {
        expect(HokkuModule).to.be.a('function');
        expect(HokkuModule.name).to.equal('Hokku');
        expect(HokkuModule.length).to.equal(1);
    })
});
