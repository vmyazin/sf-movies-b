Handlebars.registerHelper('sanitizeAddress', function(addr) {
  var localeSuffix = ', San Francisco, CA';
  var hasNumber = (function() {
    var re = /\d/;
    return function(s) {
      return re.test(s);
    };
  }()); 
  if(addr.toString().indexOf("(") != -1 && hasNumber(addr)) {
    var cleanAddr = addr.substring(addr.lastIndexOf("(")+1,addr.lastIndexOf(")"));
    return cleanAddr + localeSuffix;    
  } else {
    return addr + localeSuffix;
  }
});

Handlebars.registerHelper('makeId', function(str) {
  str = str.split(' ').join('_').toLowerCase().replace(/[\.,-\/#!$%\^&\*;:{}=_`~()'?]/g,"-");
  return str;
});
