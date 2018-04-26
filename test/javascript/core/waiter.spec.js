import chai from 'chai';
const expect = chai.expect;

import Waiter from '../../../lib/core/javascript/waiter';

describe('waiter', () => {
    it('check unresolved waiter', () => {
        const waiter = new Waiter();

        expect(
            [waiter.ready, waiter.error, waiter.done]
        ).to.deep.equal(
            [false, false, false]
        );
    });

    it('check resolved waiter', () => {
        const waiter = new Waiter();

        waiter.resolve();
        expect(
            [waiter.ready, waiter.error, waiter.done]
        ).to.deep.equal(
            [true, false, true]
        );
    });

    it('check rejected waiter', () => {
        const waiter = new Waiter();

        waiter.catch(e => null);

        waiter.reject();
        expect(
            [waiter.ready, waiter.error, waiter.done]
        ).to.deep.equal(
            [false, true, true]
        );
    });

    it('check success promise resolving', function () {
        const waiter = new Waiter();

        this.timeout(1000);
        setTimeout(waiter.resolve, 30);
        return waiter;
    });

    it('check promise rejection', function () {
        const waiter = new Waiter();

        this.timeout(1000);
        setTimeout(waiter.reject, 30);

        return waiter
            .then(() => true)
            .catch(() => false)
            .then(success => {
                if (success) {throw new Error('incorrect rejection')}
            })
    });

    it('check internal promise rejection placeholder', () => {
        const waiter = new Waiter();

        waiter.reject('test');
    });

    it('check resolved value', () => {
        const waiter = new Waiter();

        waiter.resolve({filed1: 123777});

        return waiter
            .then(val => {
                expect(
                    val
                ).to.deep.equal(
                    {filed1: 123777}
                );
            })
    });

    it('check internal promise rejection placeholder', function () {
        const waiter = new Waiter();

        this.timeout(1000);
        setTimeout(() => waiter.reject('test'), 30);

        return waiter
            .catch(err => {
                expect(
                    err
                ).to.be.equal(
                    'test'
                )
            })
    })
});
