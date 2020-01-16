
# Scripts to help rewrite JSMs as ESMs

## Running

```
npm install -g jscodeshift
```

```
# Find all non-ignored jsm files with rg, then run a transform (skipping files that have parse errors)
# Run this from a local m-c directory

hg revert --all && cp .gitignore .rgignore &&
rg --files-without-match -g '*.jsm' '^#endif|^#include|^#filter' | jscodeshift --stdin --transform ~/Code/jsm-rewrites/no-this-property-read.js --ignore-pattern ./mobile/android/modules/Sanitizer.jsm --ignore-pattern ./js/xpconnect/tests/unit/syntax_error.jsm &&
./mach eslint `hg st | rg '^M ' | sed 's/^M //'`

```

## Development notes

https://astexplorer.net/ is helpful for debugging

```
# Run it on a single file (dry run)
jscodeshift editor/AsyncSpellCheckTestHelper.jsm --dry --print --transform ~/Code/codeshift/transforms/foo.js
```

```
# Run it on a single file and see diff
hg revert toolkit/components/osfile/modules/osfile_async_front.jsm && jscodeshift toolkit/components/osfile/modules/osfile_async_front.jsm  --transform ~/jsm-rewrites/transforms/no-this-property-assign.js && hg diff
```
