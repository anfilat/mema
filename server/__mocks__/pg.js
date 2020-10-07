const pg = jest.createMockFromModule('pg');

const query = jest.fn();

const Pool = {
    query,
    connect: jest.fn(() => ({
        query,
        release: jest.fn(),
    })),
    on: jest.fn(),
};

pg.Pool = jest.fn(() => Pool);

module.exports = pg;
