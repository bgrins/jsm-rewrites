module.exports = (fileInfo, api) => {
  const {jscodeshift} = api;
  const {statement} = jscodeshift.template;
  const root = jscodeshift(fileInfo.source);
  const ast = jscodeshift;


  // Find all calls to XPCOMUtils.defineLazyPreferenceGetter

  root.find(ast.CallExpression).filter((path) => {
    if (!path.value.callee.object ||
        path.value.callee.object.name != "XPCOMUtils") {
      return false;
    }
    if (!path.value.callee.property ||
        path.value.callee.property.name != "defineConstant") {
      return false;
    }
    if (path.value.arguments.length < 3) {
      return true;
    }
    if (path.value.arguments[0].type != "ThisExpression") {
      return false;
    }
    if (path.value.arguments[1].type != "Literal") {
      return false;
    }
    if (path.value.arguments[2].type != "Identifier") {
      return false;
    }
    return path.value.arguments[1].value == path.value.arguments[2].name;
  }).remove();

  return root.toSource();
}
