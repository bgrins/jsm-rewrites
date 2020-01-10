
function isGlobalThis(path) {
  while (path = path.parent) {
    if (
      path.value.type == "FunctionDeclaration" ||
      path.value.type == "FunctionExpression"
    ) {
      return false;
    }
  }

  return true;
}

module.exports = function(fileInfo, api) {
// console.log(fileInfo);
  const { jscodeshift } = api;
  const root = jscodeshift(fileInfo.source);
  const {statement} = jscodeshift.template;

  /*
  In https://searchfox.org/mozilla-central/source/browser/components/newtab/common/Reducers.jsm#753,773:
    const TOP_SITES_DEFAULT_ROWS = 1;
    this.TOP_SITES_DEFAULT_ROWS = TOP_SITES_DEFAULT_ROWS;
    const EXPORTED_SYMBOLS = [
      "TOP_SITES_DEFAULT_ROWS",
    ];
  the second statement is unnecessary for the export to work. So it can be removed
  */
 root.find(jscodeshift.AssignmentExpression).filter(function (path) {
  let maybe = !path.parent &&
              path.value.left.object &&
              path.value.left.object.type == "ThisExpression" &&
              isGlobalThis(path);
  if (!maybe) {
    return false;
  }

  let name = path.value.right.name;

  let matchingDeclarations = root.find(jscodeshift.VariableDeclaration).filter(function (path) {
    return isGlobalThis(path) &&
            path.value.declarations.length == 1 &&
            path.value.declarations[0].id.name == name;
  });

  return matchingDeclarations.length == 1;
 }).remove();

  /*
  Replace:
    this.bar = 1;
  With:
    const bar = 1;
  */
  root.find(jscodeshift.AssignmentExpression).filter(function (path) {
    // browser/components/newtab/common/Reducers.jsm

    return path.value.left.object &&
           path.value.left.object.type == "ThisExpression" &&
           isGlobalThis(path);
  }).replaceWith(path => {
    // Handle a weird case `var Scheduler = (this.Scheduler = {})` to `var Scheduler = {}`
    if (path.parent.value.type == "VariableDeclarator" && path.parent.value.id.loc.identifierName == path.value.left.property.name) {
      return statement`${path.value.right}`;
    }

    const decl = statement`const ${path.value.left.property.name} = ${path.value.right}`;
    return decl;
  });

  /*
  Replace:
    this.bar
  With:
    bar
  */
  root.find(jscodeshift.MemberExpression).filter(function (path) {
    // console.log(path.value.object.type == "ThisExpression");
    return path.value.object.type == "ThisExpression" &&
           isGlobalThis(path);
  }).replaceWith(path => {
    return jscodeshift.identifier(path.value.property.name);
  });

  return root.toSource();
};
