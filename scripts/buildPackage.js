const path = require('path');
const fs = require('fs');

const BUILD_DST = '../build/dist/';
const appMod = process.argv[2];

if (appMod && ['core', 'node', 'web'].includes(appMod)) {

    const baseCfg = require(path.resolve(__dirname, '../package.json'));
    const coreCfg = require(path.resolve(__dirname, `../lib/${appMod}/package.json`));

    delete baseCfg.devDependencies;
    delete baseCfg.scripts;
    delete coreCfg.scripts;

    const resCfg = JSON.stringify(
        Object.assign({}, baseCfg, coreCfg),
        null, 4
    );

    fs.writeFileSync(path.resolve(__dirname, `${BUILD_DST}${appMod}/package.json`), resCfg);

    // todo, need to sync/push lock file for dependencies described in package.json file.

} else {
    console.log('Incorrect module')
}
