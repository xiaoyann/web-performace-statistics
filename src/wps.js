/**
 * WPS(WEB Performace Statistics)
 *
 * Todos: 
 * 1. 增加频率限制
 */

'use strict';

;(function(window, document) {

	// 类型：白屏时间
	var FIRST_PAINT_TIME = 'FIRST_PAINT_TIME';
	// 类型：首屏时间
	var ABOVE_THE_FOLD_TIME = 'ABOVE_THE_FOLD_TIME';
	// 类型：页面错误
	var PAGE_ERROR = 'PAGE_ERROR';

	// 类型的字段名
	var KEY_TYPE = 't';
	// 模块的字段名
	var KEY_MODULE = 'm';
	// 数据内容的字段名
	var KEY_VALUE = 'v';



	/**
	 * 上送数据到服务器
	 * @param  {object} data 一维键值对对象
	 * @param  {string} url  上送地址
	 * @return undefined
	 */
	function send(data, url) {
		console.log(data)
		return;
		if (!data || !url) return;
		var dataStr = queryString(data);
		var img = document.createElement('img');
		img.src = url + (url.indexOf('?') > -1 ? '&' : '?') + dataStr;
	}


	/**
	 * 格式化需要传输的数据
	 * @param  {object} data 一维键值对对象
	 * @return {string}
	 */
	function queryString(data) {
		var res = [];
		for (var key in data) {
			res.push(key + '=' + encodeURIComponent(data[key]));
		}
		return res.join('&');
	}


	/**
	 * 将 source 的属性扩展到 target
	 * @param  {object} target 被扩展的对象
	 * @param  {object} source
	 * @return {object}  
	 */
	function extend(target, source) {
		for (var key in source) {
			if (typeof source[key] !== 'undefined') {
				target[key] = source[key];
			}
		}
		return target;
	}


	/**
	 * 创建数据模型
	 * @param  {string} t  类型名称
	 * @param  {string} m  模块名称
	 * @param  {string} v  数据内容
	 * @return {object}    data
	 */
	function createDataModel(t, m, v) {
		var data = {};
		data[KEY_TYPE] = t;
		data[KEY_MODULE] = m;
		data[KEY_VALUE] = v;
		return data;
	}



	var WPS = {
		/**
		 * 上送数据的地址
		 */
		_url: '',

		/**
		 * 准备加载新页面的起始时间
		 */
		_navigationStart: 0,

		/**
		 * 别名配置，类型名称和模块名称都是固定的，
		 * 可以使用更简短的别名来映射，减小传输的字节大小。
		 */
		_alias: {},

		/**
		 * 初始化 WPS
		 * @param  {object} options 配置
		 * @return {object}         this
		 */
		init: function(options) {
			this._url = options.url || '';
			this._navigationStart = parseInt(options.navigationStart) || 0;
			
			// 设置类型名称的默认别名
			var alias = {};
			alias[FIRST_PAINT_TIME] = '0';
			alias[ABOVE_THE_FOLD_TIME] = '1';
			alias[PAGE_ERROR] = '2';

			if (options.alias) this._alias = extend(alias, options.alias);

			return this;
		},

		/**
		 * 上送白屏时间
		 * @param  {number} v   白屏时间
		 * @param  {string} m   所属模块
		 * @param  {string} url 上送地址，可选，未设置时则使用初始化时设置的url
		 * @return undefined
		 */
		sendFirstPaintTime: function(v, m, url) {
			var data = createDataModel(FIRST_PAINT_TIME, m, v);
			this._sendToServer(data, url);
		},
		
		/**
		 * 内部方法，进行url转换，别名转换，然后调用send上送数据
		 * @param  {object} data 待上送的数据
		 * @param  {string} url 上送地址，可选，未设置时则使用初始化时设置的url
		 * @return undefined
		 */
		_sendToServer: function(data, url) {
			var alias = this._alias, _alias;
			for (var key in data) {
				if ((key === KEY_TYPE || key === KEY_MODULE) && (_alias = alias[data[key]])) {
					data[key] = _alias;
				}
			}
			send(data, url || this._url);
		}
	};


	console.log(WPS);

	window.WPS = WPS;

})(window, document);




