
# Scripts to help rewrite JSMs as ESMs

## Running

```
npm install -g jscodeshift
```

```
# Find all non-ignored jsm files with rg, then run a transform (skipping files that have parse errors)
# Run these from a local m-c

cp .gitignore .rgignore && rg -l -g '*.jsm' --iglob '!toolkit/components/osfile/*' '' | jscodeshift --stdin --transform ~/Code/jsm-rewrites/no-this-property-assign.js --ignore-pattern ./toolkit/modules/AppConstants.jsm --ignore-pattern ./layout/tools/reftest/manifest.jsm --ignore-pattern ./layout/tools/reftest/reftest.jsm --ignore-pattern ./toolkit/components/reader/Readerable.jsm  --ignore-pattern ./mobile/android/modules/Sanitizer.jsm --ignore-pattern ./js/xpconnect/tests/unit/syntax_error.jsm Transformation error --ignore-pattern ./browser/components/enterprisepolicies/schemas/schema.jsm --ignore-pattern ./python/mozbuild/mozbuild/test/backend/data/build/qux.jsm --ignore-pattern ./python/mozbuild/mozbuild/test/backend/data/build/baz.jsm

# Fix formatting
./mach eslint --fix
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
