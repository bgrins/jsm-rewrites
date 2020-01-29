module.exports = (fileInfo, api) => {
  const {jscodeshift} = api;
  const {statement} = jscodeshift.template;
  const root = jscodeshift(fileInfo.source);
  const ast = jscodeshift;


  let prefVariables = new Set();

  // Find all calls to XPCOMUtils.defineLazyPreferenceGetter

  root.find(ast.CallExpression).filter((path) => {
    if (!path.value.callee.object ||
        path.value.callee.object.name != "XPCOMUtils") {
      return false;
    }
    if (!path.value.callee.property ||
        path.value.callee.property.name != "defineLazyPreferenceGetter") {
      return false;
    }
    if (path.value.arguments.length == 0 ||
        path.value.arguments[0].type != "ThisExpression") {
      return false;
    }
    return true;
  }).forEach((path) => {
    prefVariables.add(path.value.arguments[1].value);
    path.value.arguments[0] = statement`LazyPrefs`;
  });

  
  if (prefVariables.size > 0) {

    // Declare the object.

    let body = root.find(ast.Program).get('body', 0);
    let firstNode = body.get(0);
    let declaration = statement`const LazyPrefs = {};`;
    body.insertAfter(declaration);

    // Replace all calls to pref variables
    root.find(ast.Identifier).filter((path) => {
      return prefVariables.has(path.value.name);
    }).replaceWith((path) => {
      return statement`LazyPrefs.${path.value.name}`;
    });
  }
  

  return root.toSource();
}
