
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

/*
Example usage:
  hg revert --all  && jscodeshift browser/components/downloads/DownloadsViewUI.jsm --transform ~/Code/jsm-rewrites/no-this-property-read.js && hg diff
*/
module.exports = function(fileInfo, api) {
  let {jscodeshift} = api;
  const root = jscodeshift(fileInfo.source);
  doTranslate(jscodeshift, root);
  return root.toSource();
};


/*
Replace:
  this.bar
With:
  bar
*/
module.exports.doTranslate = doTranslate;
function doTranslate(jscodeshift, root) {
  root.find(jscodeshift.MemberExpression).filter(function (path) {
    let isParentAssignment = path.parent.value.type == "AssignmentExpression";
    return path.value.object.type == "ThisExpression" && // Only handle `this.something`
           !isParentAssignment && // Skip `this.foo = {}`
           isGlobalThis(path);
  }).replaceWith(path => {
    return jscodeshift.identifier(path.value.property.name);
  });
}
