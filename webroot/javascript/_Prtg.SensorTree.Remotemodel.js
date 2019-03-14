
(function ($) {
	var nodestates = ['none',
					'undefined',
					'collecting',
					'up',
					'warn',
					'down',
					'noprobe',
					'paused',
					'paused',
					'paused',
					'unusual',
					'paused',
					'paused',
					'downack',
					'partialdown'];
	function RemoteModel(options) {

		this.sensPerLine = 1;
		this.collapsedSensPerLine = 5;
		this.layout = '';
		this.filters = [];

		// private
		var opts,
		defaults = {
			objid: 'objid',
			level: 'probegroupdevice',
			ROOTID: 0,
			PRELOAD: 99999,
			TOTALCOUNT: 0,
			url: '/must/override',
			data: {
				start: 0,
				count: 0
			},
			postDataLoad: null,
			delay: 0
		},
    height,
		req = null, // ajax request
		lastTopRow = 0,
		lastBottom = 0,
		startLevel = 0,
		data = [],
		idxByObjId = {},
		nodes = {},
		rows = [],
		positions = [0],
		collapsed = {},
		dummyCell = $('<div class="slick-cell lr c0 treeColumn"/>'),
		refreshInProgress = false,
		self = this,
		treedepth = 0,

		onDataLoading = new Slick.Event(),
		onDataLoaded = new Slick.Event(),
		onHeightsChanged = new Slick.Event(),
		onPostDataLoaded = new Slick.Event(),
		onRowCountChanged = new Slick.Event(),

		opts = $.extend(true, {}, defaults, options),

		regObjects = /probe|group|device|sensor|library/,
		regRootObjects = /probe|group|device/,
		regParentObjects = /probe|group|library|device/,
		regLibObjectTypes = /filter|linked|node/,
		regPausedInfo = /paused/,
		regFixedInfo = /fixed/,
		regIsFavorite = /isfavorite/,
    regIsSmallProbe = /smallprobe/,
    regIsRemoteProbe = /remoteprobe/,
    regIsLocalProbe = /localprobe/,
    regIsPOD = /pod/,
		regTreeSizes = /tiny|small|medium|large/,
		regDisconnected = /disconnected/,
    regIsNotAutodiscoverable = /isnotautodiscoverable/;

    if(opts.hasOwnProperty('filters'))
      self.filters = opts.filters;

		function chaining() {
			var ret = [0],
				p = this.parent,
				sib;

			if (this.last)
				ret[0] = this.last._idx;

			while (!!p) {
				sib = p._siblings.last;
				if (!!sib)
					ret.unshift(sib._idx);
				else
					ret.unshift(0);
				p = p._siblings.parent;
			}
			return ret;
		}


		function updateSiblings(newData, prev) {
			var parent;
			newData._siblings = { parent: null, last: null, chain: chaining };
			newData._children = [];

			if (!!prev && newData._level > 1) {

				// deeper level
				if (newData._level > prev._level) {
					newData._siblings.parent = prev;
					newData._siblings.last = newData;
				//shallower level
				} else if (newData._level < prev._level) {
					parent = prev;
					while (!!parent._siblings.parent && parent._level !== newData._level) {
						parent = parent._siblings.parent;
					}
					if(!parent._nextSibling) parent._nextSibling = newData;
					newData._siblings = parent._siblings;
					newData._siblings.last = newData;
				//sames level
				} else {
					if(!prev._nextSibling) prev._nextSibling = newData;
					newData._siblings = prev._siblings;
					newData._siblings.last = newData;
				}

				parent = newData._siblings.parent;
				if (parent._children.length !== 0
				&& parent._classes.indexOf('haschildren') === -1)
					parent._classes.push('haschildren');
				parent._children.push(newData);
			}
		}
		function classify(d) {
			var paused = ($.inArray(d.status, [7, 8, 9, 11, 12]) !== -1)
				, pausedbyparent = paused && (regPausedInfo.test(d.info) === false); //&& (regPausedUntilInfo.test(d.info) === false);
			d._classes = null;
			d._classes = [];
			d._classes.push(d.basetype);

			regDisconnected.test(d.info) && d._classes.push('disconnected');
      regIsNotAutodiscoverable.test(d.info) && d._classes.push('isnotautodiscoverable');

      if(d.condition.indexOf('%') > -1) d._classes.push('autodisco');

			if (opts.treetype === 'library' && regObjects.test(d.basetype) === true)
				d._classes.push('librarymenu');
			if(!!d._parent && regRootObjects.test(d.basetype) === true)
				d._classes.push('fold-ignore');
			if(d.basetype === 'group' && d.groupnum + d.devicenum === 0){
				d._classes.push('notoggle');
				d._collapsed = false;
			}

			d._classes.push((d._collapsed ? 'collapsed' : 'expanded'));
			d._classes.push((regIsFavorite.test(d.favorite) === true ? 'isfavorite' : 'isnotfavorite'));

      if(regIsSmallProbe.test(d.info) === true){
        d._classes.push('smallprobe');
        d.smallprobe = true;
      }else if(regIsLocalProbe.test(d.info) === true){
        d._classes.push('localprobe');
      }else if(regIsRemoteProbe.test(d.info) === true){
        d._classes.push('remoteprobe');
      }
      if(regIsPOD.test(d.info) === true){
        d._classes.push('pod');
      }

			d._classes.push((
				paused
				? pausedbyparent
					? 'ispausedbyparent'
					: 'ispaused'
				: 'isnotpaused'));
			if (d[opts.level][d[opts.level].length - 2] === 2
				&& regFixedInfo.test(d.info) === true)
				d._classes.push('clusterprobedevice');
			d._classes.push((regFixedInfo.test(d.info) === true ? 'fixed' : ''));
			d._classes.push((!d._access ? 'noContextMenu' : ''));
			d._classes.push((d._access == false ? 'noaccess' : ''))
			var p = d;
			while (!!p && p.basetype !== 'probe') {
				p = p._siblings.parent;
			}
			if (!!p && p.condition !== _Prtg.Lang.sensorTree.strings.Connected)
				d._classes.push('offline');

      if(d.basetype !== 'device'
      && d.basetype !== 'library'
      && d._collapsed)
        d._loaderrors = (d['downsens']+d['downacksens']+d['partialdownsens'] <= _Prtg.Core.objects['sensor'].collapseSensorsCount['downs'] ? d['downsens']+d['downacksens']+d['partialdownsens'] : 0);

		}
		function updateNode(idx, newData, startLevel) {
			var d = data[idx];

			d._invalid = false;
			for (var i in newData) {
				if (newData.hasOwnProperty(i)) {
					if (!$.isArray(newData[i]) && d[i] !== newData[i]) {
						d._changed = true;
						d[i] = newData[i];
					}
				}
			}
			d.name = "" + newData.name;
			d._id = newData[opts.level].join('-');
			d._idx = idx;
			d._level = newData[opts.level].length - startLevel;
			d._access = newData.access || newData.access === "";

			updateSiblings(d, data[idx-1]);
			classify(d);

			if (d.hasOwnProperty('leafs'))
				d._updateLeafs = (!!newData.totalsens || newData.leafs === null);
			else
				!!d.errors && delete d.errors
			return d._changed;
		}

		function createNode(idx, newData, startLevel) {
			var parent
				, parents = null;
			newData.name = "" + newData.name;
			newData._id = newData[opts.level].join('-');
			idxByObjId[newData._id] = idx;
			newData._idx = idx;
			newData._invalid = false;
			newData._changed = true;
			newData._level = newData[opts.level].length - startLevel;
			treedepth = Math.max(newData._level, treedepth);
			newData._probe = 0;
			newData._group = 0;
			newData._device = 0;
			newData._library = 0;
			newData._access = newData.access || newData.access === "";
			newData._collapsed = !(!idx || !newData._access || newData.fold === false);
			newData._updateLeafs = false;

			if(!newData.libkind){
				if (newData.basetype === 'device') {
					newData.leafs = [];
				}
				if (newData.hasOwnProperty('leafs')) {
					newData._updateLeafs = (!!newData.totalsens || newData.leafs === null);
				}
			}
			newData._sensorcount = sensorCount;
			newData.estimatedHeight = estimateHeight;
			newData._colSpan = colSpan;

			updateSiblings(newData, data[idx-1]);
			classify(newData);

			data[idx] = newData;

			parents = newData[opts.level].slice(0);
			parents.pop();
			while (parents.length > 1) {
				parent = data[idxByObjId[parents.join('-')]];
				if (!parent)
					break;
				parent['_' + newData.basetype] += 1;
				parents.pop();
			}

			return;
		}
		function initializeData(from, junk, update, content) {
			var d = junk[content || opts.data.content],
				i = 0,
				l = d.length,
				ret, id,
				change = false,
				rowcountchange = false;

			if (data.length === 0) {
				data.length = junk['treesize'];
        if(data.length)
				  opts.startlevel = startLevel = d[0][opts.level].length - 1;
			}

			if (!!update) {
				_expandTemporary();
				while (i < l) {
					id = d[i][opts.level].join('-');
					if (idxByObjId.hasOwnProperty(id)) {
						if (idxByObjId[id] !== i + from) {
							change = true;
							data.splice(i + from, 0, data.splice(idxByObjId[id], 1)[0]);
							change = (updateNode(i + from, d[i], startLevel) || change);
							_idxByObjId();
						} else {
							change = (updateNode(idxByObjId[id], d[i], startLevel) || change);
						}
					} else {
						data.splice(i + from, 0, -1);
						createNode(from + i, d.slice(i, i + 1)[0], startLevel);
						_idxByObjId();
						data[i + from].estimatedHeight();
						data[i + from]._invalid = false;

						rowcountchange = true;
						change = true;
					}
					++i;
				}
				for (i = 0; i < data.length; ) {
					if (data[i]._invalid) {
						data.splice(i, 1);
					} else {
						rows[i] = i;
						++i;
					}
				}
				rows.length = data.length;
				positions.length = rows.length + 1;
				_idxByObjId();
				_collapseTemporary();
			} else {
				while (i < l) {
					createNode(from + i, d.slice(i, i + 1)[0], startLevel);
					rows.push(from + i);
					++i;
				}
			}
			ret = {
				from: from,
				to: from + d.length,
				update: !!update,
				change: change,
				rowcountchange: rowcountchange,
				treeDepth: treedepth
			};
			return ret;
		};

		function loadLibrary(grid) {
			var dfd = $.Deferred();
			_loadLibrary()
			.done(
				function loadLibrarySuccess(d) {
					var junk = d['library'];

					data = [];
					treedepth = 0;
					idxByObjId = {};
					nodes = {};
					grid._rows = rows = [];
					grid._positions = positions = [0];
					collapsed = {};

					$.when.apply($,opts.initLibraryData(junk)).always(function(){
						dfd.resolve(initializeData(0, d, false, 'library'));
					});
				}).fail(function loadLibraryError() {
					dfd.reject();
				});
			return dfd;
		}

		function loadData(f, t, d, b, o, x) {
			var dfd = new $.Deferred(),
				settings = o || opts,
				update;
			if (!!req) {
				if (req.abortable) {
					req.abort();
					req = null;
				} else {
					dfd.reject();
					return dfd;
				}
			}
			f = f < 0 ? 0 : f;
			t = !!data.length && t >= data.length ? data.length - 1 : t;


			while (f < t && !!data[f] && !data[f]._invalid && ++f);
			while (t > f && !!data[t] && !data[t]._invalid && --t);
			update = !!data[f] && !!data[t];
			if (f > t || (update && !data[f]._invalid && !data[t]._invalid)) {
				dfd.reject();
				return dfd;
			}
			onDataLoading.notify({ from: f, to: t });
			settings.data.start = f;
			settings.data.count = '*'; // t - f + 1;
			req = $.ajax({
				type: settings.type || 'GET',
				dataType: settings.dataType || 'text json',
				url: settings.url,
				data: settings.data,
				traditional: settings.traditional || false,
				cache: settings.cache || false,
				beforeSend: function(jqXHR){
					jqXHR.peNumber = 'PE1234'
				}
			}).done(function loadDataSuccess(ret) {
				req = null;
				if (!!x)
					dfd.resolve(initializeData(f, x(ret), update, settings.data.content));
				else
					dfd.resolve(initializeData(f, ret, update, settings.data.content));
			}).fail(function loadDataError() {
				dfd.reject();
			});
			req.from = f;
			req.to = t;
			req.abortable = !!d;
			return dfd;
		}

		//CRUD
		function refresh(grid, invalidate) {
			var dfd = null
				, vp = grid.getViewport()
				, top = vp.top
				, bottom = vp.bottom
				,i,l;
			if (refreshInProgress) {
				return $.when({});
			}
			refreshInProgress = true;
			if (opts.treetype === 'library') {
				dfd = loadLibrary(grid).done(function (args) {
					if (!!args && opts.postDataLoad && !!args.change) {
						vp = grid.getViewport();
						if (!!args.rowcountchange) {
							onRowCountChanged.notify(args, null, grid)
						} else if (!!invalidate || vp.top !== top || vp.bottom !== bottom) {
							grid.invalidate();
						} else {
							var column = grid.getColumns()[grid.getColumnIndex('tree')]
							for (i = vp.top; i <= vp.bottom; ++i)
								grid.updateCell(i, 0);
						}
					}
					onDataLoaded.notify(args, null, grid);
					refreshInProgress = false;
					dfd.resolve(args);
				});
			} else {
				for (i = 0, l = data.length; i < l; ++i) {
					data[i]._invalid = true;
				}

				dfd = loadData(0, data.length - 1).done(function (args) {
					if (!!args && opts.postDataLoad && !!args.change) {
						vp = grid.getViewport();
						if (args.rowcountchange) {
							onRowCountChanged.notify(args, null, grid)
						} else if (!!invalidate || vp.top !== top || vp.bottom !== bottom) {
							grid.invalidate();
						} else {
							var column = grid.getColumns()[grid.getColumnIndex('tree')]
							for (i = vp.top; i <= vp.bottom; ++i)
								grid.updateCell(i, 0);
						}
					}
					refreshInProgress = false;
					dfd.resolve(args);
					onDataLoaded.notify(args, null, grid);
				});
			}
			return dfd.promise();
		}
		function refreshLeafs(grid) {
			var vp = grid.getViewport();
			return opts.postDataLoad(grid, vp.top, vp.bottom, data, rows, idxByObjId, onPostDataLoaded, (vp.top - lastTopRow) || (vp.bottom - lastBottom)).always(function () {
				lastTopRow = vp.top;
				lastBottom = vp.bottom
			});

		}

		function getItemByRow(row) {
			return data[row];
		}
		function getItemByIndex(idx) {
			if (!data || !data[idx]) return;
			var l = data.length,
				i = 0, c = 0;
			while (i < l && (i < idx || data[i]._collapsed))
				if (data[i++]._collapsed)
					++c;
			return data[idx + c];
		}
		function getData(){
			return data;
		}
		function getPositionById(id) {
			return idxByObjId[id];
		}
		// function setPosition(id, pos) {
		// 	return $.ajax({
		// 		type: 'POST',
		// 		url: '/api/setposition.htm',
		// 		data: {
		// 			id: id,
		// 			newpos: pos
		// 		}
		// 	});
		// }
		function _moveNode(srcidx, dstidx, where) {
			var src = data[srcidx]
				, dst = data[dstidx]
				, pos = dst.position || _position(dstidx)
				, request = null;
			if (regFixedInfo.test(src.info) === false
			&&	(/group|library/.test(dst.basetype) === true
			|| (_parentId(srcidx) !== _parentId(dstidx)
				&& !_isParent(dstidx, srcidx)))) {
				if (dst.basetype === 'device') {
					pos = (where === 'after' || (!where && srcidx < dstidx))
						? _position(dstidx) + 1
						: _position(dstidx) - 1;
					dst = _parentData(dstidx);
				} else if (dst.basetype === 'library') {
					if (dst.libkind === 'node') {
						pos = 1;
					} else {
						dst = _parentData(dstidx);
						pos = _position(dstidx) - 1;
					}
				} else {
					pos = (where === 'insert' || (!where && srcidx < dstidx))
						? 1
						: (
							dst = _parentData(dstidx),
							_position(dstidx) +(where==='before'?-1:+1)
						);
				}
				request = _Prtg.api.move(src.objid, dst.objid)
					.then(_Prtg.api.position(src[opts.objid], pos));
			} else {
				if (_isParent(dstidx, srcidx)) {
					pos = 1;
				} else {
					pos = (where === 'after' || (!where && srcidx < dstidx))
						? _position(dstidx) + 1
						: _position(dstidx) - 1;
				}
				request = _Prtg.api.position(src[opts.objid], pos);
			}
			return request;
		}
		function moveNode(grid, srcid, dstid, where) {
			var dfd = $.Deferred();
			$.when(
				_moveNode(srcid, dstid, where)
			).then(
				function success() {
					if(!!data[srcid].leafs) data[srcid]._updateLeafs=true;
					if(!!data[dstid].leafs) data[dstid]._updateLeafs=true;
					dfd.resolve();
				},
				function error() {
					dfd.reject();
				}
			);
			return dfd.promise();
		}
		function cloneNode(grid, srcidx, dstidx, where){
			var src = data[srcidx]
				, pos = (where === 'insert' && data[dstidx].basetype !== 'device')
						? 1
						: (
							 (where === 'after' || (!where && srcidx < dstidx))
								? _position(dstidx) + 1
								: _position(dstidx) - 1
						)
				, dst = (
							data[dstidx].basetype === 'device'
							? data[dstidx]._siblings.parent
							: data[dstidx]
					)
				, dfd = $.Deferred()
				, _data = {
					id: src.objid,
					targetid: dst.objid
				};
			_Prtg.Dialogs.defaultDialog("/controls/duplicatedevicedialog.htm", _data)
				.done(function(result, action) {
					_data = $.extend(_data, result);
					return $.ajax({
							url: action,
							type: "POST",
							data: _data,
							dataType: 'json'
					}).done(function(d) {
							_Prtg.api.position(parseInt(d,10), pos).always(function(){
								dfd.resolve();
							});
					});
				}).fail(function(){
					dfd.reject();
				});
			return dfd.promise();
		}
		function _moveLeafe(row, srcid, dstid) {
			var id = data[row].leafs[srcid].objid
				, pos = (dstid[0] + 1) * 10;
			pos = srcid < dstid[0]
				? pos + 1
				: (dstid[0]++, pos - 1);

			return _Prtg.api.position(id, pos);
		}
		function moveLeafe(grid, idx, srcid, dstid) {
			srcid = typeof(srcid) === 'number' ? [srcid] : srcid;
			dstid = [dstid];
			var deferreds  = $.map(srcid, function(srcid){return _moveLeafe(idx, srcid, dstid);});
			return $.when.apply($,
					deferreds
				).then(function success() {
						var row = $.inArray(idx, rows);
						data[idx]._updateLeafs = true;
						opts.postDataLoad.apply(this, [grid, row, row, data, rows, idxByObjId, onPostDataLoaded]);
					}, function fails(){}
				);
		}
		function _cloneLeaf(srcid, name, dstid, pos){
			return $.ajax({
				type:'POST',
				url: "duplicateobject.htm",
				data: {
					"id": srcid,// data[srcrow].leafs[srcid].objid,
					"targetid": dstid, //data[dstrow].objid,
					"name": name,// $("#duplicatesensorname").val(),
					"giveid": "1",
					"position": (pos  * 10 + 1)
				},
				dataType: "text"
			});
		}
		function cloneLeaf(grid, srcrow, dstrow, srcid, dstid) {
			var pos = (dstid + 1) * 10 + 1
				,	dfd = $.Deferred()
				,	tarid = data[dstrow].objid
				, deferreds  = $.map((typeof(srcid) === 'number' ? [srcid] : srcid), function(srcid){
					return _cloneLeaf(data[srcrow].leafs[srcid].objid, data[srcrow].leafs[srcid].name, tarid, dstid++);
				});
			return $.when.apply($,deferreds)
				.done(function success(response) {
					var row = $.inArray(dstrow, rows)
						, item = data[dstrow];
					item._updateLeafs = true;
					opts.postDataLoad.apply(this, [grid, row, row, data, rows, idxByObjId, {
						notify: function notifyMoveLeafe(ready) {
							$.each(nodestates, function (key, val) { item[val + 'sens'] = 0; });
							item.totalsens = 0;
							$.each(data[dstrow].leafs, function (e, i) {
								item[nodestates[i.status] + 'sens'] += 1;
								item.totalsens++;
							});
							onPostDataLoaded.notify(ready, null, grid);
						}}]);
				}).fail(function fail(){});
		}
		function createLeafe(newData) {
			var node = newData[opts.level].slice(0);
			node.pop();
			node = data[idxByObjId[node.join('-')]];
			node.leafs.push(newData);
		}
		function deleteData(idx) {
			idx = idxByObjId[idx] || idx;
			data.splice(data[idx], 1);
			_idxByObjId();
		}

		function updateData(idx, newData) {
			idx = idxByObjId[idx] || idx;
			updateNode(idx, newData, opts.startLevel);
		}

		function _loadLibrary() {
			return $.ajax($.extend(true, {
				data: {
					id: data[0].objid
				}
			}, _Prtg.Core.objects.library));
		}

		function _addLibrary(targetid, linkedid) {
			return $.ajax({
				type: 'GET',
				dataType: 'json',
				url: '/api/libraryname.json',
			}).then(function(ret){
        var nextname = '';
        if (linkedid === -1) {
          nextname =ret.groupname;
        } else {
          nextname =ret.nodename;
        }
        return $.ajax({
          type: 'POST',
          url: 'editsettings',
          dataType: 'json',
          data: {
            ajaxrequest: 1,
            objecttype: 'library',
            targetid: targetid,
            linkedid_: linkedid,
            name_: nextname,
            id: 'new',
            targeturl: ''
          }
        });
      });
		}
		function addLibrary(grid, targetid, objid, dstrow, initLibraryData) {
			return _addLibrary(targetid, objid)
				.then(function(d){return _Prtg.api.position(d.objid, 1)})
				.then(function(d){return refresh(grid,true)});
		}

		//Filter
		function toggleFilter(filterType) {
			var pos = $.inArray(filterType, self.filters);
			if (pos === -1)
				self.filters.push(filterType);
			else
				self.filters.splice(pos, 1);
			try {
				if(self.filters.length > 0)
					window.sessionStorage.setItem('sensorfilter', self.filters);
				else
					window.sessionStorage.removeItem('sensorfilter');
				} catch (e) { }
			for (var i = 0; i < data.length; ++i)
				data[i].estimatedHeight();
		}
		function Filter(){
			var filter = (self.filters.length === 0) || new RegExp(self.filters.join('|'));
			return filter;
		}
		function senscorCountDevice(item, filter) {
			var count = 0;
			$.each(_Prtg.Core.objects.sensor.sensorTypesValues, function (key, val) {
				if (filter === true || filter.test(key) === false) {
					count += item[key + 'sens'];
				}
			});
			return count+1;
		}
		function sensorCountCollapsed(item, filter) {
			var count = 0;
			$.each(_Prtg.Core.objects.sensor.sensorTypesValuesCollapsed, function (key, val) {
				if ($.isPlainObject(val)) {
					var sum = 0, sum2 = 0;
					$.each(val, function (k, v) {
						if (filter === true || filter.test(k) === false) {
							sum += item[k + 'sens'];
							sum2 += item[k + 'sens'] > 0 ? 1 : 0;
						}
					});
					if (sum > 0) {
						if (regParentObjects.test(item.basetype) === true
						&& sum <= _Prtg.Core.objects.sensor.collapseSensorsCount[key])
							count += sum;
						else
							count += sum2;
					}
				} else {
					if (filter === true || filter.test(key) === false)
						count += item[key + 'sens'] > 0 ? 1 : 0;
				}
			});
			return count;
		}

		function sensorCount(element) {
			var item = element || this
				, collapsed = self.layout === 'tiny'
				, filter = Filter();
			if (item.basetype === 'library') {
				if (item.libkind === 'filter') {
					if (item._collapsed || collapsed) {
						return sensorCountCollapsed(item, filter);
					} else {
						return senscorCountDevice(item, filter);
					}
				} else {
					if (item._collapsed || collapsed)
						return sensorCountCollapsed(item, filter);
					else
						return 0;
				}
			} else if (item._collapsed || collapsed) {
				return sensorCountCollapsed(item, filter);
			} else if (item.basetype === 'device') {
				return senscorCountDevice(item, filter);
			}
			return 0;
		}

		function foldObject(data) {
			$.ajax({
				type: 'POST',
				url: '/api/foldobject.htm',
				data: {
					id: data.objid,
					fold: data._collapsed ? 2 : 1
				},
				error: function(){}
			});
		}
		function toggleLocal(idx, grid){
			onRowCountChanged.notify(_toggle(idx), null, grid);
		}
		function toggle(idx, grid) {
			onRowCountChanged.notify(_toggle(idx), null, grid);
			foldObject(data[rows[idx]]);
		}
		function _toggle(idx) {
			idx = parseInt(idx);
			var from = idx,
				l = rows.length,
				count = 0,
				nrows = [],
				i = 0,
				collapse = { positions: [], rows: [] };
			idx = rows[idx];
			data[idx]._collapsed = !data[idx]._collapsed;
			classify(data[idx]);
			data[idx]._changed = true;
			data[idx].estimatedHeight();
			if (data[idx]._collapsed) {
				i = from;
				while (++i < l && _isChild(idx, rows[i])) {
					++count;
				}
			}

			if (!!collapsed[data[idx]._id]) {
				collapse = collapsed[data[idx]._id];
				count = collapse.rows.length;
				collapse.rows.unshift((from + 1), 0);
				collapse.positions.unshift((from + 1), 0);
				rows.splice.apply(rows, collapse.rows);
				positions.splice.apply(positions, collapse.positions);
				delete collapsed[data[idx]._id];
			} else if (count) {
				nrows.unshift(from + 1, count);
				collapse.rows = rows.splice.apply(rows, nrows);
				collapse.positions = positions.splice.apply(positions, nrows);
				collapsed[data[idx]._id] = collapse;
			}
			return { from: from, to: from + count };
		}

		function _doCollapsed(from, to, grid, silent) {

			while (to >= from) {
				var d = data[rows[to]];
				if (!!d && d._collapsed && !collapsed[d._id]) {
					d._collapsed = false;
					if (d._id !== data[0]._id)
						_toggle(to);
				}
				to--;
			}
			if (!silent)
				onRowCountChanged.notify({ from: from }, null, grid);
			return;
		}
		function _expandTemporary() {
			var collapse = null;
			for (var i = 0; i < rows.length; ++i) {
				if (collapsed.hasOwnProperty(data[rows[i]]._id)) {
					collapse = collapsed[data[rows[i]]._id];
					collapse.rows.unshift((i + 1), 0);
					collapse.positions.unshift((i + 1), 0);
					rows.splice.apply(rows, collapse.rows);
					positions.splice.apply(positions, collapse.positions);
					delete collapsed[data[rows[i]]._id];
				}
			}
		}

		function _collapseTemporary() {
			var to = rows.length - 1;
			while (to >= 0) {
				var d = data[rows[to]];
				if (!!d && d._collapsed && !collapsed[d._id]) {
					d._collapsed = false;
					if (/treemap|sunburst/.test(self.layout.toLowerCase())===true || d._id !== data[0]._id)
						_toggle(to);
				}
				to--;
			}
		}
		//
		function _position(idx) {
			var pidx = _parentId(idx),
				pos = 1;
			for (var i = pidx; i < idx; ++i)
				if (_parentId(i) === pidx)
					++pos;
			return pos * 10;
		}
		function _parentData(idx) {
			return data[_parentId(idx)];
		}
		function _parentId(idx) {
			var parents = data[idx][opts.level].slice(0);
			parents.pop();
			return idxByObjId[parents.join('-')];
		}
		function _isParent(parentIdx, childIdx) {
			if (!data[childIdx] || !data[parentIdx]) return false;
			var parents = data[childIdx][opts.level];
			return parents[parents.length - 2] === data[parentIdx][opts.objid];
		}
		function _isChild(parentIdx, childIdx) {
			if (!data[childIdx] || !data[parentIdx]) return false;
			var parentpath = data[parentIdx]._id + '-';
			return data[childIdx]._id.substr(0, parentpath.length) === parentpath;
		}
		function _lastChild(idx) {
			var i = idx;
			while (_isChild(idx, i)) ++i;
			return i;
		}
		function _lastSibling(idx) {
			var pidx = _parentId(idx),
				i = idx;
			level = data[i]._level;
			while (_isChild(pidx, i) && data[i]._level === level) ++i;
			return i - 1;
		}
		function _hasChildren(idx) {
			return _isChild(idx, idx + 1);
		}
		function _idxByObjId() {
			var i = 0, l = data.length;
			idxByObjId = {}
			if (!!l) {
				while (i < l) {
					idxByObjId[data[i]._id] = i;
					++i;
				}
			}
		}

		function _isCollapsed(idx) {
			if (!data[idx]) return false;
			var parents = data[idx][opts.level].slice(0),
				d;
			parents.pop();
			while (parents.length > 1) {
				d = data[idxByObjId[parents.join('-')]]
				if (d && !!d._collapsed)
					return true;
				parents.pop();
			}
			return false;
		}

		function _find(value, type, result) {
			var t = type,
				res = result
			req = $.ajax({
				global: false,
				url: '/api/search.htm',
				dataType: 'json',
				data: {
					output: 'json',
					columns: 'basetype,probegroupdevice=treejson,name,position',
					noraw: 1,
					maxcount: 9999,
					count: '*',
					sortby: 'probegroupdevice',
					searchtype: type,
					searchtext: value
				}
			}).done(function (dd) {
				dd['multiobj'] = $.merge(dd['multiobj'], res['multiobj']);
			}).fail(function (dd) {
				dd['multiobj'] = $.merge(dd['multiobj'] || [], res['multiobj']);
			});
			return req;

		}
		function find(value) {
			var pipe = null;
			$.each('probenode group device sensor'.split(' '), function (i, e) {
				var type = e;
				if (!!pipe) {
					pipe = pipe.pipe(
					function (d) { return _find(value, type, d); },
					function (d) { return _find(value, type, d); }
				);
				} else {
					pipe = _find(value, type, { multiobj: [] });
				}
			});
			return pipe;
		}
		function ensureVisible(idx, grid) {
			var obj = data[idx],
				coll = [];

			while (!!obj) {
				if (!!collapsed[obj._id] || obj._collapsed) {
					coll.unshift(obj._idx);
				}
				obj = obj._siblings.parent;
			}
			for (var i = 0; i < coll.length; ++i)
				onRowCountChanged.notify(_toggle($.inArray(coll[i], rows)), null, grid);
			return $.inArray(idx, rows);
		}

		function switchLayout(x) {
			if (self.layout !== x) {
				self.layout = x;
				opts.layout = x;
				for (var i = 0; i < data.length; ++i)
					data[i].estimatedHeight();
			}
		}
		function estimateHeight(sensCountDelta) {
			if(self.sensorHeights === true) return 0;
			var sensors = 0,
				libbasetypes = {filter:'device',node:'node',linked:'group'},
				sensPerLine = this._collapsed? self.collapsedSensPerLine:self.sensPerLine,
				clp = [0,self.sensorHeights.length-1],
				basetype = ('library' === this.basetype ? libbasetypes[this.libkind] : this.basetype);

			sensCountDelta = sensCountDelta || 0;

			if (this._collapsed  || 'device' === basetype) {
				sensors = sensorCount(this) + sensCountDelta;

				if('device' === basetype) {
                    sensors = sensorCount(this) + sensCountDelta+1;
				}

				if (sensors > 0) {
						height = Math.ceil(sensors / sensPerLine) * self.sensorHeights[clp[0+this._collapsed]][basetype];
                    	height +=  self.sensorHeights[clp[0+this._collapsed]]['margin'];
				} else {
						height = self.sensorHeights[1][basetype];
				}
			}
			else {
				height = self.sensorHeights[clp[0+this._collapsed]][basetype];
			}

			if(sensors===0 && (this.totalsens + this.groupnum + this.devicenum === 0) && this._access)
				switch (this.basetype) {
					case 'group':
					case 'library':
          			case 'probe':
						height = (opts.editMode === false ? {tiny:50,small:50,medium:50,large:50}[self.layout] : height);
						break;
					case 'device':
						height = (opts.editMode === false ? {tiny:26,small:26,medium:26,large:42}[self.layout] : height);
                        height +=  self.sensorHeights[clp[0+this._collapsed]]['margin'];
						break;
					default:
						break;
				}

			this._estimatedHeight = height;
			this._changed = false;
			return this._estimatedHeight;
		}
		function colSpan(item) {
			var rowData = item || this,
			layout = self.layout !== 'tiny';
			return (!!rowData
					&& (
					(!!layout
						&& (rowData.basetype === 'device'
						|| rowData._sensorcount() > 0
						|| (rowData._collapsed && rowData.totalsens + rowData.groupnum + rowData.devicenum === 0))
					||
					(!layout
						&& (rowData.basetype === 'device'
						|| rowData._collapsed))
					)
					||
					(rowData.basetype === 'group'
					&& rowData._collapsed)
					||
					(rowData.basetype === 'library'
					&& (rowData.libkind === 'filter' || rowData._collapsed)))
					? 1 : opts.columns.length
      );
		}


		// slick grid functions
		function getSize() {
			return data.lenght;
		}
		function getLength() {
			return rows.length;
		}
		function getItem(idx) {
			return data[rows[idx]];
		}
		function getItemsByName(name){
			var ret=[];
			for(var i=0, l=data.length; i < l; ++i)
				if(data[i].name === name)
					ret.push(data[i]);
			return ret;
		}
		function setLeafs(d) {
			for (var i = 0, l = d.lengt; i < l; ++i) {
				node = d[i].probegroupdevice.slice(0);
				node.pop();
				node = data[idxByObjId[node.join('-')]];
				if (!!node._updateLeafs) {
					node.leafs = [];
					node._updateLeafs = false;
				}
				node.leafs.push(d[i]);
			}
		}

		return {

			// grid methods properties
			"getItem": getItem,
			"getLength": getLength,
			"getSize": getSize,
			"postDataLoad": null,

			// methods
			'collapse': _doCollapsed,
			'estimateHeight': estimateHeight,
			'find': find,
			'initializeData': initializeData,
			'isChild': _isChild,
			'isParent': _isParent,
			"lastChild": _lastChild,
			"loadData": loadData,
			"refreshLeafs": refreshLeafs,
			//			"reloadData": reloadData,
			'toggle': toggle,
			'toggleLocal': toggleLocal,

			//properties
			'treeDepth': function () { return treedepth },
			'dynPositions': positions,
			'layout': switchLayout,

			'toggleFilter': toggleFilter,
			'Filter': Filter,
			'Filters': function(){return self.filters;},
			'sensPerLine': function (x) { self.sensPerLine = x; },
            'collapsedSensPerLine': function (x) { self.collapsedSensPerLine = x; },
			'sensorHeights': function (heights) { self.sensorHeights = heights; },
			'visibleRows': rows,

			// CRUD methods
			"createNode": createNode,
			"deleteData": deleteData,
			"getItemByRow": getItemByRow,
			"getItemByIndex": getItemByIndex,
			"getItemsByName" : getItemsByName,
			"getPositionById": getPositionById,
			"Data": getData,
			"setLeafs": setLeafs,

			//"updateData": updateData,
			"refresh": refresh,
			// NODE Methods
			"addLibrary": addLibrary,
			"cloneLeaf": cloneLeaf,
			"cloneNode": cloneNode,
			"ensureVisible": ensureVisible,
			"moveLeafe": moveLeafe,
			"moveNode": moveNode,
			// events
			"onDataLoading": onDataLoading,
			"onDataLoaded": onDataLoaded,
			"onHeightsChanged": onHeightsChanged,
			"onPostDataLoaded": onPostDataLoaded,
			"onRowCountChanged": onRowCountChanged
		};
	}

	// Slick.Data.RemoteModel
	$.extend(true, window, { Slick: { Data: { RemoteModel: RemoteModel}} });
})(jQuery);
