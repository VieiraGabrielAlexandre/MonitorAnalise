$(function(){

	// Fix inputs with numeric IDs to work with labels -> PRTG-4511
	$(document).mousedown(function(event){
		if($(event.target).is('label')){
			var id=$(event.target).attr('for');
			if(id==id*1){
				$(event.target).attr('for','input_'+id);
				$('input[id='+id+']').id='input_'+id;
			}
		}
	})



});