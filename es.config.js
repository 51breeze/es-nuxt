const path = require('path')

let _plugin = require( "./dist/index.js")
_plugin = _plugin.default || _plugin;
module.exports = {
	workspace:"test/src",
	output:"./server",
	chunk:true,
	annotations:['Redirect'],
	bootstrap:"App.es",
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
	],
	plugins:[

		{
			name:'es-nuxt',
			plugin:_plugin,
			options:{
			  version:"3.0.0",
			  optimize:true,
			  webpack:true,
			  nuxtRootDir:__dirname,
			 // format:"vue-template",
			  hmrHandler:'import.meta.hot',
			  recordFilePath:true,
			  resolve:{
				mapping:{
					folder:{
						//'@element-plus/icons-vue':'@element-plus/icons-vue/dist/index.js'
					}
				}
			  },
			  importModuleFlag:true,
			  useAbsolutePathImport:true,
			  sourceMaps:true,
			  babel:false,
			  output:"build"
			}
		},
		
		// {
		// 	name:"es-thinkphp",
		// 	plugin:require("es-thinkphp"),
		// 	options:{
		// 		import:true,
		// 		includes:[
		// 			// "api/config/*",
		// 			// "api/lang/*",
		// 			// 'api/middleware.es',
		// 			// 'api/http/Image.es'
		// 		],
		// 		context:{
		// 			inherits:['es-php'],
		// 			include:[
		// 				/([\\\/]|^)api([\\\/])/,
		// 			],
		// 			only:true
		// 		},
		// 		resolve:{
		// 			using:[],
		// 			mapping:{
		// 				folder:{
		// 					"****.es::controller":"app/%1...",
		// 					"****.es::model":"app/%1...",
		// 					"****.es::router":"route",
		// 					"*/lang/*.es::general":"app/lang",
		// 					"*/*/lang/*.es::general":"app/%1/lang",
		// 					"*/middleware/*.es::*":"app/middleware",
		// 					"*/config/*.es::general":"config",
		// 					"*/*/config/*.es::general":"app/%1/config",
		// 					"**/middleware.es::general":"app/%1...",
		// 				},
		// 				namespace:{
							
		// 				}
		// 			}
		// 		},
		// 		output:path.join(__dirname, "./server")
		// 	}
		// }
	],
	devServer:{
		open:false,
		hot:true,
		host:'localhost',
		proxy:{
			"/api":{
				target:"http://localhost:8000",
				pathRewrite:{
					"^/api":""
				}
			}
		}
	}
}