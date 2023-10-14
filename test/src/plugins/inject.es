import System;
export default defineNuxtPlugin({
    name:"boot",
    setup(nuxtApp){
        console.log('--------nuxtapp  setup--------------')
    },
    hooks:{
        'app:created'(){
            console.log('------defineNuxtPlugin app:created--------' )    
        }
    }
})