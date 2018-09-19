module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
	"extends": [
		"eslint:recommended"
	],
    "parserOptions": {
		"ecmaVersion":8,
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
            "jsx": true
        },
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
		"react/jsx-uses-react": "error",
		"react/jsx-uses-vars": "error",
        "indent": [
            "error",
            "tab"
        ],
		"no-unused-vars": [
			"warn"
		],
		"no-console": [
			0
		],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "warn",
            "never"
        ]
    }
};
