# 一次WEB项目性能分析实录

* 制定性能分析指标
* 制定数据获取方案
* 制定数据分析方案
* 制定性能优化方案

## 制定性能分析指标

指标 | 描述 | 理由
---- | ---- | ---- 
白屏时间 | 从打开页面(输入URL，刷新，跳转等方式)开始到页面显示内容的时间 | 直接影响用户体验
首屏时间 | 浏览器首屏内所有内容都呈现出来所花费的时间 | 直接影响用户体验
页面总下载时间 | 页面所有资源都加载完成并显示出来的时间 | 直接影响用户体验
基础优化规则 | 基于雅虎页面性能优化的34条规则来给页面评分 | 提高应用性能
页面异常 | 页面里的JS脚本错误 | 直接影响用户体验

## 制定数据获取方案

基础优化规则使用 [yslow](http://yslow.org/phantomjs/) 在本地进行测试并生成数据进行分析。

白屏时间、首屏时间、页面总下载时间、页面异常需要从用户端获取。所以需要一个数据收集脚本，将收集到的数据发送到服务端。

白屏时间、首屏时间、页面总下载时间合并为一组数据(timing)在页面加载完成后上送到服务器。页面异常通过监控实时上送。

**上送的数据格式：**

根据上面的分析，将需要上送的信息分为：timing、erro。

字段 | 描述
---- | ----
t | 上送数据的种类，如：`erro`(页面异常)，可以配置别名来简化
m | 数据属于哪个模块或页面，如：`home`(主页)，可以配置别名来简化
v | 上送数据的内容

为了尽量减少传输的字节，特意将字段名简写。然后类型和模块也应该使用简短的别名进行传输，服务端拿到数据后使用别名映射到相应的类型和模块。别名配置方式：

```js
WPS.init({
    alias: {
       error:  '0',
       timing: '1',
       home: '2'
    }
});
```

**数据发送方式：**

这样的方式很简单，但有个需要注意的问题就是客户端或者服务端有可能对URL的长度有限制。

```js
function send(data, url) {
	if (!data || !url) return;
	var dataStr = queryString(data);
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
```

**timing：**

* `timing.ws`: 白屏时间
* `timing.fs`: 首屏时间
* `timing.tl`: 页面总下载时间


如果页面主要内容是直接写在HTML页面里，就可以在`<head></head>`里进行统计：

```html
<html>
<head>
    <meta charset="utf-8">
    <script>
        var navigationStart = (new Date()).getTime();
    </script>
    <link rel="stylesheet" type="text/css" href="xxx.css">
    <script>
        var firstPaintTime = (new Date()).getTime() - navigationStart;
    </script>
</head>
<body>
<div></div>
<script src="http://www.test.com/wps.min.js"></script>
<script>
	WPS.init({
		url: 'http://www.test.com/test',
		navigationStart: navigationStart,
		alias: {
			home: 'a'
		}
	});
	WPS.sendFirstPaintTime(firstPaintTime, 'home');
	// 清理不再使用的变量
	navigationStart = firstPaintTime = null;
</script>
</body>
</html>
```

如果页面主要内容是通过JS创建的，那就应该根据JS会在什么时候创建内容的逻辑设置统计时间点：

```html
<html>
<head>
    <meta charset="utf-8">
    <script>
        var navigationStart = (new Date()).getTime();
    </script>
    <link rel="stylesheet" type="text/css" href="xxx.css">
</head>
<body>
<div id="main"></div>
<script src="http://www.test.com/wps.min.js"></script>
<script>
	WPS.init({
		url: 'http://www.test.com/test',
		navigationStart: navigationStart,
		alias: {
			home: 'a'
		}
	});
	
	// 示例代码
	function pageInit() {
	    $('#main').html('...');
	    WPS.sendFirstPaintTime((new Date()).getTime() - navigationStart, 'home');
	    // 清理不再使用的变量
	    navigationStart = null;
	}
	
	pageInit();
</script>
</body>
</html>
```


**首屏时间**

```js
    
```

**关键功能可使用时间**

```js

```

**页面总下载时间**

```js

```



## 制定数据分析方案

## 制定性能优化方案


## 统计用户使用的网络类型
https://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html#.E8.8E.B7.E5.8F.96.E7.BD.91.E7.BB.9C.E7.8A.B6.E6.80.81.E6.8E.A5.E5.8F.A3

## 网速

参考链接：

* http://fex.baidu.com/blog/2014/05/front_end-data/
* https://www.zhihu.com/question/24907805
* http://www.cnblogs.com/shinnychen/p/3750020.html
* http://www.infoq.com/cn/news/2015/06/web-performance-api
* http://www.webryan.net/2013/02/web-page-test-based-on-phontomjs/
* http://www.iteye.com/magazines/116-Web-Front-Performance-Best-Practice
* https://www.smashingmagazine.com/2012/11/writing-fast-memory-efficient-javascript/
* http://code.oneapm.com/javascript/2015/09/02/BrowserInsight/
* http://www.cnblogs.com/sunshq/p/5312231.html
* https://sites.google.com/a/webpagetest.org/docs/




