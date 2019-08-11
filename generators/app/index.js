const Generator = require('yeoman-generator');
const mkdirp = require('mkdirp');
const path = require('path');

module.exports = class extends Generator {
    // The name `constructor` is important here
    constructor(args, opts) {
        // Calling the super constructor is important so our generator is correctly set up
        super(args, opts);

        // TODO: Will remove when promption enable
        this.answers = {
            c_project_name: 'cs-portal'
        };
    }

    // async prompting() {
    //     this.answers = await this.prompt([
    //         {
    //             type: 'input',
    //             name: 'c_projectName',
    //             message: 'Your project name',
    //             default: this.appname // Default to current folder name
    //         }
    //     ]);
    // }

    generateJSON() {
        const { c_project_name } = this.answers;
        const c_script_name = {
            install: 'install',
            bootstrap: 'bootstrap',
            dev: `${c_project_name}-dev`,
            'build-dev': `${c_project_name}-build-dev`,
            'build-preprod': `${c_project_name}-build-preprod`,
            'build-prod': `${c_project_name}-build-prod`,
            lint: `${c_project_name}-lint`,
            'type-check': `${c_project_name}-type-check`,
            test: `${c_project_name}-test`
        };
        const changeToProjectDir = `cd packages/${c_project_name}`;

        const pkgJson = {
            name: `@${c_project_name}/root`,
            private: true,
            version: 'independent',
            description: '',
            main: 'index.js',
            workspaces: ['packages/*', 'packages/*/packages/*'],
            scripts: {
                [c_script_name.install]: 'npx lerna link',
                [c_script_name.bootstrap]: 'npx lerna clean --yes && npx lerna bootstrap',
                [c_script_name.dev]: `${changeToProjectDir} && yarn dev`,
                [c_script_name[
                    'build-preprod'
                ]]: `${changeToProjectDir} && yarn build-preprod`,
                [c_script_name['build-prod']]: `${changeToProjectDir} && yarn build-prod`,
                [c_script_name.lint]: `${changeToProjectDir} && yarn lint`,
                [c_script_name['type-check']]: `${changeToProjectDir} && yarn type-check`,
                [c_script_name.test]: `${changeToProjectDir} && yarn test`
            },
            author: 'Timo Yan',
            license: 'ISC',
            devDependencies: {
                lerna: '3.13.1',
                'cross-env': '5.2.0',
                husky: '1.3.1',
                'lint-staged': '8.1.5',
                prettier: '1.16.4'
            },
            husky: {
                hooks: {
                    'pre-commit': `yarn ${
                        c_script_name['type-check']
                    } && npx lint-staged'`,
                    'pre-push': `yarn ${c_script_name.test}`
                }
            },
            'lint-staged': {
                linters: {
                    '*.{ts,tsx}': ['yarn pe-lint', 'prettier --write', 'git add'],
                    '*.json': ['prettier --write', 'git add']
                },
                ignore: ['**/dist/*.min.js', 'node_modules']
            }
        };

        // Extend or create package.json file in destination path
        this.fs.writeJSON(this.destinationPath('package.json'), pkgJson);
    }

    copyRootFiles() {
        this.fs.copy(this.templatePath('root/**'), this.destinationRoot(), {
            globOptions: { dot: true }
        });
    }

    install() {
        this.yarnInstall(null, { registry: 'https://registry.npm.taobao.org/' }, null);
    }

    createPackages() {
        mkdirp.sync(this.destinationPath('packages'));
    }

    createProjectPackage() {
        const { c_project_name } = this.answers;
        const packagesPath = this.destinationPath('packages');
        mkdirp.sync(path.join(packagesPath, c_project_name));
    }

    createFilesAndFoldersOfProject() {
        const { c_project_name } = this.answers;
        const packagesPath = this.destinationPath('packages');
        const projectPackagePath = path.join(packagesPath, c_project_name);

        mkdirp.sync(path.join(projectPackagePath, 'packages'));
        this.fs.copy(this.templatePath('project/**'), projectPackagePath, {
            globOptions: { dot: true }
        });
    }
};
