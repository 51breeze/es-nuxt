import System;



 when( Env(platform, 'server') ){
       
    console.log('----server:defineAppConfig----'  )
}then{
        console.log('----client:defineAppConfig----'  )
}

System.setConfig('defineAppConfig', 1)


export default defineAppConfig({
    test:"dev"
})