const j = require('jscodeshift');

const SECURITY_HEADERS = [
  ['Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload'],
  ['X-Frame-Options', 'SAMEORIGIN'],
  ['Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' https:; img-src 'self' data:; frame-ancestors 'self'"],
  ['X-Content-Type-Options', 'nosniff'],
  ['Referrer-Policy', 'no-referrer'],
  ['X-DNS-Prefetch-Control', 'off'],
  ['X-Download-Options', 'noopen'],
  ['X-Permitted-Cross-Domain-Policies', 'none'],
  ['X-XSS-Protection', '0']
];

module.exports = function(source) {
  const root = j(source);
  const findConfig = root.find(j.CallExpression, { callee: { name: 'defineConfig' } });

  if (findConfig.size() === 0) return source;

  const configObj = findConfig.get(0).node.arguments[0];
  const headerProps = SECURITY_HEADERS.map(([k, v]) => 
    j.property('init', j.stringLiteral(k), j.literal(v))
  );

  ['server', 'preview'].forEach(section => {
    let sectionProp = configObj.properties.find(p => p.key.name === section);
    
    if (!sectionProp) {
      sectionProp = j.property('init', j.identifier(section), j.objectExpression([]));
      configObj.properties.push(sectionProp);
    }

    let headersProp = sectionProp.value.properties.find(p => p.key.name === 'headers');
    if (!headersProp) {
      headersProp = j.property('init', j.identifier('headers'), j.objectExpression(headerProps));
      sectionProp.value.properties.push(headersProp);
    }
  });

  return root.toSource();
};