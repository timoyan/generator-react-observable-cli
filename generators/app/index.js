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
            c_project_name: 'sample-chart',
            c_dotnet_project_name: 'Sample.Chart.Name'
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
        const { c_dotnet_project_name } = this.answers;
        this.fs.copyTpl(
            this.templatePath('root/**'),
            this.destinationRoot(),
            { c_dotnet_project_name: c_dotnet_project_name },
            null,
            {
                globOptions: { dot: true }
            }
        );
    }

    createPackages() {
        mkdirp.sync(this.destinationPath('packages'));
    }

    createProjectPackage() {
        const { c_project_name } = this.answers;
        const packagesPath = this.destinationPath('packages');
        mkdirp.sync(path.join(packagesPath, c_project_name));
    }

    createCoreScriptPackage() {
        const { c_project_name } = this.answers;

        this.fs.copyTpl(
            this.templatePath('core-scripts/**'),
            this.destinationPath('packages/core-scripts'),
            { c_project_name: c_project_name },
            null,
            { globOptions: { dot: true } }
        );
    }

    createFilesAndFoldersOfProject() {
        const { c_project_name } = this.answers;
        const packagesPath = this.destinationPath('packages');
        const projectPackagePath = path.join(packagesPath, c_project_name);
        const projectProjectPackagePath = path.join(projectPackagePath, 'packages');

        mkdirp.sync(projectProjectPackagePath);

        const subPackagesDirName = [
            'apis',
            'client',
            'components',
            'config',
            'constants',
            'containers',
            'epics',
            'reducers',
            'tests',
            'types',
            'utilities',
            'validations'
        ];

        subPackagesDirName.forEach(dirName => {
            this._private_createSubPackageDirAndFiles(dirName, projectProjectPackagePath);
        });

        this.fs.copyTpl(
            this.templatePath('react/client/**'),
            path.join(projectProjectPackagePath, 'client'),
            { c_project_name: c_project_name }
        );

        this.fs.copyTpl(
            this.templatePath('react/config/**'),
            path.join(projectProjectPackagePath, 'config'),
            { c_project_name: c_project_name }
        );

        this.fs.copyTpl(
            this.templatePath('react/reducers/**'),
            path.join(projectProjectPackagePath, 'reducers'),
            { c_project_name: c_project_name }
        );

        this.fs.copyTpl(
            this.templatePath('react/types/**'),
            path.join(projectProjectPackagePath, 'types'),
            { c_project_name: c_project_name }
        );

        this.fs.copyTpl(
            this.templatePath('react/epics/**'),
            path.join(projectProjectPackagePath, 'epics'),
            { c_project_name: c_project_name }
        );

        this.fs.copyTpl(
            this.templatePath('project/**'),
            projectPackagePath,
            { project_name: c_project_name },
            null,
            {
                globOptions: { dot: true }
            }
        );
        this.fs.copyTpl(
            this.templatePath('public/index.html'),
            path.join(projectPackagePath, 'public/index.html'),
            {
                project_name: c_project_name,
                webpack_settings: `
        <% _.forEach(htmlWebpackPlugin.files.js, function(js) { %>
        <script type="text/javascript" src="<%-js%>"></script>
        <% }); _.forEach(htmlWebpackPlugin.files.css, function(css) { %>
        <link rel="stylesheet" type="text/css" href="<%-css%>" /> <% }); %>
                `
            }
        );

        this.fs.copy(
            this.templatePath('public/assets.html'),
            path.join(projectPackagePath, 'public/assets.html')
        );
    }

    _private_createSubPackageDirAndFiles(dirName, parentDirPath) {
        const { c_project_name } = this.answers;
        const dirPath = path.join(parentDirPath, dirName);
        mkdirp.sync(dirPath);

        const pkgJSON = {
            name: `@${c_project_name}/${dirName}`,
            version: '0.1.0',
            description: '',
            author: 'Timo Yan',
            license: 'ISC'
        };

        this.fs.writeJSON(path.join(dirPath, 'package.json'), pkgJSON);

        const excludeList = ['client', 'config', 'epics', 'reducers'];

        if (!excludeList.includes(dirName)) {
            this.fs.copy(
                this.templatePath('sub-package/index.ts'),
                path.join(dirPath, 'index.ts')
            );
        }
    }

    createVSCodeConfigurations() {
        const { c_project_name, c_dotnet_project_name } = this.answers;

        this.fs.copyTpl(
            this.templatePath('vscode/**'),
            this.destinationPath('./.vscode'),
            { project_name: c_project_name, c_dotnet_project_name: c_dotnet_project_name },
            null,
            {
                globOptions: {
                    dot: true
                }
            }
        );
    }

    createDotNetCoreProject() {
        const { c_dotnet_project_name, c_project_name } = this.answers;
        const aspnetTemplatePath = this.templatePath('aspnet');
        const aspnetFolderPath = this.destinationPath(c_dotnet_project_name);

        mkdirp.sync(aspnetFolderPath);

        this.fs.copyTpl(
            aspnetTemplatePath,
            aspnetFolderPath,
            {
                c_aspnet_project_name: c_dotnet_project_name,
                c_project_name: c_project_name
            },
            null,
            {
                globOptions: {
                    dot: true,
                    ignore: ['**/*.csproj']
                }
            }
        );

        this.fs.copy(
            path.join(aspnetTemplatePath, 'template.csproj'),
            path.join(aspnetFolderPath, `${c_dotnet_project_name}.csproj`)
        );
    }

    install() {
        this.yarnInstall(null, { registry: 'https://registry.npm.taobao.org/' }, null);
    }
};
