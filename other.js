
// create dataframe object from JSON dict of SPARQL results
// may throw error if 'resp' is not in the right object
create_dataframe_from_response = (resp) => {
    // covert row-wise data to columnar data
    const cols = resp.head.vars;
    let coldata = {};
    cols.forEach((col) => {
        coldata[col] = [];
    });
    const isvalid = (o) => { return (undefined !== o && null !== o); };
    resp.results.bindings.forEach((row) => {
        cols.forEach((col) => {
            const cell = row[col];
            let val = null;
            try {
                // create a proper instance of datum
                val = cell.value;
                let vtype = cell.type;
                let typeuri = cell.datatype;
                const langtag = cell['xml:lang'];
                if (isvalid(vtype) && vtype == 'bnode') {
                    val = '_:' + val;
                }
                else if (isvalid(langtag)) {
                    val = '"' + val + '"' + '@' + langtag;
                }
                else if (isvalid(typeuri)) {
                    typeuri = typeuri.replace('http://www.w3.org/2001/XMLSchema#', '');
                    val = typed_value(typeuri, val);
                }
            }
            catch (e) { }  // unbound datum
            coldata[col].push(val);
        });
    });
    // create dfjs.DataFrame instance
    return new dfjs.DataFrame(coldata, cols);
};

// Returns a Promise to create a dfjs.DataFrame
//   Resolves to dfjs.DataFrame object as described at https://www.npmjs.com/package/dataframe-js
//      (script src="https://gmousse.github.io/dataframe-js/dist/dataframe.min.js")
create_dataframe = (qrystr) => {
    return new Promise((resolve, reject) => {
        // run query
        run_query(qrystr).then((r) => {
            try {
                let df = create_dataframe_from_response(r);
                // create dfjs.DataFrame instance
                resolve(df);
            } catch (e) { reject(e); };
        }).catch((e) => { reject(e); });
    });
};

// create js value from str-value
typed_value = (typeuri, value) => {
    switch (typeuri) {
        case 'boolean': return 'true' === value;
        case 'byte': case 'short': case 'integer':
        case 'int': case 'long': case 'nonNegativeInteger':
            return parseInt(value);
        case 'float': case 'double': case 'decimal':
            return parseFloat(value);
        case 'dateTime': case 'date': case 'time':
            return Date.parse(value);
        case 'duration':
        default: break;
    }
    return value;
};
