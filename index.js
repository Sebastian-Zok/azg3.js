// Returns a Promise to execute a SPARQL query,
// Resolves to SPARQL results as JS object as described at https://www.w3.org/TR/sparql11-results-json

const http = require('http')

/**
 * @param {string} host
 * @param {string} username
 * @param {string} password
 * @param {string} username
 * @param {string} password
 *  */
run_query = (host, username, password, qrystr, port) => {

    // return True if its a valid object instance
    const isvalid = (o) => { return (undefined !== o && null !== o); };
    if (!isvalid(qrystr) || '' == qrystr) console.log('Empty query');

    // http connection
    var options = {
        host: host,
        port: port ? port : 80,
        path: '/sparql' + '?query=' + encodeURIComponent(qrystr),
        auth: `${username}:${password}`,
        method: 'GET',
        headers: {
            'Accept': 'application/sparql-results+json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
    }

    var req = http.request(options, res => {
        let str;
        res.on('data', d => {
            str += d
        });

        res.on('end', () => process.stdout.write(str))
    });
    req.end();
}

run_query('127.0.0.1', 'admin', 'Passw0rd1', 'select ?s ?p ?o from <tickit> where {?s ?p ?o} order by ?p limit 10', 80)