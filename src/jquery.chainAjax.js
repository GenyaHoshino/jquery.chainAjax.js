import jQuery from 'jquery'
    /**
     * ChainAjax
     * @author KissekiAkaru
     * @desc jQueryAjax的Promise链封装 可以设置全局前置promise链
     */


(function ($, _global, undef) {

    var ChainAjax = function () {
        return this._init(arguments)
    }

    ChainAjax.prototype = {
        /**
         * 配置
         */
        opts: {
            type: 'POST',
            dataType: 'JSON'
        },
        /**
         * 初始化
         * @param args
         * @param [args[0]] url 请求链接
         * @param [args[1]] firstParam 第一参数
         * @param [args[args.length - 1]] opt ajax配置 链接也可以写在这里 会被第一个参数覆盖
         * @private
         */
        _init: function (args) {
            var url, firstParam, opts
            if (typeof args[0] == 'string') {
                url = args[0]
                if (typeof args[1] == 'string') {
                    firstParam = args[1]
                }
            }
            if (typeof args[args.length - 1] == 'object') {
                opts = args[args.length - 1]
            }


            this.opts = $.extend(true, {}, this.opts, opts || {}, {
                url: url
            })
            this.firstParam = firstParam
        },
        /**
         * 全局Promise链
         */
        _chain: [],
        /**
         * 添加全局Promise链节点
         * @param type
         * @param callback
         * @private
         */
        _pushChain: function (type, callback) {
            this._chain.push({
                callback: callback,
                type: type
            })
        },
        /**
         * 清空全局Promise链
         */
        clearChain: function () {
            this._chain = []
        },
        /**
         * 发起请求
         * @param path
         * @param data
         * @param [opt]
         * @return {*}
         */
        request: function (path, data, opt) {
            var $def = $.ajax($.extend(true, {}, this.opts, {
                url: this.opts + path,
                data: data
            }, opt || {}))
            for (var i = 0; i < this._chain.length; i++) {
                var el = this._chain[i]
                $def = $def[el.type](el.callback)
            }
            return $def.promise()
        },
        /**
         * 使用第一参数或者path发起请求(语法糖)
         * @param firstParamOrPath
         * @param data
         * @param [opt]
         */
        invoke: function (firstParamOrPath, data, opt) {
            var path = {}
            // 如果设置了第一参数 则以第一参数发起请求
            if (this.firstParam) {
                return this.request('?' + this.firstParam + '=' + firstParamOrPath, $.extend({}, data, path), opt)
            }
            // 否则使用path发起请求
            else {
                return this.request(firstParamOrPath, $.extend({}, data, path), opt)
            }
        },
        /**
         * 向全局Promise链添加then节点
         * @param callback
         */
        then: function (callback) {
            this._pushChain('then', callback)
            return this
        },
        /**
         * 向全局Promise链添加done节点
         * @param callback
         */
        done: function (callback) {
            this._pushChain('done', callback)
            return this
        },
        /**
         * 向全局Promise链添加fail节点
         * @param callback
         */
        fail: function (callback) {
            this._pushChain('fail', callback)
            return this
        },
        /**
         * 向全局Promise链添加error节点
         * @param callback
         */
        error: function (callback) {
            this._pushChain('error', callback)
            return this
        },
        /**
         * 向全局Promise链添加always节点
         * @param callback
         */
        always: function (callback) {
            this._pushChain('always', callback)
            return this
        },
        /**
         * 向全局Promise链添加complete节点
         * @param callback
         */
        complete: function (callback) {
            this._pushChain('complete', callback)
            return this
        }
    }
    // 最后将插件对象暴露给全局对象
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ChainAjax
    } else if (typeof define === 'function' && define.amd) {
        define(function () {
            return ChainAjax
        })
    } else {
        !('ChainAjax' in _global) && (_global.ChainAjax = ChainAjax)
    }
})(jQuery, (function () {
    return this || (0, eval)('this')
}()))