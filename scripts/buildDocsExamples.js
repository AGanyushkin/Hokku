const path = require('path');
const fs = require('fs');
const P = require('@babel/parser');
const G = require('@babel/generator')['default'];

function walkSync(dir, filelist, dirs) {

    const files = fs.readdirSync(dir);

    filelist = filelist || [];
    dirs = dirs || [];

    files.forEach(file => {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            dirs.push(file);
            filelist = walkSync(path.join(dir, file), filelist, dirs);
            dirs.pop();
        } else {
            filelist.push({dir, dirs: [...dirs], file});
        }
    });

    return filelist;
}

function astWalk(_ast, check) {
    const ast = _ast.length ? _ast : [_ast];

    for (let expr of ast) {
        check(expr);

        switch (expr.type) {
            case 'File':
                astWalk(expr.program, check);
                break;
            case 'Program':
                astWalk(expr.body, check);
                break;
            case 'ImportDeclaration':
                astWalk(expr.specifiers, check);
                astWalk(expr.source, check);
                break;
            case 'ImportDefaultSpecifier':
                astWalk(expr.local, check);
                break;
            case 'ExpressionStatement':
                astWalk(expr.expression, check);
                break;
            case 'CallExpression':
                astWalk(expr.callee, check);
                astWalk(expr.arguments, check);
                break;
            case 'ArrowFunctionExpression':
                astWalk(expr.body, check);
                break;
            case 'BlockStatement':
                astWalk(expr.body, check);
                break;
            default: break;
        }
    }
}

function findCallExpression(ast, funcName) {
    return new Promise((res, rej) => {

        let list = [];

        astWalk(ast, expr => {
            if (expr.type === 'CallExpression') {
                if (expr.callee.name === funcName) {
                    list.push(expr);
                }
            }
        });

        if (list.length === 1) {
            res(list[0]);
        } else {
            rej(`Undefined function name: ${funcName}`);
        }

    })
}

function cleanCode(ast) {
    return new Promise((res, rej) => {

        const astConsoleLogTempl = JSON.parse(fs.readFileSync('scripts/astTemplates/consoleLogDone.json'));

        astWalk(ast, ast => {
            if (ast.type === 'BlockStatement') {

                ast.body = ast.body
                    .filter(e => {
                        const docQuery = e.type === 'ExpressionStatement' &&
                            e.expression.type === 'MemberExpression' &&
                            e.expression.object.type === 'MemberExpression' &&
                            e.expression.object.object.type === 'CallExpression' &&
                            (
                                e.expression.object.object.callee.property &&
                                e.expression.object.object.callee.property.name
                            ) === 'querySelectorAll';

                        return !docQuery;
                    })
                    .filter(e => {
                        const docQuery = e.type === 'ExpressionStatement' &&
                            e.expression.type === 'CallExpression' &&
                            e.expression.callee.type === 'MemberExpression' &&
                            e.expression.callee.object.type === 'MemberExpression' &&
                            e.expression.callee.object.object.type === 'MemberExpression' &&
                            (
                                e.expression.callee.object.object.object.callee.property &&
                                e.expression.callee.object.object.object.callee.property.name
                            ) === 'querySelector';

                        return !docQuery;
                    })
                    .map(e => {
                        const doneExpr = e.type === 'ExpressionStatement' &&
                            e.expression.type === 'CallExpression' &&
                            e.expression.callee.type === 'Identifier' &&
                            (
                                e.expression.callee &&
                                e.expression.callee.name
                            ) === 'done';

                        return doneExpr ? astConsoleLogTempl : e;
                    })

            }
        });

        res(ast);
    })
}

function buildOutputAst(origAst, ast) {
    const astFileTempl = JSON.parse(fs.readFileSync('scripts/astTemplates/file.json'));
    const astHokkuImportTempl = JSON.parse(fs.readFileSync('scripts/astTemplates/hokkuImport.json'));

    const imports = [];

    astWalk(origAst, ast => {
        if (ast.type === 'ImportDeclaration') {

            const source = ast.source.value;

            const forbidden = ['chai', 'chai-dom'];

            const skipIt = forbidden.includes(source) ||
                source.indexOf('..') === 0;

            if (!skipIt) {
                imports.push(ast);
            }

        }
    });

    astFileTempl.program.body = [...imports, astHokkuImportTempl, ...ast];

    return astFileTempl;
}

function buildOutputPaths(fList) {
    return Promise.resolve(
        fList
            .map(e => {
                const extPos = e.file.indexOf('.spec.js');

                if (extPos > -1) {
                    e.outputFile = e.file.substr(0, extPos) + '.js';
                } else {
                    e.outputFile = e.file;
                }

                return e;
            })
            .map(e => {

                const dirs = [...e.dirs];
                // const root = dirs.shift();
                //
                // dirs.unshift('docs');
                // dirs.unshift(root);

                e.outputDirs = dirs;
                // e.outputDir = 'build/' + e.outputDirs.join('/');

                return e;
            })
    )
}

function handleJSTest(fListItem, inContent) {
    const origAst = P.parse(inContent, {
        sourceType: 'module',
        plugins: [
            'jsx',
            'flow',
            'decorators-legacy',
            'classProperties'
        ]
    });

    return findCallExpression(origAst, 'it')
        .then(ast => {
            return ast.arguments[1].body.body;
        })
        .then(cleanCode)
        .then(buildOutputAst.bind(null, origAst))
        .then(astOutput => {
            fListItem.outputCode = G(astOutput, {}, {}).code;
            return fListItem;
        })
}

function writeDocsToBuild(fList) {
    return Promise.all(
        fList.map(file => {

            const targetLocation = ['docs', 'examples', ...file.outputDirs];
            let p = path.join('.', 'build');

            for (let d of targetLocation) {
                p = path.join(p, d);

                if (!fs.existsSync(p)) {
                    fs.mkdirSync(p);
                }
            }

            fs.writeFileSync(
                path.join(p, file.outputFile),
                file.outputCode
            );

        })
    )
}

function main() {
    let fList = walkSync('./test/integration/');

    Promise.resolve(fList)
        .then(buildOutputPaths)
        .then(flist => Promise.all(
            flist.map(fListItem => {

                const filePath = path.join(fListItem.dir, fListItem.file);
                const inContent = fs.readFileSync(filePath).toString();

                if (filePath.indexOf('.spec.js') > -1) {
                    return handleJSTest(fListItem, inContent);
                }
                fListItem.outputCode = inContent;
                return Promise.resolve(fListItem)
            })
        ))
        // .then(fList => {
        //     fs.writeFileSync('./output.json', JSON.stringify(fList, null, 4));
        //
        //     return fList;
        // })
        .then(writeDocsToBuild)
        .then(_ => console.log('done'))
        .catch(console.log);
}

main();
