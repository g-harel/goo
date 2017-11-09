'use strict';

const s = require('../../src/modules/state');
const sh = require('../../src/modules/state.handler');
const shh = require('../../src/modules/state.handler.history');

describe('state.handler.history', () => {
    describe('use', () => {
        describe('action', () => {
            it('should add an UNDO action', () => {
                const test = jest.fn();
                o(({use}) => {
                    use.on('action', ({type}) => {
                        if (type === 'UNDO') {
                            test();
                        }
                    });
                }, shh);
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should add an REDO action', () => {
                const test = jest.fn();
                o(({use}) => {
                    use.on('action', ({type}) => {
                        if (type === 'REDO') {
                            test();
                        }
                    });
                }, shh);
                expect(test)
                    .toHaveBeenCalled();
            });

            it('should add an RESET action', () => {
                const test = jest.fn();
                o(({use}) => {
                    use.on('action', ({type}) => {
                        if (type === '__RESET__') {
                            test();
                        }
                    });
                }, shh);
                expect(test)
                    .toHaveBeenCalled();
            });
        });

        describe('watcher', () => {
            it('should add a watcher', () => {
                const test = jest.fn();
                o(({use}) => {
                    use.on('watcher', test);
                }, shh);
                expect(test)
                    .toHaveBeenCalled();
            });
        });

        describe('api', () => {
            describe('undo', () => {
                it('should add a undo to the api', () => {
                    const test = jest.fn();
                    o(({use}) => {
                        use.on('api', (api) => {
                            expect(api.undo)
                                .toBeInstanceOf(Function);
                            test();
                        });
                    }, shh);
                    expect(test)
                        .toHaveBeenCalled();
                });

                it('should emit a undo action when called', () => {
                    const test = jest.fn();
                    const app = o(shh);
                    app.emit.on('act', ({type}) => {
                        if (type === 'UNDO') {
                            test();
                        }
                    });
                    app.undo();
                    expect(test)
                        .toHaveBeenCalled();
                });
            });

            describe('redo', () => {
                it('should add a redo to the api', () => {
                    const test = jest.fn();
                    o(({use}) => {
                        use.on('api', (api) => {
                            expect(api.redo)
                                .toBeInstanceOf(Function);
                            test();
                        });
                    }, shh);
                    expect(test)
                        .toHaveBeenCalled();
                });

                it('should emit a redo action when called', () => {
                    const test = jest.fn();
                    const app = o(shh);
                    app.emit.on('act', ({type}) => {
                        if (type === 'REDO') {
                            test();
                        }
                    });
                    app.redo();
                    expect(test)
                        .toHaveBeenCalled();
                });
            });
        });
    });

    it('should not undo if there is nothing to undo', () => {
        const app = o(s, sh, shh);
        app.setState('test');
        app.undo();
        expect(app.getState())
            .toBe('test');
    });

    it('should not redo if there is nothing to redo', () => {
        const app = o(s, sh, shh);
        app.setState('test');
        app.redo();
        expect(app.getState())
            .toBe('test');
    });

    it('should undo state changes', () => {
        const app = o(s, sh, shh);
        app.setState('test');
        app.setState('different state');
        app.undo();
        expect(app.getState())
            .toBe('test');
    });

    it('should redo state changes', () => {
        const app = o(s, sh, shh);
        app.setState('test');
        app.setState('different state');
        app.undo();
        expect(app.getState())
            .toBe('test');
        app.redo();
        expect(app.getState())
            .toBe('different state');
    });

    it('should properly handle states', () => {
        const app = o(s, sh, shh);
        app.setState('test');
        app.setState(null);
        app.setState('test');
        app.undo();
        expect(app.getState())
            .toBe(null);
        app.undo();
        app.redo();
        expect(app.getState())
            .toBe(null);
        app.redo();
        app.undo();
        app.redo();
        app.redo();
        expect(app.getState())
            .toBe('test');
    });

    it('should store at least 20 past states', () => {
        const app = o(s, sh, shh);
        app.setState(null);
        let n = 20;
        for (let i = 0; i <= n; ++i) {
            app.setState(i);
        }
        for (let i = 0; i <= n; ++i) {
            app.undo();
        }
        app.undo();
        let last = app.getState();
        expect(last)
            .toBe(null);
        app.undo();
        expect(last)
            .toBe(app.getState());
    });

    it('should not store the state when the action type has the ignore prefix', () => {
        const app = o(s, sh, shh);
        app.setState('test');
        app.use({action: {
            type: '*IGNORE',
            target: [],
            handler: (params) => params,
        }});
        app.act('*IGNORE', 0);
        app.setState(1);
        app.undo();
        expect(app.getState())
            .toBe('test');
    });

    it('should be able to reset the undo/redo stacks', () => {
        const app = o(s, sh, shh);
        app.setState('test');
        app.setState(0);
        app.act('__RESET__');
        app.undo();
        expect(app.getState())
            .toBe(0);
        app.setState(1);
        app.undo();
        app.act('__RESET__');
        app.redo();
        expect(app.getState())
            .toBe(0);
    });
});