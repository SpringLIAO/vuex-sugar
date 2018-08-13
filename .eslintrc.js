module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "extends": ["airbnb-base", "plugin:prettier/recommended"],
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaVersion": 2016,
        "sourceType": "module"
    },
    overrides: {
        files: '.prettierrc.js'
    }
};