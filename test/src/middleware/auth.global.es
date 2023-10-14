
import System;

export default defineNuxtRouteMiddleware((to, from) => {
  // isAuthenticated() is an example method verifying if a user is authenticated
//   if (isAuthenticated() === false) {
//     return navigateTo('/login')
//   }

    when( Env(platform, 'server') ){
       
        console.log('----server:defineNuxtRouteMiddleware----'  )
    }then{
         console.log('----client:defineNuxtRouteMiddleware----'  )
    }

    System.setConfig('defineNuxtRouteMiddleware', 1)

    
})