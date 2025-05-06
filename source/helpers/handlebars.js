const { json } = require('express');
const Handlebars = require('handlebars');

module.exports = {
    sum: (a, b) => a + b,
    subtract: (a, b) => a - b,
    lt: (a, b) => a < b,
    gte: (a, b) => a >= b,

    sortable: (field, sort) => {
        const sortType = field === sort.column ? sort.type : 'default';

        const icons = {
            default: 'fa-solid fa-sort',
            asc: 'fa-solid fa-arrow-up-wide-short',
            desc: 'fa-solid fa-arrow-down-wide-short',
        };

        const types = {
            default: 'desc',
            asc: 'desc',
            desc: 'asc',
        }

        const icon = icons[sortType]
        const type = types[sortType]

        const href = Handlebars.escapeExpression(`?_sort&column=${field}&type=${type}`)


        const output = `<a href="${href}">
        <i class="${icon}"></i>
      </a>`;
        return new Handlebars.SafeString(output);
    },
    shorten: function (text, length) {
        if (text.length > length) {
            return text.substring(0, length) + '...';
        }
        return text;
    },
    notEq: (a, b) => a !== b,

    ifEquals: function (arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    },

    range: function (currentPage, totalPages) {
        let delta = 2; // số trang trước/sau currentPage (=> tổng cộng 5 trang)
        let start = Math.max(1, currentPage - delta);
        let end = Math.min(totalPages, currentPage + delta);
      
        // Điều chỉnh nếu gần đầu/cuối danh sách
        if (end - start < 2 * delta) {
          if (start === 1) {
            end = Math.min(totalPages, start + 2 * delta);
          } else if (end === totalPages) {
            start = Math.max(1, end - 2 * delta);
          }
        }
      
        let result = [];
        for (let i = start; i <= end; i++) {
          result.push(i);
        }
        return result;
      },
      
      json: function (context) {
        return JSON.stringify(context);
      },

}