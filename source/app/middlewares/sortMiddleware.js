// module.exports = function sortMiddleware(req, res, next) {
//     res.locals._sort = {
//         enabled: false,
//         type: 'default'
//     };

//     if(Object.prototype.hasOwnProperty.call(req.query, '_sort')) {
//         // res.locals._sort.enabled = true;
//         // res.locals._sort.type = req.query.type;
//         // res.locals._sort.column = req.query.column;

//         Object.assign(res.locals._sort, {
//             enabled: true,
//             type: req.query.type,
//             column: req.query.column,
//         })
//     }

//     next();
// }

module.exports = function sortMiddleware(req, res, next) {
    const sortType = req.query.type?.toLowerCase(); // chuẩn hóa về chữ thường
    const isValidType = ['asc', 'desc'].includes(sortType);

    res.locals._sort = {
        enabled: false,
        type: 'default',
        column: null,
    };

    if (Object.prototype.hasOwnProperty.call(req.query, '_sort') && req.query.column) {
        Object.assign(res.locals._sort, {
            enabled: isValidType,
            type: isValidType ? sortType : 'default',
            column: req.query.column,
        });
    }

    next();
};

