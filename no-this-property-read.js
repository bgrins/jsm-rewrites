let jscodeshift = null;

function isGlobalThis(path) {
  while (path = path.parent) {
    if (
      path.value.type == "FunctionDeclaration" ||
      path.value.type == "FunctionExpression" ||
      path.value.type == "ObjectExpression" // Handle var foo = { A: 1, B: this.A }
    ) {
      return false;
    }
  }

  return true;
}


function isMemberExpressionInAssignment(path) {
  // // this.foo.prototype = {} is OK to turn into foo.prototype = {}:
  // if (path.parent.value.type == "MemberExpression") {
  //   return false;
  // }

  while (path = path.parent) {
    if (
      path.value.type == "AssignmentExpression"
    ) {
      return true;
    }
  }

  return false;
}

module.exports = function(fileInfo, api) {
  jscodeshift = api.jscodeshift;
  const root = jscodeshift(fileInfo.source);
  const {statement} = jscodeshift.template;

  /*
  Replace:
    this.bar
  With:
    bar
  */
  root.find(jscodeshift.MemberExpression).filter(function (path) {

    // hg revert --all  && jscodeshift browser/components/downloads/DownloadsViewUI.jsm --transform ~/Code/jsm-rewrites/no-this-property-read.js && hg diff
    // let isInAssignment = jscodeshift(path).closest(jscodeshift.AssignmentExpression).length;
    // console.log(isInAssignment);
    // console.log(jscodeshift(path).closest(jscodeshift.AssignmentExpression).length)
    let isParentAssignment = path.parent.value.type == "AssignmentExpression";
    return path.value.object.type == "ThisExpression" && // Only handle `this.something`
           !isParentAssignment && // Skip `this.foo = {}`

           isGlobalThis(path);
  }).replaceWith(path => {
    return jscodeshift.identifier(path.value.property.name);
  });

  return root.toSource();
};
