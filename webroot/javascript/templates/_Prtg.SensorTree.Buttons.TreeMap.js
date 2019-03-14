<div class="treemap controls">
	<input type="checkbox" name="treemapSizeSensors" class="hidden" id="treemapSizeSensors"<*= (this.sizeSensors ? ' checked="checked"' : '')*> >
	<label for="treemapSizeSensors" class="bold-text">
		<i class="icon-gray prtg-checkbox light"></i><*= _Prtg.Lang.sensorTree.strings.SizeBySensors*>
	</label>
	<input type="checkbox" name="treemapSizePriority" class="hidden" id="treemapSizePriority"<*= (this.sizePriority ? ' checked="checked"' : '')*> >
	<label for="treemapSizePriority" class="bold-text">
		<i class="icon-gray prtg-checkbox light"></i><*= _Prtg.Lang.sensorTree.strings.SizeByPriority*>
	</label>
</div>
