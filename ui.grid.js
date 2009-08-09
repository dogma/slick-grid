/*
 * Coversion of slick-grid for jQuery to a proper ui widget.
 * 
 * 
 * Format for columns:
 * {
 * 		id: columnid, //The id of this column
 * 		title: "The columns visible name",
 * 		field: fieldid, //The data field that the column renders
 * 		width: number, //The starting width of the column (default 100)
 * 		align: 'left'||'right'||'center', //Which way should the cell's content be aligned.
 * }
 */
(function($) {
	var css = {
			body: 'ui-grid-body',
			innerBody: 'ui-grid-innerBody',
			header: 'ui-grid-header',
			innerHeader: 'ui-grid-innerHeader',
			column: 'ui-grid-column',
			columnHeader: 'ui-grid-column-header',
			cell: 'ui-grid-cell'
		};
		
	var columnDef = '<div class="'+css.column+'"></div>';
	var columnHeaderDef = '<div class="'+css.columnHeader+'"></div>';
	var cellDef = '<div class="'+css.cell+'"></div>';
	
	var column = {
		_init: function () {
			var col = $(columnDef);
			this.element.id = this._getData('cssSelector');
			
			var head = $(columnHeaderDef);
			this._setData('head',head);
			this._setData('cellCache',[]);
			this._setData('currentCells',[]);
			
			head.id = this._getData('cssSelector')+'-head';
			$(head).html(this._getData('title'));
			$(head).css('float','left');
			$(head).css('display','inline-block');
			$(head).css('outline','0');
			$(head).css('text-align','center');
			
			$(this.element).css('float','left');
			$(this.element).css('display','inline-block');
			$(this.element).css('overflow','hidden');
			$(this.element).css('position','relative');
			this.width(this._getData('width'));
			
			//Here create a temporary cell and attach it to the body to get it's
			//component sizes...
			var tDiv = document.createElement('div');
			var iDiv = document.createElement('div');
			iDiv.className = css.cell;
			tDiv.appendChild(iDiv);
			document.body.appendChild(tDiv);
			this._setData('extraHeight',tDiv.clientHeight);
			this._setData('finalHeight',this._getData('rowHeight') - this._getData('extraHeight'));
			tDiv.parentNode.removeChild(tDiv);
		},
		clear: function () {
			$(this.element).empty();
		},
		body: function () {
			return this.element;
		},
		header: function () {
			var head = this._getData('head');
			return head;
		},
		width: function (width) {
			if(width !== null) {
				$(this.element).width(width);
				$(this._getData('head')).width(width);
			} else {
				return $(this.element).width();
			}
		},
		view: function (view) {
			var cells = $(this.element).children();
			var currentCells = this._getData('currentCells');
//			console.log(currentCells);
			console.log("Column: "+this._getData('id'));
			for(var c in currentCells) {
				if(view.first > c || view.last < c) {
					this.remove(c);
				}
			}
//			console.log("Reduced");
//			this.element[0].innerHTML = "";
			//Get First position...
			var topCell = this.element[0].firstChild;
			var topPosition = topCell ? topCell.row : 0;
			console.log(topPosition);
			
			for(var i = view.first; i < view.last; i++) {
				if(topPosition > i) {
					console.log("Running top insert");
					this.addrow(i,true); 
				} else {
					this.addRow(i);
				}
			}
//			console.log("Added");
			this.element[0].style.top = view.first*this._getData('rowHeight');
		},
		addRow: function (i,position) {
			var currentCells = this._getData('currentCells');
			var cellCache = this._getData('cellCache');
			if(i in currentCells) {
				console.log("Already present");
				return;
			}
			
			console.log("progressing");
			var cell = null;
			if(! i in cellCache) {
				this.buildCell(i);
			}

//			console.log("STUFF");
//			console.log(this.element);
//			console.log(this.element[0])
			console.log("adding");
			this._addChild(cellCache[i],cellCache[i+1]);

			cellCache[i].style.height = this._getData('finalHeight');

			currentCells[i] = cellCache[i];
		},
		_addChild: function (child,before) {
			if(before != undefined) {
				console.log("Adding to start");
				this.element[0].insertBefore(child,before);
			} else {
				console.log("bottom");
				this.element[0].appendChild(child);
			}
		},
		buildCell: function (i) {
			var cell = document.createElement('div');
			var val = this._getData('data')[i][this._getData('field')];
			
//			var cell = $(cellDef);
			cell.innerHTML = ( val != undefined ? val : "&nbsp;");
			cell.id = 'ui-cell-'+this._getData('id')+'-'+i;
			cell.row = i;
			cell.style.textAlign = this._getData('align');
			cell.style.display = 'block';
			cell.style.overflow = 'hidden';
			cell.style.margin = '0px';
			cell.className = css.cell;
//
			this._getData('cellCache')[i] = cell;
//			return cell;
		},
		remove: function (record) {
//			$(this.element).remove('.ui-cell-'+this._getData('id')+'-'+record);
			this.element[0].removeChild(this._getData('currentCells')[record]);
			delete this._getData('currentCells')[record];
		},
		clear: function () {
			$(this.element).empty();
		}
	}
	
	$.widget("ui.gridColumn",column);
	$.extend($.ui.gridColumn,{
		version: "0.1",
		defaults: {
			width: 100,
			title: "not set",
			align: 'left',
			rowHeight: 25,
			data: null
		}
	});
	$.ui.gridColumn.getter = ["width","body","header"];
	
	var def = '<div style="overflow: hidden;" class="ui-grid-header">'
		+'<div style="width: 10000px;" class="ui-grid-innerHeader"></div></div>'
		+'<div style="overflow: scroll;" class="ui-grid-body">'
		+'<div style="width: 10000px; border: 0px; display: inline-block; margin: 0px; padding: 0px;" class="ui-grid-innerBody">'
		+'</div></div>';
	
	var grid = {
		_init: function () {
		console.log("Building");
			var gid = "uigrid_" + Math.round(1000000 * Math.random());
			this._setData('gid',gid);
			var self = this;
			var inner = $(def);
			$(self.element)
				.empty()
				.append(inner)
				.attr("tabIndex",0)
				.attr("hideFocus",true)
				.css("outline",0)
				.addClass(gid);
			
			var body = $(self.element).find('.'+css.body+':first');
			this._setData('el_body',body);
			var header = $(self.element).find('.'+css.header+':first');
			this._setData('el_header',header);
			var innerBody = $(self.element).find('.'+css.innerBody+':first');
			this._setData('el_innerBody',innerBody);
			var innerHeader = $(self.element).find('.'+css.innerHeader+':first');
			this._setData('el_innerHerader',innerHeader);
			
			this._setData('viewport',{
				body: $(body).position(),
				innerBody: $(innerBody).position()
			});
			
			$(innerHeader).css('position','relative');
			
			if(this._getData('height') != null) {
				$(this.element).height(this._getData('height'));
			} else {
				this._setData('height',$(this.element).height());
			}
			
			if(this._getData('width') != null) {
				$(this.element).width(this._getData('width'));
			} else {
				this._setData('width',$(this.element).width());
			}
			
			$(body).height(
					$(self.element).height()
					-$(header).outerHeight()
					-parseInt($(body).css('border-top-width'))
					-parseInt($(body).css('border-bottom-width'))
			);
			
			this._setData('header',header);
	
			var headerOffset = $(innerHeader).position();
			var tempOffset = $(header).position();
			headerOffset.top -= tempOffset.top;
			headerOffset.left -= tempOffset.left;
			
			self._setData('headerOffset',headerOffset);
			this._setData('currentView',this._visibleRecords());

			$(body).bind('scroll',function () {
				p = $(innerBody).position();
				$(innerHeader).css('left',p.left-$(header).position().left-headerOffset.left);
				self._adjustColumns();
			});
			
			var columns = self._getData('columns');
			for(var i in columns) {
				self._addColumn(columns[i]);
			}
			
			this._setColumnHeight();
			this.render();
		},
		_adjustColumns: function () {
			var columns = this._getData('columnArr');
			currentView = this._getData('currentView');
			vp = this._visibleRecords();
			
			if(vp.first == currentView.first && vp.last == currentView.last) {
				return;
			}
			
			console.log(currentView);
			console.log(vp);

			for(var k in columns) {
				$(columns[k]).gridColumn('view',vp);
			}
			
			console.log("Here");
			this._setData('currentView',vp);
			
		},
		_addColumn: function (columnOpts, after) {
			var col = $(columnDef);
			columnOpts.cssSelector = this._getData('gid')+"-column-"+column.id
			columnOpts.rowHeight = this._getData('rowHeight');
			columnOpts.data = this._getData('data');
			$(col).gridColumn(columnOpts);
			
			columns = this._getData('columnArr');
			columns.push(col);
			console.log(columns.length);
			
			var innerBody = $(self.element).find('.'+css.innerBody+':first');
			$(innerBody).append($(col).gridColumn('body'));
			var innerHeader = $(self.element).find('.'+css.innerHeader+':first');
			$(innerHeader).append($(col).gridColumn('header'));
			this._updateBodyWidth();
		},
		_setColumnHeight: function () {
			var body = this._getData('el_body');
			var buffer = this._getData('buffer')*2*this._getData('rowHeight');
			
			for(var k in columns) {
				$(columns[k]).height(buffer+body.height());
			}
		},
		_buildData: function () {
			var data = this._getData('data');
			var columns = this._getData('columnArr');
			vp = this._visibleRecords();
			
			for(var i = vp.first; i < vp.last; i++) {
				for(var k in columns) {
					$(columns[k]).gridColumn('add',data[i]);
				}
			}
			
			//Update the 'actual' height of the view port...
			var recordHeight = this._getData('rowHeight');
			var dataHeight = recordHeight*data.length;
			console.log("Total height: "+dataHeight);
			$(this.element).find('.'+css.innerBody).height(dataHeight);
		},
		_visibleRecords: function () {
			vp = this._getData('viewport');

			var body = this._getData('el_body');
			
			var scrollTop = body[0].scrollTop;
			var rowHeight = this._getData('rowHeight');
			
			var firstRecord = Math.floor(scrollTop/rowHeight);
			firstRecord = firstRecord < 0 ? 0 : firstRecord;
			firstRecord = this._getData('data').length < firstRecord ? this._getData('data').length : firstRecord; 
			var lastRecord = Math.floor(((scrollTop+$(this.body).height())/rowHeight));
			lastRecord = this._getData('data').length > lastRecord ? lastRecord: this._getData('data').length; 

//			console.log("f:"+firstRecord+", l:"+lastRecord+", o:"+(scrollTop % rowHeight));
			var currentView = {
				first: firstRecord,
				last: lastRecord,
				offset: scrollTop % rowHeight
			};
			
			return currentView;
		},
		_clearGrid: function () {
			
		},
		_addRecord: function (record) {
			
		},
		_updateBodyWidth: function () {
			var bodyWidth = 0;
			var body = $(self.element).find('.'+css.body+':first');
			var innerBody = $(self.element).find('.'+css.innerBody+':first');
			
			$(body).find('.'+css.column).each(function (el) {
				bodyWidth += $(this).outerWidth();
			});

			$(innerBody).width(bodyWidth);
		},
		render: function () {
			this._buildData();
		}
	};
	
	$.widget("ui.grid",grid);
	
	$.extend($.ui.grid,{
		version: "0.1",
		defaults: {
			buffer: 5,
			columns: [], //Column definitions. This is passed to each column (along with rowHeight)
			columnArr: [],
			data: null,
			currentRecord: 0,
			hOffset: { // Is used to keep the header properly aligned with the body columns
				top: 0,
				left: 0
			},
			rowHeight: 25,
			height: null,
			width: null
		}
	});

})(jQuery);