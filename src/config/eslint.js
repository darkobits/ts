// -----------------------------------------------------------------------------
// ----- ESLint Configuration --------------------------------------------------
// -----------------------------------------------------------------------------

const config = {
  parserOptions: {
    jsx: true,
    useJSXTextNode: true
  },
  plugins: [
    'react',
    'react-hooks',
    'jsx-a11y'
  ],
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    require('@darkobits/ts').eslint
  ],
  settings: {
    // TODO: This can be removed when eslint-plugin-react adds this setting as a
    // default in a future version.
    react: {
      version: 'detect'
    }
  },
  rules: {},
  overrides: []
};


// ----- [Plugin] react --------------------------------------------------------

// Require button elements to have an explicit "type" attribute.
config.rules['react/button-has-type'] = ['error'];

// Require that components be defined as arrow functions.
config.rules['react/function-component-definition'] = ['error', {
  namedComponents: 'arrow-function',
  unnamedComponents: 'arrow-function'
}];

// Prevent usage of array indexes in `key` attributes.
config.rules['react/no-array-index-key'] = ['error'];

// Prevent usage of dangerous JSX properties.
config.rules['react/no-danger'] = ['error'];

// Prevent usage of deprecated methods.
config.rules['react/no-deprecated'] = ['error'];

// Prevent invalid characters from appearing in markup.
//
// DISABLED: While it may prevent certain mistakes, these can usually be caught
// by proof-reading copy. Leaving this rule enabled makes drafting copy in JSX
// unwieldy.
config.rules['react/no-unescaped-entities'] = 'off';

// Prevent usage of unknown DOM properties.
config.rules['react/no-unknown-property'] = ['error'];

// Prefer TypeScript for validating props. Use of PropTypes for runtime
// validation is still optional.
config.rules['react/prop-types'] = 'off';

// Prevent missing React imports when using JSX in a module.
config.rules['react/react-in-jsx-scope'] = ['error'];

// Prevent extra closing tags for components without children.
config.rules['react/self-closing-comp'] = ['error'];

// Require that the value of the `style` prop be an object or a variable that is
// an object.
config.rules['react/style-prop-object'] = ['error'];

// Prevent passing children to void DOM elements (ie: <img />, <br />).
config.rules['react/void-dom-elements-no-children'] = ['error'];

// Enforce explicit boolean attribute notation in JSX.
config.rules['react/jsx-boolean-value'] = ['error'];

// Validate closing bracket location in JSX elements.
config.rules['react/jsx-closing-bracket-location'] = ['error', 'tag-aligned'];

// Disallow unnecessary curly braces in JSX props and children.
config.rules['react/jsx-curly-brace-presence'] = ['error', 'never'];

// Enforce consistent line breaks in curly braces in JSX attributes and
// expressions.
//
// DISABLED: This rule does not have a configuration option that allows for the
// following:
//
// {someValue
//   ? <div>Value is true!</div>
//   : <div>Value is false.</div>
// }
config.rules['react/jsx-newline'] = 'off';

// Disallow spaces inside of curly braces in JSX attributes and expressions.
config.rules['react/jsx-curly-spacing'] = ['error', {
  when: 'never',
  objectLiterals: 'never'
}];

// Disallow spaces around equal signs in JSX attributes.
config.rules['react/jsx-equals-spacing'] = ['error', 'never'];

// Restrict which file extensions may contain JSX.
config.rules['react/jsx-filename-extension'] = ['error', {
  extensions: ['.tsx', '.jsx']
}];

// Require that the first JSX property be on a new line if the JSX tag takes
// up multiple lines and there are multiple properties.
config.rules['react/jsx-first-prop-new-line'] = ['error', 'multiline-multiprop'];

// Enforce shorthand for React fragments (ie: <>...</>).
config.rules['react/jsx-fragments'] = ['error', 'syntax'];

// Require indentation of 2 spaces in JSX, including attributes and logical
// expressions.
config.rules['react/jsx-indent'] = ['error', 2, {
  checkAttributes: true,
  indentLogicalExpressions: true
}];

// Enforce an indentation level of 2 spaces for multi-line JSX props relative to
// their tags.
config.rules['react/jsx-indent-props'] = ['error', 2];

// Report missing `key` props in iterators/collection literals.
config.rules['react/jsx-key'] = ['error', {
  checkFragmentShorthand: true
}];

// Warn on excessive JSX indentation depth.
config.rules['react/jsx-max-depth'] = ['warn', {
  max: 16
}];

// Limit the maximum number of props on a single line in JSX.
config.rules['react/jsx-max-props-per-line'] = ['error', {
  maximum: 4
}];

// Control what kinds of functions can be used in JSX props.
config.rules['react/jsx-no-bind'] = ['error', {
  // Allow anonymous arrow functions.
  allowArrowFunctions: true,
  // Disallow regular functions.
  allowFunctions: false,
  // Disallow .bind().
  allowBind: false,
  // Do not exempt vanilla DOM element from this rule.
  ignoreDOMComponents: false,
  // Do not exempt refs from this rule.
  ignoreRefs: false
}];

// Prevent comments from accidentally being inserted as text nodes.
config.rules['react/jsx-no-comment-textnodes'] = ['error'];

// Disallow duplicate properties in JSX.
config.rules['react/jsx-no-duplicate-props'] = ['error'];

// Disallow the usage of `javascript:` URLs.
config.rules['react/jsx-no-script-url'] = ['error', [{
  // Include the popular Link component from React Router.
  name: 'Link',
  props: ['to']
}]];

// Disallow a `target="_blank"` attribute without an accompanying
// `rel="noopener noreferrer"` attribute.
config.rules['react/jsx-no-target-blank'] = ['error'];

// Disallow undeclared variables in JSX.
config.rules['react/jsx-no-undef'] = ['error', {
  allowGlobals: false
}];

// Disallow unnecessary JSX fragments.
config.rules['react/jsx-no-useless-fragment'] = ['error'];

// Enforce PascalCase for user-defined JSX components.
config.rules['react/jsx-pascal-case'] = ['error'];

// Disallow multiple spaces between inline JSX props.
config.rules['react/jsx-props-no-multi-spaces'] = ['error'];

// Disallow JSX props spreading. This enhances readability of code by being
// more explicit about what props are received by the component.
config.rules['react/jsx-props-no-spreading'] = ['error', {
  // Allow props spreading when the properties being spread are explicitly
  // enumerated.
  explicitSpread: 'ignore'
}];

// Validate whitespace in and around the JSX opening and closing brackets.
config.rules['react/jsx-tag-spacing'] = ['error', {
  // Disallow spaces after `<` opening tags.
  afterOpening: 'never',
  // Disallow spaces before `>` closing tags.
  beforeClosing: 'never',
  // Require a space before `/>` self-closing tags.
  beforeSelfClosing: 'always',
  // Disallow spaces between `</` or `/>` characters.
  closingSlash: 'never'
}];

// Prevent variables used in JSX from being incorrectly marked as unused.
config.rules['react/jsx-uses-vars'] = ['error'];

// Require parens around multi-line JSX expressions in certain contexts.
config.rules['react/jsx-wrap-multilines'] = ['error', {
  declaration: 'parens',
  assignment: 'parens',
  return: 'parens',
  arrow: 'parens',
  condition: 'ignore',
  logical: 'ignore',
  prop: 'ignore'
}];


// ----- [Plugin] react-hooks --------------------------------------------------

// Warn when hooks do not declare dependencies they use.
//
// TEMPORARILY DISABLED: This rule has a very aggressive regular expression to
// test whether a function is a React hook[1] that winds up matching
// useAsyncEffect. The rule then throws a false positive because the function
// passed to useAsyncEffect is async. Consider re-enabling it if a future
// version is more configurable.
//
// config.rules['react-hooks/exhaustive-deps'] = ['warn', {
//   // Prevents false-positives when using `use-async-effect`.
//   additionalHooks: 'useAsyncEffect'
// }];
config.rules['react-hooks/exhaustive-deps'] = 'off';


// ----- [Plugin] jsx-a11y -----------------------------------------------------

// This rule was deprecated in version 6.1.0, but still appears to be in the
// plugin's 'recommended' rule set.
config.rules['jsx-a11y/label-has-for'] = 'off';


// ----- [Plugin] @typescript/eslint -------------------------------------------

// Configure the indent rule to ignore JSX nodes. The react/jsx-indent rule
// will enforce indentation for JSX.
config.rules['@typescript-eslint/indent'] = ['error', 2, {
  ignoredNodes: ['JSXElement'],
  // Require an extra 2 spaces of indentation between switch statements and case
  // statements.
  SwitchCase: 1
}];


// ----- [Plugin] unicorn ------------------------------------------------------

// Disable this rule in React projects because React makes heavy use of the
// `null` value.
config.rules['unicorn/no-null'] = 'off';


// ----- Overrides -------------------------------------------------------------

// Automatically set the environment to 'browser' in .jsx and .tsx files.
config.overrides.push({
  files: [
    '*.jsx',
    '*.tsx'
  ],
  env: {
    browser: true
  }
});


export default config;
