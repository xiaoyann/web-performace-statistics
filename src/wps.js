/**
 * WPS(WEB Performance Statistics)
 *
 * Todos: 
 * 1. 增加频率限制
 * 2. 网速测试
 */

'use strict';

;(function(window, document) {

	var WPS;

	// 类型的字段名
	var KEY_TYPE = 't';
	
	// 模块的字段名
	var KEY_MODULE = 'm';

	// 数据内容的字段名
	var KEY_VALUE = 'v';

	var _toString = Object.prototype.toString;


	
	/**
	 * 检测 obj 是否是数组
	 * @return {Boolean}
	 */
    function isArray(obj) {
        return _toString.call(obj) === '[object Array]';
    }


    /**
	 * 检测 obj 是否是函数
	 * @return {Boolean}
	 */
    function isFunction(obj) {
        return typeof obj === 'function';
    }


    /**
	 * 检测 obj 是否是 Object
	 * @return {Boolean}
	 */
    function isObject(obj) {
        return !!obj && _toString.call(obj) === '[object Object]';
    }


    /**
     * 将 source 的属性浅复制到 target
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
     * 序列化 data，参考 jQuery
     * @param  {object} data
     * @return {string}
     */
    function queryString(data) {
        var s = [];
        
        if (isArray(data)) {
            for (var i = 0; i < data.length; i++) {
                add(data[i].name, data[i].value);
            }
        } else if (isObject(data)) {
            for (var name in data) {
                serialize(name, data[name]);
            }
        }

        function serialize(prefix, obj) {
            if (isArray(obj)) {
                for (var i = 0; i < obj.length; i++) {
                    serialize(prefix + '[' + (typeof obj[i] === 'object' ? i : '') +']', obj[i]);
                }
            } else if (isObject(obj)) {
                for (var name in obj) {
                    serialize(prefix + '['+ name +']', obj[name]);
                }
            } else {
                add(prefix, obj);
            }
        }

        function add(name, value) {
            value = isFunction(value) ? value() : (value == null ? '' : value);
            s.push(encodeURIComponent(name) + '=' + encodeURIComponent(value));   
        }

        return s.join('&').replace(/%20/g, '+');
    }


	/**
	 * 上送数据到服务器
	 * @param  {object} data 一维键值对对象
	 * @param  {string} url  上送地址
	 * @return undefined
	 */
	function send(data, url) {
		if (!data || !url) return;
		var dataStr = queryString(data);
		console.log(dataStr);
		var img = document.createElement('img');
		var key = '_img_' + (new Date()).getTime();
		// 保持img的引用，防止img被回收后阻止请求发出
		send[key] = img;
		img.onload = img.onerror = function() {
			send[key] = img = img.onload = img.onerror = null;
			delete send[key];
		};
		img.src = url + (url.indexOf('?') > -1 ? '&' : '?') + dataStr;
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

	
	/**
	 * createFakeTiming
	 * @return {object or undefined} fakeTiming
	 */
	function createFakeTiming() {
		var timing, fakeTiming, 
			performance = window.performance || window.webkitPerformance || window.msPerformance || window.mozPerformance;
		if (performance && (timing = performance.timing)) {
			fakeTiming = {
				startLoadTime: timing.navigationStart || timing.fetchStart,
				startRenderTime: timing.domLoading,
				endLoadTime: timing.loadEventEnd
			};
		}
		return fakeTiming;
	}
	

	/**
	 * 页面加载完成后，上送 timing
	 * @return undefined
	 */
	function handleOnload() {
		WPS.setTiming('endLoadTime', Date.now());
		WPS.sendTimingInfo();
		if (window.removeEventListener) {
			window.removeEventListener('load', handleOnload);
		} else if (window.detachEvent) {
			window.detachEvent('load', handleOnload);
		}
		handleOnload = null;
	}





	WPS = {
		/**
		 * 上送数据的地址
		 */
		_url: '',

		_timing: {
			startLoadTime: 0,
			startRenderTime: 0,
			endLoadTime: 0
		},

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
			this.setTiming('startLoadTime', options.startLoadTime);
			this.setTiming('startRenderTime', options.startRenderTime);
			if (options.alias) extend(this._alias, options.alias);
			this.bindOnload();
			return this;
		},

		setTiming: function(name, value) {
			this._timing[name] = parseInt(value) || 0;
		},

		getTiming: function(name) {
			return name ? this._timing[name] : this._timing;
		},

		bindOnload: function() {
			if (window.addEventListener) {
				window.addEventListener('load', handleOnload, false);
			} else if (window.attachEvent) {
				window.attachEvent('onload', handleOnload);
			}
		},

		sendTimingInfo: function() {
			var timing = createFakeTiming() || WPS.getTiming();
			var firstPaintTime = timing.startRenderTime - timing.startLoadTime;
			var allLoadTime = timing.endLoadTime - timing.startLoadTime;
			var data = createDataModel('timing', 'home', {ws: firstPaintTime, fs: 0, tl: allLoadTime});
			this._sendToServer(data);
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





