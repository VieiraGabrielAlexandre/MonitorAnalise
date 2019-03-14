<div class="sunburst controls">
	<input type="checkbox" name="sunburstSizeSensors" class="hidden" id="sunburstSizeSensors"<*= (this.sizeSensors ? ' checked="checked"' : '')*> >
	<label for="sunburstSizeSensors" class="bold-text">
		<i class="icon-gray prtg-checkbox light"></i><*= _Prtg.Lang.sensorTree.strings.SizeBySensors*>
	</label>
	<input type="checkbox" name="sunburstSizePriority" class="hidden" id="sunburstSizePriority"<*= (this.sizePriority ? ' checked="checked"' : '')*> >
	<label for="sunburstSizePriority" class="bold-text">
		<i class="icon-gray prtg-checkbox light"></i><*= _Prtg.Lang.sensorTree.strings.SizeByPriority*>
	</label>
</div>
