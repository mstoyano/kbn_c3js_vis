export default function (kibana) {
	
	return new kibana.Plugin({
		uiExports: {
			visTypes: [
				'plugins/k5p-c3/c3_vis'
      		]
    	}
  	});
};