const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const THEME_CONFIG = require('./config.themes.json');

/**
 * Creates a directory for a given path if not already existing
 * @param {String} dir The path of the directory
 * @returns {Bool} true if the diretory exists false if not. 
 */
const mkdirIfNotExist = dir => {
    const dirExists = fs.existsSync(dir);

    if (!dirExists) {
        fs.mkdirSync(dir);
        return false;
    }

    return true;
};

/**
 * Theses the config object so that the given theme has the
 * required properties
 * 
 * @param {String} theme The theme name 
 */
const testConfigObject = (theme) => {
    const themeConfig = THEME_CONFIG[theme];

    if (!themeConfig.hasOwnProperty('src')) {
        throw `Theme ${theme} is missing src directory`;
    }

    if (!themeConfig.hasOwnProperty('icons')) {
        throw `Theme ${theme} is missing icons property`;
    }

    if (!themeConfig.hasOwnProperty('entry')) {
        throw `Theme ${theme} is missing entry files`;
    }

    if (!Object.keys(themeConfig.entry).length) {
        throw `No entry files specified in theme ${theme}`;
    }

    /// Removing fonts for now until the ticket to read fonts from the manifest file is
    /// complete
    // if (
    //     !themeConfig.hasOwnProperty('fonts') ||
    //     themeConfig.fonts && !Object.keys(THEME_CONFIG[theme].fonts).length
    // ) {
    //     throw new Error(`Theme ${theme} hasn't got any fonts`);
    // }
};

/**
 * Returns an array of theme names using the CLI arguments
 * 
 * @param {Object} argv args object from minist
 * @return {Array} Array of theme names
 */
module.exports = (argv) => {
    const args = argv._;
    let themes;
    console.log(argv);
    if (!args.length) {
        // No arguments set themes to all
        themes = Object.keys(THEME_CONFIG);
    } else {
        /// Get theme names based on arguments and aliases
        themes = args.map(arg => {
            console.log(arg);
            const currentTheme = Object.keys(THEME_CONFIG).find(theme => {
                const alias = THEME_CONFIG[theme].alias.toLowerCase();
                theme = theme.toLowerCase();
                arg = arg.toLowerCase();
                return arg === theme || arg === alias;
            });

            if (!currentTheme) {
                console.warn(chalk.yellow(`Cannot find theme for argument "${arg}"... skipping`));
                return false;
            }

            return currentTheme;
        });

        console.log('themes', themes);
    }

    /// Create build directory if needed
    // const buildDirExists = mkdirIfNotExist(path.join(__dirname, 'build'));
    // !buildDirExists && console.log(chalk.green('Creating build directory'));

    /// Setups stuff for each theme
    // themes.forEach(theme => {
    //     /// Test that each config object has the needed properties
    //     try {
    //         testConfigObject(theme);
    //     } catch(err) {
    //         throw new Error(err);
    //     }

    //     const themBuildDirExists = mkdirIfNotExist(path.join(__dirname, 'build', theme));
    //     !themBuildDirExists && console.log(chalk.green(`Creating directory for ${theme}`));
    // });

    return themes;
};
