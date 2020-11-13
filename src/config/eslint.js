// -----------------------------------------------------------------------------
// ----- ESLint Rules (TypeScript) ---------------------------------------------
// -----------------------------------------------------------------------------

import {findTsConfig} from 'lib/utils';


const config = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: findTsConfig(),
    sourceType: 'module',
    // Temporary workaround for this issue:
    // https://github.com/typescript-eslint/typescript-eslint/issues/967
    createDefaultProject: true
  },
  env: {
    node: true
  },
  plugins: [
    '@typescript-eslint',
    'eslint-plugin-prefer-arrow'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:unicorn/recommended'
  ],
  settings: {
    format: 'codeframe'
  },
  rules: {},
  overrides: []
};


// ----- [Base] Possible Errors ------------------------------------------------

// This rule is superseded by @typescript-eslint/no-misused-promises.
config.rules['no-async-promise-executor'] = 'off';

// Warn on usage of `console` methods.
config.rules['no-console'] = ['warn'];

// Disallow assignments that can lead to race conditions due to usage of `await`
// or `yield`.
config.rules['require-atomic-updates'] = ['error'];


// ----- [Base] Best Practices -------------------------------------------------

// Enforce return statements in callbacks of array methods.
config.rules['array-callback-return'] = ['error', {
  // Allow implicitly returning `undefined` with a return statement
  // containing no expression.
  allowImplicit: true
}];

// Require that the dot in a member expression be on the same line as the
// property portion.
config.rules['dot-location'] = ['error', 'property'];

// Require the use of === and !==.
config.rules['eqeqeq'] = ['error', 'always', {
  null: 'ignore'
}];

// Disallow the use of `alert`, `confirm`, and `prompt` in browser contexts.
config.rules['no-alert'] = ['error'];

// Disallow the use of `arguments.caller` and `arguments.callee`.
config.rules['no-caller'] = ['error'];

// Disallow returning a value in constructors.
config.rules['no-constructor-return'] = ['error'];

// Disallow `else` and `else if` blocks if the above `if` block contains a
// return statement.
config.rules['no-else-return'] = ['error', {
  allowElseIf: false
}];

// Disallow destructuring statements that do not create variables.
config.rules['no-empty-pattern'] = ['error'];

// Ensure that comparisons to `null` only match `null`, and not also
// `undefined`.
config.rules['no-eq-null'] = ['error'];

// Disallow the use of eval().
config.rules['no-eval'] = ['error'];

// Disallow unnecessary function binding.
config.rules['no-extra-bind'] = ['error'];

// Disallow leading or trailing decimal points in numeric literals.
config.rules['no-floating-decimal'] = ['error'];

// Disallow shorthand type conversions.
config.rules['no-implicit-coercion'] = ['error'];

// Disallow declarations in the global scope.
config.rules['no-implicit-globals'] = ['error'];

// Disallow the use of the __iterator__ property.
config.rules['no-iterator'] = ['error'];

// Disallow unnecessary nested blocks.
config.rules['no-lone-blocks'] = ['error'];

// Disallow function declarations that contain unsafe references inside loop
// statements.
config.rules['no-loop-func'] = ['error'];


// ----- [Base] Stylistic ------------------------------------------------------

// Require line breaks after opening and before closing array brackets if
// there are line breaks inside elements or between elements.
config.rules['array-bracket-newline'] = ['error', 'consistent'];

// Disallow spaces inside array brackets.
config.rules['array-bracket-spacing'] = ['error', 'never'];

// Disallows spaces inside an open block token and the next token on the
// same line.
config.rules['block-spacing'] = ['error', 'never'];

// Require that comments begin with a capitalized letter. This rule always
// ignores words like 'eslint' used in override directives.
//
// Note: This rule is off because it creates noise when code blocks are
// commented-out.
config.rules['capitalized-comments'] = 'off';

// Disallow trailing commas in object and array literals.
config.rules['comma-dangle'] = ['error', 'never'];

// Enforce standard comma style, in which commas are placed at the end of
// the current line, in array literals, object literals, and variable
// declarations.
config.rules['comma-style'] = ['error', 'last'];

// Disallow spaces inside of computed properties in object literals.
config.rules['computed-property-spacing'] = ['error', 'never', {
  enforceForClassMembers: true
}];

// Require a newline at the end of files.
config.rules['eol-last'] = ['error', 'always'];

// Require double quotes in JSX.
config.rules['jsx-quotes'] = ['error', 'prefer-double'];

// Warn about long lines.
config.rules['max-len'] = ['warn', {
  tabWidth: 2,
  // Prefer lines of code remain under 128 characters.
  code: 192,
  // Prefer comments be wrapped at 80 characters.
  comments: 80,
  // Ignore trailing comments, as these can often be ESLint directives.
  ignoreTrailingComments: true,
  // Ignore lines that contain URLs
  ignoreUrls: true,
  // Ignore lines that contain string literals.
  ignoreStrings: true
}];

// Allow up to 2 empty lines.
config.rules['no-multiple-empty-lines'] = ['error', {
  max: 2
}];

// Require a space after '//' in comments.
config.rules['spaced-comment'] = ['error', 'always'];

// Enforce consistent spacing around around colons in `case` and `default`
// clauses in `switch` statements.
config.rules['switch-colon-spacing'] = ['error', {
  after: true,
  before: false
}];

// Disallow spaces between a tag function and its template literal.
config.rules['template-tag-spacing'] = ['error', 'never'];


// ----- [Base] ECMAScript 6 ---------------------------------------------------

// Do not enforce a particular arrow body style.
config.rules['arrow-body-style'] = 'off';

// Require parens around arrow function arguments only when required.
config.rules['arrow-parens'] = ['error', 'as-needed', {
  // Require parens if the function body is surrounded by braces.
  // requireForBlockBody: true
}];

// Require a space before and after an arrow function's arrow.
config.rules['arrow-spacing'] = ['error', {
  before: true,
  after: true
}];

// Disallow arrow functions where they could be confused with comparisons.
config.rules['no-confusing-arrow'] = ['error', {
  // Relaxes the rule and allows parens as a valid confusion-preventing
  // syntax.
  allowParens: true
}];

// Disallow duplicate imports.
config.rules['no-duplicate-imports'] = ['error'];

// Disallow unnecessary computed property keys in objects and classes.
config.rules['no-useless-computed-key'] = ['error', {
  enforceForClassMembers: true
}];

// Disallow renaming import, export, and destructured assignments to the
// same name
config.rules['no-useless-rename'] = ['error'];

// Require `let` or `const` instead of `var`.
config.rules['no-var'] = ['error'];

// Require using arrow functions for callbacks.
config.rules['prefer-arrow-callback'] = ['error'];

// Require the use of `const` for variables that are never reassigned.
config.rules['prefer-const'] = ['error'];

// Require using template literals instead of string concatenation.
config.rules['prefer-template'] = ['error'];

// Disallow spaces between rest/spread operators and their expressions.
config.rules['rest-spread-spacing'] = ['error'];

// Disallow extraneous spaces inside of template string curly brace pairs.
config.rules['template-curly-spacing'] = ['error', 'never'];


// ----- [Plugin] @typescript/eslint -------------------------------------------

// N.B. For several of these rules, the base ESLint rule _must_ be disabled
// for the TypeScript version to work correctly.

// Require that member overloads be consecutive.
config.rules['@typescript-eslint/adjacent-overload-signatures'] = ['error'];

// Require the generic style for typing arrays.
config.rules['@typescript-eslint/array-type'] = ['error', {
  default: 'generic',
  readonly: 'generic'
}];

// Do not allow await-ing of non-Promise values.
config.rules['@typescript-eslint/await-thenable'] = ['error'];

// Allow the use of @ts- directives. Their use can mask errors, but is still
// necessary in many cases.
config.rules['@typescript-eslint/ban-ts-comment'] = 'off';

// Allow the use of the @ts-ignore directive.
config.rules['@typescript-eslint/ban-ts-ignore'] = 'off';

// Disallow typing values using their runtime constructors, and prefer their
// primitive counterparts instead.
config.rules['@typescript-eslint/ban-types'] = ['error', {
  types: {
    /* eslint-disable @typescript-eslint/naming-convention */
    String: 'Use `string` instead.',
    Number: 'Use `number` instead.',
    Boolean: 'Use `boolean` instead.',
    Symbol: 'Use `symbol` instead.',
    Object: 'Use `object` instead.'
    /* eslint-enable @typescript-eslint/naming-convention */
  }
}];

// Enforce the usage of 'one-true-brace-style' for braces.
config.rules['brace-style'] = 'off';
config.rules['@typescript-eslint/brace-style'] = ['error', '1tbs'];

// Naming conventions are enforced using the naming-convention rule (see below).
config.rules['camelcase'] = 'off';
config.rules['@typescript-eslint/camelcase'] = 'off';

// No strong preference on this rule.
config.rules['@typescript-eslint/class-literal-property-style'] = 'off';

// Disallow spaces before commas, require spaces after commas.
config.rules['comma-spacing'] = 'off';
config.rules['@typescript-eslint/comma-spacing'] = ['error', {
  before: false,
  after: true
}];

// Require the 'as' syntax for type assertions and allow casting object
// literals using this syntax.
config.rules['@typescript-eslint/consistent-type-assertions'] = ['error', {
  assertionStyle: 'as',
  objectLiteralTypeAssertions: 'allow'
}];

// Require that optional parameters and parameters with default values are
// last in a function signature.
config.rules['default-param-last'] = 'off';
config.rules['@typescript-eslint/default-param-last'] = ['error'];

// No strong preference on this rule.
config.rules['@typescript-eslint/dot-notation'] = 'off';

// Do not require explicit function return types; TypeScript has excellent
// type inference and this is often not needed.
config.rules['@typescript-eslint/explicit-function-return-type'] = 'off';

// No strong preference on this rule.
config.rules['@typescript-eslint/explicit-member-accessibility'] = 'off';

// This rule requires explicit typing of anything exported from an ES module.
// TypeScript's type inference is good enough that this shouldn't be
// necessary.
config.rules['@typescript-eslint/explicit-module-boundary-types'] = 'off';

// Disallow spaces between the function name and the opening parenthesis that
// calls it.
config.rules['func-call-spacing'] = 'off';
config.rules['@typescript-eslint/func-call-spacing'] = ['error', 'never'];

// Require 2-space indentation.
config.rules['indent'] = 'off';
config.rules['@typescript-eslint/indent'] = ['error', 2, {
  // Require an extra 2 spaces of indentation between switch statements and case
  // statements.
  SwitchCase: 1
}];

// No strong preference on this rule.
config.rules['@typescript-eslint/init-declarations'] = 'off';

// Require a space before and after keywords like `for`, `if`, etc.
config.rules['keyword-spacing'] = 'off';
config.rules['@typescript-eslint/keyword-spacing'] = ['error', {
  before: true,
  after: true
}];

// Require semi-colons after members in interface declarations.
config.rules['@typescript-eslint/member-delimiter-style'] = ['error', {
  multiline: {
    delimiter: 'semi',
    requireLast: true
  },
  singleline: {
    delimiter: 'semi',
    requireLast: false
  }
}];

// Enforce member ordering on interfaces and classes.
config.rules['@typescript-eslint/member-ordering'] = ['error', {
  default: [
    // Field order.
    'private-static-field',
    'public-static-field',
    'private-instance-field',
    'public-instance-field',

    // Method order.
    'constructor',
    'private-instance-method',
    'public-instance-method',
    'static-method'
  ]
}];

// Do not enforce a particular method signature style ("property" style or
// "method" style). While "property" style may allow the compiler to make
// stronger guarantees about correctness, "method" style is required to express
// overloads in interfaces; "property" style here would result in a duplicate
// key error.
config.rules['@typescript-eslint/method-signature-style'] = 'off';

// Enforce naming conventions for various kinds of symbols.
config.rules['@typescript-eslint/naming-convention'] = ['warn', {
  // By default, require a value be named using camelCase.
  selector: 'default',
  format: ['camelCase']
}, {
  // Require variables to be named using camelCase, UPPER_CASE, or PascalCase.
  selector: 'variable',
  format: ['camelCase', 'UPPER_CASE', 'PascalCase']
}, {
  // Require function expressions to be named using camelCase or PascalCase.
  selector: 'variable',
  types: ['function'],
  format: ['camelCase', 'PascalCase']
}, {
  // Require function declarations to be named using camelCase or PascalCase.
  selector: 'function',
  format: ['camelCase', 'PascalCase']
}, {
  // Require classes, interfaces, type aliases, and type parameters to be named
  // using PascalCase.
  selector: ['class', 'interface', 'typeAlias', 'typeParameter'],
  format: ['PascalCase']
}, {
  // Do not enforce any naming conventions for object properties because we
  // often need to use objects whose shape is defined by a third-party API or
  // schema that we have no control over.
  selector: 'property',
  // eslint-disable-next-line unicorn/no-null
  format: null
}];

// Disallow the use of `new Array()`.
config.rules['no-array-constructor'] = 'off';
config.rules['@typescript-eslint/no-array-constructor'] = ['error'];

// Disallow calling .toString() on values that don't produce useful
// serialization.
config.rules['@typescript-eslint/no-base-to-string'] = ['error'];

// Disallow duplicate names for class members.
config.rules['no-dupe-class-members'] = 'off';
config.rules['@typescript-eslint/no-dupe-class-members'] = ['error'];

// No strong preference on this rule.
config.rules['@typescript-eslint/no-dynamic-delete'] = 'off';

// Disallow empty functions.
config.rules['no-empty-function'] = 'off';
config.rules['@typescript-eslint/no-empty-function'] = ['error'];

// Disallow the declaration of empty interfaces.
config.rules['@typescript-eslint/no-empty-interface'] = ['error'];

// Allow explicit `any` types. While not recommended, this is sometimes
// necessary.
config.rules['@typescript-eslint/no-explicit-any'] = 'off';

// Disallow extra non-null assertions.
config.rules['@typescript-eslint/no-extra-non-null-assertion'] = ['error'];

// Disallow unnecessary parentheses, except around JSX expressions.
config.rules['no-extra-parens'] = 'off';
config.rules['@typescript-eslint/no-extra-parens'] = ['error', 'all', {
  ignoreJSX: 'all',
  enforceForArrowConditionals: false
}];

// Disallow unnecessary semicolons.
config.rules['no-extra-semi'] = 'off';
config.rules['@typescript-eslint/no-extra-semi'] = ['error'];

// Disallow the use of classes as namespaces.
config.rules['@typescript-eslint/no-extraneous-class'] = ['error'];

// Require Promise-like values to be handled appropriately.
config.rules['@typescript-eslint/no-floating-promises'] = ['error', {
  // Exempt statements that use the `void` operator. This can be a good way
  // to explicitly mark a promise as intentionally not awaited.
  ignoreVoid: true
}];

// Disallow iterating over an array with a for-in loop, prefer for-of loops.
config.rules['@typescript-eslint/no-for-in-array'] = ['error'];

// Disallow the use of eval()-like methods.
config.rules['@typescript-eslint/no-implied-eval'] = ['error'];

// Ban the use of explicit type definitions when TypeScript can infer them.
config.rules['@typescript-eslint/no-inferrable-types'] = ['error'];

// Disallow the usage of the `void` type outside of generic or return types.
//
// DISABLED: This rule is disabled because it incorrectly detects an error
// when `void` is used in union return types (ex: Promise<void> | void).
config.rules['@typescript-eslint/no-invalid-void-type'] = 'off';

// No strong preference on this rule.
config.rules['no-magic-numbers'] = 'off';
config.rules['@typescript-eslint/no-magic-numbers'] = 'off';

// Enforce valid definition of `new` and `constructor`.
config.rules['@typescript-eslint/no-misused-new'] = ['error'];

// Avoid using promises in places not designed to handle them.
config.rules['@typescript-eslint/no-misused-promises'] = ['error'];

// Disallow the use of custom TypeScript modules and namespaces.
config.rules['@typescript-eslint/no-namespace'] = ['error', {
  // Exempt .d.ts files; it is often necessary in React projects to declare
  // custom "modules" for non-code file types (ie: images) to avoid TypeScript
  // errors when they are imported.
  allowDefinitionFiles: true
}];

// Disallow using a non-null assertion after an optional chain expression.
config.rules['@typescript-eslint/no-non-null-asserted-optional-chain'] = ['error'];

// Disallows non-null assertions using the `!` postfix operator.
config.rules['@typescript-eslint/no-non-null-assertion'] = ['error'];

// Disallow aliasing `this`.
config.rules['@typescript-eslint/no-this-alias'] = ['error'];

// Disallow throwing literals as exceptions.
config.rules['@typescript-eslint/no-throw-literal'] = ['error'];

// Allow the use of type aliases.
config.rules['@typescript-eslint/no-type-alias'] = 'off';

// Disallow unnecessary equality comparisons against boolean literals.
config.rules['@typescript-eslint/no-unnecessary-boolean-literal-compare'] = ['error'];

// Prevents conditionals where the type is always truthy or always falsy.
//
// DISABLED: This rule seems to prevent and-gating.
config.rules['@typescript-eslint/no-unnecessary-condition'] = 'off';

// Disallow unnecessary namespace qualifiers.
config.rules['@typescript-eslint/no-unnecessary-qualifier'] = ['error'];

// Prevent callees from providing the default value for a type parameter.
config.rules['@typescript-eslint/no-unnecessary-type-arguments'] = ['error'];

// Disallow type assertions that do not change the type of an expression.
config.rules['@typescript-eslint/no-unnecessary-type-assertion'] = ['error'];

// Warn when assigning `any` to variables and properties.
//
// TEMPORARILY DISABLED: Regrettably, there are too many un-typed modules/APIs
// in the JavaScript ecosystem, and the need for `any` is still quite common.
config.rules['@typescript-eslint/no-unsafe-assignment'] = 'off';

// Warn when calling functions of type `any`.
//
// TEMPORARILY DISABLED: Regrettably, there are too many un-typed modules/APIs
// in the JavaScript ecosystem, and the need for `any` is still quite common.
config.rules['@typescript-eslint/no-unsafe-call'] = 'off';

// Warn on member access of values that are of type `any`.
//
// TEMPORARILY DISABLED: Regrettably, there are too many un-typed modules/APIs
// in the JavaScript ecosystem, and the need for `any` is still quite common.
config.rules['@typescript-eslint/no-unsafe-member-access'] = 'off';

// Warn when returning a value of type `any` from a function.
//
// TEMPORARILY DISABLED: Regrettably, there are too many un-typed modules/APIs
// in the JavaScript ecosystem, and the need for `any` is still quite common.
config.rules['@typescript-eslint/no-unsafe-return'] = 'off';

// Disallow unused expressions.
config.rules['no-unused-expressions'] = 'off';
config.rules['@typescript-eslint/no-unused-expressions'] = ['error'];

// Disallow unused variables.
config.rules['no-unused-vars'] = 'off';
config.rules['@typescript-eslint/no-unused-vars'] = ['error'];

// Disallow the use of variables before they are defined.
config.rules['no-use-before-define'] = 'off';
config.rules['@typescript-eslint/no-use-before-define'] = ['error'];

// Disallow unnecessary constructors.
config.rules['no-useless-constructor'] = 'off';
config.rules['@typescript-eslint/no-useless-constructor'] = ['error'];

// Disallows the use of require statements except in import statements.
config.rules['@typescript-eslint/no-var-requires'] = ['error'];

// Prefer usage of as const over literal type.
config.rules['@typescript-eslint/prefer-as-const'] = ['error'];

// Prefer a ‘for-of’ loop over a standard ‘for’ loop if the index is only used
// to access the array being iterated.
config.rules['@typescript-eslint/prefer-for-of'] = ['error'];

// Use function types instead of interfaces with call signatures.
config.rules['@typescript-eslint/prefer-function-type'] = ['error'];

// Enforce includes() method over indexOf() method.
config.rules['@typescript-eslint/prefer-includes'] = ['error'];

// No strong preference on this rule.
config.rules['@typescript-eslint/prefer-namespace-keyword'] = 'off';

// Enforce the usage of the nullish coalescing operator instead of logical
// chaining.
config.rules['@typescript-eslint/prefer-nullish-coalescing'] = ['error'];

// Prefer using concise optional chain expressions instead of chained logical
// ands.
config.rules['@typescript-eslint/prefer-optional-chain'] = ['error'];

// Do not require marking function parameters as `readonly`.
config.rules['@typescript-eslint/prefer-readonly-parameter-types'] = 'off';

// Require that private members are marked as readonly if they're never modified
// outside of the constructor
config.rules['@typescript-eslint/prefer-readonly'] = ['error'];

// Prefer using type parameter when calling Array#reduce instead of casting.
config.rules['@typescript-eslint/prefer-reduce-type-parameter'] = ['error'];

// Enforce that RegExp#exec is used instead of String#match if no global flag
// is provided.
config.rules['@typescript-eslint/prefer-regexp-exec'] = ['error'];

// Enforce the use of String#startsWith and String#endsWith instead of other
// equivalent methods of checking substrings.
config.rules['@typescript-eslint/prefer-string-starts-ends-with'] = ['error'];

// Recommend using @ts-expect-error over @ts-ignore. This is currently off
// because @ts-expect-error does not suppress errors for modules without
// declaration files, forcing the user to revert to @ts-ignore, which then in
// turn violates this rule.
config.rules['@typescript-eslint/prefer-ts-expect-error'] = 'off';

// Requires any function or method that returns a Promise to be marked `async`.
config.rules['@typescript-eslint/promise-function-async'] = ['error', {
  // Additional types that should be considered as Promises.
  allowedPromiseNames: ['PromiseLike', 'Thenable']
}];

// Enforce the consistent use of either backticks, double, or single quotes.
config.rules['quotes'] = 'off';
config.rules['@typescript-eslint/quotes'] = ['error', 'single'];

// Require Array#sort calls to always provide a comparator function.
config.rules['@typescript-eslint/require-array-sort-compare'] = ['error'];

// Disallow async functions which have no `await` expression.
config.rules['require-await'] = 'off';
config.rules['@typescript-eslint/require-await'] = ['warn'];

// When adding two variables, operands must both be of type `number` or of type
// `string`.
config.rules['@typescript-eslint/restrict-plus-operands'] = ['error'];

// Allow non-string objects to be used in string interpolations. This may have
// unintended results at times, but also allows developers to implement their
// own toString methods on objects that will stringify them in a sane way.
config.rules['@typescript-eslint/restrict-template-expressions'] = 'off';

// Enforces await-ing of Promise-like values before returning them. This allows
// for better stack traces if the promise rejects.
config.rules['@typescript-eslint/return-await'] = ['error'];

// Require semi-colons. #ComeAtMeBro
config.rules['semi'] = 'off';
config.rules['@typescript-eslint/semi'] = ['error', 'always'];

// Enforce consistent spacing before function parenthesis.
config.rules['space-before-function-paren'] = 'off';
config.rules['@typescript-eslint/space-before-function-paren'] = ['error', {
  named: 'never',
  anonymous: 'never',
  asyncArrow: 'always'
}];

// Allow type coercion in boolean expressions.
config.rules['@typescript-eslint/strict-boolean-expressions'] = 'off';

// No strong preference on this rule.
config.rules['@typescript-eslint/switch-exhaustiveness-check'] = 'off';

// Prefer ES6-style import declarations over triple-slash references.
config.rules['@typescript-eslint/triple-slash-reference'] = ['error', {
  path: 'never',
  types: 'never',
  lib: 'never'
}];

// Enforce consistent spacing around type annotations.
config.rules['@typescript-eslint/type-annotation-spacing'] = ['error', {
  before: false,
  after: true,
  overrides: {
    arrow: {
      before: true,
      after: true
    }
  }
}];

// Do not require explicit type definitions. Prefer using TypeScript in strict
// mode and leveraging type inference instead.
config.rules['@typescript-eslint/typedef'] = 'off';

// Disallow unbound methods from being called outside of their intended `this`
// context.
config.rules['@typescript-eslint/unbound-method'] = ['error'];

// Disallow overloads that could be unified into one by using a union or an
// optional/rest parameter.
config.rules['@typescript-eslint/unified-signatures'] = ['error'];


// ----- [Plugin] unicorn ------------------------------------------------------

// Require consistent naming of errors in catch blocks.
config.rules['unicorn/catch-error-name'] = ['error', {
  name: 'err'
}];

// DISABLED: This rule is disabled because it is often necessary to define
// functions inside React.useEffect factories to ensure that variables bound
// by their closures have the expected values.
config.rules['unicorn/consistent-function-scoping'] = 'off';

// Allow file names in kebab-case and PascalCase.
config.rules['unicorn/filename-case'] = ['error', {
  cases: {
    kebabCase: true,
    pascalCase: true
  }
}];

// Allow function references to be passed to iterators.
config.rules['unicorn/no-fn-reference-in-iterator'] = 'off';

// Don't enforce 'more descriptive' variable names.
config.rules['unicorn/prevent-abbreviations'] = 'off';


// ----- [Plugin] prefer-arrow -------------------------------------------------

// Prefer the use of arrow functions in certain contexts.
config.rules['prefer-arrow/prefer-arrow-functions'] = ['error', {
  // Exempt top-level function declarations.
  allowStandaloneDeclarations: true,
  // Functions defined as class instance fields will be converted to arrow
  // functions when doing so would not alter or break their behavior.
  classPropertiesAllowed: true,
  // Functions assigned to a prototype will be converted to arrow
  // functions when doing so would not alter or break their behavior.
  disallowPrototype: true
}];


// ----- Overrides -------------------------------------------------------------

/**
 * Test files.
 */
config.overrides.push({
  files: [
    '*.test.*',
    '*.spec.*'
  ],
  rules: {
    // Do not require that async functions utilize the await keyword. This
    // allows us to easily mock async functions with a mock implementation that
    // may be synchronous.
    '@typescript-eslint/require-await': 'off',
    // Do not enforce naming convention rules for values.
    '@typescript-eslint/naming-convention': 'off',
    // Allow require() statements.
    '@typescript-eslint/no-var-requires': 'off'
  }
});


/**
 * Disable all @typescript-eslint rules for JavaScript files.
 */
const javaScriptRules = Object.entries(config.rules).reduce((rules, [rule, ruleConfig]) => { // eslint-disable-line unicorn/no-reduce
  if (rule.startsWith('@typescript-eslint/')) {
    rules[rule] = 'off';

    // Compute the name of the non-TypeScript variant of the rule by stripping
    // the prefix. This relies on the fact that @typescript-eslint rules always
    // use the same rule name as their non-TypeScript variant.
    const jsRuleName = rule.replace('@typescript-eslint/', '');

    // If we have explicitly disabled the non-TypeScript variant of the rule,
    // re-enable it using the same configuration we used for the TypeScript
    // variant. This assumes that the schema for the rules is the same. This may
    // cause failures in the future if the schemas do not match.
    if (config.rules[jsRuleName] === 'off') {
      rules[jsRuleName] = ruleConfig;
    }
  }

  return rules;
}, {});

config.overrides.push({
  files: ['*.js'],
  parser: 'babel-eslint',
  rules: javaScriptRules
});


export default config;
