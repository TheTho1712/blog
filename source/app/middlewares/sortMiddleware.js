module.exports = function sortMiddleware(req, res, next) {
    const sortType = req.query.type?.toLowerCase(); // chuẩn hóa về chữ thường
    const isValidType = ['asc', 'desc'].includes(sortType);

    res.locals._sort = {
        enabled: false,
        type: 'default',
        column: null,
    };

    if (
        Object.prototype.hasOwnProperty.call(req.query, '_sort') &&
        req.query.column
    ) {
        Object.assign(res.locals._sort, {
            enabled: isValidType,
            type: isValidType ? sortType : 'default',
            column: req.query.column,
        });
    }

    next();
};
