
var dragSrcEl = null;
var dragText = null;

var statusBar = document.getElementById('statusbar');
var statusBarDefault = ":: Drag the applications to the Galileos ::";

statusBar.innerHTML = statusBarDefault;

/* Read Apps and create list */
var apps;
var appNames = readApps();
if (appNames != null) {
	createApps(appNames);
}
// listen for new apps
var newAppCallback = function(msg) {
	var app = JSON.parse(msg.data);
	appNames.push(app);
	createApps(appNames);
}

function createApps(appNames) {
	var body = document.getElementById('store');
	while (body.firstChild) {
		body.removeChild(body.firstChild);
	}
	body.style.height = 60*appNames.length+100+"px";
	var maxWidth = 0;
	apps = new Array(appNames.length);
	for (var i=0;i<appNames.length && i<10;i++) {
		var a = document.createElement('div');
		a.id = i;
		a.className = "apps";
		a.innerHTML = appNames[i];
		var w = 8*appNames[i].length+15;
		if (w > maxWidth) {
			maxWidth = w;
		}		
		a.style.width = w+"px";
		body.appendChild(a);
		set_dragable(a);
		apps[i] = a;
	}
	body.style.width = maxWidth+50 + "px";
}

/* Read clients and create table */
var clients = readClients();
if (clients != null) {
	tableCreate(clients);
}

// listen for new connections
var newClientCallback = function(msg) {
	var client = JSON.parse(msg.data);
	clients.push(client);
	tableCreate(clients);
}

var source = new EventSource('/event');
source.addEventListener('REGISTRATION', newClientCallback, false);
source.addEventListener('NEWAPP', newAppCallback, false);

function uniqBy(ary, key) {
	var seen = {};
	return ary.filter(function(elem) {
		var k = key(elem.endpoint);
		return (seen[k] === 1) ? 0 : seen[k] = 1;
	})
}

function tableCreate(Clients) {

	var clients = uniqBy(Clients, JSON.stringify);
	var num_bins = clients.length;

	var body = document.getElementById('things');
	var tbl = document.getElementById('things_table');
	
	var g_list = null;
	if (tbl != null) {
		body.removeChild(tbl);
		g_list = tbl.getElementsByTagName("div");
	}
	/* create table again */
	tbl = document.createElement('table');
	tbl.id = 'things_table';
	tbl.style.width = '100%';
	tbl.setAttribute('border', '0');
	var tbdy = document.createElement('tbody');

	var k = 0;
	var ncols = 10;
	var nrows = num_bins / ncols;

	for ( var i = 0; i < nrows; i++) {
		var tr = document.createElement('tr');
		tr.align = "center";
		tr.style.width = "100%"
		for ( var j = 0; j < ncols; j++) {
			var td = document.createElement('td');
			td.valign = "center";
			td.height = "100px";
			td.style.width = "100px";
			tr.appendChild(td)
			if (k < num_bins) {
				var found = false;
				if (g_list) {
					for (var t = 0; t<g_list.length;t++) {
						if (g_list[t].id == clients[k].endpoint) {
							found = true;
							td.appendChild(g_list[t]);
							break;	
						}						
					}					
				}
				if (!found) {
					var g = document.createElement('div');
					g.id = clients[k].endpoint;
					g.className = "bin";
					g.innerHTML = "<a href=\"client/#/clients/" + clients[k].endpoint
							+ "\">" + clients[k].endpoint + "</a>";
					td.appendChild(g);
					addEventsBin(g);
					findApps(g);
				}				
				k = k + 1;
			}
		}
		tbdy.appendChild(tr);
	}
	tbl.appendChild(tbdy);
	body.appendChild(tbl);
}

function findApps(bin) {
	var i;
	[].forEach.call(apps, function(app) {
		bin.style.backgroundColor = "#ccc";
		bin.style.opacity = "0.4";
		readLW_async(bin.id, "/10/" + app.id + "/7", function(res) {
			if (res) {
				if (app.id == 1) {
					console.log("Board: " + bin.id + " ok");
				}
				bin.style.opacity = "1";
				if (res == "3") {
					load_application_ok(bin, app);
				} else if (res == "4") {
					//bin.style.backgroundColor = "red";
				} 
			} else {
				if (bin.style.opacity == "0.4") {
					bin.style.backgroundColor = "red";
				}
			}
		});
	});

}

function execLW(clientId, resource) {
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/api/clients/' + clientId + '/' + resource, false);
	xhr.responseType = 'text/plain';
	xhr.send();
	if (xhr.status == 200) {
		if (xhr.response == '{"status":"CONTENT"}') {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

function writeLW(clientId, resource, value) {
	var xhr = new XMLHttpRequest();
	xhr.open('PUT', '/api/clients/' + clientId + '/' + resource, false);
	xhr.responseType = 'text/plain';
	xhr.send(value);
	if (xhr.status == 200) {
		if (xhr.response == '{"status":"CONTENT"}') {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

function readClients() {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/api/clients/', false);
	xhr.responseType = 'text/plain';
	xhr.send();
	if (xhr.status == 200) {
		var jsObject = JSON.parse(xhr.response);
		return jsObject;
	} else {
		return null;
	}
}

function readApps() {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/api/apps/', false);
	xhr.responseType = 'text/plain';
	xhr.send();
	if (xhr.status == 200) {
		var jsObject = JSON.parse(xhr.response);
		return jsObject;
	} else {
		return null;
	}
}

function readLW_async(clientId, resource, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/api/clients/' + clientId + '/' + resource, true);
	xhr.responseType = 'text/plain';
	xhr.onload = function(e) {
		if (xhr.status == 200) {
			var jsObject = JSON.parse(xhr.response);
			callback(jsObject.value);
		} else {
			callback(null);
		}
	};
	xhr.onerror = function(e) { /* ignore error */
	};
	xhr.send();
}

function readLW(clientId, resource) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/api/clients/' + clientId + '/' + resource, false);
	xhr.responseType = 'text/plain';
	xhr.send();
	if (xhr.status == 200) {
		var jsObject = JSON.parse(xhr.response);
		return jsObject.value;
	} else {
		return null;
	}
}

function load_application_ok(bin, el) {
	var childs = bin.childNodes;
	
    var elcopy = el.cloneNode();
	elcopy.style.opacity = '0.4';
	elcopy.innerHTML = el.innerHTML;
	elcopy.style.background = "#33FF99";
	set_dragable(elcopy);
	if (el.parentNode.className == "bin") {
		var nof_childs = el.parentNode.childNodes.length;
		if (nof_childs > 2) {
			el.parentNode.style.height = (nof_childs - 2) * 70 + 'px';
		} else {
			el.parentNode.style.height = '60px';
		}
		unload_application(el.parentNode.id, el.id, el,
				unload_application_ok);
	}
	if (dragSrcEl != null) {
		el.innerHTML = dragText;
	}
	
	bin.appendChild(elcopy);
	bin.style.height = (childs.length - 1) * 70 + 'px';
	statusLoaded(el.innerHTML, bin.id);
}

function load_application_run_check(bin, app) {
	clientId = bin.id;
	id = app.id;
	app_name = app.innerHTML;

	var res = readLW(clientId, "/10/" + id + "/7");
	if (res == "3") {
		load_application_ok(bin, app);
	} else if (res == "4") {
		statusCustom("Error running " + app_name);
		return false;
	}
}
var status_chk_cnt = 0;
function load_application_run(bin, app) {
	clientId = bin.id;
	id = app.id;
	app_name = app.innerHTML;

	var res = readLW(clientId, "/10/" + id + "/7");
	if (res == "0" || res == "1") {
		if (status_chk_cnt < 5) {
			setTimeout(function() {
				load_application_run(bin, app)
			}, 1000);
		} else {
			statusCustom("Timeout while downloading " + app_name);
			return false;			
		}
		
		status_chk_cnt = status_chk_cnt+1;
		
	} else if (res == "4") {
		statusCustom("Error downloading " + app_name);
		return false;
	} else if (res == "2") {
		/*
		 * downloaded OK, now run and check if
		 * running ok
		 */
		if (!execLW(clientId, "/10/" + id + "/5"))
			return false;
		setTimeout(function() {
			load_application_run_check(bin, app)
		}, 1000);
	} else {
		statusCustom("Invalid error application state: " + res);
		return false;
	}

	return true;
}

function load_application(bin, app) {
	clientId = bin.id;
	id = app.id;
	app_name = app.innerHTML;

	if (!writeLW(clientId, "/10/" + id + "/0", app_name))
		return false;
	if (!writeLW(clientId, "/10/" + id + "/2", "http://192.168.10.20:8080/apps/download?fileName=/"  
			+ app_name))
		return false;
	if (!writeLW(clientId, "/10/" + id + "/4", "/dev/ttyS0 /dev/ttyS0"))
		return false;
	/* Start download */
	if (!execLW(clientId, "/10/" + id + "/3"))
		return false;
	/* wait until downloaded correctly */
	status_chk_cnt = 0;
	setTimeout(function() {
		load_application_run(bin, app)
	}, 1000);
	return true;
}

function unload_application_ok(clientId, id, el) {
	var res = readLW(clientId, "/10/" + id + "/7");
	if (res == "0") {
		var nof_childs = el.parentNode.childNodes.length;
		if (nof_childs > 2) {
			el.parentNode.style.height = (nof_childs - 2) * 70 + 'px';
		} else {
			el.parentNode.style.height = '60px';
		}

		el.parentNode.removeChild(el);
		statusUnloaded(el.innerHTML);
	} else {
		statusCustom("Error unloading application " + el.innerHTML);
	}
}

function unload_application(clientId, id, arg, callback) {
	if (!execLW(clientId, "/10/" + id + "/6"))
		return false;
	setTimeout(function() {
		callback(clientId, id, arg)
	}, 1000);
	return true;
}

function addEventsBin(bin) {

	addEvent(bin, 'dragover', function(e) {
		if (e.preventDefault)
			e.preventDefault(); // allows us to drop
		if (dragSrcEl.parentNode == bin) {
			return false;
		}
		this.style.border = '3px dashed #999';
		e.dataTransfer.dropEffect = 'copy';
		statusLoad(dragSrcEl.innerHTML, bin.id);
		return false;
	});

	addEvent(bin, 'dragleave', function(e) {
		if (e.preventDefault)
			e.preventDefault(); // allows us to drop
		if (dragSrcEl.parentNode == bin) {
			return false;
		}
		this.style.border = '3px solid #000';
		e.dataTransfer.dropEffect = 'copy';
		dragSrcEl.innerHTML = dragText;
		statusDefault();
		return false;
	});

	/* app is loaded */
	addEvent(bin, 'drop', function(e) {
		if (e.stopPropagation)
			e.stopPropagation(); 
		
		if (dragSrcEl.parentNode == bin) {
			return false;
		}

		bin.style.border = '3px solid #000';
		statusLoading(dragSrcEl.innerHTML, bin.id);
		if (!load_application(bin, dragSrcEl)) {
			alert("Error loading " + dragSrcEl.innerHTML);
		}
		dragSrcEl = null;
		return false;
	});
}

/***************************************************
 * APPs dragging functions
 **************************************************/
function app_dragstart(e) {
	e.dataTransfer.effectAllowed = 'copy';
	dragSrcEl = this;
	dragText = dragSrcEl.innerHTML;
	this.style.opacity = '0.4';
}
function app_dragend(e) {
	if (this.parentNode) {
		if (this.parentNode.className != "bin") {
			this.style.opacity = '1';
		}
	}
}
function set_dragable(a) {
	a.setAttribute('draggable', 'true');
	a.addEventListener('dragstart', app_dragstart, false);
	a.addEventListener('dragend', app_dragend, false);
}

function statusDefault() {
	statusBar.innerHTML = statusBarDefault;
}
function statusLoad(app, id) {
	statusBar.innerHTML = ":: Drop here to load " + app + " to " + id + " ::";
}
function statusLoading(app, id) {
	statusBar.innerHTML = ":: Loading " + app + " to " + id + " ::";
}
function statusLoaded(app, id) {
	statusBar.innerHTML = ":: " + app + " loaded to " + id + " ::";
}
function statusUnload(app) {
	statusBar.innerHTML = ":: Drop here to unload " + app + " ::";
}
function statusUnloaded(app) {
	statusBar.innerHTML = ":: Unloaded " + app + " ::";
}
function statusCustom(msg) {
	statusBar.innerHTML = ":: " + msg + " ::";
}

/*********************** 
 *  STORE dragging functions
 ****************************/
var store = document.querySelector('#store');

addEvent(store, 'dragover', function(e) {
	if (e.preventDefault)
		e.preventDefault(); // allows us to drop
	this.style.border = '1px dashed #999';
	e.dataTransfer.dropEffect = 'copy';
	if (dragSrcEl.parentNode.className == "bin") {
		statusUnload(dragSrcEl.innerHTML);
	}
	return false;
});
addEvent(store, 'dragleave', function(e) {
	if (e.preventDefault)
		e.preventDefault(); // allows us to drop
	this.style.border = '1px solid #000';
	e.dataTransfer.dropEffect = 'copy';
	statusDefault();
	return false;
});

/* unload an app */
addEvent(store, 'drop', function(e) {
	if (e.stopPropagation)
		e.stopPropagation(); // stops the browser from redirecting...why???
	this.style.border = '1px solid #000';

	var el = dragSrcEl;
	if (el.parentNode.className == "bin") {
		unload_application(el.parentNode.id, dragSrcEl.id, dragSrcEl,
				unload_application_ok);
	}
	dragSrcEl = null;
	return false;
});
