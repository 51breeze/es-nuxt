const path = require('path');

console.log( process.cwd() );


module.exports = {
	cwd:path.join(__dirname, './test'),
	workspace:"src",
	annotations:['Redirect'],
	metadata:{
		http:{
			responseField:'data'
		}
	},
	scopes:[
		{
			name:'es-thinkphp',
			inherits:['es-php'],
			include:[
				/([\\\/]|^)api([\\\/])/
			],
		},
		{
			name:'es-vue',
			inherits:['es-javascript']
		},
		{
			name:'es-nuxt',
			inherits:['es-vue']
		}
	]


}