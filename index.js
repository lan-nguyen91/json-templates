function parse(value){
  switch(typeof value) {
    case "string":
      return parseString(value);
    case "object":
      return parseObject(value);
  }
};

function parseString(value){
  if(isTemplateString(value)){
    var parameter = Parameter(value);
    return Template(function (context){
      if(typeof context === "undefined"){
        context = {};
      }
      return context[parameter.key] || parameter.defaultValue;
    }, [parameter]);
  } else {
    return Template(function (){
      return value;
    }, []);
  }
}

function parseObject(value){

  var children = Object.keys(value).map(function (key){
    return {
      key: key,
      template: parse(value[key])
    };
  });

  return Template(function (context){
    return children.reduce(function (newValue, child){
      newValue[child.key] = child.template(context);
      return newValue;
    }, {});
  }, children.reduce(function (parameters, child){
    return parameters.concat(child.template.parameters);
  }, []));

}

// Checks whether a given string fits the form {{xyz}}.
function isTemplateString(str){
  return (
      (str.length > 5)
    &&
      (str.substr(0, 2) === "{{")
    &&
      (str.substr(str.length - 2, 2) === "}}")
  );
}

// Constructs a parameter object from the given template string.
// e.g. "{{xyz}}" --> { key: "xyz" }
// e.g. "{{xyz:foo}}" --> { key: "xyz", defaultValue: "foo" }
function Parameter(str){

  // Extract the key.
  var parameter = {
    key: str.substring(2, str.length - 2)
  };

  // Handle default values.
  var colonIndex = parameter.key.indexOf(":"); 
  if(colonIndex !== -1){
    parameter.defaultValue = parameter.key.substr(colonIndex + 1);
    parameter.key = parameter.key.substr(0, colonIndex);
  }

  return parameter;
}

// Constructs a template function with `parameters` property.
function Template(fn, parameters){
  fn.parameters = parameters;
  return fn;
}

module.exports = parse;