#!/usr/bin/env node

const shell = require('shelljs');
const argv = require('yargs').argv;

if (!shell.which('git')) {
    shell.echo('Sorry, this script requires git');
    shell.exit(1);
}
if (!shell.which('npm')) {
    shell.echo('Sorry, this script requires npm');
    shell.exit(1);
}

const versionType = argv._[0];
const versionTypes = ['major', 'minor', 'patch', 'premajor', 'preminor', 'prepatch', 'prerelease'];

function updateVersion(versionType) {
    const gitReadyMsg = shell.exec('git status')
        .stdout
        .indexOf('nothing to commit, working tree clean');

    if (gitReadyMsg > 0) {

        shell.exec('git checkout develop');
        shell.exec('git pull');
        shell.exec('git checkout master');
        shell.exec('git pull');
        shell.exec('git merge develop --no-ff'); // todo, only last version develop branch. is it required to fix it?
        shell.exec(`npm version ${versionType}`);

        if (shell.exec('npm run build').code === 0) {

            for (let component of ['core', 'node', 'web']) {
                shell.cd(`./build/${component}`);
                shell.exec('npm publish');
                shell.cd('../../');
            }

            shell.exec('git push');
            shell.exec('git push --tags');
            shell.exec('git checkout develop');
            shell.exec('git merge master --no-ff');
            shell.exec('git push');

        } else {
            shell.echo('please fix error before deploy packages to npm');
        }

    } else {
        shell.echo('please commit files before');
    }
}

if (versionTypes.includes(versionType)) {
    updateVersion(versionType);
} else {
    shell.echo('incorrect options');
}
