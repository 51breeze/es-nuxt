package;
import web.components.Page;
import web.components.Component;
// import {ElButton} from 'element-plus/es/components/button'
// import 'element-plus/es/components/button/style/css.mjs'

// import * as ElementPlusIconsVue from "@element-plus/icons-vue"
// import * as Vue from "vue"
// import Icon from "../icon.js";


import net.Http;
import components.List;
import web.components.Viewport


//import api.http.Account

@Router('person')
class Person extends Page{
    
    @Reactive
    private data:{name:string} = {name:'====66663333===='}


    onClick(e){
        console.log(e)
    }

   


    private lang:string = 'sss';

    @Override
    async onInitialized(){


        await new Promise( (resolve)=>{
            setTimeout(resolve, 1000)
        });

        console.log( '----onInitialized----person' )

        this.data.name = "===6666666-222222-----"

        useSeoMeta({
            title:'EaseScript Nuxt'
        })

        useServerSeoMeta({
            title:'EaseScript Nuxt'
        })

      
       

        //var bs:api.http.Account

        //  const data3 = await useAsyncData('sss3333', ()=>{
        //     return new Promise((resolve, reject)=>{
        //         setTimeout(()=>{
        //             resolve({data:'======yejun 33333=========='});
        //         },5000)
        //     })
        // });

        // console.log(data3)

       // type T1 = typeof await @Http(Account, index)

       const {data, error, refresh} = await this.useAsyncData(@Router(api.http.Account, index));
       if(data.value && data.value ){
            this.data4 = data.value.data;
       }
      
    }

    @Reactive
    private data2:{[key:string]} = {}

     @Reactive
    private data4:{[key:string]:any, msg?:string} = {}



    @Override
    protected render(){

        var params = {id:60}
        var bss = 'sss' as any;

        //const MyIcon = Icon as web.components.Component;
        return <div xmlns:local="components" xmlns:d="@directives" xmlns:s="@slots" xmlns:ui="web.ui" class="login-container">
           
            <ui:Meta content="sfdsfdsfds"></ui:Meta>
            <h6>{this.data.name}</h6>

            <ui:Button><ui:Icon name="Plus" />button</ui:Button>
            <ui:Link to="/">Index</ui:Link>
            <ui:Link to={@Router(pages.members.Profile, param=params)}>profile</ui:Link>
             <ui:Link to={@Router(pages.Address)}>Address</ui:Link>
             
            <div>===6666 ==</div>
            <div>Load data: {data4.msg}</div>
            <List>
                <div>List children</div>
            </List>
            <ui:ClientOnly fallback="fallback">
               
                <s:fallback>
                    <div>=======55559999===</div>
                </s:fallback>
                
            </ui:ClientOnly>
        </div>
    }

}
