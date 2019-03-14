/* _Prtg.fileHandler.Plugin.js */
(function fileHandlerPlugin($, window, document, undefined) {

	var pluginName = 'prtg-fileHandler';

	function fileHandler(element, data, parent) {
		this.data = data;
		this.el = (!(element instanceof jQuery)) ? element : element[0];
		this.$el = (!(element instanceof jQuery)) ? $(element) : element;

		this.init();
	}

	fileHandler.prototype.init = function init() {

		if (this.$el.is('input') && this.$el.attr('type') == 'file') {
			fileUpload.call(this);
		} else if (this.$el.is('button') || this.$el.is('a') || this.$el.is('input') && this.$el.attr('type') == 'button') {

			var _this = this;

			this.$el.click(function click(evt) {

				var fileData = '';

				if ($(_this.data.filedata).length) {
					fileData = $(_this.data.filedata).html() || $(_this.data.filedata).val();
				} else if (_this.data.filedata in window && typeof window[_this.data.filedata] === 'function') {
					fileData = window[_this.data.filedata].call(_this, _this);
				} else {
					fileData = _this.data.filedata;
				}

				fileSave.call(_this, _this.data.filename, fileData);
			});
		}
	};

	var fileSave = function fileSave(fileName, data) {

		var blob = new Blob([data], { type: 'text/plain' });
		if (window.navigator.msSaveOrOpenBlob) {
			this.$el.click(function (e) {
				window.navigator.msSaveOrOpenBlob(blob, fileName);
				e.preventDefault();
			});
		} else {
			this.el.download = fileName;
			this.el.href = window.URL.createObjectURL(blob);
		}
	};

	var fileUpload = function fileUpload() {

		this.$el.hide();

		var id = this.$el.attr('id');

		if (!id) {
			id = randomId();
			this.$el.attr('id', id);
		}

		var presetValue=this.$el.attr('value');
		var fileNameLabel = $('<label class="fileHandlerTextLabel" for="' + id + '">'+(presetValue?presetValue:'')+'</label>').insertAfter(this.$el);
		var fakeButtonLabel = $('<label for="' + id + '" class="fileHandlerButtonLabel actionbutton"></label>').html(this.$el.attr('defaultValue')).insertAfter(this.$el);

		var _this = this;

		this.$el.change(function change(evt) {
			$(this).parent().removeClass('fileHandler-validateerror-field');
			$('.fileHandler-validateerror-text').remove();

			var file = {};

			if ('files' in evt.target && evt.target.files.length > 0) {
				file = evt.target.files[Object.keys(evt.target.files)[0]];
			} else {
				updateLabel(fileNameLabel, "");
				return
			}

			if (!('name' in file)) {
				return validError(this, _Prtg.Lang.FileHandler.strings.loadError);
			}

			var valid = 1;

			valid &= checkFileSize(file, _this, this);
			valid &= checkFileType(this);
			updateLabel(fileNameLabel, file.name);

			if (('filecontent' in _this.data) && $(_this.data.filecontent).length) {
				if (valid) {
					fileContent(file, _this.data.filecontent);
				} else {
					$(_this.data.filecontent).html('');
				}
			}

		});

	};

	var validError = function validError(el, text) {
		var $parentControl = $(el).parent();
		$parentControl.addClass('fileHandler-validateerror-field');
		$parentControl.append(
			$('<div id="' + el.name + '-error" class="fileHandler-validateerror-text">' + text + '</div>')
		);
		return false;
	};

	var checkFileSize = function checkFileSize(file, _this, uploadInput) {
		if (file && 'size' in file && file.size > _this.data.max) {
			return validError(uploadInput, _Prtg.Lang.FileHandler.strings.maxSize.printf({ max: (_this.data.max >> 20) }));
		}
		return true;
	};

	var checkFileType = function checkFileType(uploadInput) {
		var ext = '.' + uploadInput.value.split('.').pop().toLowerCase();
		if ($(uploadInput).attr('accept')) {
			var allowed = $(uploadInput).attr('accept').replace(/ /g, '').split(',');
			if (!~allowed.indexOf(ext)) {
				validError(uploadInput, _Prtg.Lang.FileHandler.strings.wrongExt);
				return false;
			}
		}

		return true;
	};

	var updateLabel = function updateLabel(fileNameLabel, fileName) {
		if (fileName.length > 60) fileName = '...' + fileName.substring(fileName.length - 60);
		fileNameLabel.html(fileName);
	};

	var fileContent = function fileContent(file, target) {

		var reader = new FileReader();

		reader.onload = function onload(evt) {
			$(target).val(evt.target.result);
		};

		reader.onerror = function onerror() {
			$(target).val('');
		};

		reader.readAsText(file);
	};

	var randomId = function randomId() {
		var id = Math.random().toString().replace('0.', 'ID');
		while (document.getElementById(id) !== null) {
			id = Math.random().toString().replace('0.', 'ID');
		}
		return id;
	};

	_Prtg.Plugins.registerPlugin(pluginName, fileHandler);
})(jQuery, window, document);

